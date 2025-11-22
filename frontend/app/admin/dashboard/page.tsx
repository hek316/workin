'use client';

import { useState, useEffect } from 'react';
import {
  getAllUsers,
  subscribeToAttendanceByDate,
  calculateAttendanceStats,
  combineEmployeesWithAttendance,
  type EmployeeAttendance,
  type AttendanceStats,
} from '@/lib/firestore/admin';
import type { User, Attendance } from '@/types';

type FilterType = 'all' | 'late' | 'early' | 'absent' | 'present';

export default function AdminDashboardPage() {
  const [employees, setEmployees] = useState<User[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [filter, setFilter] = useState<FilterType>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all users on mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userList = await getAllUsers();
        setEmployees(userList);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('사용자 목록을 불러오는데 실패했습니다.');
      }
    };

    fetchUsers();
  }, []);

  // Subscribe to attendance for selected date
  useEffect(() => {
    setIsLoading(true);

    const unsubscribe = subscribeToAttendanceByDate(selectedDate, (attendanceData) => {
      setAttendance(attendanceData);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [selectedDate]);

  // Calculate stats when employees or attendance changes
  useEffect(() => {
    if (employees.length > 0) {
      const calculatedStats = calculateAttendanceStats(employees, attendance);
      setStats(calculatedStats);
    }
  }, [employees, attendance]);

  // Combine and filter data
  const combinedData = combineEmployeesWithAttendance(employees, attendance);

  const filteredData = combinedData.filter((item) => {
    switch (filter) {
      case 'late':
        return item.attendance?.checkIn?.status === 'late';
      case 'early':
        return item.attendance?.checkOut?.status === 'early';
      case 'absent':
        return !item.attendance?.checkIn;
      case 'present':
        return !!item.attendance?.checkIn;
      default:
        return true;
    }
  });

  // Format time for display
  const formatTime = (date: Date | undefined): string => {
    if (!date) return '-';
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Format work hours
  const formatWorkHours = (hours: number | null): string => {
    if (hours === null) return '-';
    return `${hours.toFixed(1)}시간`;
  };

  // Get status badge
  const getStatusBadge = (item: EmployeeAttendance) => {
    if (!item.attendance?.checkIn) {
      return (
        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded">
          미출근
        </span>
      );
    }

    const badges = [];

    if (item.attendance.checkIn.status === 'late') {
      badges.push(
        <span key="late" className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded">
          지각
        </span>
      );
    }

    if (item.attendance.checkOut?.status === 'early') {
      badges.push(
        <span key="early" className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded">
          조퇴
        </span>
      );
    }

    if (badges.length === 0) {
      badges.push(
        <span key="normal" className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded">
          정상
        </span>
      );
    }

    return <div className="flex gap-1">{badges}</div>;
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">출퇴근 현황</h2>

        {/* Date Picker */}
        <div className="flex items-center gap-2">
          <label htmlFor="date" className="text-sm text-gray-600">
            날짜:
          </label>
          <input
            type="date"
            id="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
          />
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">전체 직원</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">출근</p>
            <p className="text-2xl font-bold text-blue-600">{stats.checkedIn}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">퇴근</p>
            <p className="text-2xl font-bold text-green-600">{stats.checkedOut}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">지각</p>
            <p className="text-2xl font-bold text-red-600">{stats.late}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">조퇴</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.early}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">출근률</p>
            <p className="text-2xl font-bold text-purple-600">{stats.attendanceRate}%</p>
          </div>
        </div>
      )}

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        {[
          { value: 'all', label: '전체' },
          { value: 'present', label: '출근' },
          { value: 'absent', label: '미출근' },
          { value: 'late', label: '지각' },
          { value: 'early', label: '조퇴' },
        ].map((option) => (
          <button
            key={option.value}
            onClick={() => setFilter(option.value as FilterType)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === option.value
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  이름
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  출근 시간
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  퇴근 시간
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  근무 시간
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
                      로딩 중...
                    </div>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    {filter === 'all' ? '등록된 직원이 없습니다.' : '해당하는 기록이 없습니다.'}
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr
                    key={item.user.uid}
                    className={`hover:bg-gray-50 ${
                      item.attendance?.checkIn?.status === 'late' ? 'bg-red-50' : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {item.user.name}
                      </div>
                      <div className="text-xs text-gray-500">{item.user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatTime(item.attendance?.checkIn?.time)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatTime(item.attendance?.checkOut?.time)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatWorkHours(item.attendance?.workHours ?? null)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(item)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
