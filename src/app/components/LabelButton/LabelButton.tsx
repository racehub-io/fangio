import classnames from 'classnames';
import styles from './LabelButton.module.scss';

type Props = {
  text: string;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
};

export function LabelButton(props: Props) {
  return (
    <div
      className={classnames(
        props.className,
        props.disabled && styles.disabled,
        styles.button,
      )}
      onClick={() => !props.disabled && props.onClick && props.onClick()}
    >
      {props.text}
    </div>
  );
}
