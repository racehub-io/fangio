import { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  selectLatestTelemetry,
  selectSelectedTelemetry,
  selectTelemetryParticipants,
} from 'store/race/slice/selectors';
import { PropertySelectors } from '../PropertySelector';
import styles from './TyreWearPitDisplayPanel.module.scss';
import { RootState } from 'types';

const renderTire = (position, temp, wear, age) => (
  <div className={styles.tireContainer}>
    <div className={styles.wearDisplay}>{`${wear}%`}</div>
    <div className={styles.tireVisual}>
      <div className={styles.tireStripes} />
    </div>
    <div className={styles.tireInfo}>
      <div>{`${temp}\u00b0C`}</div>
      <div>{`${age} Laps`}</div>
    </div>
  </div>
);

export function TyreWearPitDisplayPanel({ id }: { id: string }) {
  const selectedTelemetry = useSelector((state: RootState) =>
    selectSelectedTelemetry(state, id),
  );
  const [isToastOpen, setIsToastOpen] = useState(true);
  const participants = useSelector(
    selectTelemetryParticipants(selectedTelemetry.recorderId),
  );

  return (
    <>
      <PropertySelectors
        id={id}
        recorderId={selectedTelemetry.recorderId}
        componentName={'Tyres Display'}
        isToastOpen={isToastOpen}
        selectedParticipantId={selectedTelemetry.participantIds}
        onSetIsToastOpen={setIsToastOpen}
        hideParameterSelector={true}
      />
      {selectedTelemetry.recorderId &&
      participants &&
      selectedTelemetry.participantIds !== undefined ? (
        <TyreDisplay
          recorderId={selectedTelemetry.recorderId}
          participantId={selectedTelemetry.participantIds}
          participants={participants}
        />
      ) : !isToastOpen ? (
        <div className={styles.noData}>No data</div>
      ) : null}
    </>
  );
}

function TyreDisplay({ participantId, recorderId, participants }) {
  const telemetry = useSelector((state: RootState) =>
    selectLatestTelemetry(state, recorderId),
  );

  if (!telemetry) {
    return <div className={styles.noData}>No data</div>;
  }

  //console.log(telemetry);

  return (
    <div className={styles.container}>
      {/* replace true's when channels avail */}
      {/* Status Indicators */}
      <div
        className={`${styles.statusIndicator} ${
          true ? styles.pitLimiterOn : styles.pitLimiterOff
        }`}
      >
        PIT LIMITER {true ? 'ON' : 'OFF'}
      </div>

      <div
        className={`${styles.statusIndicator} ${
          true ? styles.inBox : styles.outBox
        }`}
      >
        {true ? 'IN BOX' : 'OUT OF BOX'}
      </div>

      {/* Speed Display */}
      {/* <div className={styles.speedDisplay}>{`${(0.0).toFixed(1)} MPH`}</div> */}

      {/* Tire Grid */}
      <div className={styles.tireGrid}>
        {['fl', 'fr', 'rl', 'rr'].map((tire, index) => (
          <div key={tire}>
            {renderTire(
              tire,
              telemetry[`tyres_wear_${tire}`][participantId],
              telemetry[`tyres_inner_temperature_${tire}`][participantId],
              11, //telemetry['tyre_age'][participantId] // TODO,
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
