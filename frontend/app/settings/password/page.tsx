'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { getPasswordError } from '@/lib/validation';
import { updatePassword, reauthenticate } from '@/lib/firebase/auth';

export default function ChangePasswordPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<{
    currentPassword: string | null;
    newPassword: string | null;
    confirmPassword: string | null;
  }>({
    currentPassword: null,
    newPassword: null,
    confirmPassword: null,
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({ ...formData, [field]: e.target.value });
    setErrors({ ...errors, [field]: null });
    setSuccessMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    const currentPasswordError = !formData.currentPassword
      ? '현재 비밀번호를 입력해주세요'
      : null;
    const newPasswordError = getPasswordError(formData.newPassword);
    const confirmPasswordError =
      formData.newPassword !== formData.confirmPassword
        ? '비밀번호가 일치하지 않습니다'
        : null;

    setErrors({
      currentPassword: currentPasswordError,
      newPassword: newPasswordError,
      confirmPassword: confirmPasswordError,
    });

    if (currentPasswordError || newPasswordError || confirmPasswordError) {
      return;
    }

    if (!user?.email) {
      setErrors({
        ...errors,
        currentPassword: '사용자 정보를 찾을 수 없습니다',
      });
      return;
    }

    setLoading(true);

    try {
      // Re-authenticate user with current password
      await reauthenticate(user.email, formData.currentPassword);

      // Update to new password
      await updatePassword(formData.newPassword);

      setSuccessMessage('비밀번호가 성공적으로 변경되었습니다!');
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('비밀번호 변경 에러:', error);
      const errorMessage =
        error instanceof Error ? error.message : '비밀번호 변경에 실패했습니다';

      // Check if it's authentication error
      if (errorMessage.includes('auth/wrong-password') || errorMessage.includes('auth/invalid-credential')) {
        setErrors({
          ...errors,
          currentPassword: '현재 비밀번호가 일치하지 않습니다',
        });
      } else {
        setErrors({
          ...errors,
          confirmPassword: errorMessage,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-3xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">비밀번호 변경</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          {/* Info Banner */}
          <div className="mb-6 bg-blue-50 border-l-4 border-blue-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-xl">🔐</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  안전한 비밀번호 만들기
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>최소 8자 이상</li>
                    <li>영문자 포함 필수</li>
                    <li>숫자 포함 필수</li>
                    <li>111111, 123456, password 같은 흔한 비밀번호 사용 금지</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-xl">✅</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">{successMessage}</p>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="현재 비밀번호"
              type="password"
              placeholder="현재 사용중인 비밀번호"
              value={formData.currentPassword}
              onChange={handleChange('currentPassword')}
              error={errors.currentPassword}
              disabled={loading}
            />

            <div className="border-t border-gray-200 pt-6">
              <Input
                label="새 비밀번호"
                type="password"
                placeholder="8자 이상, 영문+숫자 포함"
                value={formData.newPassword}
                onChange={handleChange('newPassword')}
                error={errors.newPassword}
                disabled={loading}
              />
            </div>

            <Input
              label="새 비밀번호 확인"
              type="password"
              placeholder="새 비밀번호를 다시 입력하세요"
              value={formData.confirmPassword}
              onChange={handleChange('confirmPassword')}
              error={errors.confirmPassword}
              disabled={loading}
            />

            <div className="flex gap-3 pt-4">
              <Button type="submit" fullWidth loading={loading}>
                비밀번호 변경
              </Button>
              <Button
                type="button"
                variant="outline"
                fullWidth
                onClick={handleCancel}
                disabled={loading}
              >
                취소
              </Button>
            </div>
          </form>

          {/* Security Tips */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              보안 팁
            </h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• 다른 사이트에서 사용하는 비밀번호와 다르게 설정하세요</li>
              <li>• 정기적으로 비밀번호를 변경하는 것이 좋습니다</li>
              <li>• 비밀번호를 다른 사람과 공유하지 마세요</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
