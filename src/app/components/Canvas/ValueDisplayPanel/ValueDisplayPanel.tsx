import { useState } from 'react';
import { useSelector } from 'react-redux';
import classNames from 'classnames';
import {
  selectLatestTelemetry,
  selectSelectedTelemetry,
  selectTelemetryParticipants,
  selectRecorderIds,
} from 'store/race/slice/selectors';
import { PropertySelectors } from '../PropertySelector';
import styles from './ValueDisplayPanel.module.scss';
import { RootState } from 'types';

export function ValueDisplayPanel({ id }: { id: string }) {
  const selectedTelemetry = useSelector((state: RootState) =>
    selectSelectedTelemetry(state, id),
  );
  const [isToastOpen, setIsToastOpen] = useState(false);
  const recorderIds = useSelector(selectRecorderIds);
  const hasData = recorderIds.length > 0;
  const participants = useSelector(
    selectTelemetryParticipants(selectedTelemetry.recorderId),
  );

  return (
    <>
      <PropertySelectors
        id={id}
        recorderId={selectedTelemetry.recorderId}
        componentName={'Value Display'}
        isToastOpen={isToastOpen}
        selectedParameter={selectedTelemetry.parameterId}
        selectedParticipantId={selectedTelemetry.participantIds}
        onSetIsToastOpen={setIsToastOpen}
      />
      {selectedTelemetry.parameterId &&
      selectedTelemetry.recorderId &&
      participants &&
      selectedTelemetry.participantIds !== undefined ? (
        <ValueDisplay
          recorderId={selectedTelemetry.recorderId}
          parameter={selectedTelemetry.parameterId}
          participantId={selectedTelemetry.participantIds}
          participants={participants}
        />
      ) : !isToastOpen ? (
        <div className={styles.noData}>
          {hasData ? 'Select data to visualize' : 'No data'}
        </div>
      ) : null}
    </>
  );
}

function ValueDisplay({ parameter, participantId, recorderId, participants }) {
  const telemetry = useSelector((state: RootState) =>
    selectLatestTelemetry(state, recorderId),
  );

  if (!telemetry) {
    return <div className={styles.noData}>No data</div>;
  }

  const currentValue = telemetry[parameter][participantId];
  const teamName = participants.team_name[participantId];
  const teamClassName = `team${teamName.replace(/\s+/g, '')}`;
  const valueClass = classNames(styles.value, styles[teamClassName]);

  return <div className={valueClass}>{currentValue}</div>;
}
