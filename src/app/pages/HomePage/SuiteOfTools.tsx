import Analyser from 'assets/analyser.svg';
import Tools from 'assets/suiteoftools.svg';
import styles from './SuiteOfTools.module.scss';

export function SuiteOfTools() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.banner}>
        <div className={styles.title}>
          A suite of tools
          <br />
          designed for <span>the best.</span>
        </div>
        <div className={styles.description}>
          RaceHub empowers both professional and aspiring amateur racing drivers
          and players to make the most out of their laps.
        </div>
      </div>
      <div className={styles.box}>
        <div className={styles.description}>
          <div className={styles.top}>
            <div className={styles.name}>
              <img src={Analyser} alt="" />
              <span>Analyser</span>
            </div>
            <div className={styles.title}>
              Data and insights for your telemetry.
            </div>
          </div>
          <div className={styles.text}>
            Decode your racing data to understand performance nuances,
            highlighting strengths and areas for refinement.
          </div>
        </div>
        <img src={Tools} alt="" className={styles.tools} />

        {/* <div className={styles.cards}>
          <div className={classNames(styles.card, styles.ball1)} />
          <div className={classNames(styles.card, styles.ball2)} />
          <div className={classNames(styles.card, styles.ball3)} />
          <div className={classNames(styles.card, styles.ball4)} />
          <div className={classNames(styles.card, styles.ball5)} />
        </div> */}
      </div>
    </div>
  );
}
