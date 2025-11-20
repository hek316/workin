import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  setPersistence,
  browserLocalPersistence,
  AuthError,
} from 'firebase/auth';
import { auth } from './config';
import { createUser, getUserByUid, updateLastLogin } from '../firestore/users';
import type { User } from '@/types';

/**
 * Sign up with email and password
 * Creates Firebase Auth user and Firestore user document
 */
export async function signUp(
  email: string,
  password: string,
  name: string
): Promise<User> {
  try {
    // Set persistence to LOCAL (survives browser restarts)
    console.log('Setting persistence...');
    await setPersistence(auth, browserLocalPersistence);

    // Create Firebase Auth user
    console.log('Creating Firebase Auth user...');
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    console.log('Firebase Auth user created:', userCredential.user.uid);

    // Create Firestore user document
    console.log('Creating Firestore user document...');
    const user = await createUser(
      userCredential.user.uid,
      email,
      name
    );
    console.log('Firestore user document created');

    return user;
  } catch (error) {
    console.error('signUp error:', error);
    const authError = error as AuthError;
    throw new Error(getAuthErrorMessage(authError.code));
  }
}

/**
 * Sign in with email and password
 */
export async function signIn(
  email: string,
  password: string
): Promise<User> {
  try {
    // Set persistence to LOCAL (survives browser restarts)
    await setPersistence(auth, browserLocalPersistence);

    // Sign in with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Get user from Firestore
    const user = await getUserByUid(userCredential.user.uid);

    if (!user) {
      throw new Error('사용자 정보를 찾을 수 없습니다');
    }

    // Update last login timestamp
    await updateLastLogin(userCredential.user.uid);

    return user;
  } catch (error) {
    const authError = error as AuthError;
    throw new Error(getAuthErrorMessage(authError.code));
  }
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    const authError = error as AuthError;
    throw new Error(getAuthErrorMessage(authError.code));
  }
}

/**
 * Listen to auth state changes
 * Returns unsubscribe function
 */
export function onAuthChange(
  callback: (user: FirebaseUser | null) => void
): () => void {
  return onAuthStateChanged(auth, callback);
}

/**
 * Get current Firebase Auth user
 */
export function getCurrentUser(): FirebaseUser | null {
  return auth.currentUser;
}

/**
 * Convert Firebase Auth error codes to Korean error messages
 */
function getAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return '이미 사용 중인 이메일입니다';
    case 'auth/invalid-email':
      return '유효하지 않은 이메일 형식입니다';
    case 'auth/weak-password':
      return '비밀번호는 최소 6자 이상이어야 합니다';
    case 'auth/user-not-found':
      return '존재하지 않는 사용자입니다';
    case 'auth/wrong-password':
      return '잘못된 비밀번호입니다';
    case 'auth/too-many-requests':
      return '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요';
    case 'auth/network-request-failed':
      return '네트워크 오류가 발생했습니다';
    case 'auth/user-disabled':
      return '비활성화된 계정입니다';
    case 'auth/invalid-credential':
      return '잘못된 인증 정보입니다';
    default:
      return '인증 오류가 발생했습니다. 다시 시도해주세요';
  }
}
