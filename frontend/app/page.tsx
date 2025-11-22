'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';

export default function Home() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    // Wait for auth to initialize
    if (isLoading) return;

    if (!isAuthenticated) {
      // Not logged in -> go to login
      router.replace('/login');
    } else if (user?.role === 'admin') {
      // Admin -> go to admin dashboard
      router.replace('/admin/dashboard');
    } else {
      // Employee -> go to employee dashboard
      router.replace('/dashboard');
    }
  }, [isLoading, isAuthenticated, user, router]);

  // Show loading state while determining redirect
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">워크인</h1>
        <p className="text-gray-600">로딩 중...</p>
      </div>
    </main>
  );
}
