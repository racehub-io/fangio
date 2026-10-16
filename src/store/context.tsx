import React, { useEffect } from 'react';
import { User } from 'firebase/auth';
import { useDispatch as useReduxDispatch } from 'react-redux';
import {
  RECORDER_STATUS,
  SELECT_PRIMARY_LAP,
  REMOVE_COMPONENT,
  ADD_COMPONENT,
  UPDATE_LAYOUTS,
  RESTORE_CANVAS,
  UPDATE_WS_STATUS,
} from 'store/race/actions';
import {
  getInitialCanvas,
  initialLayout,
} from '../app/components/Canvas/config';
import { useClientSlice } from './client/slice';
import { RecorderType } from './client/slice/types';

export const RACEHUB_LAYOUT = 'racehub.layout';

export enum UploadStatus {
  NotStarted = 0,
  Starting,
  Uploading,
  Parsing,
}

interface State {
  isParsing: boolean;
  propertySelectors?: any;
  user?: User;
  participants: any;
  selectedDriver: number;
  primaryLapId: string | undefined;
  wsStatus: number;
  canvas: any;
  layouts: any;
}

export const initialState: State = {
  propertySelectors: {},
  selectedDriver: 0,
  user: undefined,
  participants: [],
  primaryLapId: undefined,
  isParsing: false,
  wsStatus: WebSocket.CLOSED,
  canvas: getInitialCanvas(),
  layouts: initialLayout,
};

export function UIReducer(state: State, action: any): any {
  switch (action.type) {
    case RESTORE_CANVAS: {
      return { ...state, canvas: action.canvas, layouts: action.layout };
    }

    case ADD_COMPONENT: {
      const { id, width = 4, height = 4 } = action.payload;
      const updatedCanvas = [...state.canvas, id];
      return {
        ...state,
        canvas: updatedCanvas,
        layouts: {
          lg: [
            ...state.layouts.lg,
            {
              i: id,
              resizeHandles: ['se'],
              x: 0,
              y: 0,
              w: width,
              h: height,
            },
          ],
        },
      };
    }

    case REMOVE_COMPONENT: {
      const { id } = action.payload;

      const filteredCanvas = state.canvas.filter(component => component !== id);

      const removeComponentFromLayout = layout => {
        return layout.filter(item => item.i !== id);
      };

      const updatedLayouts = Object.keys(state.layouts).reduce((acc, key) => {
        acc[key] = removeComponentFromLayout(state.layouts[key]);
        return acc;
      }, {});

      return {
        ...state,
        canvas: filteredCanvas,
        layouts: updatedLayouts,
      };
    }

    case UPDATE_LAYOUTS: {
      return { ...state, layouts: { lg: action.newLayout } };
    }

    case RECORDER_STATUS: {
      return { ...state, recorderInfo: action.payload };
    }

    case SELECT_PRIMARY_LAP: {
      if (state.primaryLapId === action.primaryLapId) {
        return { ...state, primaryLapId: undefined };
      }

      return { ...state, primaryLapId: action.primaryLapId };
    }

    case UPDATE_WS_STATUS: {
      return { ...state, wsStatus: action.status };
    }

    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

export const UIContext = React.createContext({
  dispatch: (value: any) => {},
  state: initialState,
});

function useLoadedState() {
  const localState = localStorage.getItem(RACEHUB_LAYOUT);
  let stateToLoad = { ...initialState };

  if (localState) {
    const savedState = JSON.parse(localState);
    if (savedState.canvas !== undefined) {
      stateToLoad.canvas = savedState.canvas;
    }
    if (savedState.layouts !== undefined) {
      stateToLoad.layouts = savedState.layouts;
    }
    if (savedState.propertySelectors !== undefined) {
      stateToLoad.propertySelectors = savedState.propertySelectors;
    }
  }

  return stateToLoad;
}

export function UIProvider({ children }: { children: React.ReactNode }) {
  const reduxDispatch = useReduxDispatch();
  const { actions: clientActions } = useClientSlice();
  const loadedState = useLoadedState();
  const [state, dispatch] = React.useReducer(UIReducer, loadedState);

  useEffect(() => {
    loadedState.canvas
      .filter(e => e.includes('recorder_'))
      .forEach(recorderToAdd => {
        reduxDispatch(
          clientActions.addRecorder({
            recorderId: recorderToAdd,
            recorderType: RecorderType.F12024,
          }),
        );
      });

    const { canvas, layouts, propertySelectors } = state;

    const stateToSave = {
      ...(canvas ? { canvas } : {}),
      ...(layouts ? { layouts } : {}),
      ...(propertySelectors ? { propertySelectors } : {}),
      timestamp: Date.now(),
    };

    if (Object.keys(stateToSave).length > 0) {
      localStorage.setItem(RACEHUB_LAYOUT, JSON.stringify(stateToSave));
    }
  }, [
    state,
    reduxDispatch,
    clientActions.addRecorder,
    loadedState.canvas,
    clientActions,
  ]);

  return (
    <UIContext.Provider value={{ state, dispatch }}>
      {children}
    </UIContext.Provider>
  );
}

export function useStore(): { store: State } {
  const context = React.useContext(UIContext);
  return { store: context.state };
}

export function useDispatch() {
  const context = React.useContext(UIContext);
  return { dispatch: context.dispatch };
}
