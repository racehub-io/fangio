import classnames from 'classnames';
import { RxDragHandleHorizontal } from 'react-icons/rx';
import { memo } from 'react';
import { Props } from './DataPanelBox.types';

import styles from './DataPanelBox.module.scss';

export const DataPanelBox = memo(function DataPanelBox(props: Props) {
  const { children } = props;

  return (
    <div
      className={classnames(styles.dataPanelBox)}
      style={{ backgroundColor: '#171717' }}
    >
      <RxDragHandleHorizontal className={`${styles.handle} handle`} />
      {children}
    </div>
  );
});
