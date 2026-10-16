import { raceReducer, initialState, raceActions } from './reducer';

describe('race reducer', () => {
  it('should return the initial state', () => {
    expect(raceReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  describe('resetRaceSession', () => {
    it('should reset all state properties to initial values', () => {
      const previousState = {
        ...initialState,
        telemetry: { someData: {} },
        latestTelemetry: { someData: {} },
        selectedTelemetry: { someComponent: {} },
        telemetryMetadata: { someMetadata: {} },
        parameterMap: { p0: 'param1' },
        reverseParameterMap: { param1: 'p0' },
        simplificationBatching: { someBatch: {} },
      };

      expect(
        raceReducer(previousState, raceActions.resetRaceSession()),
      ).toEqual(initialState);
    });
  });

  describe('updateSelectedTelemetry', () => {
    it('should update selected telemetry for a component', () => {
      const payload = {
        componentId: 'comp1',
        recorderId: 'recorder1',
        parameterId: 'param1',
        participantIds: ['1', '2'],
      };

      const expectedState = {
        ...initialState,
        selectedTelemetry: {
          comp1: {
            recorderId: 'recorder1',
            parameterId: 'param1',
            participantIds: ['1', '2'],
          },
        },
      };

      expect(
        raceReducer(initialState, raceActions.updateSelectedTelemetry(payload)),
      ).toEqual(expectedState);
    });

    it('should preserve existing values when updating partially', () => {
      const initialStateWithTelemetry = {
        ...initialState,
        selectedTelemetry: {
          comp1: {
            recorderId: 'recorder1',
            parameterId: 'param1',
            participantIds: ['1', '2'],
          },
        },
      };

      const payload = {
        componentId: 'comp1',
        parameterId: 'param2',
      };

      const expectedState = {
        ...initialState,
        selectedTelemetry: {
          comp1: {
            recorderId: 'recorder1',
            parameterId: 'param2',
            participantIds: ['1', '2'],
          },
        },
      };

      expect(
        raceReducer(
          initialStateWithTelemetry,
          raceActions.updateSelectedTelemetry(payload),
        ),
      ).toEqual(expectedState);
    });
  });

  describe('removeSelectedTelemetry', () => {
    it('should remove selected telemetry and clean up unused data', () => {
      const stateWithTelemetry = {
        ...initialState,
        selectedTelemetry: {
          comp1: {
            recorderId: 'recorder1',
            parameterId: 'param1',
            participantIds: ['1'],
          },
        },
        telemetry: {
          recorder1: {
            param1: {
              '1': [{ x: 1, y: 1 }],
            },
          },
        },
      };

      const expectedState = {
        ...initialState,
        telemetry: {
          recorder1: {
            param1: {},
          },
        },
      };

      expect(
        raceReducer(
          stateWithTelemetry,
          raceActions.removeSelectedTelemetry({ componentId: 'comp1' }),
        ),
      ).toEqual(expectedState);
    });

    it('should not remove telemetry if it is used by another component', () => {
      const stateWithMultipleComponents = {
        ...initialState,
        selectedTelemetry: {
          comp1: {
            recorderId: 'recorder1',
            parameterId: 'param1',
            participantIds: ['1'],
          },
          comp2: {
            recorderId: 'recorder1',
            parameterId: 'param1',
            participantIds: ['1'],
          },
        },
        telemetry: {
          recorder1: {
            param1: {
              '1': [{ x: 1, y: 1 }],
            },
          },
        },
      };

      const expectedState = {
        ...initialState,
        selectedTelemetry: {
          comp2: {
            recorderId: 'recorder1',
            parameterId: 'param1',
            participantIds: ['1'],
          },
        },
        telemetry: {
          recorder1: {
            param1: {
              '1': [{ x: 1, y: 1 }],
            },
          },
        },
      };

      expect(
        raceReducer(
          stateWithMultipleComponents,
          raceActions.removeSelectedTelemetry({ componentId: 'comp1' }),
        ),
      ).toEqual(expectedState);
    });
  });

  describe('storeHistoricTelemetry', () => {
    it('should store and simplify historic telemetry data', () => {
      const payload = {
        recorderId: 'recorder1',
        parameter: 'param1',
        carIndex: '1',
        data: [
          { timestamp: 1, value: 1 },
          { timestamp: 2, value: 2 },
          { timestamp: 3, value: 3 },
        ],
      };

      const result = raceReducer(
        initialState,
        raceActions.storeHistoricTelemetry(payload),
      );

      expect(result.telemetry.recorder1.param1['1']).toBeDefined();
      expect(Array.isArray(result.telemetry.recorder1.param1['1'])).toBe(true);
      // The exact length might vary due to simplification, but we know it should contain points
      expect(result.telemetry.recorder1.param1['1'].length).toBeGreaterThan(0);
    });
  });

  describe('storeLatestTelemetry', () => {
    it('should store latest telemetry data', () => {
      const payload = {
        recorderId: 'recorder1',
        data: { param1: 100 },
      };

      const expectedState = {
        ...initialState,
        latestTelemetry: {
          recorder1: { param1: 100 },
        },
      };

      expect(
        raceReducer(initialState, raceActions.storeLatestTelemetry(payload)),
      ).toEqual(expectedState);
    });
  });

  describe('storeTelemetryMetadata', () => {
    it('should store telemetry metadata', () => {
      const payload = {
        recorderId: 'recorder1',
        data: { some: 'metadata' },
      };

      const expectedState = {
        ...initialState,
        telemetryMetadata: {
          recorder1: [{ some: 'metadata' }],
        },
      };

      expect(
        raceReducer(initialState, raceActions.storeTelemetryMetadata(payload)),
      ).toEqual(expectedState);
    });
  });

  describe('addParameterMapping', () => {
    it('should create new parameter mapping', () => {
      const payload = {
        originalId: 'speed',
      };

      const expectedState = {
        ...initialState,
        parameterMap: { p0: 'speed' },
        reverseParameterMap: { speed: 'p0' },
      };

      expect(
        raceReducer(initialState, raceActions.addParameterMapping(payload)),
      ).toEqual(expectedState);
    });

    it('should not create duplicate mapping for existing parameter', () => {
      const stateWithMapping = {
        ...initialState,
        parameterMap: { p0: 'speed' },
        reverseParameterMap: { speed: 'p0' },
      };

      const payload = {
        originalId: 'speed',
      };

      expect(
        raceReducer(stateWithMapping, raceActions.addParameterMapping(payload)),
      ).toEqual(stateWithMapping);
    });
  });

  describe('storeTelemetry', () => {
    it('should store and process telemetry data for selected parameters', () => {
      const stateWithSelection = {
        ...initialState,
        selectedTelemetry: {
          comp1: {
            recorderId: 'recorder1',
            parameterId: 'speed',
            participantIds: ['1'],
          },
        },
        parameterMap: { p0: 'speed' },
        reverseParameterMap: { speed: 'p0' },
      };

      const payload = {
        recorderId: 'recorder1',
        data: {
          speed: { 1: 100 },
          timestamp: { 1: 1000 },
        },
      };

      const result = raceReducer(
        stateWithSelection,
        raceActions.storeTelemetry(payload),
      );

      expect(result.parameterMap).toBeDefined();
      expect(result.reverseParameterMap).toBeDefined();
      expect(result.reverseParameterMap['speed']).toBeDefined();
      expect(
        result.telemetry.recorder1[result.reverseParameterMap['speed']]['1'],
      ).toBeDefined();
      expect(
        result.telemetry.recorder1[result.reverseParameterMap['speed']]['1'],
      ).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            x: 1000,
            y: 100,
          }),
        ]),
      );
    });

    it('should handle data simplification when batch size reaches window', () => {
      const stateWithSelection = {
        ...initialState,
        selectedTelemetry: {
          comp1: {
            recorderId: 'recorder1',
            parameterId: 'speed',
            participantIds: ['1'],
          },
        },
        simplificationBatching: {
          recorder1: {
            p0: {
              '1': 99, // One less than SIMPLIFICATION_WINDOW
            },
          },
        },
        parameterMap: { p0: 'speed' },
        reverseParameterMap: { speed: 'p0' },
        telemetry: {
          recorder1: {
            p0: {
              '1': Array.from({ length: 99 }, (_, i) => ({
                x: i,
                y: i * 2,
              })),
            },
          },
        },
      };

      const payload = {
        recorderId: 'recorder1',
        data: {
          speed: { 1: 200 },
          timestamp: { 1: 100 },
        },
      };

      const result = raceReducer(
        stateWithSelection,
        raceActions.storeTelemetry(payload),
      );

      // After simplification, the number of points should be less than the original
      expect(result.telemetry.recorder1.p0['1'].length).toBeLessThan(100);
      // The last point should be preserved
      expect(result.telemetry.recorder1.p0['1']).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            x: 100,
            y: 200,
          }),
        ]),
      );
      // Simplification batch counter should be reset
      expect(result.simplificationBatching.recorder1.p0['1']).toBe(0);
    });

    it('should ignore data for unselected telemetry', () => {
      const stateWithSelection = {
        ...initialState,
        selectedTelemetry: {
          comp1: {
            recorderId: 'recorder1',
            parameterId: 'speed',
            participantIds: ['1'],
          },
        },
        parameterMap: { p0: 'speed' },
        reverseParameterMap: { speed: 'p0' },
      };

      const payload = {
        recorderId: 'recorder1',
        data: {
          speed: { 1: 100 },
          rpm: { 1: 5000 }, // Unselected parameter
          timestamp: { 1: 1000 },
        },
      };

      const result = raceReducer(
        stateWithSelection,
        raceActions.storeTelemetry(payload),
      );

      // Verify that only selected parameter data is stored
      const speedParamId = result.reverseParameterMap['speed'];
      expect(result.telemetry.recorder1[speedParamId]['1']).toBeDefined();
      expect(result.telemetry.recorder1[speedParamId]['1']).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            y: 100,
          }),
        ]),
      );

      // Verify that unselected parameter data is not stored
      const rpmParamId = result.reverseParameterMap['rpm'];
      expect(result.telemetry.recorder1[rpmParamId]).toBeUndefined();
    });

    it('should handle simulation data with current timestamp', () => {
      const stateWithSelection = {
        ...initialState,
        selectedTelemetry: {
          comp1: {
            recorderId: 'recorder1',
            parameterId: 'speed',
            participantIds: ['1'],
          },
        },
        parameterMap: { p0: 'speed' },
        reverseParameterMap: { speed: 'p0' },
      };

      const payload = {
        recorderId: 'recorder1',
        data: {
          speed: { 1: 100 },
        },
        simulationIndex: 1,
      };

      const before = Date.now();
      const result = raceReducer(
        stateWithSelection,
        raceActions.storeTelemetry(payload),
      );
      const after = Date.now();

      const storedPoint =
        result.telemetry.recorder1[result.reverseParameterMap['speed']]['1'][0];
      expect(storedPoint.x).toBeGreaterThanOrEqual(before);
      expect(storedPoint.x).toBeLessThanOrEqual(after);
      expect(storedPoint.y).toBe(100);
    });
  });
});
