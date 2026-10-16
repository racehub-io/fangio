import simplify from 'simplify-js';
import { createSlice } from '@reduxjs/toolkit';
import { useInjectReducer } from 'utils/redux-injectors';
import { RaceState, SelectedTelemetry } from './types';

export const initialState: RaceState = {
  simplificationBatching: {},
  telemetry: {},
  latestTelemetry: {},
  telemetryMetadata: {},
  selectedTelemetry: {},
  parameterMap: {},
  reverseParameterMap: {},
  storeLoad: 0,
};

const SIMPLIFICATION_WINDOW = 100;

function calculateSimplificationTolerance(data) {
  // Find the min/max values in the window
  const yValues = data.map(point => point.y);
  const min = Math.min(...yValues);
  const max = Math.max(...yValues);
  const range = max - min;

  // Calculate average rate of change
  let totalRateChange = 0;
  for (let i = 1; i < data.length; i++) {
    const timeDiff = data[i].x - data[i - 1].x;
    const valueDiff = Math.abs(data[i].y - data[i - 1].y);
    if (timeDiff > 0) {
      totalRateChange += valueDiff / timeDiff;
    }
  }
  const avgRateChange = totalRateChange / (data.length - 1);

  // Use a combination of range and rate of change
  // Higher rate of change = higher tolerance needed
  const rateTolerance = avgRateChange * 0.05; // 5% of rate of change
  const rangeTolerance = range * 0.005; // 0.5% of total range

  return Math.max(0.05, Math.min(rateTolerance, rangeTolerance));
}

