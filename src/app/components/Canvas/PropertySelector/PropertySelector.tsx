import { useEffect, useRef } from 'react';
import Select from 'react-select';
import { useSelector, useDispatch } from 'react-redux';
import { FiSettings, FiX } from 'react-icons/fi';
import {
  selectTelemetryParameters,
  selectTelemetryParticipants,
} from 'store/race/slice/selectors';
import { selectRecorderIds } from 'store/race/slice/selectors';
import { RACEHUB_LAYOUT } from 'store/context';
import { useDispatch as useContextDispatch } from 'store/context';
import { REMOVE_COMPONENT } from 'store/race/actions';
import { useRaceSlice } from 'store/race/slice';
import { Button } from 'app/components/Button';

import styles from './PropertySelector.module.scss';

type LiveModeSetter = React.Dispatch<React.SetStateAction<boolean>>;
type ToastOpenSetter = React.Dispatch<React.SetStateAction<boolean>>;

interface PropertySelectorsProps {
  id: string;
  recorderId?: string;
  selectedParameter?: string;
  selectedParticipantId?: number | number[];
  isToastOpen: boolean;
  isLiveMode?: boolean;
  componentName: string;
  onlyTables?: boolean;
  showLiveSelector?: boolean;
  hideRecorderSelector?: boolean;
  hideParameterSelector?: boolean;
  hideParticipantSelector?: boolean;
  multipleParticipants?: boolean;
  onSetIsToastOpen: ToastOpenSetter;
  onChangeLiveMode?: LiveModeSetter;
  extraMenuItems?: React.ReactNode;
}

