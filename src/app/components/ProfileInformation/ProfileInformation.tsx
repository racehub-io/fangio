import { useUser } from 'api/firebase';
import styles from './ProfileInformation.module.scss';

export const ProfileInformation = () => {
  const user = useUser();

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <div className={styles.profile}>
      <span>Email: {user.email}</span>
    </div>
  );
};
