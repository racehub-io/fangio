import { createSelector } from '@reduxjs/toolkit';
import { RootState } from 'store/reducers';
import { Participants, RaceState } from './types';

export const selectRaceSlice = (state: RootState): RaceState | undefined =>
  state.race;
export const selectSelectedTelemetrySlice = (state: RootState) =>
  state.race?.selectedTelemetry;
export const selectLatestTelemetrySlice = (state: RootState) =>
  state.race?.latestTelemetry;
export const selectTelemetrySlice = (state: RootState) => state.race?.telemetry;
export const selectTelemetryMetadataSlice = (state: RootState) =>
  state.race?.telemetryMetadata;

let previousKeys: string[] = [];

export const selectRace = createSelector([selectRaceSlice], race => race);
export const selectSelectedTelemetry = createSelector(
  [selectSelectedTelemetrySlice, (_, componentId) => componentId],
  (selectedTelemetry, componentId) =>
    selectedTelemetry[componentId] || {
      recorderId: undefined,
      parameterId: undefined,
      participantIds: undefined,
    },
);
export const selectLatestTelemetry = createSelector(
  [selectLatestTelemetrySlice, (_, recorderId) => recorderId],
  (latestTelemetry, recorderId) => latestTelemetry[recorderId] || null,
);
export const selectTelemetryByRecorderId = createSelector(
  [selectTelemetrySlice, (_, recorderId) => recorderId, selectRaceSlice],
  (telemetry, recorderId, raceState) => {
    console.log({ telemetry });
    if (!telemetry?.[recorderId]) return null;
    // Convert minified IDs back to original IDs in the response
    const result: { [key: string]: any } = {};
    Object.entries(telemetry[recorderId]).forEach(([minifiedId, data]) => {
      const originalId = raceState?.parameterMap[minifiedId];
      if (originalId) {
        result[originalId] = data;
      }
    });
    return result;
  },
);

export const createSelectTelemetryByComponentIdAndFrame = () => {
  let previousValue: { [key: number]: any } | null = null;
  let previousFrame: number | null = null;

  return createSelector(
    [
      selectSelectedTelemetrySlice,
      selectTelemetrySlice,
      selectRaceSlice,
      (_, componentId) => componentId,
      (_, __, animationFrame) => animationFrame,
    ],
    (selectedTelemetry, telemetry, raceState, componentId, animationFrame) => {
      // Only update if the frame has changed
      if (animationFrame === previousFrame) {
        return previousValue;
      }

      previousFrame = animationFrame;

      if (!selectedTelemetry || !selectedTelemetry[componentId]) {
        previousValue = null;
        return previousValue;
      }

      const selected = selectedTelemetry[componentId];
      const { recorderId, parameterId, participantIds } = selected;

      const isFullySelected =
        recorderId &&
        parameterId &&
        participantIds &&
        participantIds.length > 0;

      if (!isFullySelected) {
        previousValue = null;
        return previousValue;
      }

      // Get the minified parameter ID using the reverseParameterMap
      const minifiedParameterId = raceState?.reverseParameterMap[parameterId];
      if (!minifiedParameterId) {
        previousValue = null;
        return previousValue;
      }

      const result: { [key: number]: any } = {};

      participantIds.forEach(participantId => {
        result[participantId] =
          telemetry?.[recorderId]?.[minifiedParameterId]?.[participantId];
      });

      previousValue = result;
      return previousValue;
    },
  );
};

export const selectTelemetryMetadataByRecorderId = createSelector(
  [selectTelemetryMetadataSlice, (_, recorderId) => recorderId],
  (telemetry, recorderId) => telemetry[recorderId] || null,
);

// note: the assumption here is that each channel doesn't change neither the
// parameters nor the participants during the entire session.
// therefore we can derive the parameters and the participants just by reading index 0
export const selectTelemetryParameters = (recorderId, onlyTables) =>
  createSelector(
    [state => selectTelemetryMetadataByRecorderId(state, recorderId)],
    telemetry => {
      const telemetryList = telemetry?.[0] ? Object.keys(telemetry[0]) : [];
      return onlyTables
        ? telemetryList.filter(x => x === 'tyre_sets')
        : telemetryList;
    },
  );

export const selectRecorderIds = createSelector(
  [selectTelemetryMetadataSlice],
  telemetry => {
    const currentKeys = Object.keys(telemetry);
    if (
      previousKeys.length !== currentKeys.length ||
      !previousKeys.every((key, index) => key === currentKeys[index])
    ) {
      previousKeys = currentKeys;
    }
    return previousKeys;
  },
);

export const selectTelemetryParticipants = recorderId =>
  createSelector(
    [state => selectTelemetryMetadataByRecorderId(state, recorderId)],
    telemetry => {
      const participants: Participants = {};

      if (!telemetry || telemetry.length === 0) return;

      if (!participants.player_name && telemetry[0].player_name) {
        participants.player_name = telemetry[0].player_name;
        participants.length = telemetry[0].player_name.length;
      }
      if (!participants.team_name && telemetry[0].team_name) {
        participants.team_name = telemetry[0].team_name;
      }
      if (
        !participants.driver_abbreviation &&
        telemetry[0].driver_abbreviation
      ) {
        participants.driver_abbreviation = telemetry[0].driver_abbreviation;
      }

      return participants;
    },
  );

export const selectParameterId = (state: RootState, minifiedId: string) =>
  state.race?.parameterMap[minifiedId];

export const selectRaceStoreLoad = (state: RootState) => {
  const raceState = state.race;
  if (!raceState) return 0;

  // Convert state to string and calculate size in KB
  const stateString = JSON.stringify(raceState);
  const sizeInKB = (stateString.length * 2) / 1024; // 2 bytes per character, converted to KB

  // For display purposes, keep it in KB (don't convert to MB)
  return sizeInKB;
};
