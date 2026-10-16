import { ClientStatus } from './ClientStatus';
import styles from './StatusBar.module.scss';

export function StatusBar() {
  return (
    <footer className={styles.footer}>
        <ClientStatus />
    </footer>
  );
}
