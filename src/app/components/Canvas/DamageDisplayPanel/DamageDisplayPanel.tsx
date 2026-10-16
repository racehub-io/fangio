import { useState } from 'react';
import { useSelector } from 'react-redux';
import classNames from 'classnames';
import {
  selectLatestTelemetry,
  selectSelectedTelemetry,
  selectTelemetryParticipants,
} from 'store/race/slice/selectors';
import { PropertySelectors } from '../PropertySelector';
import styles from './DamageDisplayPanel.module.scss';
import { RootState } from 'types';

type VerticalPosition = 'top' | 'rear';
type HorizontalPosition = 'left' | 'right';
type Property = 'surface' | 'inner' | 'brake' | 'engine';

interface Telemetry {
  position: {
    vertical: VerticalPosition;
    horizontal: HorizontalPosition;
  };
  data: {
    value: number;
    property: Property;
  }[];
}

const getColorByTemperature = (
  temp: number,
  type: string,
  darkness: number = 0, // Optional third parameter
) => {
  let low, high;

  if (type === 'surface') {
    low = 70;
    high = 120;
  } else if (type === 'inner') {
    low = 60;
    high = 100;
  } else if (type === 'brake') {
    low = 200;
    high = 900;
  } else if (type === 'engine') {
    low = 90;
    high = 120;
  } else {
    throw new Error('Unknown temperature type');
  }

  const range = high - low;
  const relativeTemp = (temp - low) / range;

  const r = relativeTemp < 0.5 ? relativeTemp * 2 * 255 : 255;
  const g = relativeTemp < 0.5 ? 255 : (1 - (relativeTemp - 0.5) * 2) * 255;
  const b = 0;

  // Apply darkness effect
  const darkenedR = r * (1 - darkness);
  const darkenedG = g * (1 - darkness);
  const darkenedB = b * (1 - darkness);

  return `rgb(${Math.round(darkenedR)}, ${Math.round(darkenedG)}, ${Math.round(
    darkenedB,
  )})`;
};

