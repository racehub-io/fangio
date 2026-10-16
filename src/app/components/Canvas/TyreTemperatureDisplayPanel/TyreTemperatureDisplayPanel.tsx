import { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  selectLatestTelemetry,
  selectSelectedTelemetry,
  selectTelemetryParticipants,
} from 'store/race/slice/selectors';
import { PropertySelectors } from '../PropertySelector';
import styles from './TyreTemperatureDisplayPanel.module.scss';
import { RootState } from 'types';

type ThresholdConfig = {
  greenMax: number;
  orangeMax: number;
};

function ThresholdConfigurator({
  config,
  onConfigChange,
}: {
  config: ThresholdConfig;
  onConfigChange: (config: ThresholdConfig) => void;
}) {
  return (
    <div className={styles.thresholdConfig}>
      <div className={styles.thresholdRow}>
        <span style={{ color: '#22c55e' }}>Green</span>
        <span>Below {config.greenMax}°C</span>
        <input
          type="range"
          min={0}
          max={config.orangeMax}
          value={config.greenMax}
          onChange={e =>
            onConfigChange({
              ...config,
              greenMax: Number(e.target.value),
            })
          }
        />
      </div>
      <div className={styles.thresholdRow}>
        <span style={{ color: '#f97316' }}>Orange</span>
        <span>
          {config.greenMax}°C - {config.orangeMax}°C
        </span>
        <input
          type="range"
          min={config.greenMax}
          max={150}
          value={config.orangeMax}
          onChange={e =>
            onConfigChange({
              ...config,
              orangeMax: Number(e.target.value),
            })
          }
        />
      </div>
      <div className={styles.thresholdRow}>
        <span style={{ color: '#ef4444' }}>Red</span>
        <span>Above {config.orangeMax}°C</span>
      </div>
    </div>
  );
}

export function TyreTemperatureDisplayPanel({ id }: { id: string }) {
  const selectedTelemetry = useSelector((state: RootState) =>
    selectSelectedTelemetry(state, id),
  );
  const [isToastOpen, setIsToastOpen] = useState(true);
  const [surfaceThresholds, setSurfaceThresholds] = useState<ThresholdConfig>({
    greenMax: 80,
    orangeMax: 110,
  });
  const [innerThresholds, setInnerThresholds] = useState<ThresholdConfig>({
    greenMax: 100,
    orangeMax: 140,
  });

  const participants = useSelector(
    selectTelemetryParticipants(selectedTelemetry.recorderId),
  );

  return (
    <>
      <PropertySelectors
        id={id}
        recorderId={selectedTelemetry.recorderId}
        componentName={'Tyre Temperature Display'}
        isToastOpen={isToastOpen}
        selectedParticipantId={selectedTelemetry.participantIds}
        onSetIsToastOpen={setIsToastOpen}
        hideParameterSelector={true}
        extraMenuItems={
          <>
            <ThresholdConfigurator
              config={surfaceThresholds}
              onConfigChange={setSurfaceThresholds}
            />
            <ThresholdConfigurator
              config={innerThresholds}
              onConfigChange={setInnerThresholds}
            />
          </>
        }
      />
      {selectedTelemetry.recorderId &&
      participants &&
      selectedTelemetry.participantIds !== undefined ? (
        <TyreTemperatureDisplay
          recorderId={selectedTelemetry.recorderId}
          participantId={selectedTelemetry.participantIds}
          surfaceThresholds={surfaceThresholds}
          innerThresholds={innerThresholds}
        />
      ) : !isToastOpen ? (
        <div className={styles.noData}>No data</div>
      ) : null}
    </>
  );
}

function TyreTemperatureDisplay({
  participantId,
  recorderId,
  surfaceThresholds,
  innerThresholds,
}: {
  participantId: number;
  recorderId: string;
  surfaceThresholds: ThresholdConfig;
  innerThresholds: ThresholdConfig;
}) {
  const telemetry = useSelector((state: RootState) =>
    selectLatestTelemetry(state, recorderId),
  );

  const getSurfaceTyreTemp = (wheel: string) => {
    if (!telemetry) return 0;
    return telemetry[`tyres_surface_temperature_${wheel}`][participantId];
  };
  const getInnerTyreTemp = (wheel: string) => {
    if (!telemetry) return 0;
    return telemetry[`tyres_inner_temperature_${wheel}`][participantId];
  };

  const getInnerColorFromTemp = (temp: number) => {
    if (temp <= innerThresholds.greenMax) return '#22c55e'; // green
    if (temp <= innerThresholds.orangeMax) return '#f97316'; // orange
    return '#ef4444'; // red
  };

  const getSurfaceColorFromTemp = (temp: number) => {
    if (temp <= surfaceThresholds.greenMax) return '#22c55e'; // green
    if (temp <= surfaceThresholds.orangeMax) return '#f97316'; // orange
    return '#ef4444'; // red
  };

  return (
    <div className={styles.container}>
      <div className={styles.tireGrid}>
        {['fl', 'fr', 'rl', 'rr'].map(wheel => {
          const surfaceTemp = getSurfaceTyreTemp(wheel);
          const innerTemp = getInnerTyreTemp(wheel);

          return (
            <div key={wheel} className={styles.tireContainer}>
              {!wheel.startsWith('r') && (
                <div className={styles.tempDisplay}>
                  {surfaceTemp.toFixed(1)}°C
                </div>
              )}
              <div className={styles.tireVisual}>
                <div
                  className={styles.tireOuter}
                  style={{
                    backgroundColor: getSurfaceColorFromTemp(surfaceTemp),
                  }}
                />
                <div
                  className={styles.tireInner}
                  style={{ backgroundColor: getInnerColorFromTemp(innerTemp) }}
                >
                  <div className={styles.tireStripes} />
                </div>
              </div>
              {wheel.startsWith('r') && (
                <div className={styles.tempDisplay}>
                  {surfaceTemp.toFixed(1)}°C
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
