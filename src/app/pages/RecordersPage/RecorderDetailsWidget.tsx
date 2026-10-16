import { useSelector } from 'react-redux';
import { timeFormat } from 'd3-time-format';

import { selectRecorderInfo } from 'store/client/slice/selectors';

import { nFormatter, ETtoHHMMSS } from 'utils/helpers';
import { RootState } from 'types';

const dayTimeFormat = timeFormat('%H:%M:%S');

export const RecorderDetailsWidget = ({ recorderId }) => {
  const recorderInfo = useSelector((state: RootState) =>
    selectRecorderInfo(state, recorderId),
  );

  const {
    filepath,
    lastHeartbeat,
    messageCounts,
    sessionTime,
    sessionType,
    trackName,
  } = recorderInfo;

  return (
    <>
      <h3>Recorder Details</h3>
      <p>Filepath: {filepath}</p>
      <p>
        Last Heartbeat:{' '}
        {lastHeartbeat !== 0
          ? dayTimeFormat(new Date(lastHeartbeat * 1e3))
          : ''}
      </p>
      <p>
        Message Count:{' '}
        {messageCounts.length
          ? nFormatter(messageCounts[messageCounts.length - 1].count)
          : 0}
      </p>
      <p>Session Time: {sessionTime !== 0 ? ETtoHHMMSS(sessionTime) : ''}</p>
      <p>Session Type: {sessionType}</p>
      <p>Track Name: {trackName}</p>
    </>
  );
};
