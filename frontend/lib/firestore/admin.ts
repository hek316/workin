import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { User, Attendance } from '@/types';

/**
 * Get all users (employees and admins)
 */
export async function getAllUsers(): Promise<User[]> {
  const usersRef = collection(db, 'users');
  const querySnapshot = await getDocs(usersRef);

  const users: User[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    users.push({
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      lastLoginAt: data.lastLoginAt?.toDate() || new Date(),
    } as User);
  });

  // Sort by name
  users.sort((a, b) => a.name.localeCompare(b.name, 'ko'));

  return users;
}

/**
 * Get all employees (excluding admins)
 */
export async function getAllEmployees(): Promise<User[]> {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('role', '==', 'employee'));
  const querySnapshot = await getDocs(q);

  const employees: User[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    employees.push({
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      lastLoginAt: data.lastLoginAt?.toDate() || new Date(),
    } as User);
  });

  // Sort by name
  employees.sort((a, b) => a.name.localeCompare(b.name, 'ko'));

  return employees;
}

/**
 * Get attendance records for a specific date for all users
 */
export async function getAttendanceByDate(dateStr: string): Promise<Attendance[]> {
  const attendanceRef = collection(db, 'attendance');
  const q = query(attendanceRef, where('date', '==', dateStr));
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
 * Subscribe to real-time attendance updates for a specific date
 */
export function subscribeToAttendanceByDate(
  dateStr: string,
  callback: (attendance: Attendance[]) => void
): Unsubscribe {
  const attendanceRef = collection(db, 'attendance');
  const q = query(attendanceRef, where('date', '==', dateStr));

  return onSnapshot(q, (querySnapshot) => {
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

    callback(attendance);
  });
}

/**
 * Get attendance summary statistics for a date
 */
export interface AttendanceStats {
  total: number;
  checkedIn: number;
  checkedOut: number;
  late: number;
  early: number;
  absent: number;
  attendanceRate: number;
}

export function calculateAttendanceStats(
  employees: User[],
  attendance: Attendance[]
): AttendanceStats {
  const total = employees.length;
  const checkedIn = attendance.filter(a => a.checkIn).length;
  const checkedOut = attendance.filter(a => a.checkOut).length;
  const late = attendance.filter(a => a.checkIn?.status === 'late').length;
  const early = attendance.filter(a => a.checkOut?.status === 'early').length;
  const absent = total - checkedIn;
  const attendanceRate = total > 0 ? Math.round((checkedIn / total) * 100) : 0;

  return {
    total,
    checkedIn,
    checkedOut,
    late,
    early,
    absent,
    attendanceRate,
  };
}

/**
 * Combine employees with their attendance data
 */
export interface EmployeeAttendance {
  user: User;
  attendance: Attendance | null;
}

export function combineEmployeesWithAttendance(
  employees: User[],
  attendance: Attendance[]
): EmployeeAttendance[] {
  return employees.map(employee => {
    const employeeAttendance = attendance.find(a => a.uid === employee.uid) || null;
    return {
      user: employee,
      attendance: employeeAttendance,
    };
  });
}
