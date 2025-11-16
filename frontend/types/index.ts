/**
 * 공통 타입 정의
 */

export interface User {
  uid: string;
  email: string;
  name: string;
  kakaoId?: string;
  profileImage?: string;
  role: 'employee' | 'admin';
  createdAt: Date;
  lastLoginAt: Date;
}

export interface Location {
  lat: number;
  lng: number;
  accuracy: number;
}

export interface CheckInOut {
  time: Date;
  location: Location;
  status: 'normal' | 'late' | 'early' | 'approved' | 'pending';
}

export interface Attendance {
  uid: string;
  name: string;
  date: string;
  checkIn: CheckInOut | null;
  checkOut: CheckInOut | null;
  workHours: number | null;
  createdAt: Date;
  updatedAt: Date;
}
