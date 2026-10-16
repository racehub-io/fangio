import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  MosaicWithoutDragDropContext,
  MosaicBranch,
  MosaicWindow,
  MosaicNode,
  MosaicZeroState,
  createBalancedTreeFromLeaves,
  MosaicContext,
} from 'react-mosaic-component';
import { Button } from '@blueprintjs/core';
import { RecorderConfigWidget } from './RecorderConfigWidget';
import { RecorderDetailsWidget } from './RecorderDetailsWidget';

import { RecorderStatus } from 'store/client/slice/types';
import { useClientSlice } from 'store/client/slice';
import {
  selectRecorderIds,
  selectRecorderConfig,
  selectRecorderStatus,
} from 'store/client/slice/selectors';
import styles from './RecordersPage.module.scss';
import { RootState } from 'types';

export function RecordersPage() {
  const recorderIds = useSelector(selectRecorderIds);

  const [currentNode, setCurrentNode] = useState(
    createBalancedTreeFromLeaves(recorderIds),
  );

  const onChange = (currentNode: MosaicNode<string> | null) => {
    setCurrentNode(currentNode);
  };

  const onRelease = (currentNode: MosaicNode<string> | null) => {
    console.log('Mosaic.onRelease():', currentNode);
  };

  useEffect(() => {
    if (recorderIds.length > 0) {
      setCurrentNode(createBalancedTreeFromLeaves(recorderIds));
    }
  }, [recorderIds]);

  return (
    <div className={styles.wrapper}>
      <MosaicWithoutDragDropContext<string>
        renderTile={(recorderId, path) => {
          return <RecorderWidget recorderId={recorderId} path={path} />;
        }}
        zeroStateView={<MosaicZeroState />}
        value={currentNode}
        onChange={onChange}
        onRelease={onRelease}
        className={`mosaic-blueprint-theme bp4 ${styles.mosaic}`}
        blueprintNamespace="bp4"
      />
    </div>
  );
}

interface RecorderWidgetProps {
  recorderId: string;
  path: MosaicBranch[];
}

const RecorderWidget = ({ recorderId, path }: RecorderWidgetProps) => {
  const dispatch = useDispatch();
  const { actions: clientActions } = useClientSlice();

  const recorderConfig = useSelector((state: RootState) =>
    selectRecorderConfig(state, recorderId),
  );

  const recorderStatus = useSelector((state: RootState) =>
    selectRecorderStatus(state, recorderId),
  );

  const recorderConfigLocked =
    recorderStatus === RecorderStatus.INITIALISING ||
    recorderStatus === RecorderStatus.RECORDING;

  const { recorderType, inPort, forwardingEnabled, outAddress, outPort } =
    recorderConfig;

  const title = `Recorder: ${recorderType} | IN: ${inPort}
  ${forwardingEnabled ? ` | OUT: ${outAddress}:${outPort}` : ''}
  `;

  return (
    <MosaicContext.Consumer key={recorderId}>
      {({ mosaicActions }) => (
        <MosaicWindow<string>
          title={title}
          path={path}
          onDragStart={() => console.log('MosaicWindow.onDragStart')}
          onDragEnd={type => console.log('MosaicWindow.onDragEnd', type)}
          toolbarControls={[
            <Button
              key="close"
              icon="cross"
              minimal={true}
              disabled={recorderConfigLocked ? true : false}
              onClick={() => {
                mosaicActions.remove(path);
                dispatch(clientActions.removeRecorder(recorderId));
              }}
            />,
          ]}
        >
          <RecorderConfigWidget recorderId={recorderId} />
          {recorderConfigLocked && (
            <RecorderDetailsWidget recorderId={recorderId} />
          )}
          {/* <RecorderStreamGraphWidget recorderId={recorderId} /> */}
        </MosaicWindow>
      )}
    </MosaicContext.Consumer>
  );
};
