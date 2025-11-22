'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import type { ApprovalType, Location } from '@/types';

interface ApprovalRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => Promise<void>;
  type: ApprovalType;
  location: Location | null;
  distance: number | null;
}

export function ApprovalRequestModal({
  isOpen,
  onClose,
  onSubmit,
  type,
  location,
  distance,
}: ApprovalRequestModalProps) {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation: minimum 10 characters
    if (reason.trim().length < 10) {
      setError('사유는 최소 10자 이상 입력해주세요');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(reason.trim());
      setReason('');
      onClose();
    } catch (err) {
      setError((err as Error).message || '요청 제출에 실패했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setReason('');
      setError(null);
      onClose();
    }
  };

  const typeText = type === 'check_in' ? '출근' : '퇴근';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">
            예외 승인 요청
          </h2>

          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              현재 위치가 {typeText} 허용 범위를 벗어났습니다.
              {distance && (
                <span className="block mt-1">
                  현재 거리: {Math.round(distance)}m
                </span>
              )}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="reason"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                예외 사유 <span className="text-red-500">*</span>
              </label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="예: 외근으로 인해 사무실 외부에서 출근합니다"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900"
                rows={4}
                disabled={isSubmitting}
              />
              <p className="mt-1 text-xs text-gray-500">
                {reason.length}/10자 이상
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1"
              >
                취소
              </Button>
              <Button
                type="submit"
                loading={isSubmitting}
                disabled={isSubmitting || reason.trim().length < 10}
                className="flex-1"
              >
                요청하기
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
