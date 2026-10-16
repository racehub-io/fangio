import styles from './Overlay.module.scss';
import classnames from 'classnames';

interface OverlayProps {
  title: string;
  children: React.ReactElement;
  size?: 'l' | 'm';
  imageUrl?: string;
  className?: string;
}

export const Overlay = (props: OverlayProps) => {
  return (
    <div className={classnames(styles.wrapper, props.className)}>
      <div
        className={classnames(styles.form, props.size === 'l' && styles.large)}
      >
        <div className={styles.header}>
          {props.imageUrl ? <img src={props.imageUrl} /> : null}
          <div
            className={classnames(styles.title, props.imageUrl && styles.caps)}
          >
            {props.title}
          </div>
        </div>
        {props.children}
      </div>
    </div>
  );
};