const raceSlice = createSlice({
  name: 'race',
  initialState,
  reducers: {
    resetRaceSession(state) {
      state.telemetry = {};
      state.latestTelemetry = {};
      state.selectedTelemetry = {};
      state.telemetryMetadata = {};
      state.parameterMap = {};
      state.reverseParameterMap = {};
      state.simplificationBatching = {};
    },
    updateSelectedTelemetry(state, action) {
      const { componentId, recorderId, parameterId, participantIds } =
        action.payload;

      const prevState = state.selectedTelemetry[componentId];

      state.selectedTelemetry[componentId] = {
        recorderId: recorderId || prevState?.recorderId,
        parameterId: parameterId || prevState?.parameterId,
        participantIds: participantIds || prevState?.participantIds,
      };
    },
    removeSelectedTelemetry(state, action) {
      const { componentId } = action.payload;

      const selectedTelemetryToDeselect = state.selectedTelemetry[componentId];

      const {
        recorderId,
        parameterId,
        participantIds = [],
      } = selectedTelemetryToDeselect || {};

      delete state.selectedTelemetry[componentId];

      const componentIds = Object.keys(state.selectedTelemetry);

      let participantsToRemove = [...participantIds];

      for (let i = 0; i < componentIds.length; i++) {
        const _componentId = componentIds[i];
        const {
          recorderId: selectedRecorderId,
          parameterId: selectedParameterId,
          participantIds: selectedParticipantIds,
        } = state.selectedTelemetry[_componentId];

        // if the same recorderId, parameterId, participantId is found then it should not remove the telemetry from the store
        if (
          selectedRecorderId === recorderId &&
          selectedParameterId === parameterId &&
          selectedRecorderId &&
          selectedParameterId &&
          selectedParticipantIds
        ) {
          for (let j = 0; j < participantIds.length; j++) {
            // if this recorderId, parameterId, participantId is present, then it should not remove the telemetry for it
            if (selectedParticipantIds.find(p => p === participantIds[j])) {
              participantsToRemove = participantsToRemove.filter(
                p => p !== participantIds[j],
              );
            }
          }
        }
      }

      // cleans the store of unused telemetry
      participantsToRemove.forEach(participantId => {
        if (recorderId && parameterId && participantId) {
          delete state.telemetry[recorderId][parameterId][participantId];
        }
      });
    },
    storeHistoricTelemetry(state, action) {
      const { recorderId, parameter, carIndex, data } = action.payload;

      // Ensure the telemetry structure exists in the state
      if (!state.telemetry[recorderId]) {
        state.telemetry[recorderId] = {};
      }
      if (!state.telemetry[recorderId][parameter]) {
        state.telemetry[recorderId][parameter] = {};
      }

      const historicData = data.map(point => ({
        x: point.timestamp,
        y: point.value,
      }));

      state.telemetry[recorderId][parameter][carIndex] = simplify(
        historicData,
        calculateSimplificationTolerance(historicData),
        false,
      );
    },
    storeLatestTelemetry(state, action) {
      const { data, recorderId } = action.payload;
      state.latestTelemetry[recorderId] = data;
    },
    storeTelemetryMetadata(state, action) {
      const { data, recorderId } = action.payload;
      if (!state.telemetryMetadata[recorderId]) {
        state.telemetryMetadata[recorderId] = [];
      }

      // this needs to be replaced with the matadata package instead of saving a sample package
      state.telemetryMetadata[recorderId][0] = data;
    },
    storeTelemetry(state, action) {
      const { data, recorderId, simulationIndex } = action.payload;

      const selectedTelemetry = Object.values(state.selectedTelemetry) as (
        | SelectedTelemetry
        | undefined
      )[];

      // Create parameter mappings for any new parameters
      Object.keys(data).forEach(parameterId => {
        if (!state.parameterMap) {
          state.parameterMap = {};
          state.reverseParameterMap = {};
        }
        if (!state.reverseParameterMap?.[parameterId]) {
          const minifiedId = `p${Object.keys(state.parameterMap).length}`;
          state.parameterMap[minifiedId] = parameterId;
          state.reverseParameterMap[parameterId] = minifiedId;
        }
      });

      // Calculate total size of telemetry data
      let totalSize = 0;
      Object.values(state.telemetry).forEach((recorderData: any) => {
        Object.values(recorderData).forEach((parameterData: any) => {
          Object.values(parameterData).forEach((participantData: unknown) => {
            if (Array.isArray(participantData)) {
              totalSize += participantData.length;
            }
          });
        });
      });
      state.storeLoad = totalSize;

      selectedTelemetry.forEach((params: SelectedTelemetry | undefined) => {
        const {
          recorderId: selectedRecorderId,
          parameterId,
          participantIds,
        } = params ||
        ({
          recorderId: '',
          parameterId: '',
          participantIds: [],
        } as SelectedTelemetry);

        const isFullySelected =
          selectedRecorderId &&
          parameterId &&
          participantIds &&
          participantIds.length > 0;

        // If telemetry is not fully selected or if the recorder ID doesn't match, skip this entry
        if (!isFullySelected || recorderId !== selectedRecorderId) {
          return;
        }

        const minifiedParameterId = state.reverseParameterMap[parameterId];

        // Ensure the telemetry structure exists in the state
        if (!state.telemetry[selectedRecorderId]) {
          state.telemetry[selectedRecorderId] = {};
        }
        if (!state.telemetry[selectedRecorderId][minifiedParameterId]) {
          state.telemetry[selectedRecorderId][minifiedParameterId] = {};
        }

        // Ensure the telemetry structure exists in the state
        if (!state.simplificationBatching[selectedRecorderId]) {
          state.simplificationBatching[selectedRecorderId] = {};
        }
        if (
          !state.simplificationBatching[selectedRecorderId][minifiedParameterId]
        ) {
          state.simplificationBatching[selectedRecorderId][
            minifiedParameterId
          ] = {};
        }

        participantIds.forEach(participantId => {
          if (
            !state.telemetry[selectedRecorderId][minifiedParameterId][
              participantId
            ]
          ) {
            state.telemetry[selectedRecorderId][minifiedParameterId][
              participantId
            ] = [];
          }

          if (
            !state.simplificationBatching[selectedRecorderId][
              minifiedParameterId
            ][participantId]
          ) {
            state.simplificationBatching[selectedRecorderId][
              minifiedParameterId
            ][participantId] = 0;
          }

          const telemetryArray =
            state.telemetry[selectedRecorderId][minifiedParameterId][
              participantId
            ];

          // Append new telemetry data
          let xData;
          if (simulationIndex) {
            xData = Date.now();
          } else if (data['timestamp']) {
            xData = data['timestamp'][participantId];
          } else {
            xData = data['session_time'][participantId];
          }

          const dataPoint = {
            y: data[parameterId][Number(participantId)],
            x: xData,
          };

          telemetryArray.push(dataPoint);

          state.simplificationBatching[selectedRecorderId][minifiedParameterId][
            participantId
          ] += 1;

          const shouldSimplify =
            state.simplificationBatching[selectedRecorderId][
              minifiedParameterId
            ][participantId] >= SIMPLIFICATION_WINDOW;

          if (shouldSimplify) {
            const dataToSimplify = telemetryArray.slice(-SIMPLIFICATION_WINDOW);

            const tolerance = calculateSimplificationTolerance(dataToSimplify);
            let simplifiedTelemetry = simplify(
              dataToSimplify,
              tolerance,
              false,
            );

            // Ensure we keep points where there are significant changes in rate
            const points = dataToSimplify;
            for (let i = 1; i < points.length - 1; i++) {
              const prevRate =
                (points[i].y - points[i - 1].y) /
                (points[i].x - points[i - 1].x);
              const nextRate =
                (points[i + 1].y - points[i].y) /
                (points[i + 1].x - points[i].x);
              const rateChange = Math.abs(nextRate - prevRate);

              if (rateChange > tolerance * 2) {
                if (!simplifiedTelemetry.find(p => p.x === points[i].x)) {
                  simplifiedTelemetry.push(points[i]);
                }
              }
            }

            // Keep first and last points
            const firstPoint = dataToSimplify[0];
            const lastPoint = dataToSimplify[dataToSimplify.length - 1];
            if (!simplifiedTelemetry.find(p => p.x === firstPoint.x)) {
              simplifiedTelemetry.push(firstPoint);
            }
            if (!simplifiedTelemetry.find(p => p.x === lastPoint.x)) {
              simplifiedTelemetry.push(lastPoint);
            }

            // Sort the points by timestamp
            simplifiedTelemetry.sort((a, b) => a.x - b.x);

            state.simplificationBatching[selectedRecorderId][
              minifiedParameterId
            ][participantId] = 0;

            state.telemetry[selectedRecorderId][minifiedParameterId][
              participantId
            ] = [
              ...telemetryArray.slice(0, -SIMPLIFICATION_WINDOW),
              ...simplifiedTelemetry,
            ];
          } else {
            state.telemetry[selectedRecorderId][minifiedParameterId][
              participantId
            ] = telemetryArray;
          }
        });
      });
    },
    setTelemetryCache(state, action) {
      state.telemetry = action.payload;
    },
    addParameterMapping(state, action) {
      const { originalId } = action.payload;
      if (!state.reverseParameterMap[originalId]) {
        const minifiedId = `p${Object.keys(state.parameterMap).length}`;
        state.parameterMap[minifiedId] = originalId;
        state.reverseParameterMap[originalId] = minifiedId;
      }
    },
  },
});

export const { actions: raceActions } = raceSlice;

export const useRaceSlice = () => {
  useInjectReducer({ key: raceSlice.name, reducer: raceSlice.reducer });
  return { actions: raceSlice.actions };
};

export const raceReducer = raceSlice.reducer;
