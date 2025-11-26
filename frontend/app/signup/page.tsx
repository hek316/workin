'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import {
  getNameError,
  getEmailError,
  getPasswordError,
  getPasswordConfirmError,
} from '@/lib/validation';
import { signUp } from '@/lib/firebase/auth';
import { useAuthStore } from '@/store/useAuthStore';

export default function SignupPage() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const setSigningUp = useAuthStore((state) => state.setSigningUp);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<{
    name: string | null;
    email: string | null;
    password: string | null;
    confirmPassword: string | null;
  }>({
    name: null,
    email: null,
    password: null,
    confirmPassword: null,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [field]: e.target.value });
    setErrors({ ...errors, [field]: null });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('회원가입 시작');

    // Validate all inputs
    const nameError = getNameError(formData.name);
    const emailError = getEmailError(formData.email);
    const passwordError = getPasswordError(formData.password);
    const confirmPasswordError = getPasswordConfirmError(formData.password, formData.confirmPassword);

    setErrors({
      name: nameError,
      email: emailError,
      password: passwordError,
      confirmPassword: confirmPasswordError,
    });

    // If there are errors, stop
    if (nameError || emailError || passwordError || confirmPasswordError) {
      console.log('유효성 검사 실패');
      return;
    }

    // Sign up with Firebase Auth
    setLoading(true);
    setSigningUp(true); // Prevent onAuthStateChanged from fetching user during signup
    try {
      console.log('Firebase Auth 회원가입 시작...');
      const user = await signUp(
        formData.email,
        formData.password,
        formData.name
      );
      console.log('회원가입 성공:', user);

      setUser(user);
      console.log('Zustand 스토어 업데이트 완료');

      // Redirect to dashboard
      console.log('대시보드로 리다이렉트 시도...');
      router.push('/dashboard');
      console.log('router.push 호출 완료');
    } catch (error) {
      console.error('회원가입 에러:', error);
      setSigningUp(false); // Reset signing up flag on error
      const errorMessage = error instanceof Error ? error.message : '회원가입에 실패했습니다';
      setErrors({
        name: null,
        email: null,
        password: null,
        confirmPassword: errorMessage,
      });
    } finally {
      console.log('finally 블록 실행');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
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
          <h2 className="text-2xl font-semibold text-center mb-6 text-gray-900">
            회원가입
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="이름"
              type="text"
              placeholder="홍길동"
              value={formData.name}
              onChange={handleChange('name')}
              error={errors.name}
              disabled={loading}
            />

            <Input
              label="이메일"
              type="email"
              placeholder="example@company.com"
              value={formData.email}
              onChange={handleChange('email')}
              error={errors.email}
              disabled={loading}
            />

            <Input
              label="비밀번호"
              type="password"
              placeholder="8자 이상, 영문+숫자 포함"
              value={formData.password}
              onChange={handleChange('password')}
              error={errors.password}
              disabled={loading}
            />

            <Input
              label="비밀번호 확인"
              type="password"
              placeholder="비밀번호를 다시 입력하세요"
              value={formData.confirmPassword}
              onChange={handleChange('confirmPassword')}
              error={errors.confirmPassword}
              disabled={loading}
            />

            <Button
              type="submit"
              fullWidth
              loading={loading}
            >
              회원가입
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              이미 계정이 있으신가요?{' '}
              <Link
                href="/login"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                로그인
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
