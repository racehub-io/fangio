import { useState, useEffect, useRef } from 'react';
import { Button } from 'app/components/Button';
import classNames from 'classnames';
import styles from './Menu.module.scss';

export interface Option {
  label: string;
  disabled?: boolean;
  action: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}

export function Menu({ options, label }: { options: Option[]; label: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const handleClick = () => {
    setIsOpen(prevValue => !prevValue);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const handleItemClick = () => {
    closeMenu();
  };

  useEffect(() => {
    const handleClickOutside = event => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        closeMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuRef]);

  return (
    <div className={styles.menu} ref={menuRef}>
      <Button text={label} onClick={handleClick} borderless />
      {isOpen && (
        <div className={styles.list}>
          {options.map(option => (
            <div
              key={option.label}
              className={classNames(styles.item, {
                [styles.disabled]: option.disabled,
              })}
              onClick={e => {
                if (option.disabled) return;
                handleItemClick();
                option.action(e);
              }}
              style={{ cursor: option.disabled ? 'not-allowed' : 'pointer' }}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
