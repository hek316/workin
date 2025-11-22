import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { OfficeLocation } from '@/types';

/**
 * Get all active office locations
 */
export async function getActiveOffices(): Promise<OfficeLocation[]> {
  const officesRef = collection(db, 'offices');
  const q = query(officesRef, where('isActive', '==', true));
  const querySnapshot = await getDocs(q);

  const offices: OfficeLocation[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    offices.push({
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as OfficeLocation);
  });

  return offices;
}

/**
 * Get all office locations (including inactive)
 */
export async function getAllOffices(): Promise<OfficeLocation[]> {
  const officesRef = collection(db, 'offices');
  const querySnapshot = await getDocs(officesRef);

  const offices: OfficeLocation[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    offices.push({
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as OfficeLocation);
  });

  return offices;
}

/**
 * Get a single office by ID
 */
export async function getOfficeById(id: string): Promise<OfficeLocation | null> {
  const officeRef = doc(db, 'offices', id);
  const officeSnap = await getDoc(officeRef);

  if (!officeSnap.exists()) {
    return null;
  }

  const data = officeSnap.data();
  return {
    id: officeSnap.id,
    ...data,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  } as OfficeLocation;
}

/**
 * Create a new office location
 */
export async function createOffice(
  office: Omit<OfficeLocation, 'id' | 'createdAt' | 'updatedAt'>
): Promise<OfficeLocation> {
  const officesRef = collection(db, 'offices');
  const newDocRef = doc(officesRef);

  const officeData = {
    ...office,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(newDocRef, officeData);

  return {
    id: newDocRef.id,
    ...office,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Update an existing office location
 */
export async function updateOffice(
  id: string,
  updates: Partial<Omit<OfficeLocation, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  const officeRef = doc(db, 'offices', id);
  await updateDoc(officeRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Delete an office location
 */
export async function deleteOffice(id: string): Promise<void> {
  const officeRef = doc(db, 'offices', id);
  await deleteDoc(officeRef);
}

/**
 * Initialize default offices if none exist
 */
export async function initializeDefaultOffices(): Promise<void> {
  const offices = await getAllOffices();

  if (offices.length === 0) {
    // Create default headquarters
    await createOffice({
      name: '본사',
      address: '서울특별시 중구',
      lat: 37.5665,
      lng: 126.9780,
      checkInRadius: 1000,
      checkOutRadius: 3000,
      isActive: true,
    });

    // Create default branch office
    await createOffice({
      name: '지사',
      address: '서울특별시 강남구',
      lat: 37.4979,
      lng: 127.0276,
      checkInRadius: 1000,
      checkOutRadius: 3000,
      isActive: true,
    });
  }
}
