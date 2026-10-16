import { useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  selectSelectedTelemetry,
  selectTelemetryParticipants,
  selectTelemetryMetadataByRecorderId,
  selectRecorderIds,
} from 'store/race/slice/selectors';
import { useStore } from 'store/context';
import { getData } from 'utils/helpers';
import { WebsocketContext } from 'app/WebSocketProvider';
import { PropertySelectors } from '../PropertySelector';
import { LineChart } from './LineChart';
import styles from './LineChartPanel.module.scss';
import { RootState } from 'types';

export function LineChartPanel({ id }: { id: string }) {
  const { store } = useStore();
  const selectedTelemetry = useSelector((state: RootState) =>
    selectSelectedTelemetry(state, id),
  );
  const recorderIds = useSelector(selectRecorderIds);
  const hasData = recorderIds.length > 0;

  const { send } = useContext(WebsocketContext);
  const [isToastOpen, setIsToastOpen] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(true);
  const participants = useSelector(
    selectTelemetryParticipants(selectedTelemetry.recorderId),
  );

  useEffect(() => {
    if (store.wsStatus !== WebSocket.OPEN) {
      return;
    }
    if (
      selectedTelemetry.recorderId &&
      selectedTelemetry.parameterId &&
      selectedTelemetry.participantIds &&
      selectedTelemetry.participantIds.length > 0
    ) {
      // optimise to avoid unnecessary requests
      selectedTelemetry.participantIds.forEach(participantId => {
        getData(
          selectedTelemetry.recorderId,
          participantId,
          selectedTelemetry.parameterId,
          send,
        );
      });
    }
  }, [
    selectedTelemetry.recorderId,
    selectedTelemetry.parameterId,
    selectedTelemetry.participantIds,
    send,
    store.wsStatus,
  ]);

  return (
    <>
      <PropertySelectors
        id={id}
        recorderId={selectedTelemetry.recorderId}
        componentName={'Line Chart'}
        isToastOpen={isToastOpen}
        isLiveMode={isLiveMode}
        selectedParameter={selectedTelemetry.parameterId}
        selectedParticipantId={selectedTelemetry.participantIds}
        onSetIsToastOpen={setIsToastOpen}
        onChangeLiveMode={setIsLiveMode}
        multipleParticipants
        showLiveSelector
      />

      {selectedTelemetry.parameterId &&
      selectedTelemetry.recorderId &&
      participants &&
      selectedTelemetry.participantIds !== undefined ? (
        <LineChart
          id={id}
          participants={participants}
          isLiveMode={isLiveMode}
          participantIds={selectedTelemetry.participantIds}
          isPropertySelectorsOpen={isToastOpen}
        />
      ) : !isToastOpen ? (
        <div className={styles.noData}>
          {hasData ? 'Select data to visualize' : 'No data'}
        </div>
      ) : null}
    </>
  );
}
