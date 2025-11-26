'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if prompt was already dismissed
    const promptDismissed = localStorage.getItem('installPromptDismissed');

    // Check if app is already installed
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches;

    // Check if mobile device
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    // Only show on mobile, if not installed, and not dismissed
    if (isMobile && !isInstalled && !promptDismissed) {
      // Delay showing prompt by 2 seconds for better UX
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 2000);

      return () => clearTimeout(timer);
    }

    // Listen for beforeinstallprompt event (Android Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      // Show native install prompt (Android Chrome)
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: { outcome: string }) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        }
        setDeferredPrompt(null);
        setShowPrompt(false);
      });
    } else {
      // Redirect to install guide
      router.push('/install');
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  const handleDismissForever = () => {
    localStorage.setItem('installPromptDismissed', 'true');
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={handleDismiss} />

      {/* Modal */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl p-6 animate-slide-up">
        <div className="max-w-md mx-auto">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center">
              <span className="text-3xl">📱</span>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-center mb-2">
            워크인 앱 설치하기
          </h2>

          {/* Description */}
          <p className="text-center text-gray-600 mb-6">
            홈 화면에 추가하고 앱처럼 빠르고 편리하게 사용하세요
          </p>

          {/* Benefits */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3">
              <span className="text-xl">⚡</span>
              <span className="text-gray-700">더 빠른 실행 속도</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xl">📶</span>
              <span className="text-gray-700">오프라인에서도 사용 가능</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xl">🎯</span>
              <span className="text-gray-700">홈 화면에서 바로 접근</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleInstallClick}
              className="w-full bg-black text-white py-4 rounded-xl font-semibold text-lg hover:bg-gray-800 transition active:scale-95"
            >
              설치 방법 보기
            </button>

            <div className="flex gap-3">
              <button
                onClick={handleDismiss}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition"
              >
                나중에
              </button>
              <button
                onClick={handleDismissForever}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition"
              >
                다시 보지 않기
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
