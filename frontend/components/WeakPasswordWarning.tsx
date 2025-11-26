'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function WeakPasswordWarning() {
  const [dismissed, setDismissed] = useState(() => {
    // Check if user has dismissed the warning
    if (typeof window !== 'undefined') {
      return localStorage.getItem('weakPasswordWarningDismissed') === 'true';
    }
    return false;
  });

  const handleDismiss = () => {
    localStorage.setItem('weakPasswordWarningDismissed', 'true');
    setDismissed(true);
  };

  if (dismissed) return null;

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <span className="text-2xl">⚠️</span>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-yellow-800">
            비밀번호 보안 점검이 필요합니다
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>
              최근 보안 정책이 강화되었습니다.
              <strong className="font-semibold"> 111111, 123456, password </strong>
              같은 약한 비밀번호를 사용 중이라면 즉시 변경해주세요.
            </p>
            <div className="mt-3 flex gap-3">
              <Link
                href="/settings/password"
                className="text-sm font-medium text-yellow-800 hover:text-yellow-900 underline"
              >
                비밀번호 변경하기 →
              </Link>
              <button
                onClick={handleDismiss}
                className="text-sm font-medium text-yellow-600 hover:text-yellow-700"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 border-t border-yellow-200 pt-3">
        <p className="text-xs text-yellow-600">
          <strong>새로운 비밀번호 규칙:</strong>
          8자 이상, 영문자와 숫자 포함 필수
        </p>
      </div>
    </div>
  );
}
