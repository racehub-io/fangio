/**
 *
 * App
 *
 * This component is the skeleton around the actual pages, and should only
 * contain code that should be seen on all pages. (e.g. navigation bar)
 */

import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, FirestoreProvider, FirebaseAppProvider } from 'reactfire';
import { getFirestore } from 'firebase/firestore';

import { firebaseApp } from 'api/firebase';
import { getAuth } from 'firebase/auth';
import { CLOUD_ENABLED, firebaseConfig } from 'api/environment';
import { WorkbookPage } from './pages/WorkbookPage/Loadable';
import { LoginPage } from './pages/LoginPage/Loadable';
import { NotFoundPage } from './pages/NotFoundPage/Loadable';
import { HomePage } from './pages/HomePage';
import { ProfilePage } from './pages/ProfilePage';
import { PrivacyPolicy } from './pages/LegalPage/Legal/PrivacyPolicy';
import { CookiePolicy } from './pages/LegalPage/Legal/CookiePolicy';
import { DMCAPolicy } from './pages/LegalPage/Compliance/DMCAPolicy';
import { AccessibilityStatement } from './pages/LegalPage/Compliance/AccessibilityStatement';
import { LegalPage } from './pages/LegalPage';
import { RACEHUB_LAYOUT } from 'store/context';
import { AuthTokenWatcher } from './AuthTokenWatcher';

import 'react-mosaic-component/react-mosaic-component.css';
import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';
import './index.scss';

export const LEGAL_LINKS = [
  {
    label: 'Privacy Policy',
    path: '/privacy-policy',
    component: <PrivacyPolicy />,
  },
  {
    label: 'Cookie Policy',
    path: '/cookie-policy',
    component: <CookiePolicy />,
  },
];

export const COMPLIANCE_LINKS = [
  {
    label: 'DMCA Policy',
    path: '/dmca-policy',
    component: <DMCAPolicy />,
  },
  {
    label: 'Accessibility Statement',
    path: '/accessibility-statement',
    component: <AccessibilityStatement />,
  },
];

export function App() {
  useEffect(() => {
    const localState = localStorage.getItem(RACEHUB_LAYOUT);

    if (!localState) {
      return;
    }

    const storedLayout = JSON.parse(localState);

    const expiryDate = new Date('2024-06-06');
    const storedLayoutTimestamp = new Date(storedLayout?.timestamp);

    if (!storedLayout?.timestamp || storedLayoutTimestamp < expiryDate) {
      localStorage.removeItem(RACEHUB_LAYOUT);
    }
  }, []);

  return (
    <BrowserRouter>
        <AuthWrapper>
          <Helmet
            titleTemplate="%s - RaceHub"
            defaultTitle="RaceHub: Professional Sim Racing Telemetry Analysis Tools"
          >
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
          {CLOUD_ENABLED && <AuthTokenWatcher />}
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/analyser" element={<WorkbookPage />} />
            {CLOUD_ENABLED && <Route path="/profile" element={<ProfilePage />} />}
            {CLOUD_ENABLED && <Route path="/signin" element={<LoginPage />} />}
            {LEGAL_LINKS.map(link => (
              <Route
                key={`legal-link-${link}`}
                path={link.path}
                element={<LegalPage component={link.component} />}
              />
            ))}
            {COMPLIANCE_LINKS.map(link => (
              <Route
                key={`compliance-link-${link}`}
                path={link.path}
                element={<LegalPage component={link.component} />}
              />
            ))}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AuthWrapper>
    </BrowserRouter>
  );
}

function AuthWrapper(props) {
  if (!firebaseApp) return props.children;
  return (
    <FirebaseAppProvider firebaseConfig={firebaseConfig}>
      <AuthProvider sdk={getAuth(firebaseApp)}>
        <FirestoreProvider sdk={getFirestore(firebaseApp)}>{props.children}</FirestoreProvider>
      </AuthProvider>
    </FirebaseAppProvider>
  );
}
