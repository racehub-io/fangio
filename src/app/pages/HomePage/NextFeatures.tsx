import Clock from 'assets/clock.svg';
import Flags from 'assets/flags.svg';
import Circuit from 'assets/circuit.svg';
import styles from './NextFeatures.module.scss';

export function NextFeatures() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.box}>
        <div className={styles.comingSoon}>Coming Soon</div>
        <div className={styles.description}>
          <div className={styles.top}>
            <div className={styles.name}>
              <img src={Clock} />
              <span>Trainer</span>
              <div className={styles.title}>
                Learn how to improve your lap times.
              </div>
            </div>
            <img src={Circuit} className={styles.decoration} />
            <div>
              With the Trainer feature, harness the power of data-driven
              insights to refine your strategies and elevate your race
              performance.
            </div>
          </div>
        </div>
      </div>
      <div className={styles.box}>
        <div className={styles.comingSoon}>Coming Soon</div>
        <div className={styles.description}>
          <div className={styles.top}>
            <div className={styles.name}>
              <img src={Flags} />
              <span>Ranker</span>
              <div className={styles.title}>Compete against the community.</div>
            </div>
            <div className={styles.list}>
              <div className={styles.rank}>
                <div className={styles.leftside}>
                  <div>🇦🇷</div>
                  <span className={styles.racer}>chueco11</span>
                </div>
                <span className={styles.time}>1:21:02</span>
              </div>
              <div className={styles.rank}>
                <div className={styles.leftside}>
                  <div>🇧🇷</div>
                  <span className={styles.racer}>rainmaster</span>
                </div>
                <span className={styles.time}>1:21:14</span>
              </div>
              <div className={styles.rank}>
                <div className={styles.leftside}>
                  <div>🏴󠁧󠁢󠁳󠁣󠁴󠁿</div>
                  <span className={styles.racer}>flyingscot39</span>
                </div>
                <span className={styles.time}>1:22:16</span>
              </div>
              <div className={styles.rank}>
                <div className={styles.leftside}>
                  <div>🇫🇮</div>
                  <span className={styles.racer}>iceman</span>
                </div>
                <span className={styles.time}>1:22:21</span>
              </div>
              <div className={styles.rank}>
                <div className={styles.leftside}>
                  <div>🇫🇷</div>
                  <span className={styles.racer}>leprofessor</span>
                </div>
                <span className={styles.time}>1:23:10</span>
              </div>
            </div>
            <div>
              The Ranker platform will offer you a real-time glimpse of where
              you stand in the global racing community. Gear up to top the
              charts!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
