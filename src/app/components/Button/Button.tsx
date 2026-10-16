import classnames from 'classnames';
import styles from './Button.module.scss';
import { LoadingIndicator } from '../LoadingIndicator';

type Props = {
  text: string;
  type?: 'button' | 'submit';
  size?: 'xs' | 's' | 'm' | 'l';
  icon?: JSX.Element;
  minimal?: boolean;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  borderless?: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  href?: string;
};

export function Button({
  size = 's',
  type = 'button',
  href,
  borderless,
  loading,
  ...props
}: Props) {
  const classNames = classnames(
    props.className,
    (props.disabled || loading) && styles.disabled,
    props.minimal && styles.minimal,
    size === 'xs' && styles.xsmall,
    size === 's' && styles.small,
    size === 'm' && styles.medium,
    size === 'l' && styles.large,
    borderless && styles.borderless,
    styles.button,
  );

  if (loading) {
    return (
      <div className={classNames}>
        <LoadingIndicator color="black" />
      </div>
    );
  }

  if (href) {
    return (
      <a
        className={classNames}
        onMouseEnter={props.onMouseEnter}
        onMouseLeave={props.onMouseLeave}
        href={href}
      >
        {props.icon}
        {props.text}
      </a>
    );
  }

  return (
    <div
      className={classNames}
      onMouseEnter={props.onMouseEnter}
      onMouseLeave={props.onMouseLeave}
    >
      {props.icon}
      <input
        value={props.text}
        disabled={props.disabled}
        type={type}
        onClick={props.onClick}
      />
    </div>
  );
}
