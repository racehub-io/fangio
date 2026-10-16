import { useEffect, useMemo, useState } from 'react';
import { useSigninCheck } from 'reactfire';
import { setDoc, getFirestore, doc, getDoc } from 'firebase/firestore';
import { Auth, getAuth } from 'firebase/auth';

import { initializeApp } from 'firebase/app';
import { CLOUD_ENABLED, firebaseConfig } from './environment';

export interface Sessions {
  [ip: string]: string[];
}

export interface User {
  sessions: Sessions;
  name: string;
  team?: { [email: string]: boolean };
  email: string;
  uid: string;
  accessToken: string;
}

interface UserPayload {
  sessions?: Sessions;
}

interface AuthUser {
  uid?: string;
  email: string | undefined | null;
  accessToken?: string;
}

// Initialize Firebase
export const firebaseApp = CLOUD_ENABLED ? initializeApp(firebaseConfig) : undefined;

export function useAuthUser(): AuthUser {
  const { currentUser } = useAuth();

  const uid = currentUser?.uid;
  const email = currentUser?.email;
  const accessToken = (currentUser as any)?.accessToken;

  const authUser = useMemo(() => {
    return {
      uid,
      email,
      accessToken,
    };
  }, [uid, email, accessToken]);

  return authUser;
}

export function useSignedStatus(): 'loading' | 'error' | 'success' {
  const { status } = useSigninCheck();
  return status;
}

export async function removeSessionFromUser(
  ipToRemove: string,
  userId: string,
) {
  // Fetch the user document
  const userDocRef = doc(getFirestore(), 'users', userId);
  const userSnapshot = await getDoc(userDocRef);

  if (userSnapshot.exists()) {
    const userData = userSnapshot.data() as UserPayload;

    // Check if the session with the given IP exists
    if (userData.sessions && userData.sessions[ipToRemove]) {
      // Delete the session
      delete userData.sessions[ipToRemove];

      // Save the modified document back to Firestore
      await setDoc(userDocRef, userData);
    }
  }
}

export async function addUserToTeam(emailAddress: string, teamId: string) {
  await setDoc(
    doc(getFirestore(), 'team_members', emailAddress),
    { [teamId]: true },
    { merge: true },
  );
  await setDoc(
    doc(getFirestore(), 'users', teamId),
    { team: { [emailAddress]: true } },
    { merge: true },
  );
}

export async function removeUserFromTeam(emailAddress: string, teamId: string) {
  await setDoc(
    doc(getFirestore(), 'team_members', emailAddress),
    { [teamId]: false },
    { merge: true },
  );
  await setDoc(
    doc(getFirestore(), 'users', teamId),
    { team: { [emailAddress]: false } },
    { merge: true },
  );
}

export async function storeToUser(payload: UserPayload, userId: string) {
  await setDoc(doc(getFirestore(), 'users', userId), payload, { merge: true });
}

export function useUser(): User {
  const authUser = useAuthUser();
  const userDocRef = useMemo(() => {
    return authUser?.uid ? doc(getFirestore(), `users/${authUser.uid}`) : null;
  }, [authUser?.uid]);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (userDocRef) {
      getDoc(userDocRef)
        .then(snapshot => {
          if (snapshot.exists()) {
            setUser(snapshot.data() as User);
          } else {
            console.log('No user data found');
          }
        })
        .catch(error => {
          console.error('Error fetching user data:', error.message);
          console.error('Detailed error:', error);
        });
    }
  }, [authUser, userDocRef]);

  return { ...user, ...authUser } as User;
}

export function useSignOut(): () => Promise<void> {
  const auth = useAuth();
  return () => auth.signOut().then(() => console.log('Signed user out'));
}

export function useAuth(): Auth {
  return getAuth(firebaseApp);
}
