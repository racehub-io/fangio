import { useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useDispatch as useContextDispatch } from 'store/context';
import Select from 'react-select';
import Switch from 'react-switch';
import classNames from 'classnames';
import { startRecorder, stopRecorder } from 'utils/helpers';
import { RecorderStatus, RecorderType } from 'store/client/slice/types';

import { useClientSlice } from 'store/client/slice';
import {
  selectActiveRecorderConfigs,
  selectIsConnected,
  selectRecorderConfig,
  selectRecorderStatus,
} from 'store/client/slice/selectors';
import { WebsocketContext } from 'app/WebSocketProvider';

import { FiX } from 'react-icons/fi';
import { REMOVE_COMPONENT } from 'store/race/actions';
import { Button } from '../../components/Button';

import styles from './RecorderConfigWidget.module.scss';
import { RootState } from 'types';

export const RecorderConfigWidget = ({ recorderId }) => {
  const dispatch = useDispatch();
  const { dispatch: contextDispatch } = useContextDispatch();
  const { actions: clientActions } = useClientSlice();
  const { send } = useContext(WebsocketContext);
  const isConnected = useSelector(selectIsConnected);
  const recorderStatus = useSelector((state: RootState) =>
    selectRecorderStatus(state, recorderId),
  );
  const [isRecording, setIsRecording] = useState(
    recorderStatus === RecorderStatus.RECORDING,
  );
  const recorderConfig = useSelector((state: RootState) =>
    selectRecorderConfig(state, recorderId),
  );

  const recorderConfigLocked =
    recorderStatus === RecorderStatus.INITIALISING ||
    recorderStatus === RecorderStatus.RECORDING;

  const activeRecorderConfigs = useSelector(selectActiveRecorderConfigs);

  const { recorderType, inPort, forwardingEnabled, outAddress, outPort } =
    recorderConfig;

  const [recorderTypeState, setRecorderTypeState] = useState(recorderType);
  const [inPortState, setInPortState] = useState(inPort);
  const [forwardingEnabledState, setForwardingEnabledState] =
    useState(forwardingEnabled);
  const [outAddressState, setOutAddressState] = useState(outAddress);
  const [outPortState, setOutPortState] = useState(outPort);

  const [inPortError, setInPortError] = useState(false);
  const [outAddressError, setOutAddressError] = useState(false);
  const [outPortError, setOutPortError] = useState(false);

  const [isValid, setIsValid] = useState(false);

  const disableStartStopButton = isRecording
    ? !isConnected || !(recorderStatus === RecorderStatus.RECORDING)
    : !isValid || !isConnected || recorderConfigLocked;

  useEffect(() => {
    const inPortInUse = activeRecorderConfigs.some(
      config =>
        config.recorderId !== recorderId && config.inPort === inPortState,
    );

    const outPortInUse = activeRecorderConfigs.some(
      config =>
        config.recorderId !== recorderId && config.inPort === outPortState,
    );

    setInPortError(
      inPortState < 0 ||
        inPortState > 65535 ||
        inPortInUse ||
        (forwardingEnabledState && inPortState === outPortState),
    );
    setOutAddressError(outAddressState.length === 0);
    setOutPortError(
      outPortState < 0 ||
        outPortState > 65535 ||
        outPortInUse ||
        inPortState === outPortState,
    );
  }, [
    recorderId,
    activeRecorderConfigs,
    inPortState,
    forwardingEnabledState,
    outAddressState,
    outPortState,
  ]);

  useEffect(() => {
    setIsValid(
      !inPortError && !outAddressError && !outPortError ? true : false,
    );
  }, [inPortError, outAddressError, outPortError]);

  if (!recorderId) {
    return <div />;
  }

  const recorderOptions = [
    { label: 'F1 2022', value: 'F12022' },
    { label: 'F1 2023', value: 'F12023' },
    { label: 'F1 2024', value: 'F12024' },
    { label: 'iRacing', value: 'iRacing' },
  ];

  const currentRecorderOption = recorderOptions.find(
    option => option.value === recorderTypeState,
  );

  const handleClick = () => {
    if (isRecording) {
      stopRecorder(recorderId, isConnected, send);
    } else {
      const recorderConfig = {
        recorderId,
        recorderType: recorderTypeState,
        inPort: inPortState,
        forwardingEnabled: forwardingEnabledState,
        outAddress: outAddressState,
        outPort: outPortState,
      };
      startRecorder(recorderConfig, isConnected, send);
    }
    setIsRecording(!isRecording);
  };

  return (
    <div className={styles.recorderConfig}>
      <FiX
        className={styles.closeButton}
        onClick={() => {
          contextDispatch({
            type: REMOVE_COMPONENT,
            payload: { id: recorderId },
          });
          dispatch(clientActions.removeRecorder(recorderId));
        }}
      />
      <span className={styles.id}>{recorderId}</span>
      <div className={styles.componentName}>RECORDER</div>
      <div className={styles.field}>
        <label htmlFor="recorder-type">Recorder Type</label>
        <Select
          id="recorder-type"
          className={styles.selector}
          value={currentRecorderOption}
          defaultValue={{ label: 'Select recorder', value: '' }}
          isDisabled={recorderConfigLocked}
          onChange={option => {
            if (option) {
              const newRecorderType =
                RecorderType[option.value as keyof typeof RecorderType];
              setRecorderTypeState(newRecorderType);
              dispatch(
                clientActions.setRecorderType({
                  recorderId,
                  recorderType: newRecorderType,
                }),
              );
            }
          }}
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
      </div>
      <div className={styles.field}>
        <label htmlFor="udp-in-port">UDP In Port</label>
        <input
          id="udp-in-port"
          type="number"
          value={inPortState.toString()}
          disabled={recorderConfigLocked}
          onChange={e => {
            const newInPort = parseInt(e.target.value);
            setInPortState(newInPort);
            dispatch(
              clientActions.setRecorderInPort({
                recorderId,
                inPort: newInPort,
              }),
            );
          }}
        />
        {inPortError && (
          <div className={styles.error}>
            Check that the port isn't used by another active recorder, is
            different from the out port, and is between 0 and 65535.
          </div>
        )}
      </div>
      <div className={classNames(styles.field, styles.forwardingGroup)}>
        {forwardingEnabledState && (
          <>
            <div className={styles.field}>
              <label htmlFor="udp-forward-address">UDP Forward Address</label>
              <input
                id="udp-forward-address"
                type="text"
                value={outAddressState}
                disabled={recorderConfigLocked || !forwardingEnabledState}
                onChange={e => {
                  const newOutAddress = e.target.value;
                  setOutAddressState(newOutAddress);
                  dispatch(
                    clientActions.setRecorderOutAddress({
                      recorderId,
                      outAddress: newOutAddress,
                    }),
                  );
                }}
              />
              {outAddressError && (
                <div className={styles.error}>
                  Check that the address is valid and not empty.
                </div>
              )}
            </div>
            <div className={styles.field}>
              <label htmlFor="udp-out-port">UDP Out Port</label>
              <input
                id="udp-out-port"
                type="number"
                value={outPortState.toString()}
                disabled={recorderConfigLocked || !forwardingEnabledState}
                onChange={e => {
                  const newOutPort = parseInt(e.target.value);
                  setOutPortState(newOutPort);
                  dispatch(
                    clientActions.setRecorderOutPort({
                      recorderId,
                      outPort: newOutPort,
                    }),
                  );
                }}
              />
              {outPortError && (
                <div className={styles.error}>
                  Check that the port isn't used by another active recorder, is
                  different from the in port, and is between 0 and 65535.
                </div>
              )}
            </div>
          </>
        )}
        <label htmlFor="udp-forwarding">UDP Forwarding Enabled</label>
        <Switch
          id="udp-forwarding"
          onColor="#00d78f"
          checkedIcon={false}
          uncheckedIcon={false}
          onChange={setForwardingEnabledState}
          checked={forwardingEnabledState}
          disabled={recorderConfigLocked}
        />
      </div>
      <div className={styles.buttonGroup}>
        <Button
          text={isRecording ? 'Stop' : 'Start'}
          disabled={disableStartStopButton}
          onClick={handleClick}
          type="button"
          className={isRecording ? styles.dangerButton : styles.successButton}
        />
      </div>
      {!isConnected && (
        <div className={styles.message}>
          Unable to start recorder. RaceHub Client is not connected.
        </div>
      )}
    </div>
  );
};
