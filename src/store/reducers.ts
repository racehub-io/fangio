import localforage from 'localforage';
import { combineReducers } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import { raceReducer } from './race/slice';

import { InjectedReducersType } from 'utils/types/injector-typings';

const persistConfig = {
  key: 'racehub',
  storage: localforage,
};

export function createReducer(injectedReducers: InjectedReducersType = {}) {
  const rootReducer = combineReducers({
    race: raceReducer,
    ...injectedReducers,
  });

  return persistReducer(persistConfig, rootReducer);
}

export type RootState = ReturnType<ReturnType<typeof createReducer>>;
