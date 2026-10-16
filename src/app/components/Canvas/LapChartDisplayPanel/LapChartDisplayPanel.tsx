import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  selectLatestTelemetry,
  selectSelectedTelemetry,
  selectTelemetryParticipants,
} from 'store/race/slice/selectors';
import { PropertySelectors } from '../PropertySelector';
import styles from './LapChartDisplayPanel.module.scss';
import { RootState } from 'types';

type LapData = {
  lapNumber: number;
  lapTime: number;
  deltaToBest: number | null;
};

export function LapChartDisplayPanel({ id }: { id: string }) {
  const selectedTelemetry = useSelector((state: RootState) =>
    selectSelectedTelemetry(state, id),
  );
  const [isToastOpen, setIsToastOpen] = useState(true);
  const participants = useSelector(
    selectTelemetryParticipants(selectedTelemetry.recorderId),
  );

  const [laps, setLaps] = useState<LapData[]>([]);
  const [currentLap, setCurrentLap] = useState<number | null>(null);
  const [bestLapTime, setBestLapTime] = useState<number | null>(null);

  return (
    <>
      <PropertySelectors
        id={id}
        recorderId={selectedTelemetry.recorderId}
        componentName={'Lap Chart Display'}
        isToastOpen={isToastOpen}
        selectedParticipantId={selectedTelemetry.participantIds}
        onSetIsToastOpen={setIsToastOpen}
        hideParameterSelector={true}
      />
      {selectedTelemetry.recorderId &&
      participants &&
      selectedTelemetry.participantIds !== undefined ? (
        <LapChartDisplay
          recorderId={selectedTelemetry.recorderId}
          participantId={selectedTelemetry.participantIds}
          participants={participants}
          laps={laps}
          setLaps={setLaps}
          currentLap={currentLap}
          setCurrentLap={setCurrentLap}
          bestLapTime={bestLapTime}
          setBestLapTime={setBestLapTime}
        />
      ) : !isToastOpen ? (
        <div className={styles.noData}>No data</div>
      ) : null}
    </>
  );
}

function LapChartDisplay({
  participantId,
  recorderId,
  participants,
  laps,
  setLaps,
  currentLap,
  setCurrentLap,
  bestLapTime,
  setBestLapTime,
}: {
  participantId: number;
  recorderId: string;
  participants: any;
  laps: LapData[];
  setLaps: (laps: LapData[]) => void;
  currentLap: number | null;
  setCurrentLap: (lap: number) => void;
  bestLapTime: number | null;
  setBestLapTime: (time: number) => void;
}) {
  const telemetry = useSelector((state: RootState) =>
    selectLatestTelemetry(state, recorderId),
  );

  useEffect(() => {
    if (!telemetry) {
      return;
    }

    const lap_number = telemetry[`lap_number`][participantId];

    if (currentLap === null) {
      setCurrentLap(lap_number);
      return;
    }

    let newLaps = laps;

    if (lap_number > currentLap) {
      const previous_lap_time = telemetry[`previous_lap_time`][participantId];
      const finishedLap: LapData = {
        lapNumber: currentLap,
        lapTime: previous_lap_time,
        deltaToBest: bestLapTime ? previous_lap_time - bestLapTime : null,
      };

      if (!bestLapTime || previous_lap_time < bestLapTime) {
        setBestLapTime(previous_lap_time);
        newLaps.forEach(lap => {
          lap.deltaToBest = bestLapTime ? lap.lapTime - bestLapTime : null;
        });
      }

      console.log({ finishedLap });
      setCurrentLap(lap_number);
      newLaps = [...laps, finishedLap];
    }

    setLaps(newLaps);
  }, [
    telemetry,
    participantId,
    setLaps,
    setCurrentLap,
    setBestLapTime,
    bestLapTime,
    laps,
    currentLap,
  ]);

  return (
    <div className={styles.lapChart}>
      <h4>Best Lap: {bestLapTime ? bestLapTime.toFixed(3) + 's' : 'N/A'}</h4>
      <table>
        <thead>
          <tr>
            <th>Lap</th>
            <th>Lap Time (s)</th>
            <th>Delta to Best (s)</th>
          </tr>
        </thead>
        <tbody>
          {laps.map(lap => (
            <tr key={lap.lapNumber}>
              <td>{lap.lapNumber}</td>
              <td>{lap.lapTime?.toFixed(2)}</td>
              <td>
                {lap.deltaToBest !== null ? lap.deltaToBest.toFixed(2) : 'N/A'}
              </td>
            </tr>
          ))}
          <tr>
            <td>{currentLap !== null ? currentLap : 'N/A'}</td>
            <td>...</td>
            <td>...</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
