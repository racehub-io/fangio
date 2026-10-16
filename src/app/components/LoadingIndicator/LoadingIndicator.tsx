import classNames from 'classnames';
import styles from './LoadingIndicator.module.scss';

export function LoadingIndicator({
  color = 'white',
}: {
  color?: 'white' | 'black';
}) {
  return (
    <span
      className={classNames(
        styles.loader,
        color === 'black' && styles.black,
        color === 'white' && styles.white,
      )}
    />
  );
}
