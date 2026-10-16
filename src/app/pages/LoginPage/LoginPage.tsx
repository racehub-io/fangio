import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useAuth, AuthProvider, useFirebaseApp } from 'reactfire';
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from 'firebase/auth';

import { NavBar } from 'app/components/NavBar';
import { Button } from 'app/components/Button';
import { Overlay } from 'app/components/Overlay';
import { LabelButton } from 'app/components/LabelButton';


import styles from './LoginPage.module.scss';

type LogInFormData = {
  email: string;
  password: string;
};

type RegisterFormData = {
  email: string;
  name: string;
  password: string;
  confirmPassword: string;
};

function getErrorMessage(code: string): string {
  let message: string;
  switch (code) {
    case 'auth/weak-password':
      message =
        'Your password must be at least 6 characters long for enhanced security.';
      break;
    case 'auth/user-not-found':
      message = 'No user found for the provided email.';
      break;
    case 'auth/wrong-password':
      message = 'Wrong password. Please try again.';
      break;
    case 'auth/invalid-email':
      message = 'The email address is not valid.';
      break;
    case 'auth/user-disabled':
      message = 'This user has been disabled. Please contact support.';
      break;
    case 'auth/email-already-in-use':
      message = 'The email is already in use by another account.';
      break;
    case 'auth/operation-not-allowed':
      message = 'Operation not allowed. Please contact support.';
      break;
    case 'auth/too-many-requests':
      message =
        'We have blocked all requests from this device due to unusual activity. Try again later.';
      break;
    case 'auth/network-request-failed':
      message = 'A network error has occurred, please try again.';
      break;
    default:
      message = 'An unknown error occurred. Please try again.';
  }
  return message;
}

const logInUser = async (auth, email, password, cb) => {
  signInWithEmailAndPassword(auth, email, password)
    .then(() => cb())
    .catch(error => {
      const errorCode = error.code;
      cb(getErrorMessage(error.code));
      console.log(errorCode);
    });
};

const registerUser = async (auth, email, password, cb) => {
  createUserWithEmailAndPassword(auth, email, password)
    .then(() => cb())
    .catch(error => {
      const errorCode = error.code;
      cb(getErrorMessage(error.code));
      console.log(errorCode);
    });
};

const resetPassword = async (auth, email, cb) => {
  sendPasswordResetEmail(auth, email)
    .then(() => {
      cb('Password reset email sent.');
    })
    .catch(error => {
      const errorCode = error.code;
      cb(getErrorMessage(errorCode));
      console.log(errorCode);
    });
};

const SignInForm = () => {
  const [formMode, setFormMode] = useState<'login' | 'register'>('login');

  const setFormToLogin = () => {
    setFormMode('login');
  };

  const setFormToRegister = () => {
    setFormMode('register');
  };

  return (
    <Overlay title={formMode === 'login' ? 'Log In' : 'Register'}>
      {formMode === 'login' ? (
        <LoginForm onSetFormToRegister={setFormToRegister} />
      ) : (
        <RegisterForm onSetFormToLogin={setFormToLogin} />
      )}
    </Overlay>
  );
};

