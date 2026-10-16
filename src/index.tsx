import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import * as React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { DndProvider } from 'react-dnd-multi-backend';
import HTML5toTouch from 'react-dnd-multi-backend/dist/cjs/HTML5toTouch';
import { App } from 'app';
import { HelmetProvider } from 'react-helmet-async';
import { UIProvider } from 'store/context';
import { configureAppStore } from 'store/configureStore';

import { WebsocketProvider } from 'app/WebSocketProvider';
import { PersistGate } from 'redux-persist/integration/react';

const { store, persistor } = configureAppStore();

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

root.render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <UIProvider>
          <WebsocketProvider>
            <HelmetProvider>
              <React.StrictMode>
                <DndProvider options={HTML5toTouch}>
                  <App />
                </DndProvider>
              </React.StrictMode>
            </HelmetProvider>
          </WebsocketProvider>
      </UIProvider>
    </PersistGate>
  </Provider>,
);
