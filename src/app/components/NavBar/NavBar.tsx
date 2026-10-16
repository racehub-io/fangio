import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import RHImage from 'assets/rh_logo.svg';
import RHLogo from 'assets/rh_logo_text.svg';

import { CLOUD_ENABLED, ENVIRONMENT } from 'api/environment';

import { Login } from '../Login';
import { Button } from '../Button';
import { ComponentAdder } from '../Canvas/ComponentAdder';
import { DownloadMenu } from '../Canvas/DownloadMenu';
import { ViewsMenu } from '../Canvas/ViewsMenu';

import { raceActions } from 'store/race/slice';

import styles from './NavBar.module.scss';

export function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAtHome = location.pathname === '/';
  const isAtAnalyser = location.pathname === '/analyser';

  function renderCanvasNavbar() {
    return (
      <>
        <ResetSessionButton />
        <div className={styles.toolbar}>
          <DownloadMenu />
          <ViewsMenu />
          <ComponentAdder />
        </div>
      </>
    );
  }

  return (
    <div className={styles.navbar}>
      <Link to="/" className={styles.link}>
        <img alt="RaceHub" src={RHImage} />
        <img alt="RaceHub" className={styles.logoText} src={RHLogo} />
      </Link>
      {ENVIRONMENT === 'STAGING' ? (
        <div
          className={styles.environmentLabel}
          data-test-id="environment-label"
        >
          STAGING PRE-RELEASE
        </div>
      ) : null}
      <div className={styles.buttons}>
        {CLOUD_ENABLED && (isAtHome || isAtAnalyser) && <Login />}
        {!isAtAnalyser && (
          <Button
            text="Analyser"
            className={styles.button}
            onClick={() => navigate('/analyser')}
          />
        )}
        {isAtAnalyser && renderCanvasNavbar()}
      </div>
    </div>
  );
}

const ResetSessionButton = () => {
  const dispatch = useDispatch();

  const handleClick = () => {
    dispatch(raceActions.resetRaceSession());
  };

  useEffect(() => {
    const lastFlush = localStorage.getItem('LAST_RACE_SESSION_RESET');
    const lastFlushDate = lastFlush ? new Date(lastFlush) : null;
    const expiryDate = new Date('2024-11-07');
    const today = new Date();

    if (today > expiryDate && (!lastFlushDate || lastFlushDate < expiryDate)) {
      dispatch(raceActions.resetRaceSession());
      localStorage.setItem('LAST_RACE_SESSION_RESET', today.toISOString());
    }
  }, [dispatch]);

  return (
    <Button
      text={'Reset Session'}
      className={styles.button}
      onClick={handleClick}
    />
  );
};

