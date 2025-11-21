'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/Button';
import {
  getMonthlyAttendance,
  getAvailableMonths,
} from '@/lib/firestore/attendance';
import { formatWorkHours, formatTime } from '@/lib/gps';
import type { Attendance } from '@/types';

interface SelectedMonth {
  year: number;
  month: number;
  label: string;
}

export default function HistoryPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();

  const availableMonths = getAvailableMonths();
  const [selectedMonth, setSelectedMonth] = useState<SelectedMonth>(availableMonths[0]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loadingAttendance, setLoadingAttendance] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedAttendance, setSelectedAttendance] = useState<Attendance | null>(null);

  // Fetch attendance for selected month
  const fetchAttendance = useCallback(async () => {
    if (!user) return;

    setLoadingAttendance(true);
    try {
      const records = await getMonthlyAttendance(
        user.uid,
        selectedMonth.year,
        selectedMonth.month
      );
      setAttendance(records);
    } catch (err) {
      console.error('Error fetching attendance:', err);
    } finally {
      setLoadingAttendance(false);
    }
  }, [user, selectedMonth]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (user) {
      fetchAttendance();
    }
  }, [user, fetchAttendance]);

  // Get attendance record for a specific date
  const getAttendanceForDate = (dateStr: string): Attendance | undefined => {
    return attendance.find((a) => a.date === dateStr);
  };

  // Handle date click
  const handleDateClick = (dateStr: string) => {
    setSelectedDate(dateStr);
    const record = getAttendanceForDate(dateStr);
    setSelectedAttendance(record || null);
  };

  // Close detail modal
  const closeDetail = () => {
    setSelectedDate(null);
    setSelectedAttendance(null);
  };

  // Generate calendar days for the month
  const generateCalendarDays = () => {
    const year = selectedMonth.year;
    const month = selectedMonth.month - 1; // JavaScript months are 0-indexed

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay(); // 0 = Sunday

    const days: { date: string; day: number; isCurrentMonth: boolean }[] = [];

    // Add empty slots for days before the first day of the month
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push({ date: '', day: 0, isCurrentMonth: false });
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      days.push({ date: dateStr, day, isCurrentMonth: true });
    }

    return days;
  };

  // Get status indicator for a date
  const getStatusIndicator = (dateStr: string) => {
    const record = getAttendanceForDate(dateStr);
    if (!record) return null;

    const hasLate = record.checkIn?.status === 'late';
    const hasEarly = record.checkOut?.status === 'early';
    const hasApproved = record.checkIn?.status === 'approved' || record.checkOut?.status === 'approved';

    if (hasApproved) {
      return 'approved';
    }
    if (hasLate || hasEarly) {
      return 'warning';
    }
    return 'normal';
  };

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

  if (!isAuthenticated || !user) {
    return null;
  }

  const calendarDays = generateCalendarDays();
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">출퇴근 기록</h1>
            <Button variant="outline" onClick={() => router.push('/dashboard')}>
              대시보드로
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Month Selector */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <label htmlFor="month-select" className="block text-sm font-medium text-gray-700 mb-2">
            월 선택
          </label>
          <select
            id="month-select"
            value={`${selectedMonth.year}-${selectedMonth.month}`}
            onChange={(e) => {
              const [year, month] = e.target.value.split('-').map(Number);
              const selected = availableMonths.find(
                (m) => m.year === year && m.month === month
              );
              if (selected) setSelectedMonth(selected);
            }}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            {availableMonths.map((m) => (
              <option key={`${m.year}-${m.month}`} value={`${m.year}-${m.month}`}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        {/* Calendar */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">{selectedMonth.label}</h2>

          {loadingAttendance ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-600 text-sm">기록 로딩 중...</p>
            </div>
          ) : (
            <>
              {/* Week day headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map((day, index) => (
                  <div
                    key={day}
                    className={`text-center text-sm font-medium py-2 ${
                      index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-gray-600'
                    }`}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((dayInfo, index) => {
                  if (!dayInfo.isCurrentMonth) {
                    return <div key={index} className="h-16"></div>;
                  }

                  const status = getStatusIndicator(dayInfo.date);
                  const hasRecord = !!getAttendanceForDate(dayInfo.date);
                  const isToday = dayInfo.date === new Date().toISOString().split('T')[0];
                  const dayOfWeek = new Date(dayInfo.date).getDay();

                  return (
                    <button
                      key={dayInfo.date}
                      onClick={() => handleDateClick(dayInfo.date)}
                      className={`h-16 p-1 rounded-lg border transition-colors relative ${
                        isToday
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <span
                        className={`text-sm ${
                          dayOfWeek === 0 ? 'text-red-500' : dayOfWeek === 6 ? 'text-blue-500' : 'text-gray-900'
                        }`}
                      >
                        {dayInfo.day}
                      </span>

                      {/* Status indicator */}
                      {hasRecord && (
                        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                          {status === 'warning' && (
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          )}
                          {status === 'approved' && (
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          )}
                          {status === 'normal' && (
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>정상</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>지각/조퇴</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>예외 승인</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Detail Modal */}
        {selectedDate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {new Date(selectedDate + 'T00:00:00').toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    weekday: 'long',
                  })}
                </h3>
                <button
                  onClick={closeDetail}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {selectedAttendance ? (
                <div className="space-y-4">
                  {/* Check-in */}
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium text-gray-900 mb-1">출근</p>
                    {selectedAttendance.checkIn ? (
                      <>
                        <p className="text-gray-600">
                          {formatTime(selectedAttendance.checkIn.time)}
                          {selectedAttendance.checkIn.status === 'late' && (
                            <span className="ml-2 text-red-600 font-medium">(지각)</span>
                          )}
                          {selectedAttendance.checkIn.status === 'approved' && (
                            <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                              예외 승인
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          GPS: {selectedAttendance.checkIn.location.lat.toFixed(4)}, {selectedAttendance.checkIn.location.lng.toFixed(4)}
                          {' '}(정확도: {Math.round(selectedAttendance.checkIn.location.accuracy)}m)
                        </p>
                      </>
                    ) : (
                      <p className="text-gray-500">기록 없음</p>
                    )}
                  </div>

                  {/* Check-out */}
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium text-gray-900 mb-1">퇴근</p>
                    {selectedAttendance.checkOut ? (
                      <>
                        <p className="text-gray-600">
                          {formatTime(selectedAttendance.checkOut.time)}
                          {selectedAttendance.checkOut.status === 'early' && (
                            <span className="ml-2 text-orange-600 font-medium">(조퇴)</span>
                          )}
                          {selectedAttendance.checkOut.status === 'approved' && (
                            <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                              예외 승인
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          GPS: {selectedAttendance.checkOut.location.lat.toFixed(4)}, {selectedAttendance.checkOut.location.lng.toFixed(4)}
                          {' '}(정확도: {Math.round(selectedAttendance.checkOut.location.accuracy)}m)
                        </p>
                      </>
                    ) : (
                      <p className="text-gray-500">기록 없음</p>
                    )}
                  </div>

                  {/* Work hours */}
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="font-medium text-blue-900 mb-1">총 근무시간</p>
                    <p className="text-xl font-bold text-blue-700">
                      {selectedAttendance.workHours
                        ? formatWorkHours(selectedAttendance.workHours)
                        : '-'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">기록 없음</p>
                  <p className="text-sm text-gray-400 mt-1">
                    이 날짜에는 출퇴근 기록이 없습니다
                  </p>
                </div>
              )}

              <div className="mt-6">
                <Button onClick={closeDetail} className="w-full">
                  닫기
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
