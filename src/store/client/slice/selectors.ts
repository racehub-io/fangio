import { createSelector } from '@reduxjs/toolkit';

import { RootState } from 'types';
import { initialState } from '.';
import { RecorderConfig, MessageCountDataPoint, RecorderStatus } from './types';

const selectSlice = (state: RootState) => state.client || initialState;

export const selectClientVersion = createSelector([selectSlice], state => {
  return {
    major: state.versionMajor,
    minor: state.versionMinor,
    patch: state.versionPatch,
  };
});

export const selectIsConnected = createSelector(
  [selectSlice],
  state => state.isConnected,
);

export const selectRecorder = (state: RootState, id: string) => {
  const slice = selectSlice(state);
  // check if the recorder exists
  if (!slice.recorders[id]) {
    throw new Error(`Recorder ${id} does not exist`);
  }
  return slice.recorders[id];
};

export const selectRecorderIds = createSelector([selectSlice], state =>
  Object.keys(state.recorders),
);

export const selectActiveRecorderIds = createSelector([selectSlice], state =>
  Object.keys(state.recorders).filter(
    recorderId =>
      state.recorders[recorderId].status === RecorderStatus.RECORDING,
  ),
);

export const selectActiveRecorderConfigs = createSelector(
  [selectSlice],
  state => {
    const configs: RecorderConfig[] = [];
    for (const recorderId of Object.keys(state.recorders)) {
      const recorder = state.recorders[recorderId];
      if (recorder.status === RecorderStatus.RECORDING) {
        configs.push({
          recorderId,
          recorderType: recorder.recorderType,
          inPort: recorder.inPort,
          forwardingEnabled: recorder.forwardingEnabled,
          outPort: recorder.outPort,
          outAddress: recorder.outAddress,
        });
      }
    }
    return configs;
  },
);

export const selectRecorderConfig = (state: RootState, recorderId: string) => {
  const recorder = selectRecorder(state, recorderId);
  return {
    recorderId,
    recorderType: recorder.recorderType,
    inPort: recorder.inPort,
    forwardingEnabled: recorder.forwardingEnabled,
    outPort: recorder.outPort,
    outAddress: recorder.outAddress,
  };
};

export const selectRecorderStatus = createSelector(
  [selectRecorder],
  recorder => recorder.status,
);

export const selectRecorderInfo = (state: RootState, recorderId: string) => {
  const recorder = selectRecorder(state, recorderId);
  return {
    recorderId,
    filepath: recorder.filepath,
    lastHeartbeat: recorder.lastHeartbeat,
    messageCounts: recorder.messageCounts,
    sessionTime: recorder.sessionTime,
    sessionType: recorder.sessionType,
    trackName: recorder.trackName,
  };
};

export const selectParserQueueLength = createSelector(
  [selectSlice],
  state => state.parser.queueLength,
);

export const selectParserCurrentSession = createSelector(
  [selectSlice],
  state => state.parser.currentSession,
);

// get all recorders messageCounts
export const selectAllRecordersMessageCounts = createSelector(
  [selectSlice],
  state => {
    const recordersMessageCounts: {
      [recorderId: string]: MessageCountDataPoint[];
    } = {};
    for (const recorderId of Object.keys(state.recorders)) {
      const { status, messageCounts } = state.recorders[recorderId];
      if (status === RecorderStatus.RECORDING && messageCounts.length > 1) {
        // return the last 2 messageCounts
        recordersMessageCounts[recorderId] = [
          messageCounts[messageCounts.length - 2],
          messageCounts[messageCounts.length - 1],
        ];
      }
    }
    return recordersMessageCounts;
  },
);

export const selectStoreLoad = createSelector(
  [selectSlice, (state: RootState) => state.race],
  (clientState, raceState) => {
    // Get the complete store size by stringifying both states
    const clientStateSize = new TextEncoder().encode(
      JSON.stringify(clientState),
    ).length;
    const raceStateSize = raceState
      ? new TextEncoder().encode(JSON.stringify(raceState)).length
      : 0;

    const totalBytes = clientStateSize + raceStateSize;
    const totalMB = totalBytes / (1024 * 1024);

    return totalMB;
  },
);
