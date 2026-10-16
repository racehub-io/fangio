import { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  selectSelectedTelemetry,
  selectTelemetryByRecorderId,
  selectTelemetryParticipants,
} from 'store/race/slice/selectors';
import { PropertySelectors } from '../PropertySelector';
import styles from './TableDisplayPanel.module.scss';
import { RootState } from 'types';

export function TableDisplayPanel({ id }: { id: string }) {
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
        recorderId={selectedTelemetry.recorderId}
        componentName={'Table Display'}
        isToastOpen={isToastOpen}
        onlyTables={true}
        selectedParameter={selectedTelemetry.parameterId}
        selectedParticipantId={selectedTelemetry.participantIds}
        onSetIsToastOpen={setIsToastOpen}
      />
      {selectedTelemetry.parameterId &&
      selectedTelemetry.recorderId &&
      participants &&
      selectedTelemetry.participantIds !== undefined ? (
        <TableDisplay
          recorderId={selectedTelemetry.recorderId}
          parameter={selectedTelemetry.parameterId}
          participantId={selectedTelemetry.participantIds}
          participants={participants}
        />
      ) : !isToastOpen ? (
        <div className={styles.noData}>No data</div>
      ) : null}
    </>
  );
}

function TableDisplay({ parameter, participantId, recorderId, participants }) {
  const telemetry = useSelector((state: RootState) =>
    selectTelemetryByRecorderId(state, recorderId),
  );

  if (!telemetry) {
    return <div>No telemetry data available.</div>;
  }

  const latestMessage = telemetry[telemetry.length - 1];
  const currentValue = latestMessage[parameter][participantId];

  if (!currentValue[0]) return <div />;

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          {Object.keys(currentValue[0]).map(key => (
            <th key={key}>
              {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {currentValue.map((item, index) => (
          <tr
            key={index}
            className={index % 2 === 0 ? styles.evenRow : styles.oddRow}
          >
            {Object.values(item).map((value, valueIndex) => (
              <td key={valueIndex}>
                {typeof value === 'boolean'
                  ? value
                    ? 'Yes'
                    : 'No'
                  : (value as any).toString()}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
