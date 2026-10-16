import { createContext, useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { UPDATE_WS_STATUS } from 'store/race/actions';
import {
  CLIENT_INITIALISED,
  CLIENT_RESPONSE_RECORDER_INITIALISING,
  CLIENT_RESPONSE_RECORDER_STARTED,
  CLIENT_RESPONSE_RECORDER_STOPPED,
  CLIENT_RESPONSE_RECORDER_FILE,
  CLIENT_RESPONSE_RECORDER_STATUS,
  CLIENT_RESPONSE_PARSER_STARTED,
  CLIENT_RESPONSE_PARSER_QUEUE_LENGTH,
  CLIENT_RESPONSE_PARSER_STATUS,
  CLIENT_RESPONSE_PARSER_FINISHED,
  CLIENT_RESPONSE_RECORDER_LIVE_DATA,
  CLIENT_RESPONSE_MACHINE_LOGGED,
  CLIENT_RESPONSE_GET_DATA,
  CLIENT_RESPONSE_RECORDER_PROTO_MESSAGE,
  CLIENT_RESPONSE_RECORDER_PARTITION_CREATED,
  CLIENT_WORKER_ERROR,
  CLIENT_RESPONSE_POST_PROCESSOR_STARTED,
  CLIENT_RESPONSE_POST_PROCESSOR_MESSAGE,
  CLIENT_RESPONSE_POSTPROCESSING_QUEUE_LENGTH,
  CLIENT_RESPONSE_RECORDER_ARCHIVE_CREATED,
  CLIENT_RESPONSE_RECORDER_PARTITION_CLOSED,
  CLIENT_RESPONSE_RECORDER_ARCHIVE_CLOSED,
} from 'store/client/actions';
import { RecorderStatus } from 'store/client/slice/types';
import { useClientSlice } from 'store/client/slice';
import { selectActiveRecorderIds } from 'store/client/slice/selectors';
import { useRaceSlice } from 'store/race/slice';
import { useDispatch as useContextDispatch } from 'store/context';

interface IWebsocketContext {
  message: string | null;
  send: (msg: string) => void;
}

export const WebsocketContext = createContext<IWebsocketContext>({
  message: null,
  send: () => {},
});

export const WebsocketProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { dispatch: contextDispatch } = useContextDispatch();
  const { actions: clientActions } = useClientSlice();
  const { actions: raceActions } = useRaceSlice();
  const [isConnected, setIsConnected] = useState(false);
  const hasReceivedMetadataRef = useRef<string[]>([]);
  const [message, setMessage] = useState(null);
  const [reconnect, setReconnect] = useState(true);
  const activeRecorderIds = useSelector(selectActiveRecorderIds);

  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    const connect = (reconnect: boolean) => {
      const socket = new WebSocket('ws://localhost:8082');

      const close = socket.close;

      // Close without reconnecting;
      socket.close = () => {
        setReconnect(false);
        close.call(socket);
      };

      socket.onopen = () => {
        setIsConnected(true);
        contextDispatch({
          type: UPDATE_WS_STATUS,
          status: WebSocket.OPEN,
        });
      };
      socket.onclose = () => {
        setIsConnected(false);
        contextDispatch({
          type: UPDATE_WS_STATUS,
          status: WebSocket.CLOSED,
        });
        if (reconnect) {
          setTimeout(() => connect(true), 1000);
        }
      };
      socket.onmessage = event => {
        const data = JSON.parse(event.data);
        const { action, payload } = data;
        switch (action) {
          case CLIENT_INITIALISED: {
            const {
              versionMajor,
              versionMinor,
              versionPatch,
              hostname,
              platform,
            } = payload;
            // check and convert if needed the versions to numbers
            const versionMajorNumber = Number(versionMajor);
            const versionMinorNumber = Number(versionMinor);
            const versionPatchNumber = Number(versionPatch);

            dispatch(
              clientActions.setClientInfo({
                versionMajor: versionMajorNumber,
                versionMinor: versionMinorNumber,
                versionPatch: versionPatchNumber,
                hostname,
                platform,
              }),
            );
            break;
          }
          case CLIENT_RESPONSE_RECORDER_INITIALISING: {
            const { recorderId } = payload;
            dispatch(
              clientActions.setRecorderStatus({
                recorderId,
                status: RecorderStatus.INITIALISING,
              }),
            );
            break;
          }
          case CLIENT_RESPONSE_GET_DATA: {
            dispatch(raceActions.storeHistoricTelemetry(payload));
            break;
          }
          case CLIENT_RESPONSE_RECORDER_STARTED: {
            const { recorderId } = payload;
            dispatch(
              clientActions.setRecorderStatus({
                recorderId,
                status: RecorderStatus.RECORDING,
              }),
            );
            break;
          }
          case CLIENT_RESPONSE_RECORDER_STOPPED: {
            const { recorderId } = payload;
            dispatch(
              clientActions.setRecorderStatus({
                recorderId,
                status: RecorderStatus.STOPPED,
              }),
            );
            break;
          }
          case CLIENT_RESPONSE_RECORDER_FILE: {
            const { recorderId, filepath } = payload;
            dispatch(
              clientActions.setRecorderFilepath({
                recorderId,
                filepath,
              }),
            );
            break;
          }
          case CLIENT_RESPONSE_MACHINE_LOGGED: {
            break;
          }
          case CLIENT_RESPONSE_RECORDER_LIVE_DATA: {
            if (!payload.data) {
              return;
            }
            const { recorderId } = payload;

            // all this ugliness will go away once we get the metadata from a different package
            if (
              !hasReceivedMetadataRef.current.includes(recorderId) &&
              payload.data?.driver_name
            ) {
              dispatch(raceActions.storeTelemetryMetadata(payload));
              hasReceivedMetadataRef.current = [
                ...hasReceivedMetadataRef.current,
                recorderId,
              ];
            }
            // addDataToDB(data, recorderId);
            dispatch(raceActions.storeTelemetry(payload));
            dispatch(raceActions.storeLatestTelemetry(payload));
            break;
          }
          case CLIENT_RESPONSE_RECORDER_STATUS: {
            break;
          }
          case CLIENT_RESPONSE_PARSER_STARTED: {
            const { filepath, recorderType } = payload;
            dispatch(
              clientActions.setParserStarted({
                filepath,
                recorderType,
              }),
            );
            break;
          }
          case CLIENT_RESPONSE_PARSER_QUEUE_LENGTH: {
            const { queueLength } = payload;
            dispatch(
              clientActions.setParserQueueLength({
                queueLength,
              }),
            );
            break;
          }
          case CLIENT_RESPONSE_PARSER_STATUS: {
            const { filepath, progress, sessionType, trackName } = payload;
            dispatch(
              clientActions.setParserStatus({
                filepath,
                progress,
                sessionType,
                trackName,
              }),
            );
            break;
          }
          case CLIENT_RESPONSE_PARSER_FINISHED: {
            dispatch(clientActions.setParserFinished());
            break;
          }
          case CLIENT_RESPONSE_RECORDER_PROTO_MESSAGE: {
            const { recorderId, data } = payload;
            if (!data) {
              return;
            }
            // Handle metadata similar to live data
            if (
              !hasReceivedMetadataRef.current.includes(recorderId) &&
              data?.driver_name
            ) {
              dispatch(raceActions.storeTelemetryMetadata(payload));
              hasReceivedMetadataRef.current = [
                ...hasReceivedMetadataRef.current,
                recorderId,
              ];
            }

            dispatch(raceActions.storeTelemetry(payload));
            dispatch(raceActions.storeLatestTelemetry(payload));
            break;
          }
          case CLIENT_RESPONSE_RECORDER_PARTITION_CREATED: {
            return;
          }
          case CLIENT_WORKER_ERROR: {
            return;
          }
          case CLIENT_RESPONSE_POST_PROCESSOR_STARTED: {
            return;
          }
          case CLIENT_RESPONSE_POST_PROCESSOR_MESSAGE: {
            return;
          }
          case CLIENT_RESPONSE_POSTPROCESSING_QUEUE_LENGTH: {
            return;
          }
          case CLIENT_RESPONSE_RECORDER_ARCHIVE_CREATED: {
            return;
          }
          case CLIENT_RESPONSE_RECORDER_PARTITION_CLOSED: {
            return;
          }
          case CLIENT_RESPONSE_RECORDER_ARCHIVE_CLOSED: {
            return;
          }
          default: {
            console.log('Unknown action', action);
            break;
          }
        }
        setMessage(event.data);
      };
      socket.onerror = e => console.error(e);

      ws.current = socket;
    };
    connect(reconnect);

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [clientActions, dispatch, contextDispatch, raceActions, reconnect]);

  useEffect(() => {
    dispatch(clientActions.setConnectionStatus(isConnected));
  }, [clientActions, dispatch, isConnected]);

  useEffect(() => {
    if (!isConnected) {
      // set all active recorders to not recording
      activeRecorderIds.forEach(recorderId => {
        dispatch(
          clientActions.setRecorderStatus({
            recorderId,
            status: RecorderStatus.UNKNOWN,
          }),
        );
      });
    }
  }, [activeRecorderIds, isConnected, clientActions, dispatch]);

  // define send function using useCallback to avoid it being recreated on every render
  const send = useCallback((message: string) => {
    if (ws.current) {
      try {
        ws.current.send(message);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const ret = { message, send };

  return (
    <WebsocketContext.Provider value={ret}>
      {children}
    </WebsocketContext.Provider>
  );
};
