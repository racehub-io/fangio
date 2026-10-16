import { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from 'utils/@reduxjs/toolkit';
import { useInjectReducer } from 'utils/redux-injectors';
import {
  ClientState,
  RecorderState,
  RecorderStatus,
  RecorderType,
  SessionType,
} from './types';

export const initialState: ClientState = {
  versionMajor: 0,
  versionMinor: 0,
  versionPatch: 0,
  platform: '',
  hostname: '',
  isConnected: false,
  recorders: {
    recorder_0: createRecorder('recorder-0', RecorderType.F12024),
  },
  parser: {
    queueLength: 0,
    currentSession: {
      recorderType: '',
      filepath: '',
      progress: 0,
      sessionType: '',
      trackName: '',
    },
  },
};

interface PayloadAddRecorder {
  recorderId: string;
  recorderType: RecorderType;
}

const slice = createSlice({
  name: 'client',
  initialState,
  reducers: {
    setClientInfo(
      state,
      action: PayloadAction<{
        versionMajor: number;
        versionMinor: number;
        versionPatch: number;
        platform: string;
        hostname: string;
      }>,
    ) {
      state.versionMajor = action.payload.versionMajor;
      state.versionMinor = action.payload.versionMinor;
      state.versionPatch = action.payload.versionPatch;
      state.platform = action.payload.platform;
      state.hostname = action.payload.hostname;
    },
    setConnectionStatus(state, action: PayloadAction<boolean>) {
      state.isConnected = action.payload;
      !action.payload && (state.parser.queueLength = 0);
      !action.payload &&
        (state.parser.currentSession = initialState.parser.currentSession);
    },
    addRecorder(state, action: PayloadAction<PayloadAddRecorder>) {
      if (!state.recorders[action.payload.recorderId]) {
        state.recorders[action.payload.recorderId] = createRecorder(
          action.payload.recorderId,
          action.payload.recorderType,
        );
      }
    },
    removeRecorder(state, action: PayloadAction<string>) {
      delete state.recorders[action.payload];
    },
    setRecorderType(
      state,
      action: PayloadAction<{ recorderId: string; recorderType: RecorderType }>,
    ) {
      state.recorders[action.payload.recorderId].recorderType =
        action.payload.recorderType;
    },
    setRecorderInPort(
      state,
      action: PayloadAction<{ recorderId: string; inPort: number }>,
    ) {
      state.recorders[action.payload.recorderId].inPort = action.payload.inPort;
    },
    setRecorderForwardingEnabled(
      state,
      action: PayloadAction<{ recorderId: string; forwardingEnabled: boolean }>,
    ) {
      state.recorders[action.payload.recorderId].forwardingEnabled =
        action.payload.forwardingEnabled;
    },
    setRecorderOutPort(
      state,
      action: PayloadAction<{ recorderId: string; outPort: number }>,
    ) {
      state.recorders[action.payload.recorderId].outPort =
        action.payload.outPort;
    },
    setRecorderOutAddress(
      state,
      action: PayloadAction<{ recorderId: string; outAddress: string }>,
    ) {
      state.recorders[action.payload.recorderId].outAddress =
        action.payload.outAddress;
    },
    setRecorderStatus(
      state,
      action: PayloadAction<{ recorderId: string; status: RecorderStatus }>,
    ) {
      if (action.payload.status === RecorderStatus.RECORDING) {
        state.recorders[action.payload.recorderId].filepath = '';
        state.recorders[action.payload.recorderId].lastHeartbeat = 0;
        state.recorders[action.payload.recorderId].messageCounts = [];
        state.recorders[action.payload.recorderId].sessionTime = 0;
        state.recorders[action.payload.recorderId].sessionType = '';
        state.recorders[action.payload.recorderId].trackName = '';
      }
      state.recorders[action.payload.recorderId].status = action.payload.status;
    },
    setRecorderFilepath(
      state,
      action: PayloadAction<{ recorderId: string; filepath: string }>,
    ) {
      state.recorders[action.payload.recorderId].filepath =
        action.payload.filepath;
    },
    setRecorderInfo(
      state,
      action: PayloadAction<{
        recorderId: string;
        lastHeartbeat: number;
        messageCount: number;
        sessionTime: number;
        sessionType: SessionType | '';
        trackName: string;
      }>,
    ) {
      state.recorders[action.payload.recorderId].lastHeartbeat =
        action.payload.lastHeartbeat;
      state.recorders[action.payload.recorderId].messageCounts = [
        ...state.recorders[action.payload.recorderId].messageCounts,
        {
          timestamp: action.payload.lastHeartbeat,
          count: action.payload.messageCount,
        },
      ];
      state.recorders[action.payload.recorderId].sessionTime =
        action.payload.sessionTime;
      state.recorders[action.payload.recorderId].sessionType =
        action.payload.sessionType;
      state.recorders[action.payload.recorderId].trackName =
        action.payload.trackName;
    },
    setParserQueueLength(
      state,
      action: PayloadAction<{ queueLength: number }>,
    ) {
      state.parser.queueLength = action.payload.queueLength;
    },
    setParserStatus(
      state,
      action: PayloadAction<{
        filepath: string;
        progress: number;
        sessionType: string;
        trackName: string;
      }>,
    ) {
      state.parser.currentSession.filepath = action.payload.filepath;
      state.parser.currentSession.progress = action.payload.progress;
      state.parser.currentSession.sessionType = action.payload.sessionType;
      state.parser.currentSession.trackName = action.payload.trackName;
    },
    setParserStarted(
      state,
      action: PayloadAction<{ recorderType: string; filepath: string }>,
    ) {
      state.parser.currentSession.recorderType = action.payload.recorderType;
      state.parser.currentSession.filepath = action.payload.filepath;
      state.parser.currentSession.progress = 0;
    },
    setParserFinished(state) {
      state.parser.currentSession.recorderType = '';
      state.parser.currentSession.filepath = '';
      state.parser.currentSession.progress = 0;
      state.parser.currentSession.sessionType = '';
      state.parser.currentSession.trackName = '';
    },
  },
});

export const { actions: clientActions } = slice;

export const useClientSlice = () => {
  useInjectReducer({ key: slice.name, reducer: slice.reducer });
  return { actions: slice.actions };
};

function createRecorder(
  recorderId: string,
  recorderType: RecorderType,
): RecorderState {
  return {
    recorderId,
    recorderType,
    inPort: 30500,
    forwardingEnabled: false,
    outPort: 30501,
    outAddress: '127.0.0.1',
    status: RecorderStatus.UNKNOWN,
    filepath: '',
    lastHeartbeat: 0,
    messageCounts: [],
    sessionTime: 0,
    sessionType: '',
    trackName: '',
  };
}
