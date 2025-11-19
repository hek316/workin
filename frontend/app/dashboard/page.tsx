'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/Button';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuthStore();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              워크인 대시보드
            </h1>
            <Button
              variant="outline"
              onClick={handleLogout}
            >
              로그아웃
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">
            환영합니다, {user.name}님!
          </h2>

          <div className="space-y-2 text-gray-600">
            <p><strong>이메일:</strong> {user.email}</p>
            <p><strong>역할:</strong> {user.role === 'admin' ? '관리자' : '직원'}</p>
            <p><strong>UID:</strong> {user.uid}</p>
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">
              🎉 인증 시스템 완성!
            </h3>
            <p className="text-blue-800 text-sm">
              이메일/비밀번호 로그인 및 회원가입이 정상적으로 작동합니다.
              Firebase Auth와 Firestore가 성공적으로 연동되었습니다.
            </p>
          </div>

          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">
              다음 단계 (SCRUM-7)
            </h3>
            <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
              <li>GPS 기반 출퇴근 기록 기능</li>
              <li>출근하기/퇴근하기 버튼</li>
              <li>실시간 근무시간 표시</li>
              <li>지각/조퇴 자동 판정</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
