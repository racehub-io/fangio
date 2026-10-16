import { useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';

import { killClient } from 'utils/helpers';
import {
  selectIsConnected,
  selectActiveRecorderIds,
  selectParserQueueLength,
  selectParserCurrentSession,
  selectClientVersion,
} from 'store/client/slice/selectors';
import styles from './ClientStatus.module.scss';
import { WebsocketContext } from 'app/WebSocketProvider';

interface ParserCurrentSession {
  recorderType: string;
  filepath: string;
  progress: number;
  trackName: string;
  sessionType: string;
}

export const ClientStatus = () => {
  const { send } = useContext(WebsocketContext);
  const isConnected: boolean = useSelector(selectIsConnected);
  const [isLatestVersion, setIsLatestVersion] = useState(false);
  const activeRecorderIds: string[] = useSelector(selectActiveRecorderIds);
  const parserQueueLength: number = useSelector(selectParserQueueLength);
  const parserCurrentSession: ParserCurrentSession = useSelector(
    selectParserCurrentSession,
  );
  const clientVersion = useSelector(selectClientVersion);

  const versionText = useMemo(
    () =>
      `${clientVersion.major}.${clientVersion.minor}.${clientVersion.patch}`,
    [clientVersion.major, clientVersion.minor, clientVersion.patch],
  );

  const progress = useMemo(
    () => parserCurrentSession.progress,
    [parserCurrentSession.progress],
  );

  useEffect(() => {
    if (
      clientVersion.major >= 0 &&
      clientVersion.minor >= 0 &&
      clientVersion.patch >= 5
    ) {
      setIsLatestVersion(true);
    }
  }, [clientVersion.major, clientVersion.minor, clientVersion.patch]);

  const handleKillClient = useCallback(() => {
    if (isConnected) {
      killClient(send);
    }
  }, [isConnected, send]);

  const renderParsingProgress = useMemo(() => {
    if (!parserCurrentSession.filepath) return null;

    return (
      <div className={styles.item}>
        <div className={styles.progressBarWrapper}>
          <span className="icon">📄</span>
          Parsing {parserCurrentSession.recorderType}:{' '}
          {parserCurrentSession.trackName} {parserCurrentSession.sessionType} (
          {progress.toFixed(0)}%)
          <div
            className={styles.progressBarItem}
            style={{
              width: `${progress ? progress : 0}%`,
            }}
          />
        </div>
      </div>
    );
  }, [parserCurrentSession, progress]);

  return (
    <nav className={styles.wrapper}>
      <div onClick={handleKillClient}>
        <span className="icon">📡</span>
        Client:{' '}
        {isConnected ? 'Connected' : 'Disconnected'}
      </div>
      {isConnected && (
        <>
          <div className={styles.item}>
            <span className="icon">📡</span>
            {activeRecorderIds.length} active recorder
            {activeRecorderIds.length !== 1 ? 's' : ''}
          </div>
          <div className={styles.item}>
            <span className="icon">📁</span>
            {parserQueueLength} session{parserQueueLength !== 1 ? 's' : ''} in
            parsing queue
          </div>
          {renderParsingProgress}
          <div className={styles.item}>
            <div>
              <span className="icon">📦</span>
              Client version: {versionText}
              {isLatestVersion ? '' : ' (update available)'}
            </div>
          </div>
        </>
      )}
    </nav>
  );
};
