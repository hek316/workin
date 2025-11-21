import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  limit,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Attendance, CheckInOut, Location } from '@/types';

/**
 * Generate attendance document ID: {uid}_{YYYY-MM-DD}
 */
export function getAttendanceDocId(uid: string, date: Date): string {
  const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
  return `${uid}_${dateStr}`;
}

/**
 * Get today's date string in YYYY-MM-DD format
 */
export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Get today's attendance record for a user
 */
export async function getTodayAttendance(uid: string): Promise<Attendance | null> {
  const docId = getAttendanceDocId(uid, new Date());
  const attendanceRef = doc(db, 'attendance', docId);
  const attendanceSnap = await getDoc(attendanceRef);

  if (!attendanceSnap.exists()) {
    return null;
  }

  const data = attendanceSnap.data();
  return {
    ...data,
    checkIn: data.checkIn ? {
      ...data.checkIn,
      time: data.checkIn.time.toDate(),
    } : null,
    checkOut: data.checkOut ? {
      ...data.checkOut,
      time: data.checkOut.time.toDate(),
    } : null,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  } as Attendance;
}

/**
 * Determine check-in status based on time
 * Normal: before 09:05
 * Late: 09:05 or after
 */
export function determineCheckInStatus(checkInTime: Date): 'normal' | 'late' {
  const hours = checkInTime.getHours();
  const minutes = checkInTime.getMinutes();

  // 09:05 이후면 지각
  if (hours > 9 || (hours === 9 && minutes >= 5)) {
    return 'late';
  }
  return 'normal';
}

/**
 * Determine check-out status based on time
 * Normal: 18:00 or after
 * Early: before 18:00
 */
export function determineCheckOutStatus(checkOutTime: Date): 'normal' | 'early' {
  const hours = checkOutTime.getHours();

  // 18:00 이전이면 조퇴
  if (hours < 18) {
    return 'early';
  }
  return 'normal';
}

/**
 * Calculate work hours between check-in and check-out
 */
export function calculateWorkHours(checkIn: Date, checkOut: Date): number {
  const diffMs = checkOut.getTime() - checkIn.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  return Math.round(diffHours * 100) / 100; // Round to 2 decimal places
}

/**
 * Record check-in for a user
 */
export async function recordCheckIn(
  uid: string,
  name: string,
  location: Location
): Promise<Attendance> {
  const now = new Date();
  const docId = getAttendanceDocId(uid, now);
  const attendanceRef = doc(db, 'attendance', docId);

  const checkIn: CheckInOut = {
    time: now,
    location,
    status: determineCheckInStatus(now),
  };

  const attendanceData = {
    uid,
    name,
    date: getTodayDateString(),
    checkIn: {
      time: Timestamp.fromDate(now),
      location,
      status: checkIn.status,
    },
    checkOut: null,
    workHours: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(attendanceRef, attendanceData);

  return {
    uid,
    name,
    date: getTodayDateString(),
    checkIn,
    checkOut: null,
    workHours: null,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Record check-out for a user
 */
export async function recordCheckOut(
  uid: string,
  location: Location
): Promise<Attendance> {
  const now = new Date();
  const docId = getAttendanceDocId(uid, now);
  const attendanceRef = doc(db, 'attendance', docId);

  // Get existing attendance record
  const existingSnap = await getDoc(attendanceRef);
  if (!existingSnap.exists()) {
    throw new Error('출근 기록이 없습니다');
  }

  const existing = existingSnap.data();
  if (!existing.checkIn) {
    throw new Error('출근 기록이 없습니다');
  }

  const checkInTime = existing.checkIn.time.toDate();
  const workHours = calculateWorkHours(checkInTime, now);

  const checkOut: CheckInOut = {
    time: now,
    location,
    status: determineCheckOutStatus(now),
  };

  await updateDoc(attendanceRef, {
    checkOut: {
      time: Timestamp.fromDate(now),
      location,
      status: checkOut.status,
    },
    workHours,
    updatedAt: serverTimestamp(),
  });

  return {
    uid: existing.uid,
    name: existing.name,
    date: existing.date,
    checkIn: {
      time: checkInTime,
      location: existing.checkIn.location,
      status: existing.checkIn.status,
    },
    checkOut,
    workHours,
    createdAt: existing.createdAt?.toDate() || now,
    updatedAt: now,
  };
}

/**
 * Get attendance history for a user (current month + 3 months)
 */
export async function getAttendanceHistory(
  uid: string,
  monthsBack: number = 3
): Promise<Attendance[]> {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - monthsBack);
  startDate.setDate(1); // First day of the month

  const startDateStr = startDate.toISOString().split('T')[0];

  const attendanceRef = collection(db, 'attendance');
  const q = query(
    attendanceRef,
    where('uid', '==', uid),
    where('date', '>=', startDateStr),
    orderBy('date', 'desc'),
    limit(100)
  );

  const querySnapshot = await getDocs(q);
  const attendance: Attendance[] = [];

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    attendance.push({
      ...data,
      checkIn: data.checkIn ? {
        ...data.checkIn,
        time: data.checkIn.time.toDate(),
      } : null,
      checkOut: data.checkOut ? {
        ...data.checkOut,
        time: data.checkOut.time.toDate(),
      } : null,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as Attendance);
  });

  return attendance;
}

/**
 * Get attendance records for a specific month
 */
export async function getMonthlyAttendance(
  uid: string,
  year: number,
  month: number
): Promise<Attendance[]> {
  // Create start and end dates for the month
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0); // Last day of the month

  const startDateStr = startDate.toISOString().split('T')[0];
  const endDateStr = endDate.toISOString().split('T')[0];

  const attendanceRef = collection(db, 'attendance');
  const q = query(
    attendanceRef,
    where('uid', '==', uid),
    where('date', '>=', startDateStr),
    where('date', '<=', endDateStr),
    orderBy('date', 'asc')
  );

  const querySnapshot = await getDocs(q);
  const attendance: Attendance[] = [];

  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    attendance.push({
      ...data,
      checkIn: data.checkIn ? {
        ...data.checkIn,
        time: data.checkIn.time.toDate(),
      } : null,
      checkOut: data.checkOut ? {
        ...data.checkOut,
        time: data.checkOut.time.toDate(),
      } : null,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as Attendance);
  });

  return attendance;
}

/**
 * Get available months for attendance history (current + past 3 months)
 */
export function getAvailableMonths(): { year: number; month: number; label: string }[] {
  const months: { year: number; month: number; label: string }[] = [];
  const now = new Date();

  for (let i = 0; i <= 3; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      label: `${date.getFullYear()}년 ${date.getMonth() + 1}월`,
    });
  }

  return months;
}
