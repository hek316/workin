'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { getEmailError, getPasswordError } from '@/lib/validation';
import { signIn } from '@/lib/firebase/auth';
import { useAuthStore } from '@/store/useAuthStore';

export default function LoginPage() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{
    email: string | null;
    password: string | null;
  }>({
    email: null,
    password: null,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    const emailError = getEmailError(email);
    const passwordError = getPasswordError(password);

    setErrors({
      email: emailError,
      password: passwordError,
    });

    // If there are errors, stop
    if (emailError || passwordError) {
      return;
    }

    // Sign in with Firebase Auth
    setLoading(true);
    try {
      const user = await signIn(email, password);
      setUser(user);

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '로그인에 실패했습니다';
      setErrors({
        email: null,
        password: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-center text-gray-900">
            워크인
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            GPS 기반 출퇴근 관리 시스템
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow rounded-lg">
          <h2 className="text-2xl font-semibold text-center mb-6">
            로그인
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="이메일"
              type="email"
              placeholder="example@company.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors({ ...errors, email: null });
              }}
              error={errors.email}
              disabled={loading}
            />

            <Input
              label="비밀번호"
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors({ ...errors, password: null });
              }}
              error={errors.password}
              disabled={loading}
            />

            <Button
              type="submit"
              fullWidth
              loading={loading}
            >
              로그인
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              계정이 없으신가요?{' '}
              <Link
                href="/signup"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                회원가입
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
