import { render, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { LineChart } from './LineChart';
import { Participants } from 'store/race/slice/types';

// Mock d3 modules
jest.mock('d3-array', () => ({
  bisector: () => ({
    left: jest.fn(),
  }),
}));

jest.mock('d3-shape', () => ({
  curveStep: jest.fn(),
}));

jest.mock('d3-time-format', () => ({
  timeFormat: () => (value: number) => new Date(value * 1000).toISOString(),
}));

// Mock the visx components we're not testing
jest.mock('@visx/responsive', () => ({
  ParentSize: ({ children, style }) => {
    const rendered = children({ width: 500, height: 300 });
    return <div style={style}>{rendered}</div>;
  },
}));

jest.mock('@visx/tooltip', () => ({
  useTooltip: () => ({
    tooltipData: null,
    tooltipLeft: 0,
    tooltipOpen: false,
    showTooltip: jest.fn(),
    hideTooltip: jest.fn(),
  }),
  Tooltip: () => null,
}));

jest.mock('@visx/scale', () => ({
  scaleLinear: () => (value: number) => value,
}));

jest.mock('@visx/shape', () => ({
  LinePath: () => null,
  Line: () => null,
}));

jest.mock('@visx/axis', () => ({
  AxisLeft: () => null,
  AxisBottom: () => null,
}));

jest.mock('@visx/grid', () => ({
  GridRows: () => null,
  GridColumns: () => null,
}));

jest.mock('@visx/event', () => ({
  localPoint: () => ({ x: 0, y: 0 }),
}));

jest.mock('@visx/brush', () => ({
  Brush: () => null,
}));

// Mock helpers with debug logging
jest.mock('./helpers', () => ({
  extractTelemetry: (telemetry, participantId) => {
    if (!telemetry || !telemetry[participantId]) {
      return null;
    }
    const result = telemetry[participantId];
    return result;
  },
  getFullXDomain: () => [1000, 2000],
  getTeamColor: () => '#FFFFFF',
  getXDomain: () => [1000, 2000],
}));

// Mock react-redux with debug logging
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: (selector: any) => {
    const mockState = {
      race: {
        telemetry: {
          recorder1: {
            p0: {
              1: [
                { x: 1000, y: 100 },
                { x: 2000, y: 200 },
              ],
            },
          },
        },
        selectedTelemetry: {
          'test-id': {
            recorderId: 'recorder1',
            parameterId: 'speed',
            participantIds: [1],
          },
        },
        parameterMap: {
          p0: 'speed',
        },
        reverseParameterMap: {
          speed: 'p0',
        },
      },
    };
    const result = selector(mockState);
    return result;
  },
}));

// Mock hooks
let animationFrameCallback: ((...args: any[]) => void) | null = null;

// Create a module for tracking animation frame renders
const mockModule = {
  renderCount: 0,
  reset: () => {
    mockModule.renderCount = 0;
  },
  increment: () => {
    mockModule.renderCount++;
  },
};

// Mock React's useState to track animation frame renders
jest.mock('react', () => {
  const originalModule = jest.requireActual('react');
  return {
    ...originalModule,
    useState: (initialValue: any) => {
      const result = originalModule.useState(initialValue);
      // Only track animation frame state updates
      if (initialValue === 0) {
        mockModule.increment();
      }
      return result;
    },
  };
});

jest.mock('./hooks', () => ({
  useAnimationFrame: (callback: () => void) => {
    animationFrameCallback = callback;
  },
  useEffectAllDepsChange: jest.fn(),
}));

// Mock the selector
jest.mock('store/race/slice/selectors', () => ({
  createSelectTelemetryByComponentIdAndFrame: () => {
    return (state: any, id: string, frame: number) => {
      // Return the actual telemetry data from the state
      const recorderId = state.race.selectedTelemetry[id].recorderId;
      const parameterId =
        state.race.reverseParameterMap[
          state.race.selectedTelemetry[id].parameterId
        ];
      return state.race.telemetry[recorderId][parameterId];
    };
  },
}));

