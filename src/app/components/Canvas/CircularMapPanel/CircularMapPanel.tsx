import classNames from 'classnames';
import { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  selectLatestTelemetry,
  selectSelectedTelemetry,
  selectTelemetryParticipants,
} from 'store/race/slice/selectors';
import { PropertySelectors } from '../PropertySelector';
import styles from './CircularMapPanel.module.scss';
import { RootState } from 'types';

export function CircularMapPanel({ id }: { id: string }) {
  const selectedTelemetry = useSelector((state: RootState) =>
    selectSelectedTelemetry(state, id),
  );
  const [isToastOpen, setIsToastOpen] = useState(false);

  const participantsSelector = useMemo(
    () => selectTelemetryParticipants(selectedTelemetry.recorderId),
    [selectedTelemetry.recorderId],
  );
  const participants = useSelector(participantsSelector);

  return (
    <>
      <PropertySelectors
        id={id}
        recorderId={selectedTelemetry.recorderId}
        componentName={'Circular Map Display'}
        isToastOpen={isToastOpen}
        selectedParticipantId={selectedTelemetry.participantIds}
        onSetIsToastOpen={setIsToastOpen}
        hideParameterSelector
        multipleParticipants
      />

      {!isToastOpen &&
      selectedTelemetry.recorderId &&
      participants &&
      selectedTelemetry.participantIds &&
      selectedTelemetry.participantIds?.length > 0 &&
      selectedTelemetry.participantIds !== undefined ? (
        <CircularMap
          recorderId={selectedTelemetry.recorderId}
          participantIds={selectedTelemetry.participantIds}
          participants={participants}
        />
      ) : !isToastOpen ? (
        <div className={styles.noData}>No data</div>
      ) : null}
    </>
  );
}

function CircularMap({ participantIds, participants, recorderId }) {
  const telemetry = useSelector((state: RootState) =>
    selectLatestTelemetry(state, recorderId),
  );

  if (!telemetry || !telemetry['lap_distance'] || !telemetry['track_length']) {
    return <div className={styles.noData}>No data</div>;
  }

  const size = 250;

  const participantCircles = participantIds
    .map(participantId => {
      const lapDistance = telemetry['lap_distance']?.[participantId];
      const trackLength = telemetry['track_length']?.[participantId];

      if (lapDistance === undefined || trackLength === undefined) {
        // Skip this participant if data is missing
        return null;
      }

      const normalisedLapDistance = lapDistance < 0 ? 0 : lapDistance;
      const teamName = participants.team_name[participantId] || 'Unknown';
      const participantName =
        participants.player_name[participantId] || 'Unknown';
      const teamClassName = `team${teamName.replace(/\s+/g, '')}`;
      const valueClass = classNames(styles[teamClassName]);
      const value = normalisedLapDistance / trackLength;
      const radius = size / 2 - 10;
      const radians = value * 2 * Math.PI - Math.PI / 2;
      const x = radius * Math.cos(radians) + size / 2;
      const y = radius * Math.sin(radians) + size / 2;

      return {
        normalisedLapDistance,
        participantName,
        trackLength,
        valueClass,
        x,
        y,
      };
    })
    .filter(circle => circle !== null);

  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        top: `calc(50% - ${size / 2}px + 5px)`,
        position: 'absolute',
      }}
    >
      <div className={styles.background} />
      {participantCircles.map(participantCircle => (
        <div
          key={`participant-circle-${participantCircle.participantName}`}
          className={participantCircle.valueClass}
          style={{
            width: '20px',
            height: '20px',
            left: `${participantCircle.x - 10}px`,
            top: `${participantCircle.y - 10}px`,
            borderRadius: '50%',
            position: 'absolute',
          }}
        >
          <div className={styles.circleData}>
            <div className={styles.circleName}>
              {participantCircle.participantName}
            </div>
            <div className={styles.circleProgress}>
              {(
                (participantCircle.normalisedLapDistance /
                  participantCircle.trackLength) *
                100
              ).toFixed(1)}
              %
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
