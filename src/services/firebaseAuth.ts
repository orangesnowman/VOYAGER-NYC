import { initializeApp } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  getAuth,
  getRedirectResult,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
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

export const registerWithEmail = async (name: string, email: string, password: string, preferredLanguage: 'EN' | 'ES', company = '') => {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  if (name.trim()) await updateProfile(credential.user, { displayName: name.trim() });
  await sendEmailVerification(credential.user);
  await saveUserProfileSafely(credential.user, preferredLanguage);
  await setDoc(doc(db, 'users', credential.user.uid), {
    company: company.trim(),
    accountType: company.trim() ? 'corporate' : 'individual',
    approvalStatus: company.trim() ? 'pending' : 'active',
    role: 'student',
    updatedAt: serverTimestamp(),
  }, { merge: true });
  return credential.user;
};

export const signInWithEmail = async (email: string, password: string) => {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  if (!credential.user.emailVerified) {
    await sendEmailVerification(credential.user);
    await auth.signOut();
    const error = new Error('Email verification required') as Error & { code?: string };
    error.code = 'auth/email-not-verified';
    throw error;
  }
  return credential.user;
};

export const signInWithGoogle = async (preferredLanguage: 'EN' | 'ES') => {
  sessionStorage.setItem('voyager_google_login_language', preferredLanguage);
  const teacherInvite = new URLSearchParams(window.location.search).get('teacherInvite');
  if (teacherInvite) {
    localStorage.setItem('voyager_teacher_invite', teacherInvite);
    localStorage.setItem('voyager_post_login_destination', 'teachers');
  }
  await signInWithRedirect(auth, loginProvider);
};

export const completeGoogleSignIn = async () => {
  const result = await getRedirectResult(auth);
  if (!result) return null;
  const preferredLanguage = sessionStorage.getItem('voyager_google_login_language') === 'ES' ? 'ES' : 'EN';
  sessionStorage.removeItem('voyager_google_login_language');
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
