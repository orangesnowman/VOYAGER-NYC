import { initializeApp } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
  User,
} from 'firebase/auth';
import { doc, getFirestore, serverTimestamp, setDoc } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

const loginProvider = new GoogleAuthProvider();
loginProvider.setCustomParameters({ prompt: 'select_account' });

const tasksProvider = new GoogleAuthProvider();
tasksProvider.addScope('https://www.googleapis.com/auth/tasks');

let cachedTasksAccessToken: string | null = null;

const saveUserProfile = async (user: User, preferredLanguage: 'EN' | 'ES' = 'EN') => {
  await setDoc(doc(db, 'users', user.uid), {
    displayName: user.displayName || '',
    email: user.email || '',
    preferredLanguage,
    updatedAt: serverTimestamp(),
    createdAt: serverTimestamp(),
  }, { merge: true });
};

const saveUserProfileSafely = async (user: User, preferredLanguage: 'EN' | 'ES') => {
  try {
    await saveUserProfile(user, preferredLanguage);
  } catch (error) {
    console.warn('The Firebase account is active, but its Firestore profile could not be saved.', error);
  }
};

export const registerWithEmail = async (name: string, email: string, password: string, preferredLanguage: 'EN' | 'ES') => {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  if (name.trim()) await updateProfile(credential.user, { displayName: name.trim() });
  await sendEmailVerification(credential.user);
  await saveUserProfileSafely(credential.user, preferredLanguage);
  return credential.user;
};

export const signInWithEmail = async (email: string, password: string) => {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
};

export const signInWithGoogle = async (preferredLanguage: 'EN' | 'ES') => {
  const result = await signInWithPopup(auth, loginProvider);
  await saveUserProfileSafely(result.user, preferredLanguage);
  return result.user;
};

export const requestPasswordReset = (email: string) => sendPasswordResetEmail(auth, email);

// Google Tasks authorization is intentionally separate from normal login.
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  const result = await signInWithPopup(auth, tasksProvider);
  const credential = GoogleAuthProvider.credentialFromResult(result);
  if (!credential?.accessToken) throw new Error('Google Tasks permission was not granted');
  cachedTasksAccessToken = credential.accessToken;
  return { user: result.user, accessToken: cachedTasksAccessToken };
};

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void,
) => onAuthStateChanged(auth, (user) => {
  if (user && cachedTasksAccessToken) onAuthSuccess?.(user, cachedTasksAccessToken);
  else onAuthFailure?.();
});

export const getAccessToken = async () => cachedTasksAccessToken;

export const isCurrentUserAdmin = async () => {
  const token = await auth.currentUser?.getIdTokenResult(true);
  return token?.claims.admin === true;
};

export const logout = async () => {
  await auth.signOut();
  cachedTasksAccessToken = null;
};
