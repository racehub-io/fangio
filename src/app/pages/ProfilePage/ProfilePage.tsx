import { Helmet } from 'react-helmet-async';
import { Navigate, useNavigate } from 'react-router-dom';
import { useSigninCheck } from 'reactfire';

import { Button } from 'app/components/Button';
import { NavBar } from 'app/components/NavBar';
import { Overlay } from 'app/components/Overlay';

import {
  addUserToTeam,
  removeUserFromTeam,
  useSignOut,
  useUser,
} from 'api/firebase';

import Cross from 'assets/cross.svg';

import styles from './ProfilePage.module.scss';

const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;

function TeamPanel({
  team,
  teamId,
  onAddUser,
}: {
  team?: { [email: string]: boolean };
  teamId: string;
  onAddUser: () => void;
}) {
  const emails = team
    ? Object.keys(team).filter(email => team[email] && email !== 'NO_ID_FIELD')
    : [];

  return (
    <div className={styles.membership}>
      <span className={styles.detailsHeader}>My Team</span>
      <div className={styles.info}>
        {emails
          .sort((a, b) => {
            if (a < b) {
              return -1;
            }
            if (a > b) {
              return 1;
            }
            return 0;
          })
          .map(email => (
            <div className={styles.row} key={email}>
              <span className={styles.title}>{email}</span>
              <img
                alt="Remove"
                src={Cross}
                className={styles.close}
                onClick={() => {
                  const result = window.confirm(
                    `Remove ${email} from your team?`,
                  );
                  if (result) {
                    removeUserFromTeam(email, teamId);
                  }
                }}
              />
            </div>
          ))}
      </div>
      <Button className={styles.adduser} text="Add user" onClick={onAddUser} />
    </div>
  );
}

export const ProfilePage = () => {
  const { data: signinResult } = useSigninCheck();
  const user = useUser();
  const navigate = useNavigate();
  const signOut = useSignOut();

  const handleAddUser = () => {
    const email =
      window.prompt(
        'Enter the email address of the user you wish to add to your team:',
      ) || '';

    if (email.match(emailRegex)) {
      addUserToTeam(email, user.uid);
    }
  };

  if (!signinResult?.signedIn) return <Navigate to="/signin" replace />;

  return (
    <>
      <Helmet>
        <title>Profile - RaceHub | Your Racing Data Center</title>
        <meta
          name="description"
          content="Access and manage your RaceHub profile. Customize settings, view racing history, and more."
        />
        <meta
          name="keywords"
          content="RaceHub, Profile, Sim Racing, Telemetry Analysis, Racing Data, User Profile"
        />
        <meta
          property="og:title"
          content="Profile - RaceHub | Your Racing Data Center"
        />
        <meta
          property="og:description"
          content="Access and manage your RaceHub profile. Customize settings, view racing history, and more."
        />
        <meta property="og:url" content="http://racehub.io/profile" />
        <meta name="twitter:card" content="summary" />
      </Helmet>
      <NavBar />
      <div className={styles.profileOverlay}>
        <Overlay size="l" title={'Profile'} className={styles.overlay}>
          <>
            <div className={styles.panels}>
              <TeamPanel onAddUser={handleAddUser} teamId={user.uid} team={user.team} />
            </div>
            <div className={styles.actions}>
              <Button
                minimal
                text="Email support"
                href={`mailto:info@racehub.io`}
              />
              <Button
                text="Log out"
                type="button"
                minimal
                onClick={() => {
                  signOut().then(() => console.log('Signed user out'));
                  navigate('/signin');
                }}
              />
            </div>
          </>
        </Overlay>
      </div>
    </>
  );
};