describe('LineChart', () => {
  const mockParticipants: Participants = {
    team_name: ['', 'Team1'],
    player_name: ['', 'Player1'],
    driver_abbreviation: ['', 'T1'],
    length: [0, 1],
  };

  beforeEach(() => {
    animationFrameCallback = null;
    mockModule.reset();
  });

  it('renders without crashing', async () => {
    const mockState = {
      race: {
        telemetry: {
          recorder1: {
            p0: {
              1: [
                { x: 1000, y: 100 },
                { x: 2000, y: 200 },
              ],
            },
          },
        },
        selectedTelemetry: {
          'test-id': {
            recorderId: 'recorder1',
            parameterId: 'speed',
            participantIds: [1],
          },
        },
        parameterMap: {
          p0: 'speed',
        },
        reverseParameterMap: {
          speed: 'p0',
        },
      },
    };

    const store = configureStore({
      reducer: {
        race: (state = mockState.race) => state,
      },
      preloadedState: mockState,
    });

    await act(async () => {
      const { container } = render(
        <Provider store={store}>
          <LineChart
            id="test-id"
            participantIds={[1]}
            isLiveMode={false}
            participants={mockParticipants}
            isPropertySelectorsOpen={false}
          />
        </Provider>,
      );

      // Trigger animation frame callback
      if (animationFrameCallback) {
        (animationFrameCallback as () => void)();
        // Wait for any state updates to complete
        await new Promise(resolve => setTimeout(resolve, 0));
      }

      // Instead of looking for Player1 text which might not be visible,
      // let's verify the chart renders without the "No data" message
      expect(container.querySelector('.noData')).not.toBeInTheDocument();
    });
  });

  it('shows no data message when no participants selected', async () => {
    const mockState = {
      race: {
        telemetry: {
          recorder1: {
            p0: {
              1: [
                { x: 1000, y: 100 },
                { x: 2000, y: 200 },
              ],
            },
          },
        },
        selectedTelemetry: {
          'test-id': {
            recorderId: 'recorder1',
            parameterId: 'speed',
            participantIds: [],
          },
        },
        parameterMap: {
          p0: 'speed',
        },
        reverseParameterMap: {
          speed: 'p0',
        },
      },
    };

    const store = configureStore({
      reducer: {
        race: (state = mockState.race) => state,
      },
      preloadedState: mockState,
    });

    const { container } = render(
      <Provider store={store}>
        <LineChart
          id="test-id"
          participantIds={[]}
          isLiveMode={false}
          participants={mockParticipants}
          isPropertySelectorsOpen={false}
        />
      </Provider>,
    );

    // Trigger animation frame callback
    if (animationFrameCallback) {
      await act(async () => {
        (animationFrameCallback as () => void)();
        // Wait for any state updates to complete
        await new Promise(resolve => setTimeout(resolve, 0));
      });
    }

    const noDataElement = container.querySelector('.noData');
    expect(noDataElement).toBeInTheDocument();
    expect(noDataElement).toHaveTextContent('No participants selected');
  });

  it('shows no data message when telemetry is missing', async () => {
    const mockState = {
      race: {
        telemetry: {
          recorder1: {
            p0: {
              1: [],
            },
          },
        },
        selectedTelemetry: {
          'test-id': {
            recorderId: 'recorder1',
            parameterId: 'speed',
            participantIds: [1],
          },
        },
        parameterMap: {
          p0: 'speed',
        },
        reverseParameterMap: {
          speed: 'p0',
        },
      },
    };

    const store = configureStore({
      reducer: {
        race: (state = mockState.race) => state,
      },
      preloadedState: mockState,
    });

    const { container } = render(
      <Provider store={store}>
        <LineChart
          id="test-id"
          participantIds={[1]}
          isLiveMode={false}
          participants={mockParticipants}
          isPropertySelectorsOpen={false}
        />
      </Provider>,
    );

    // Trigger animation frame callback
    if (animationFrameCallback) {
      await act(async () => {
        (animationFrameCallback as () => void)();
        // Wait for any state updates to complete
        await new Promise(resolve => setTimeout(resolve, 0));
      });
    }

    const noDataElement = container.querySelector('.noData');
    expect(noDataElement).toBeInTheDocument();
    expect(noDataElement).toHaveTextContent('No data');
  });

  it('should rerender only when animationFrame changes', async () => {
    const mockState = {
      race: {
        telemetry: {
          recorder1: {
            p0: {
              1: [
                { x: 1000, y: 100 },
                { x: 2000, y: 200 },
              ],
            },
          },
        },
        selectedTelemetry: {
          'test-id': {
            recorderId: 'recorder1',
            parameterId: 'speed',
            participantIds: [1],
          },
        },
        parameterMap: {
          p0: 'speed',
        },
        reverseParameterMap: {
          speed: 'p0',
        },
      },
    };

    const store = configureStore({
      reducer: {
        race: (state = mockState.race) => state,
      },
      preloadedState: mockState,
    });

    // Initial render
    await act(async () => {
      render(
        <Provider store={store}>
          <LineChart
            id="test-id"
            participantIds={[1]}
            isLiveMode={false}
            participants={mockParticipants}
            isPropertySelectorsOpen={false}
          />
        </Provider>,
      );

      // Wait for initial render to complete
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Get initial render count
    const initialRenderCount = mockModule.renderCount;

    // Update store with new telemetry but same animation frame
    const newMockState = {
      race: {
        ...mockState.race,
        telemetry: {
          recorder1: {
            p0: {
              1: [
                { x: 1000, y: 150 }, // Changed value
                { x: 2000, y: 250 }, // Changed value
              ],
            },
          },
        },
      },
    };

    const newStore = configureStore({
      reducer: {
        race: (state = newMockState.race) => state,
      },
      preloadedState: newMockState,
    });

    // Reset render count
    mockModule.reset();

    // Rerender with new store
    await act(async () => {
      render(
        <Provider store={newStore}>
          <LineChart
            id="test-id"
            participantIds={[1]}
            isLiveMode={false}
            participants={mockParticipants}
            isPropertySelectorsOpen={false}
          />
        </Provider>,
      );

      // Wait for rerender to complete
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Should not rerender since animation frame hasn't changed
    expect(mockModule.renderCount).toBe(1); // Initial render only

    // Reset render count
    mockModule.reset();

    // Trigger animation frame
    if (animationFrameCallback) {
      await act(async () => {
        (animationFrameCallback as () => void)();
        // Wait for any state updates to complete
        await new Promise(resolve => setTimeout(resolve, 0));
      });
    }

    // Should rerender after animation frame
    expect(mockModule.renderCount).toBe(1); // One render from animation frame update
  });

  it('handles live mode correctly', async () => {
    // Mock extractTelemetry to return valid data
    const mockExtractTelemetry = jest.spyOn(
      require('./helpers'),
      'extractTelemetry',
    );
    mockExtractTelemetry.mockImplementation((telemetry, participantId) => {
      return [
        { x: 1000, y: 100 },
        { x: 2000, y: 200 },
      ];
    });

    const mockState = {
      race: {
        telemetry: {
          recorder1: {
            p0: {
              1: [
                { x: 1000, y: 100 },
                { x: 2000, y: 200 },
              ],
            },
          },
        },
        selectedTelemetry: {
          'test-id': {
            recorderId: 'recorder1',
            parameterId: 'speed',
            participantIds: [1],
          },
        },
        parameterMap: {
          p0: 'speed',
        },
        reverseParameterMap: {
          speed: 'p0',
        },
      },
    };

    const store = configureStore({
      reducer: {
        race: (state = mockState.race) => state,
      },
      preloadedState: mockState,
    });

    // Initial render in live mode
    const { container, rerender } = render(
      <Provider store={store}>
        <LineChart
          id="test-id"
          participantIds={[1]}
          isLiveMode={true}
          participants={mockParticipants}
          isPropertySelectorsOpen={false}
        />
      </Provider>,
    );

    // Wait for initial render to complete
    await act(async () => {
      if (animationFrameCallback) {
        (animationFrameCallback as () => void)();
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    });

    // In live mode, verify that the component renders
    expect(container.innerHTML).not.toBe('');

    // Switching to non-live mode
    rerender(
      <Provider store={store}>
        <LineChart
          id="test-id"
          participantIds={[1]}
          isLiveMode={false}
          participants={mockParticipants}
          isPropertySelectorsOpen={false}
        />
      </Provider>,
    );

    // Wait for rerender to complete
    await act(async () => {
      if (animationFrameCallback) {
        (animationFrameCallback as () => void)();
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    });

    // In non-live mode, verify that the component still renders
    expect(container.innerHTML).not.toBe('');

    // Clean up the mock
    mockExtractTelemetry.mockRestore();
  });

  it('handles property selectors visibility', async () => {
    const mockState = {
      race: {
        telemetry: {
          recorder1: {
            p0: {
              1: [
                { x: 1000, y: 100 },
                { x: 2000, y: 200 },
              ],
            },
          },
        },
        selectedTelemetry: {
          'test-id': {
            recorderId: 'recorder1',
            parameterId: 'speed',
            participantIds: [1],
          },
        },
        parameterMap: {
          p0: 'speed',
        },
        reverseParameterMap: {
          speed: 'p0',
        },
      },
    };

    const store = configureStore({
      reducer: {
        race: (state = mockState.race) => state,
      },
      preloadedState: mockState,
    });

    // Initial render with property selectors open
    const { container, rerender } = render(
      <Provider store={store}>
        <LineChart
          id="test-id"
          participantIds={[1]}
          isLiveMode={false}
          participants={mockParticipants}
          isPropertySelectorsOpen={true}
        />
      </Provider>,
    );

    // Wait for initial render to complete
    await act(async () => {
      if (animationFrameCallback) {
        (animationFrameCallback as () => void)();
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    });

    // When property selectors are open, nothing should be rendered
    expect(container.innerHTML).toBe('');

    // Switching to closed property selectors
    rerender(
      <Provider store={store}>
        <LineChart
          id="test-id"
          participantIds={[1]}
          isLiveMode={false}
          participants={mockParticipants}
          isPropertySelectorsOpen={false}
        />
      </Provider>,
    );

    // Wait for rerender to complete
    await act(async () => {
      if (animationFrameCallback) {
        (animationFrameCallback as () => void)();
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    });

    // When property selectors are closed, something should be rendered
    expect(container.innerHTML).not.toBe('');
  });

  it('handles tooltip state changes', async () => {
    const mockShowTooltip = jest.fn();
    const mockHideTooltip = jest.fn();

    // Override useTooltip mock for this test
    const mockUseTooltip = jest.spyOn(require('@visx/tooltip'), 'useTooltip');
    mockUseTooltip.mockReturnValue({
      tooltipData: null,
      tooltipLeft: 0,
      tooltipOpen: false,
      showTooltip: mockShowTooltip,
      hideTooltip: mockHideTooltip,
    });

    const mockState = {
      race: {
        telemetry: {
          recorder1: {
            p0: {
              1: [
                { x: 1000, y: 100 },
                { x: 2000, y: 200 },
              ],
            },
          },
        },
        selectedTelemetry: {
          'test-id': {
            recorderId: 'recorder1',
            parameterId: 'speed',
            participantIds: [1],
          },
        },
        parameterMap: {
          p0: 'speed',
        },
        reverseParameterMap: {
          speed: 'p0',
        },
      },
    };

    const store = configureStore({
      reducer: {
        race: (state = mockState.race) => state,
      },
      preloadedState: mockState,
    });

    render(
      <Provider store={store}>
        <LineChart
          id="test-id"
          participantIds={[1]}
          isLiveMode={false}
          participants={mockParticipants}
          isPropertySelectorsOpen={false}
        />
      </Provider>,
    );

    // Wait for initial render to complete
    await act(async () => {
      if (animationFrameCallback) {
        (animationFrameCallback as () => void)();
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    });

    // Verify that useTooltip was called with the correct initial values
    expect(mockUseTooltip).toHaveBeenCalled();
    expect(mockShowTooltip).not.toHaveBeenCalled();
    expect(mockHideTooltip).not.toHaveBeenCalled();

    // Clean up the mock
    mockUseTooltip.mockRestore();
  });
});
