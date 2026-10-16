import { Helmet } from 'react-helmet-async';
import { FiChevronDown } from 'react-icons/fi';

import { NavBar } from 'app/components/NavBar';
import { Footer } from 'app/components/Footer';
import { SuiteOfTools } from './SuiteOfTools';
import { NextFeatures } from './NextFeatures';

import styles from './HomePage.module.scss';

export function HomePage() {
  return (
    <>
      <Helmet>
        <title>
          RaceHub - Professional Sim Racing Telemetry Analysis Tools
        </title>
        <meta
          name="description"
          content="RaceHub offers a complete suite of telemetry analysis tools, designed for professional sim racing. Dominate the competition with RaceHub!"
        />
        <meta
          name="keywords"
          content="RaceHub, Sim Racing, Telemetry Analysis, Racing Tools, Professional Sim Racing"
        />
        <meta
          property="og:title"
          content="RaceHub: Professional Sim Racing Telemetry Analysis Tools"
        />
        <meta
          property="og:description"
          content="RaceHub offers a complete suite of telemetry analysis tools, designed for professional sim racing. Dominate the competition with RaceHub!"
        />
        <meta property="og:url" content="http://racehub.io/" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      <NavBar />

      <div className={styles.homeContent}>
        <div className={styles.bannerWrapper}>
          <div className={styles.banner}>
            <div className={styles.title}>Dominate the competition.</div>
            <div className={styles.description}>
              Welcome to RaceHub, an encompassing array of telemetry insight
              platforms, purposefully tailored for the elite simulation racing
              scene.
            </div>
          </div>
          <FiChevronDown className={styles.arrowDown} />
        </div>
        <SuiteOfTools />
        <NextFeatures />
        <Footer />
      </div>
    </>
  );
}
