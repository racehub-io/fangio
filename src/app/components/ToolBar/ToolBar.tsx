import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { RecorderType } from 'store/client/slice/types';
import { useClientSlice } from 'store/client/slice';

import { uniqueId } from '@blueprintjs/core/lib/esm/common/utils';
import { Button } from '@blueprintjs/core';

import styles from './ToolBar.module.scss';

export function ToolBar() {
  const dispatch = useDispatch();
  const { actions: clientActions } = useClientSlice();

  const addRecorder = useCallback(() => {
    const recorderId = uniqueId('recorder_');
    dispatch(
      clientActions.addRecorder({
        recorderId,
        recorderType: RecorderType.F12022,
      }),
    );
  }, [clientActions, dispatch]);

  return (
    <div className={styles.toolbar}>
      <nav className={styles.wrapper}>
        <div className={styles.item} title="Add Recorder">
          <Button
            icon="add"
            className={styles.button}
            style={{
              color: 'white',
            }}
            minimal={true}
            onClick={addRecorder}
          >
            Add Recorder
          </Button>
        </div>
      </nav>
    </div>
  );
}
