import { NavBar } from 'app/components/NavBar';
import styles from './LegalPage.module.scss';
import { Footer } from 'app/components/Footer';

export function LegalPage({ component }: { component: React.ReactNode }) {
  return (
    <div className={styles.legalPage}>
      <NavBar />
      <div className={styles.legal}>{component}</div>
      <Footer />
    </div>
  );
}
