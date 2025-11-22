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

export interface OfficeLocation {
  id: string;
  name: string;
  address?: string;
  lat: number;
  lng: number;
  checkInRadius: number;
  checkOutRadius: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type ApprovalType = 'check_in' | 'check_out';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface ApprovalRequest {
  id: string;
  uid: string;
  name: string;
  date: string;
  type: ApprovalType;
  reason: string;
  location: Location;
  status: ApprovalStatus;
  reviewedBy?: string;
  reviewedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}
