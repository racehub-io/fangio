import { useFirebaseApp, useSigninCheck } from 'reactfire';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { Button } from 'app/components/Button';
import { LoadingIndicator } from 'app/components/LoadingIndicator';

export const Login = () => {
  const navigate = useNavigate();
  const firebaseApp = useFirebaseApp();
  const auth = getAuth(firebaseApp);
  const authToken = auth.currentUser?.uid;
  const { status, data: signinResult } = useSigninCheck();

  if (status === 'loading') {
    return <LoadingIndicator />;
  }

  const { signedIn } = signinResult;

  const navigateToLogin = () => navigate('/signin');

  const navigateToProfile = () => navigate('/profile');

  if (signedIn && authToken) {
    return <ProfileButton onClick={navigateToProfile} />;
  }

  return <Button text="Sign In" onClick={navigateToLogin} minimal />;
};

function ProfileButton({ onClick }: { onClick: () => void }) {
  return <Button minimal text={'Profile'} onClick={onClick} />;
}