export const PropertySelectors = ({
  id,
  recorderId,
  selectedParameter,
  selectedParticipantId,
  isToastOpen,
  isLiveMode,
  componentName,
  showLiveSelector = false,
  onlyTables = false,
  hideRecorderSelector = false,
  hideParameterSelector = false,
  hideParticipantSelector = false,
  multipleParticipants = false,
  onSetIsToastOpen,
  onChangeLiveMode,
  extraMenuItems,
}: PropertySelectorsProps) => {
  const dispatch = useDispatch();
  const { actions: raceActions } = useRaceSlice();
  const toastRef = useRef<any>(null);
  const recorders = useSelector(selectRecorderIds);
  const { dispatch: contextDispatch } = useContextDispatch();
  const parameters = useSelector(
    selectTelemetryParameters(recorderId, onlyTables),
  );
  const participants = useSelector(selectTelemetryParticipants(recorderId));

  const recorderOptions = recorders.map(recorderId => ({
    value: recorderId,
    label: recorderId,
  }));

  const telemetryOptions = parameters.map(parameter => ({
    value: parameter,
    label: parameter,
  }));

  const participantOptions = participants?.player_name?.map(
    (playerName, index) => ({
      value: index.toString(),
      label: playerName,
    }),
  );

  const currentRecorderOption =
    recorderOptions.find(option => option.value === recorderId) || null;

  const currentParameterOption =
    telemetryOptions.find(option => option.value === selectedParameter) || null;

  useEffect(() => {
    if (recorders.length === 1) {
      dispatch(
        raceActions.updateSelectedTelemetry({
          componentId: id,
          recorderId: recorders[0],
        }),
      );
    }
    // fix the deps here
  }, [dispatch, id, raceActions, recorders]);

  useEffect(() => {
    const localState = localStorage.getItem(RACEHUB_LAYOUT);

    if (!localState) {
      return;
    }

    let storedLayout = JSON.parse(localState);

    // this does not remove unused values
    storedLayout = {
      ...storedLayout,
      propertySelectors: {
        ...storedLayout.propertySelectors,
        [id]: {
          selectedParameter,
          selectedParticipantId,
          recorderId,
        },
      },
    };

    // possibly move this to redux, make redux persistant
    localStorage.setItem(RACEHUB_LAYOUT, JSON.stringify(storedLayout));
  }, [id, recorderId, selectedParameter, selectedParticipantId]);

  useEffect(() => {
    const handleClickOutside = event => {
      if (toastRef.current && !toastRef.current.contains(event.target)) {
        onSetIsToastOpen(false);
      }
    };

    const handleKeyDown = event => {
      if (event.key === 'Escape') {
        onSetIsToastOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleRecorderIdChange = selectedOption => {
    const recorderId = selectedOption ? selectedOption.value : '';

    dispatch(
      raceActions.updateSelectedTelemetry({
        componentId: id,
        recorderId,
      }),
    );
  };

  const handleParameterChange = selectedOption => {
    const parameterId = selectedOption ? selectedOption.value : '';

    dispatch(
      raceActions.updateSelectedTelemetry({
        componentId: id,
        parameterId,
      }),
    );
  };

  const handleParticipantChange = selectedOption => {
    let participantIds;
    let singleParticipantId;

    if (multipleParticipants) {
      participantIds = selectedOption.map(option => option.value);
    } else {
      singleParticipantId = selectedOption ? selectedOption.value : '';
      participantIds = [singleParticipantId];
    }

    dispatch(
      raceActions.updateSelectedTelemetry({
        componentId: id,
        participantIds,
      }),
    );
  };

  let currentParticipantOption;

  if (Array.isArray(selectedParticipantId)) {
    currentParticipantOption = selectedParticipantId
      .map(id =>
        participantOptions?.find(option => option.value === id.toString()),
      )
      .filter(Boolean);
  } else {
    currentParticipantOption =
      participantOptions?.find(
        option => option.value === selectedParticipantId?.toString(),
      ) || null;
  }

  const renderSelects = () => (
    <div className={styles.selects}>
      <div className={styles.componentName}>{componentName}</div>
      {!hideRecorderSelector && (
        <Select
          className={styles.selector}
          value={currentRecorderOption}
          isDisabled={recorders.length === 1}
          defaultValue={{ label: 'Select recorder', value: '' }}
          onChange={handleRecorderIdChange}
          options={recorderOptions}
          isSearchable={true}
          styles={{
            menuPortal: base => ({
              ...base,
              color: 'black',
              zIndex: 9999,
            }),
          }}
          menuPortalTarget={document.body}
        />
      )}
      {!hideParameterSelector && (
        <Select
          className={styles.selector}
          value={currentParameterOption}
          defaultValue={{ label: 'Select telemetry property', value: '' }}
          onChange={handleParameterChange}
          options={telemetryOptions}
          isSearchable={true}
          isDisabled={!recorderId}
          styles={{
            menuPortal: base => ({
              ...base,
              color: 'black',
              zIndex: 9999,
            }),
          }}
          menuPortalTarget={document.body}
        />
      )}
      {!hideParticipantSelector && (
        <Select
          className={styles.selector}
          isMulti={multipleParticipants}
          value={currentParticipantOption}
          defaultValue={{ label: 'Select participant', value: '' }}
          onChange={handleParticipantChange}
          options={participantOptions || []}
          isSearchable={true}
          isDisabled={!recorderId}
          styles={{
            menuPortal: base => ({
              ...base,
              color: 'black',
              zIndex: 9999,
            }),
          }}
          menuPortalTarget={document.body}
        />
      )}
    </div>
  );

  return (
    <div className={styles.propertySelectors}>
      <FiX
        className={styles.closeButton}
        onClick={() => {
          contextDispatch({
            type: REMOVE_COMPONENT,
            payload: { id },
          });

          dispatch(
            raceActions.removeSelectedTelemetry({
              componentId: id,
            }),
          );
        }}
      />

      {!isToastOpen && (
        <>
          <div className={styles.values}>
            {!hideRecorderSelector && <div>{currentRecorderOption?.label}</div>}
            {!hideParameterSelector && (
              <div>{currentParameterOption?.label}</div>
            )}
            {!hideParticipantSelector && (
              <div>{currentParticipantOption?.label}</div>
            )}
          </div>
          <div className={styles.settingsPanel}>
            {showLiveSelector && onChangeLiveMode ? (
              <Button
                size="xs"
                minimal
                onClick={() => onChangeLiveMode(prev => !prev)}
                text={
                  isLiveMode ? 'Switch to Analysis View' : 'Switch to Live View'
                }
              />
            ) : null}
            <FiSettings
              className={styles.settingsButton}
              onClick={() => onSetIsToastOpen(prev => !prev)}
            />
          </div>
        </>
      )}

      {isToastOpen && (
        <div ref={toastRef} className={styles.toast}>
          {renderSelects()}
          {extraMenuItems}
        </div>
      )}
    </div>
  );
};
