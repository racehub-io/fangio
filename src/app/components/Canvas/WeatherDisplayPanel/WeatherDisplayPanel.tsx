import { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  selectLatestTelemetry,
  selectSelectedTelemetry,
  selectRecorderIds,
} from 'store/race/slice/selectors';
import {
  TiWeatherCloudy,
  TiWeatherDownpour,
  TiWeatherPartlySunny,
  TiWeatherShower,
  TiWeatherStormy,
  TiWeatherSunny,
  TiWeatherWindy,
} from 'react-icons/ti';
import { MdOutlineWaterDrop } from 'react-icons/md';
import { BsQuestion } from 'react-icons/bs';
import { PiRoadHorizonBold } from 'react-icons/pi';

import { PropertySelectors } from '../PropertySelector';
import { DataPanelBox } from '../DataPanelBox';
import { RootState } from 'types';
import styles from './WeatherDisplayPanel.module.scss';

enum WeatherCondition {
  Clear = 'Clear',
  LightCloud = 'Light Cloud',
  Overcast = 'Overcast',
  LightRain = 'Light Rain',
  HeavyRain = 'Heavy Rain',
  Storm = 'Storm',
}

export function WeatherDisplayPanel({ id }: { id: string }) {
  const selectedTelemetry = useSelector((state: RootState) =>
    selectSelectedTelemetry(state, id),
  );
  const [isToastOpen, setIsToastOpen] = useState(false);
  const recorderIds = useSelector(selectRecorderIds);
  const hasData = recorderIds.length > 0;

  return (
    <DataPanelBox>
      <>
        <PropertySelectors
          id={id}
          recorderId={selectedTelemetry.recorderId}
          componentName={'Weather Display'}
          isToastOpen={isToastOpen}
          selectedParameter={selectedTelemetry.parameterId}
          selectedParticipantId={selectedTelemetry.participantIds}
          onSetIsToastOpen={setIsToastOpen}
          hideParameterSelector
          hideParticipantSelector
        />
        {selectedTelemetry.recorderId ? (
          <WeatherDisplay recorderId={selectedTelemetry.recorderId} />
        ) : !isToastOpen ? (
          <div className={styles.noData}>
            {hasData ? 'Select data to visualize' : 'No data'}
          </div>
        ) : null}
        <div className={styles.componentName}>Weather Display</div>
      </>
    </DataPanelBox>
  );
}

function getWeatherIcon(sessionWeather: WeatherCondition | string) {
  switch (sessionWeather) {
    case WeatherCondition.Clear:
      return TiWeatherSunny;
    case WeatherCondition.LightCloud:
      return TiWeatherPartlySunny;
    case WeatherCondition.Overcast:
      return TiWeatherCloudy;
    case WeatherCondition.LightRain:
      return TiWeatherShower;
    case WeatherCondition.HeavyRain:
      return TiWeatherDownpour;
    case WeatherCondition.Storm:
      return TiWeatherStormy;
  }
  return BsQuestion;
}

function WeatherDisplay({ recorderId }) {
  const telemetry = useSelector((state: RootState) =>
    selectLatestTelemetry(state, recorderId),
  );

  if (!telemetry) {
    return <div className={styles.noData}>No data</div>;
  }

  const weatherConditions: { [key: number]: WeatherCondition } = {
    0: WeatherCondition.Clear,
    1: WeatherCondition.LightCloud,
    2: WeatherCondition.Overcast,
    3: WeatherCondition.LightRain,
    4: WeatherCondition.HeavyRain,
    5: WeatherCondition.Storm,
  };
  const weatherValue = telemetry['weather']?.[0];
  const rainPercentage = telemetry['rain_percentage']?.[0];
  const weatherText = weatherConditions[weatherValue] || weatherValue;
  const WeatherIcon = getWeatherIcon(weatherText);

  return (
    <div className={styles.valueContainer}>
      <div className={styles.parameter}>
        <span className={styles.label}>Weather</span>
        <div className={styles.value}>
          <WeatherIcon size={28} />
          {weatherText}
        </div>
      </div>
      <div className={styles.parameter}>
        <span className={styles.label}>Rain</span>
        <span className={styles.value}>
          <MdOutlineWaterDrop size={28} />
          {rainPercentage}%
        </span>
      </div>
      <div className={styles.parameter}>
        <span className={styles.label}>Air Temp</span>
        <span className={styles.value}>
          <TiWeatherWindy size={28} />
          {telemetry['air_temperature']?.[0]}°C
        </span>
      </div>
      <div className={styles.parameter}>
        <span className={styles.label}>Track Temp</span>
        <span className={styles.value}>
          <PiRoadHorizonBold size={28} />
          {telemetry['track_temperature']?.[0]}°C
        </span>
      </div>
    </div>
  );
}
