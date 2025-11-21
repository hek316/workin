import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { User } from '@/types';

/**
 * Create a new user document in Firestore
 * Called after successful Firebase Auth signup
 */
export async function createUser(
  uid: string,
  email: string,
  name: string,
  kakaoId?: string,
  profileImage?: string
): Promise<User> {
  const userRef = doc(db, 'users', uid);

  const firestoreData = {
    uid,
    email,
    name,
    role: 'employee' as const, // New users are employees by default
    createdAt: serverTimestamp(),
    lastLoginAt: serverTimestamp(),
    ...(kakaoId && { kakaoId }),
    ...(profileImage && { profileImage }),
  };

  await setDoc(userRef, firestoreData);

  const now = new Date();
  return {
    uid,
    email,
    name,
    role: 'employee',
    createdAt: now,
    lastLoginAt: now,
    ...(kakaoId && { kakaoId }),
    ...(profileImage && { profileImage }),
  };
}

/**
 * Get user document by UID
 */
export async function getUserByUid(uid: string): Promise<User | null> {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    return null;
  }

  return userSnap.data() as User;
}

/**
 * Update user's last login timestamp
 * Called after successful login
 */
export async function updateLastLogin(uid: string): Promise<void> {
  const userRef = doc(db, 'users', uid);

  await updateDoc(userRef, {
    lastLoginAt: serverTimestamp(),
  });
}

/**
 * Update user profile information
 * Users can only update name and profileImage
 */
export async function updateUserProfile(
  uid: string,
  updates: {
    name?: string;
    profileImage?: string;
  }
): Promise<void> {
  const userRef = doc(db, 'users', uid);

  // Filter out undefined values
  const filteredUpdates = Object.fromEntries(
    Object.entries(updates).filter(([_, value]) => value !== undefined)
  );

  if (Object.keys(filteredUpdates).length === 0) {
    return;
  }

  await updateDoc(userRef, filteredUpdates);
}

/**
 * Check if user document exists
 * Useful for checking if user completed signup process
 */
export async function userExists(uid: string): Promise<boolean> {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  return userSnap.exists();
}
