import { ReactNode } from 'react';
import { Helmet } from 'react-helmet-async';


import { NavBar } from 'app/components/NavBar';
import { StatusBar } from 'app/components/StatusBar';
import { Canvas } from 'app/components/Canvas';

import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';

import styles from './WorkbookPage.module.scss';

export const WorkbookPage = () => {
  return (
    <AnalyserWrapper>
      <Workbook />
    </AnalyserWrapper>
  );
};

const Workbook = () => {
  return (
    <>
      <div className={styles.workbookTabStyle}>
        <Canvas />
      </div>
      <StatusBar />
    </>
  );
};

const AnalyserWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <Helmet>
        <title>Analyser - RaceHub | Deep Dive into Racing Performance</title>
        <meta
          name="description"
          content="Harness the power of RaceHub's Analyser tool. Decode racing data, understand performance nuances, and refine your strategies."
        />
        <meta
          name="keywords"
          content="RaceHub, Analyser, Sim Racing, Telemetry Analysis, Performance Insights"
        />
        <meta
          property="og:title"
          content="Analyser - RaceHub | Deep Dive into Racing Performance"
        />
        <meta
          property="og:description"
          content="Harness the power of RaceHub's Analyser tool. Decode racing data, understand performance nuances, and refine your strategies."
        />
        <meta property="og:url" content="http://racehub.io/analyser" />
        <meta name="twitter:card" content="summary" />
      </Helmet>
      <NavBar />
      <div className={styles.wrapper}>{children}</div>
    </>
  );
};