function LoginForm({
  onSetFormToRegister,
}: {
  onSetFormToRegister: () => void;
}) {
  const [message, setMessage] = useState('');
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LogInFormData>();
  const email = watch('email', '');
  const password = watch('password', '');

  const auth = useAuth();
  const navigate = useNavigate();

  const cb = (errorMessage?: string) => {
    if (errorMessage) {
      setMessage(errorMessage);
      return;
    }
    navigate('/profile');
  };

  const onSubmit = handleSubmit(data => {
    logInUser(auth, data.email, data.password, cb);
  });

  const handleForgotPassword = () => {
    resetPassword(auth, email, cb);
  };

  const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;

  return (
    <form onSubmit={onSubmit} className={styles.form}>
      <div className={styles.field}>
        <label>Email</label>
        <input
          {...register('email', {
            required: true,
            pattern: emailRegex,
          })}
        />
        {errors.email && <div>Please provide a valid email.</div>}
      </div>
      <div className={styles.field}>
        <label>Password</label>
        <input
          {...register('password', {
            required: true,
          })}
          type="password"
        />
        {errors.password && <div>Password is required.</div>}
        <div className={styles.forgotPassword}>
          <LabelButton
            disabled={!email.match(emailRegex)}
            text="Forgot password?"
            onClick={handleForgotPassword}
          />
        </div>
      </div>
      <div className={styles.footer}>
        {message}
        <Button
          type="submit"
          text="Login"
          disabled={!email.match(emailRegex) || !password}
        />
        <div className={styles.panelSwitcher}>
          <span>Don't have an account?</span>
          <LabelButton
            text={'Register now'}
            onClick={() => onSetFormToRegister()}
          />
        </div>
      </div>
    </form>
  );
}

function RegisterForm({ onSetFormToLogin }: { onSetFormToLogin: () => void }) {
  const [isRegistering, setRegistering] = useState(false);
  const [message, setMessage] = useState('');
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>();
  const email = watch('email', '');
  const password = watch('password', '');
  const confirmPassword = watch('confirmPassword', '');

  const auth = useAuth();
  const navigate = useNavigate();

  const cb = (errorMessage?: string) => {
    if (errorMessage) {
      setMessage(errorMessage);
      setRegistering(false);
      return;
    }
    navigate('/profile');
  };

  const onSubmit = handleSubmit(data => {
    setRegistering(true);
    registerUser(auth, data.email, data.password, cb);
  });

  const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;

  return (
    <form onSubmit={onSubmit} className={styles.form}>
      <div className={styles.field}>
        <label>Email</label>
        <input
          {...register('email', {
            required: true,
            pattern: emailRegex,
          })}
        />
        {errors.email && <div>Please provide a valid email.</div>}
      </div>
      <div className={styles.field}>
        <label>Password</label>
        <input
          {...register('password', {
            required: true,
          })}
          type="password"
        />
        {errors.password && <div>Password is required.</div>}
      </div>
      <div className={styles.field}>
        <label>Confirm your password</label>
        <input
          {...register('confirmPassword', {
            required: true,
          })}
          type="password"
        />
      </div>
      <div className={styles.footer}>
        {message}
        <Button
          type="submit"
          text="Register"
          loading={isRegistering}
          disabled={
            !email.match(emailRegex) ||
            !password ||
            !confirmPassword ||
            confirmPassword !== password
          }
        />
        <div className={styles.panelSwitcher}>
          <span>Already have an account?</span>
          <LabelButton text={'Log in now'} onClick={() => onSetFormToLogin()} />
        </div>
      </div>
    </form>
  );
}

export const LoginPage = () => {
  const firebaseApp = useFirebaseApp();
  const auth = getAuth(firebaseApp);

  return (
    <AuthProvider sdk={auth}>
      <Helmet>
        <title>Login - RaceHub | Sim Racing Telemetry Analysis</title>
        <meta
          name="description"
          content="Login to RaceHub - your hub for professional sim racing telemetry analysis. Access advanced tools to elevate your racing performance."
        />
        <meta
          name="keywords"
          content="RaceHub, Login, Sim Racing, Telemetry Analysis, Racing Tools, Professional Sim Racing"
        />
        <meta
          property="og:title"
          content="Login - RaceHub | Sim Racing Telemetry Analysis"
        />
        <meta
          property="og:description"
          content="Login to RaceHub - your hub for professional sim racing telemetry analysis. Access advanced tools to elevate your racing performance."
        />
        <meta property="og:url" content="http://racehub.io/signin" />
        <meta name="twitter:card" content="summary" />
      </Helmet>
      <NavBar />
      <SignInForm />
    </AuthProvider>
  );
};
