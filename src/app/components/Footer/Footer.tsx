import { useNavigate } from 'react-router-dom';
import { COMPLIANCE_LINKS, LEGAL_LINKS } from 'app';

import BigRH from 'assets/bigrh.svg';

import styles from './Footer.module.scss';

export function Footer() {
  const navigate = useNavigate();
  return (
    <>
      <div className={styles.footer}>
        <img alt="RaceHub" src={BigRH} className={styles.bigrh} />
        <span className={styles.copyright}>© 2024 RaceCloud, Inc.</span>
        <div className={styles.links}>
          <div className={styles.linksList}>
            <div className={styles.grouptitle}>Products</div>
            <div>
              <div
                className={styles.link}
                onClick={() => navigate('/analyser')}
              >
                Analyser
              </div>
            </div>
          </div>
          <div className={styles.linksList}>
            <div className={styles.grouptitle}>Compliance</div>
            <div className={styles.list}>
              {COMPLIANCE_LINKS.map(link => (
                <div
                  key={`footer-${link.label}`}
                  className={styles.link}
                  onClick={() => navigate(link.path)}
                >
                  {link.label}
                </div>
              ))}
            </div>
          </div>
          <div className={styles.linksList}>
            <div className={styles.grouptitle}>Legal</div>
            <div className={styles.list}>
              {LEGAL_LINKS.map(link => (
                <div
                  key={`footer-${link.label}`}
                  className={styles.link}
                  onClick={() => navigate(link.path)}
                >
                  {link.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
