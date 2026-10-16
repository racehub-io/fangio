import { useContext, useEffect, useReducer } from 'react';
import { AuthProvider, useFirebaseApp, useAuth } from 'reactfire';
import { useSelector } from 'react-redux';
import { getAuth } from 'firebase/auth';
import { selectIsConnected } from 'store/client/slice/selectors';
import { WebsocketContext } from './WebSocketProvider';
import { WEB_RESPONSE_AUTH_TOKEN } from 'store/client/actions';

const initialState = { uid: '', token: '' };

function reducer(state, action) {
  switch (action.type) {
    case 'setUidToken':
      return { uid: action.uid, token: action.token };
    default:
      throw new Error();
  }
}

const Watcher = () => {
  const { send } = useContext(WebsocketContext);
  const isConnected = useSelector(selectIsConnected);
  const [state, dispatch] = useReducer(reducer, initialState);

  const auth = useAuth();

  useEffect(() => {
    const message = {
      action: WEB_RESPONSE_AUTH_TOKEN,
      payload: state,
    };

    if (isConnected && state.uid && state.token) {
      send(JSON.stringify(message));
    }
  }, [isConnected, send, state]);

  useEffect(() => {
    auth.onIdTokenChanged(async user => {
      const uid = user?.uid;
      const token = await user?.getIdToken();

      if (!uid || !token) {
        dispatch({ type: 'setUidToken', uid: '', token: '' });
        return;
      }

      dispatch({ type: 'setUidToken', uid, token });
    });
  }, [auth]);

  return null;
};

export const AuthTokenWatcher = () => {
  const firebaseApp = useFirebaseApp();
  const auth = getAuth(firebaseApp);

  return (
    <AuthProvider sdk={auth}>
      <Watcher />
    </AuthProvider>
  );
};
