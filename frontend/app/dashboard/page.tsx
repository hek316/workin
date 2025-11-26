'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/Button';
import { ApprovalRequestModal } from '@/components/ApprovalRequestModal';
import WeakPasswordWarning from '@/components/WeakPasswordWarning';
import {
  getTodayAttendance,
  recordCheckIn,
  recordCheckOut
} from '@/lib/firestore/attendance';
import {
  createApprovalRequest,
  getTodayApprovalRequest,
  subscribeToApprovalStatus,
} from '@/lib/firestore/approvals';
import {
  validateGPSForCheckIn,
  validateGPSForCheckOut,
  formatWorkHours,
  formatTime,
  GPSError,
  GPSValidationResult
} from '@/lib/gps';
import type { Attendance, ApprovalRequest, ApprovalType, Location } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuthStore();

  const [attendance, setAttendance] = useState<Attendance | null>(null);
  const [loadingAttendance, setLoadingAttendance] = useState(true);
  const [processingCheckIn, setProcessingCheckIn] = useState(false);
  const [processingCheckOut, setProcessingCheckOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [currentWorkTime, setCurrentWorkTime] = useState<string>('');

  // Approval request states
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalType, setApprovalType] = useState<ApprovalType>('check_in');
  const [pendingLocation, setPendingLocation] = useState<Location | null>(null);
  const [pendingDistance, setPendingDistance] = useState<number | null>(null);
  const [checkInApproval, setCheckInApproval] = useState<ApprovalRequest | null>(null);
  const [checkOutApproval, setCheckOutApproval] = useState<ApprovalRequest | null>(null);

  // Fetch today's attendance
  const fetchAttendance = useCallback(async () => {
    if (!user) return;

    try {
      const todayAttendance = await getTodayAttendance(user.uid);
      setAttendance(todayAttendance);

      // Also fetch today's approval requests
      const [checkInReq, checkOutReq] = await Promise.all([
        getTodayApprovalRequest(user.uid, 'check_in'),
        getTodayApprovalRequest(user.uid, 'check_out'),
      ]);
      setCheckInApproval(checkInReq);
      setCheckOutApproval(checkOutReq);
    } catch (err) {
      console.error('Error fetching attendance:', err);
      setError('출퇴근 기록을 불러오는데 실패했습니다');
    } finally {
      setLoadingAttendance(false);
    }
  }, [user]);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (user) {
      fetchAttendance();
    }
  }, [user, fetchAttendance]);

  // Subscribe to approval status changes
  useEffect(() => {
    if (!user) return;

    const unsubscribers: (() => void)[] = [];

    // Subscribe to check-in approval
    if (checkInApproval && checkInApproval.status === 'pending') {
      const unsubscribe = subscribeToApprovalStatus(
        checkInApproval.id,
        (approval) => {
          setCheckInApproval(approval);
          if (approval?.status === 'approved') {
            setSuccessMessage('출근 예외 승인이 완료되었습니다');
            fetchAttendance();
          } else if (approval?.status === 'rejected') {
            setError(`출근 예외 요청이 거부되었습니다: ${approval.rejectionReason || '사유 없음'}`);
          }
        }
      );
      unsubscribers.push(unsubscribe);
    }

    // Subscribe to check-out approval
    if (checkOutApproval && checkOutApproval.status === 'pending') {
      const unsubscribe = subscribeToApprovalStatus(
        checkOutApproval.id,
        (approval) => {
          setCheckOutApproval(approval);
          if (approval?.status === 'approved') {
            setSuccessMessage('퇴근 예외 승인이 완료되었습니다');
            fetchAttendance();
          } else if (approval?.status === 'rejected') {
            setError(`퇴근 예외 요청이 거부되었습니다: ${approval.rejectionReason || '사유 없음'}`);
          }
        }
      );
      unsubscribers.push(unsubscribe);
    }

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, [user, checkInApproval, checkOutApproval, fetchAttendance]);

  // Update current work time every minute
  useEffect(() => {
    if (!attendance?.checkIn || attendance?.checkOut) return;

    const updateWorkTime = () => {
      const now = new Date();
      const checkInTime = attendance.checkIn!.time;
      // Handle both Date object and Firestore Timestamp
      const checkInMs = checkInTime instanceof Date
        ? checkInTime.getTime()
        : (checkInTime as { toDate: () => Date }).toDate().getTime();
      const diffMs = now.getTime() - checkInMs;
      const diffHours = diffMs / (1000 * 60 * 60);
      setCurrentWorkTime(formatWorkHours(diffHours));
    };

    updateWorkTime();
    const interval = setInterval(updateWorkTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [attendance]);

  const handleGPSValidationError = (
    validation: GPSValidationResult,
    type: ApprovalType
  ) => {
    if (validation.error?.type === 'OUT_OF_RANGE' && validation.location) {
      // Show option to request approval
      setApprovalType(type);
      setPendingLocation(validation.location);
      setPendingDistance(validation.distance);
      setError(validation.error.message);
    } else {
      setError(validation.error?.message || 'GPS 검증에 실패했습니다');
    }
  };

  const handleCheckIn = async () => {
    if (!user) return;

    setProcessingCheckIn(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const validation = await validateGPSForCheckIn();

      if (!validation.isValid || !validation.location) {
        handleGPSValidationError(validation, 'check_in');
        return;
      }

      const newAttendance = await recordCheckIn(
        user.uid,
        user.name,
        validation.location
      );

      setAttendance(newAttendance);

      const statusText = newAttendance.checkIn?.status === 'late' ? ' (지각)' : '';
      setSuccessMessage(`출근이 기록되었습니다${statusText} - ${formatTime(newAttendance.checkIn!.time)}`);
    } catch (err) {
      const gpsError = err as GPSError;
      setError(gpsError.message || '출근 기록에 실패했습니다');
    } finally {
      setProcessingCheckIn(false);
    }
  };

  const handleCheckOut = async () => {
    if (!user) return;

    setProcessingCheckOut(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const validation = await validateGPSForCheckOut();

      if (!validation.isValid || !validation.location) {
        handleGPSValidationError(validation, 'check_out');
        return;
      }

      const newAttendance = await recordCheckOut(
        user.uid,
        validation.location
      );

      setAttendance(newAttendance);

      const statusText = newAttendance.checkOut?.status === 'early' ? ' (조퇴)' : '';
      setSuccessMessage(
        `퇴근이 기록되었습니다${statusText} - ${formatTime(newAttendance.checkOut!.time)} (총 ${formatWorkHours(newAttendance.workHours!)})`
      );
    } catch (err) {
      const gpsError = err as GPSError;
      setError(gpsError.message || '퇴근 기록에 실패했습니다');
    } finally {
      setProcessingCheckOut(false);
    }
  };

  const handleApprovalRequest = async (reason: string) => {
    if (!user || !pendingLocation) return;

    const approval = await createApprovalRequest(
      user.uid,
      user.name,
      approvalType,
      reason,
      pendingLocation
    );

    if (approvalType === 'check_in') {
      setCheckInApproval(approval);
    } else {
      setCheckOutApproval(approval);
    }

    setError(null);
    setSuccessMessage('예외 승인 요청이 제출되었습니다. 관리자 승인을 기다려주세요.');
    setPendingLocation(null);
    setPendingDistance(null);
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated || !user) {
    return null;
  }

  const hasPendingCheckInApproval = checkInApproval?.status === 'pending';
  const hasPendingCheckOutApproval = checkOutApproval?.status === 'pending';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              워크인
            </h1>
            <div className="flex items-center gap-3">
              {user.role === 'admin' && (
                <Button
                  variant="primary"
                  onClick={() => router.push('/admin/dashboard')}
                >
                  관리자
                </Button>
              )}
              <Button
                variant="outline"
                onClick={handleLogout}
              >
                로그아웃
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome Card */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-2 text-gray-900">
            안녕하세요, {user.name}님!
          </h2>
          <p className="text-gray-600">
            {new Date().toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'long',
            })}
          </p>
        </div>

        {/* Weak Password Warning */}
        <WeakPasswordWarning />

        {/* Attendance Card */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">오늘의 출퇴근</h3>

          {loadingAttendance ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-600 text-sm">출퇴근 기록 확인 중...</p>
            </div>
          ) : (
            <>
              {/* Success/Error Messages */}
              {successMessage && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800">{successMessage}</p>
                </div>
              )}

              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800">{error}</p>
                  <div className="mt-2 flex gap-2">
                    {pendingLocation && (
                      <Button
                        variant="primary"
                        className="text-sm"
                        onClick={() => setShowApprovalModal(true)}
                      >
                        예외 승인 요청
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      className="text-sm"
                      onClick={() => {
                        setError(null);
                        setPendingLocation(null);
                        setPendingDistance(null);
                      }}
                    >
                      닫기
                    </Button>
                  </div>
                </div>
              )}

              {/* Pending Approval Status */}
              {hasPendingCheckInApproval && !attendance?.checkIn && (
                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800">
                    출근 예외 승인 대기 중입니다. 관리자가 검토 후 승인/거부합니다.
                  </p>
                </div>
              )}

              {hasPendingCheckOutApproval && attendance?.checkIn && !attendance?.checkOut && (
                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800">
                    퇴근 예외 승인 대기 중입니다. 관리자가 검토 후 승인/거부합니다.
                  </p>
                </div>
              )}

              {/* Attendance Status */}
              <div className="space-y-4">
                {/* Check-in Status */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">출근</p>
                    {attendance?.checkIn ? (
                      <p className="text-sm text-gray-600">
                        {formatTime(attendance.checkIn.time)}
                        {attendance.checkIn.status === 'late' && (
                          <span className="ml-2 text-red-600">(지각)</span>
                        )}
                        {attendance.checkIn.status === 'approved' && (
                          <span className="ml-2 text-blue-600">(예외 승인)</span>
                        )}
                      </p>
                    ) : hasPendingCheckInApproval ? (
                      <p className="text-sm text-yellow-600">승인 대기 중</p>
                    ) : (
                      <p className="text-sm text-gray-500">미출근</p>
                    )}
                  </div>
                  {!attendance?.checkIn && !hasPendingCheckInApproval && (
                    <Button
                      onClick={handleCheckIn}
                      loading={processingCheckIn}
                      disabled={processingCheckIn || processingCheckOut}
                    >
                      출근하기
                    </Button>
                  )}
                </div>

                {/* Check-out Status */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">퇴근</p>
                    {attendance?.checkOut ? (
                      <p className="text-sm text-gray-600">
                        {formatTime(attendance.checkOut.time)}
                        {attendance.checkOut.status === 'early' && (
                          <span className="ml-2 text-orange-600">(조퇴)</span>
                        )}
                        {attendance.checkOut.status === 'approved' && (
                          <span className="ml-2 text-blue-600">(예외 승인)</span>
                        )}
                      </p>
                    ) : attendance?.checkIn ? (
                      hasPendingCheckOutApproval ? (
                        <p className="text-sm text-yellow-600">승인 대기 중</p>
                      ) : (
                        <p className="text-sm text-gray-500">미퇴근</p>
                      )
                    ) : (
                      <p className="text-sm text-gray-500">-</p>
                    )}
                  </div>
                  {attendance?.checkIn && !attendance?.checkOut && !hasPendingCheckOutApproval && (
                    <Button
                      onClick={handleCheckOut}
                      loading={processingCheckOut}
                      disabled={processingCheckIn || processingCheckOut}
                    >
                      퇴근하기
                    </Button>
                  )}
                </div>

                {/* Work Hours */}
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="font-medium text-blue-900">근무 시간</p>
                  {attendance?.workHours ? (
                    <p className="text-2xl font-bold text-blue-700">
                      {formatWorkHours(attendance.workHours)}
                    </p>
                  ) : attendance?.checkOut ? (
                    <p className="text-2xl font-bold text-blue-700">
                      0.0시간
                    </p>
                  ) : attendance?.checkIn ? (
                    <p className="text-2xl font-bold text-blue-700">
                      {currentWorkTime || '계산 중...'}
                      <span className="text-sm font-normal ml-2">(진행 중)</span>
                    </p>
                  ) : (
                    <p className="text-gray-500">-</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">빠른 메뉴</h3>
          <div className="space-y-3">
            <Button
              variant="outline"
              onClick={() => router.push('/history')}
              className="w-full justify-start"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              내 기록 보기
            </Button>
          </div>
        </div>

        {/* User Info Card */}
        <div className="bg-white shadow rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">내 정보</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p><strong>이메일:</strong> {user.email}</p>
            <p><strong>역할:</strong> {user.role === 'admin' ? '관리자' : '직원'}</p>
          </div>
        </div>
      </main>

      {/* Approval Request Modal */}
      <ApprovalRequestModal
        isOpen={showApprovalModal}
        onClose={() => setShowApprovalModal(false)}
        onSubmit={handleApprovalRequest}
        type={approvalType}
        location={pendingLocation}
        distance={pendingDistance}
      />
    </div>
  );
}