export function DamageDisplayPanel({ id }: { id: string }) {
  const selectedTelemetry = useSelector((state: RootState) =>
    selectSelectedTelemetry(state, id),
  );

  const [isToastOpen, setIsToastOpen] = useState(false);
  const participants = useSelector(
    selectTelemetryParticipants(selectedTelemetry.recorderId),
  );

  return (
    <>
      <PropertySelectors
        id={id}
        hideParameterSelector
        componentName={'Damage Display'}
        recorderId={selectedTelemetry.recorderId}
        isToastOpen={isToastOpen}
        selectedParticipantId={selectedTelemetry.participantIds}
        onSetIsToastOpen={setIsToastOpen}
      />
      {selectedTelemetry.recorderId &&
      participants &&
      !isToastOpen &&
      selectedTelemetry.participantIds !== undefined ? (
        <DamageDisplay
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

function DamageDisplay({ participantId, recorderId, participants }) {
  const telemetry = useSelector((state: RootState) =>
    selectLatestTelemetry(state, recorderId),
  );

  if (!telemetry) {
    return <div className={styles.noData}>No data</div>;
  }

  const teamName = participants.team_name[participantId];
  const teamClassName = `team${teamName.replace(/\s+/g, '')}`;
  const valueClass = classNames(styles.value, styles[teamClassName]);

  const telemetryData: Telemetry[] = [
    {
      position: {
        vertical: 'top',
        horizontal: 'left',
      },
      data: [
        {
          property: 'inner',
          value: telemetry['tyres_inner_temperature_fl'][participantId],
        },
        {
          property: 'surface',
          value: telemetry['tyres_surface_temperature_fl'][participantId],
        },
        {
          property: 'brake',
          value: telemetry['brakes_temperature_fl'][participantId],
        },
      ],
    },
    {
      position: {
        vertical: 'top',
        horizontal: 'right',
      },
      data: [
        {
          property: 'inner',
          value: telemetry['tyres_inner_temperature_fr'][participantId],
        },
        {
          property: 'surface',
          value: telemetry['tyres_surface_temperature_fr'][participantId],
        },
        {
          property: 'brake',
          value: telemetry['brakes_temperature_fr'][participantId],
        },
      ],
    },
    {
      position: {
        vertical: 'rear',
        horizontal: 'left',
      },
      data: [
        {
          property: 'inner',
          value: telemetry['tyres_inner_temperature_rl'][participantId],
        },
        {
          property: 'surface',
          value: telemetry['tyres_surface_temperature_rl'][participantId],
        },
        {
          property: 'brake',
          value: telemetry['brakes_temperature_rl'][participantId],
        },
      ],
    },
    {
      position: {
        vertical: 'rear',
        horizontal: 'right',
      },
      data: [
        {
          property: 'inner',
          value: telemetry['tyres_inner_temperature_rr'][participantId],
        },
        {
          property: 'surface',
          value: telemetry['tyres_surface_temperature_rr'][participantId],
        },
        {
          property: 'brake',
          value: telemetry['brakes_temperature_rr'][participantId],
        },
      ],
    },
  ];

  const renderIcon = (value: number, property: Property) => {
    switch (property) {
      case 'brake':
        return <BrakeSVG value={value} />;
      case 'surface':
        return <SurfaceTyre value={value} />;
      case 'inner':
        return <InnerTyre value={value} />;
      default:
        <div />;
    }
  };

  return (
    <div className={styles.car}>
      <CarSVG
        telemetryData={telemetryData}
        engine={telemetry['engine_temperature'][participantId]}
      />
      <div className={valueClass}>
        {telemetryData.map(({ position, data }) => (
          <div
            key={`${position.horizontal}-${position.vertical}`}
            className={classNames(
              styles.infoSection,
              styles[position.horizontal],
              styles[position.vertical],
            )}
          >
            {data.map(({ property, value }) => (
              <div
                key={`${position}-${property}`}
                className={classNames(
                  styles.label,
                  position.horizontal === 'right' && styles.rightLabel,
                )}
              >
                {renderIcon(value, property)}
                <span>{value}°C</span>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className={styles.engineLabel}>
        {telemetry['engine_temperature'][participantId]}°C
      </div>
    </div>
  );
}

const InnerTyre = ({ value }) => {
  return (
    <div
      className={styles.surfaceTyre}
      style={{ backgroundColor: getColorByTemperature(value, 'inner', 0.66) }}
    >
      <div
        className={styles.innerTyre}
        style={{ backgroundColor: getColorByTemperature(value, 'inner') }}
      />
    </div>
  );
};

const SurfaceTyre = ({ value }) => {
  return (
    <div
      className={styles.surfaceTyre}
      style={{ backgroundColor: getColorByTemperature(value, 'inner') }}
    >
      <div
        className={styles.innerTyre}
        style={{ backgroundColor: getColorByTemperature(value, 'inner', 0.66) }}
      />
    </div>
  );
};

const BrakeSVG = ({ value }) => {
  return (
    <svg
      className={styles.icon}
      xmlns="http://www.w3.org/2000/svg"
      version="1.1"
      viewBox="0 0 478.4 439.7"
    >
      <g>
        <g id="Layer_1">
          <g id="Layer_1-2" data-name="Layer_1">
            <g>
              <path
                fill={getColorByTemperature(value, 'brake')}
                d="M212,0c25.2-.2,47.3,2.3,69,8.6,18.1,5.3,35.2,12.7,51.4,22.2,12.8,7.5,24.7,16.4,35.6,26.5,1.8,1.7,3.8,3.2,5.7,4.8,1.4,1.2,1.5,2.3,0,3.7-4.1,3.8-7.9,7.8-12,11.7-1.6,1.6-2.4,3.3-2.3,5.5,0,.8,0,1.5,0,2.2,0,89.6,0,179.1-.1,268.7,0,5,1.8,8.3,5.4,11.3,3.2,2.7,6.1,5.9,9.2,8.8,1.5,1.4.8,2.5-.4,3.5-10.2,9.1-20.4,18.1-31.9,25.6-14.6,9.6-30.1,17.4-46.5,23.4-21.4,7.8-43.5,12.2-66.3,13-24.4.9-48.3-2-71.7-9-16.7-5-32.5-11.9-47.5-20.6-13.4-7.7-25.6-16.9-37.1-27.2-19.1-17.1-34.5-37-46.5-59.7-13.6-25.6-21.9-52.6-24.8-81.4-1.2-12.5-1.4-25-.4-37.6,1.3-17.5,4.5-34.7,9.9-51.3,9-27.5,22.6-52.5,41.3-74.6,12.5-14.7,26.7-27.4,42.3-38.6,12.5-8.9,26.1-16,40.2-22.1,17.5-7.5,35.6-12.5,54.4-15.2,8.6-1.2,17.2-1.7,23.2-2.3h0ZM220.8,101.4c-63.2-.2-115.3,48.3-118.9,111.7-3.8,67.6,48.8,124,116.1,125.2,64.4,1.1,118.2-48.7,120.3-114.8,2.1-65.8-49.3-121.2-117.5-122.2h0Z"
              />
              <path
                fill={getColorByTemperature(value, 'brake')}
                d="M478.4,218.4c-.5,35.2-7.1,67.3-21,98-8.4,18.5-18.7,35.8-31.7,51.5-4.6,5.5-9.4,10.8-14.2,16.1-2,2.2-2.5,2.2-4.6,0-9.4-9.3-18.7-18.7-28.1-28-1.7-1.7-2.4-3.6-2.4-6,0-15.2,0-30.3,0-45.5,0-71,0-142,0-213,0-3.7,1.1-6.4,3.8-9,9-8.7,17.7-17.6,26.5-26.4,2.7-2.7,2.9-2.8,5.5,0,9.3,10.5,18.6,21.1,26.4,32.9,15.2,23.1,26.2,48,33,74.8,3.6,14.2,5.7,28.6,6.3,43.2.2,4.3.4,8.6.6,11.4h0Z"
              />
              <path
                fill={getColorByTemperature(value, 'brake')}
                d="M219.4,321.4c-55,.1-101.3-44-101-101.8.3-58.9,47.3-101.7,102.3-101.4,56.6.2,101.5,45.8,101.4,101.6-.1,57.4-46.8,102.4-102.6,101.6h0ZM220.1,243.9c13.2,0,24-10.8,24-24,0-13.2-10.9-24.1-24.2-24-12.9,0-23.7,10.8-23.7,23.8,0,13.5,10.7,24.3,24,24.3ZM175.4,276.8c6.8,0,12.6-5.7,12.5-12.3,0-6.8-5.9-12.6-12.5-12.5-6.5,0-12.2,6-12.1,12.5,0,6.5,5.7,12.3,12,12.3h0ZM236.5,292.8c6.5,0,12.2-5.5,12.3-11.9.1-6.7-5.7-12.5-12.5-12.5-6.6,0-12,5.5-12.1,12.1,0,6.8,5.4,12.3,12.3,12.3h0ZM264.8,187.7c6.4,0,12-5.6,12.1-12.1s-5.7-12.5-12-12.6c-6.6,0-12.2,5.4-12.3,11.9,0,7.2,5.3,12.8,12.2,12.8ZM281.2,223.9c-6.9,0-12.6,5.8-12.5,12.6.1,6.5,6,12.2,12.5,12.2,6.1,0,11.9-6.1,11.8-12.5,0-6.8-5.4-12.3-11.8-12.3h0ZM216.1,159.2c0-6.8-5.4-12.4-12-12.4-7,0-12.2,5.1-12.2,12,0,6.9,5.5,12.6,12.1,12.5,6.5,0,12.1-5.7,12.1-12.1h0ZM159.6,191.5c-7.2-.5-12.4,6.5-12.4,12s5.4,12.4,12,12.4c6.7,0,12.3-5.5,12.3-12.2,0-6.6-5.4-12.2-11.9-12.3h0Z"
              />
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
};

const CarSVG = ({ telemetryData, engine }) => {
  const topLeft = telemetryData[0];
  const topRight = telemetryData[1];
  const rearLeft = telemetryData[2];
  const rearRight = telemetryData[3];
  return (
    <svg
      width="245"
      height="230"
      viewBox="0 0 245 469"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M122.074 24.9783L121.811 25.0708L121.81 25.0705L121.809 25.0708L121.546 24.9783L104.616 19.0283L104.535 19H104.45C101.607 19 98.8781 21.0204 96.096 23.8244C94.3868 25.547 92.5942 27.6355 90.6967 29.8462C89.4953 31.246 88.2517 32.6948 86.9607 34.1307C80.2409 41.6047 72.0711 48.93 60.78 48.93H60.28V49.43V57.0531L49.73 58.9804V11.1331L72.2041 6.252L72.7554 9.95368L72.8382 10.5091L73.3803 10.3628L73.25 9.88003C73.3803 10.3628 73.3804 10.3627 73.3806 10.3627L73.3816 10.3624L73.386 10.3612L73.4034 10.3565L73.473 10.3379C73.5346 10.3213 73.6264 10.2968 73.7468 10.2648C73.9878 10.2007 74.3435 10.1066 74.8019 9.98672C75.7186 9.74693 77.0462 9.40389 78.6884 8.9912C81.973 8.16577 86.5151 7.06193 91.5456 5.94821C101.622 3.71744 113.606 1.45878 121.38 1.29992L121.8 1.29135L122.22 1.29992C129.994 1.45878 141.981 3.71744 152.059 5.94821C157.091 7.06194 161.635 8.16578 164.92 8.99121C166.563 9.4039 167.891 9.74694 168.808 9.98673C169.266 10.1066 169.622 10.2007 169.863 10.2648C169.984 10.2968 170.075 10.3214 170.137 10.3379L170.207 10.3565L170.224 10.3612L170.228 10.3624L170.229 10.3627C170.23 10.3627 170.23 10.3628 170.36 9.88003L170.23 10.3628L170.772 10.509L170.855 9.95369L171.408 6.24021L193.89 11.1231V58.9804L183.34 57.0531V49.43V48.93H182.84C171.549 48.93 163.379 41.6047 156.659 34.1307C155.368 32.6948 154.125 31.246 152.923 29.8462C151.026 27.6355 149.233 25.547 147.524 23.8244C144.742 21.0204 142.013 19 139.17 19H139.085L139.004 19.0283L122.074 24.9783Z"
        fill="black"
        stroke="#464646"
      />
      <path
        d="M142.512 116.518L143.01 116.47L142.512 116.518C143.196 123.566 144.787 131.403 146.491 137.481C147.343 140.519 148.227 143.132 149.046 144.995C149.455 145.923 149.856 146.685 150.24 147.224C150.432 147.493 150.633 147.724 150.843 147.893C151.049 148.059 151.309 148.2 151.61 148.2H159.264C159.426 158.604 164.531 165.933 171.111 170.765C177.782 175.663 185.978 178.008 192.132 178.437C192.992 178.497 193.66 179.187 193.66 180.01V349.81C193.66 350.638 192.988 351.31 192.16 351.31H182.85C180.063 351.31 177.008 352.006 174.635 353.726C172.241 355.462 170.58 358.216 170.58 362.22V403.22C170.58 404.048 169.908 404.72 169.08 404.72H162.479C160.793 404.72 159.591 406.355 160.093 407.965L161.322 411.902C161.5 412.472 161.876 412.96 162.382 413.277L168.056 416.826C168.494 417.1 168.76 417.581 168.76 418.098V425.4C168.76 426.228 168.088 426.9 167.26 426.9H75.9C75.0716 426.9 74.4 426.228 74.4 425.4V418.098C74.4 417.581 74.6662 417.1 75.1044 416.826L80.7775 413.277C81.2838 412.96 81.66 412.472 81.8379 411.902L83.0669 407.965C83.5694 406.355 82.3668 404.72 80.6805 404.72H74.08C73.2516 404.72 72.58 404.048 72.58 403.22V362.22C72.58 358.216 70.9191 355.462 68.5247 353.726C66.1523 352.006 63.0974 351.31 60.31 351.31H51C50.1716 351.31 49.5 350.638 49.5 349.81V180.01C49.5 179.187 50.168 178.497 51.0275 178.437C56.9837 178.022 64.8496 175.816 71.3953 171.237C77.9536 166.65 83.2041 159.665 83.8362 149.721C83.8909 148.862 84.5796 148.19 85.4 148.19H91.55C91.8508 148.19 92.1113 148.049 92.3174 147.883C92.5275 147.714 92.7279 147.483 92.9196 147.214C93.3038 146.675 93.7052 145.913 94.1136 144.985C94.9329 143.122 95.8172 140.509 96.6689 137.471C98.3733 131.393 99.9644 123.556 100.648 116.508C101.445 108.277 102.71 92.4172 103.615 79.155C103.714 77.7107 102.568 76.49 101.122 76.49H94.93C94.1016 76.49 93.43 75.8184 93.43 74.99V60.53C93.43 59.7016 94.1016 59.03 94.93 59.03H102.22C103.601 59.03 104.72 57.9107 104.72 56.53V18.7C104.72 16.508 105.386 11.9289 107.837 7.9156C110.269 3.93223 114.459 0.5 121.58 0.5C128.702 0.5 132.891 3.92988 135.323 7.91191C137.774 11.9239 138.44 16.5029 138.44 18.7V56.54C138.44 57.9207 139.559 59.04 140.94 59.04H148.23C149.058 59.04 149.73 59.7116 149.73 60.54V75C149.73 75.8284 149.058 76.5 148.23 76.5H142.038C140.592 76.5 139.446 77.7207 139.545 79.165C140.45 92.4272 141.715 108.287 142.512 116.518Z"
        fill="black"
        stroke="#464646"
      />
      <path
        d="M74.62 467.72V437.15H168.98V467.72H74.62Z"
        fill="black"
        stroke="#464646"
      />
      <path
        d="M193.63 208C193.63 253.48 184.17 299.42 154 349.86C154 365.17 154 377.78 154 377.78L171.11 394.44"
        stroke="#464646"
        strokeMiterlimit="10"
      />
      <path
        d="M49.37 208C49.37 253.48 58.83 299.42 89 349.86C89 365.17 89 377.78 89 377.78L71.89 394.44"
        stroke="#464646"
        strokeMiterlimit="10"
      />

      {/* engine */}
      <path
        d="M132.49 260.1V250.69H121.8H111.12V260.1H78.39V304.55L92.17 319.71V329.35L100.1 339H121.8H143.51L151.44 329.35V319.71L165.22 304.55V260.1H132.49Z"
        fill={getColorByTemperature(engine, 'engine')}
        stroke={getColorByTemperature(engine, 'engine')}
        strokeWidth="5"
        fillOpacity="0.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* engine */}
      <path
        d="M121.8 339H100.1V354.85H121.8H143.51V339H121.8Z"
        fill={getColorByTemperature(engine, 'engine')}
        stroke={getColorByTemperature(engine, 'engine')}
        strokeWidth="5"
        fillOpacity="0.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M140.268 86.3H164.72V107.835L143.604 123.12C143.243 120.856 142.941 118.602 142.728 116.422L140.268 86.3ZM140.268 86.3C141.099 97.7082 142.069 109.653 142.728 116.421L140.268 86.3Z"
        fill="black"
        stroke="#464646"
      />
      <path
        d="M100.007 123.12L78.89 107.835V86.3H103.342C102.511 97.7084 101.541 109.654 100.882 116.422C100.669 118.601 100.368 120.863 100.007 123.12Z"
        fill="black"
        stroke="#464646"
      />

      {/* rear left inner */}
      <path
        d="M7.04999 365.29L7.04999 404.43C7.04999 406.092 8.39762 407.44 10.06 407.44H29.75C31.4124 407.44 32.76 406.092 32.76 404.43V365.29C32.76 363.628 31.4124 362.28 29.75 362.28H10.06C8.39762 362.28 7.04999 363.628 7.04999 365.29Z"
        fill={getColorByTemperature(rearLeft.data[0].value, 'inner')}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* rear left brake */}
      <path
        d="M48.8 373.36V398.35C48.8 399.206 49.4939 399.9 50.35 399.9H64.32C65.176 399.9 65.87 399.206 65.87 398.35V373.36C65.87 372.504 65.176 371.81 64.32 371.81H50.35C49.4939 371.81 48.8 372.504 48.8 373.36Z"
        fill={getColorByTemperature(rearLeft.data[2].value, 'brake')}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* rear left surface */}
      <path
        d="M1 363.1L1 406.63C1 410.446 4.09369 413.54 7.90997 413.54H31.91C35.7263 413.54 38.82 410.446 38.82 406.63V363.1C38.82 359.284 35.7263 356.19 31.91 356.19H7.90997C4.09369 356.19 1 359.284 1 363.1Z"
        stroke={getColorByTemperature(rearLeft.data[1].value, 'surface')}
        strokeWidth="5"
        strokeMiterlimit="10"
      />

      {/* top left inner */}
      <path
        d="M7.04999 76.0999L7.04999 115.24C7.04999 116.902 8.39762 118.25 10.06 118.25H29.75C31.4124 118.25 32.76 116.902 32.76 115.24V76.0999C32.76 74.4375 31.4124 73.0899 29.75 73.0899H10.06C8.39762 73.0899 7.04999 74.4375 7.04999 76.0999Z"
        fill={getColorByTemperature(topLeft.data[0].value, 'inner')}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* top left brake */}
      <path
        d="M48.8 84.17V109.16C48.8 110.016 49.4939 110.71 50.35 110.71H64.32C65.176 110.71 65.87 110.016 65.87 109.16V84.17C65.87 83.3139 65.176 82.62 64.32 82.62H50.35C49.4939 82.62 48.8 83.3139 48.8 84.17Z"
        fill={getColorByTemperature(topLeft.data[2].value, 'brake')}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* top left surface */}
      <path
        d="M1 73.91L1 117.44C1 121.256 4.09369 124.35 7.90997 124.35H31.91C35.7263 124.35 38.82 121.256 38.82 117.44V73.91C38.82 70.0937 35.7263 67 31.91 67H7.90997C4.09369 67 1 70.0937 1 73.91Z"
        stroke={getColorByTemperature(topLeft.data[1].value, 'surface')}
        strokeWidth="5"
        strokeMiterlimit="10"
      />

      {/* rear right inner */}
      <path
        d="M237.82 365.29V404.43C237.82 406.092 236.472 407.44 234.81 407.44H215.12C213.458 407.44 212.11 406.092 212.11 404.43V365.29C212.11 363.628 213.458 362.28 215.12 362.28H234.81C236.472 362.28 237.82 363.628 237.82 365.29Z"
        fill={getColorByTemperature(rearRight.data[0].value, 'inner')}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* rear right brake */}
      <path
        d="M196.07 373.36V398.35C196.07 399.206 195.376 399.9 194.52 399.9H180.55C179.694 399.9 179 399.206 179 398.35V373.36C179 372.504 179.694 371.81 180.55 371.81H194.52C195.376 371.81 196.07 372.504 196.07 373.36Z"
        fill={getColorByTemperature(rearRight.data[2].value, 'brake')}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* rear right surface */}
      <path
        d="M243.87 363.1V406.63C243.87 410.446 240.776 413.54 236.96 413.54H212.96C209.144 413.54 206.05 410.446 206.05 406.63V363.1C206.05 359.284 209.144 356.19 212.96 356.19H236.96C240.776 356.19 243.87 359.284 243.87 363.1Z"
        stroke={getColorByTemperature(rearRight.data[1].value, 'surface')}
        strokeWidth="5"
        strokeMiterlimit="10"
      />

      {/* top right inner */}
      <path
        d="M237.82 76.0999V115.24C237.82 116.902 236.472 118.25 234.81 118.25H215.12C213.458 118.25 212.11 116.902 212.11 115.24V76.0999C212.11 74.4375 213.458 73.0899 215.12 73.0899H234.81C236.472 73.0899 237.82 74.4375 237.82 76.0999Z"
        fill={getColorByTemperature(topRight.data[0].value, 'inner')}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* top right brake */}
      <path
        d="M196.07 84.17V109.16C196.07 110.016 195.376 110.71 194.52 110.71H180.55C179.694 110.71 179 110.016 179 109.16V84.17C179 83.3139 179.694 82.62 180.55 82.62H194.52C195.376 82.62 196.07 83.3139 196.07 84.17Z"
        fill={getColorByTemperature(topRight.data[2].value, 'brake')}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* top right surface */}
      <path
        d="M243.87 73.91V117.44C243.87 121.256 240.776 124.35 236.96 124.35H212.96C209.144 124.35 206.05 121.256 206.05 117.44V73.91C206.05 70.0937 209.144 67 212.96 67H236.96C240.776 67 243.87 70.0937 243.87 73.91Z"
        stroke={getColorByTemperature(topRight.data[1].value, 'surface')}
        strokeWidth="5"
        strokeMiterlimit="10"
      />
    </svg>
  );
};
