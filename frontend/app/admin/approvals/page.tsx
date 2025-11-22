'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/Button';
import {
  subscribeToPendingApprovals,
  approveRequest,
  rejectRequest,
} from '@/lib/firestore/approvals';
import {
  recordCheckIn,
  recordCheckOut,
} from '@/lib/firestore/attendance';
import type { ApprovalRequest } from '@/types';

export default function AdminApprovalsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();

  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [loadingApprovals, setLoadingApprovals] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedApproval, setSelectedApproval] = useState<ApprovalRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    } else if (!isLoading && user && user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, user, router]);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;

    setLoadingApprovals(true);
    const unsubscribe = subscribeToPendingApprovals((pendingApprovals) => {
      setApprovals(pendingApprovals);
      setLoadingApprovals(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleApprove = async (approval: ApprovalRequest) => {
    if (!user) return;

    setProcessingId(approval.id);
    setError(null);
    setSuccessMessage(null);

    try {
      // Create attendance record
      if (approval.type === 'check_in') {
        await recordCheckIn(
          approval.uid,
          approval.name,
          approval.location
        );
      } else {
        await recordCheckOut(
          approval.uid,
          approval.location
        );
      }

      // Approve the request
      await approveRequest(approval.id, user.uid);

      setSuccessMessage(`${approval.name}님의 ${approval.type === 'check_in' ? '출근' : '퇴근'} 예외 요청을 승인했습니다.`);
    } catch (err) {
      setError((err as Error).message || '승인 처리에 실패했습니다');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectClick = (approval: ApprovalRequest) => {
    setSelectedApproval(approval);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const handleRejectSubmit = async () => {
    if (!user || !selectedApproval) return;

    if (rejectionReason.trim().length < 5) {
      setError('거부 사유는 최소 5자 이상 입력해주세요');
      return;
    }

    setProcessingId(selectedApproval.id);
    setError(null);
    setSuccessMessage(null);

    try {
      await rejectRequest(selectedApproval.id, user.uid, rejectionReason.trim());
      setSuccessMessage(`${selectedApproval.name}님의 요청을 거부했습니다.`);
      setShowRejectModal(false);
      setSelectedApproval(null);
      setRejectionReason('');
    } catch (err) {
      setError((err as Error).message || '거부 처리에 실패했습니다');
    } finally {
      setProcessingId(null);
    }
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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

  if (!isAuthenticated || !user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">예외 승인 요청</h2>
        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
          {approvals.length}건 대기 중
        </span>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800">{successMessage}</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Approvals List */}
      <div className="bg-white rounded-lg shadow">
        {loadingApprovals ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600 text-sm">로딩 중...</p>
          </div>
        ) : approvals.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="mt-2 text-gray-500">대기 중인 승인 요청이 없습니다</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {approvals.map((approval) => (
              <li key={approval.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{approval.name}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        approval.type === 'check_in'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}>
                        {approval.type === 'check_in' ? '출근' : '퇴근'}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-2">
                      <strong>사유:</strong> {approval.reason}
                    </p>

                    <div className="text-xs text-gray-500 space-y-1">
                      <p>날짜: {approval.date}</p>
                      <p>요청 시간: {formatTime(approval.createdAt)}</p>
                      <p>위치: {approval.location.lat.toFixed(4)}, {approval.location.lng.toFixed(4)}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      onClick={() => handleApprove(approval)}
                      loading={processingId === approval.id}
                      disabled={processingId !== null}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      승인
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleRejectClick(approval)}
                      disabled={processingId !== null}
                      className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
                    >
                      거부
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && selectedApproval && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              요청 거부
            </h3>

            <p className="text-sm text-gray-600 mb-4">
              {selectedApproval.name}님의 {selectedApproval.type === 'check_in' ? '출근' : '퇴근'} 예외 요청을 거부합니다.
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                거부 사유 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="거부 사유를 입력하세요"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-gray-900"
                rows={3}
              />
              <p className="mt-1 text-xs text-gray-500">
                {rejectionReason.length}/5자 이상
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedApproval(null);
                  setRejectionReason('');
                }}
                disabled={processingId !== null}
                className="flex-1"
              >
                취소
              </Button>
              <Button
                onClick={handleRejectSubmit}
                loading={processingId === selectedApproval.id}
                disabled={processingId !== null || rejectionReason.trim().length < 5}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                거부하기
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
