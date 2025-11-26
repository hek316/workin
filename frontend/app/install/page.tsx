'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function InstallPage() {
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Detect device type
    const ua = navigator.userAgent;
    setIsIOS(/iPhone|iPad|iPod/.test(ua));
    setIsAndroid(/Android/.test(ua));

    // Check if app is already installed (running as PWA)
    setIsInstalled(window.matchMedia('(display-mode: standalone)').matches);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-3">📱 워크인 설치 가이드</h1>
          <p className="text-gray-600 text-lg">
            워크인 앱을 홈 화면에 추가하고 편리하게 사용하세요
          </p>
        </div>

        {/* Installation Status */}
        {isInstalled && (
          <div className="mb-8 p-6 bg-green-50 border-2 border-green-200 rounded-xl">
            <div className="flex items-center gap-3">
              <span className="text-3xl">✅</span>
              <div>
                <h3 className="font-bold text-green-900">설치 완료!</h3>
                <p className="text-green-700">
                  워크인 앱이 이미 설치되어 있습니다. 지금 바로 사용하세요!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* QR Code Section */}
        <div className="mb-12 p-8 bg-white rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-center mb-6">
            🔗 다른 기기에 설치하기
          </h2>
          <div className="flex flex-col items-center">
            <div className="w-64 h-64 bg-gray-100 rounded-lg p-4 mb-4">
              <Image
                src="/qr-code.png"
                alt="워크인 QR 코드"
                width={240}
                height={240}
                className="w-full h-full"
              />
            </div>
            <p className="text-center text-gray-600">
              QR 코드를 스캔하거나 아래 링크를 공유하세요
            </p>
            <code className="mt-2 px-4 py-2 bg-gray-100 rounded text-sm font-mono">
              workin-vac1.vercel.app
            </code>
          </div>
        </div>

        {/* Installation Instructions */}
        <div className="space-y-8">
          {/* Android Instructions */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-green-600 p-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <span>🤖</span> Android (Chrome) 설치 방법
              </h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2">Chrome 브라우저로 접속</h3>
                  <p className="text-gray-600 mb-3">
                    Chrome 앱에서 <code className="bg-gray-100 px-2 py-1 rounded">workin-vac1.vercel.app</code>을 열어주세요
                  </p>
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <p className="text-sm text-yellow-800">
                      💡 <strong>중요:</strong> 반드시 Chrome 브라우저를 사용해야 합니다
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2">메뉴 열기</h3>
                  <p className="text-gray-600 mb-3">
                    화면 오른쪽 상단의 <strong>점 3개(⋮)</strong> 버튼을 누르세요
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2">"홈 화면에 추가" 선택</h3>
                  <p className="text-gray-600 mb-3">
                    메뉴에서 <strong>"홈 화면에 추가"</strong> 또는 <strong>"앱 설치"</strong>를 찾아 누르세요
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  4
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2">설치 확인</h3>
                  <p className="text-gray-600">
                    팝업창에서 <strong>"추가"</strong> 또는 <strong>"설치"</strong> 버튼을 눌러 완료하세요
                  </p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <p className="text-green-900 font-semibold">
                  ✅ 완료! 홈 화면에 워크인 아이콘이 나타납니다
                </p>
              </div>
            </div>
          </div>

          {/* iOS Instructions */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-blue-600 p-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <span>🍎</span> iPhone (Safari) 설치 방법
              </h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2">Safari 브라우저로 접속</h3>
                  <p className="text-gray-600 mb-3">
                    Safari 앱에서 <code className="bg-gray-100 px-2 py-1 rounded">workin-vac1.vercel.app</code>을 열어주세요
                  </p>
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <p className="text-sm text-yellow-800">
                      💡 <strong>중요:</strong> 반드시 Safari 브라우저를 사용해야 합니다 (Chrome 불가)
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2">공유 버튼 누르기</h3>
                  <p className="text-gray-600 mb-3">
                    화면 하단 중앙의 <strong>공유 버튼(⬆︎)</strong>을 누르세요
                  </p>
                  <p className="text-sm text-gray-500">
                    공유 버튼은 상자에서 화살표가 위로 나가는 모양입니다
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2">"홈 화면에 추가" 선택</h3>
                  <p className="text-gray-600 mb-3">
                    메뉴를 아래로 스크롤하여 <strong>"홈 화면에 추가"</strong>를 찾아 누르세요
                  </p>
                  <p className="text-sm text-gray-500">
                    메뉴가 길 수 있으니 아래쪽을 잘 찾아보세요
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  4
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2">이름 확인 및 추가</h3>
                  <p className="text-gray-600">
                    앱 이름("워크인")을 확인하고 오른쪽 상단의 <strong>"추가"</strong> 버튼을 누르세요
                  </p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-blue-900 font-semibold">
                  ✅ 완료! 홈 화면에 워크인 아이콘이 나타납니다
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6">❓ 자주 묻는 질문</h2>

          <div className="space-y-4">
            <div className="border-l-4 border-gray-300 pl-4">
              <h3 className="font-bold mb-2">Q. 홈 화면에 추가 메뉴가 안 보여요</h3>
              <p className="text-gray-600">
                <strong>Android:</strong> Chrome 브라우저를 사용하고 있는지 확인하세요<br/>
                <strong>iPhone:</strong> Safari 브라우저를 사용하고 있는지 확인하세요
              </p>
            </div>

            <div className="border-l-4 border-gray-300 pl-4">
              <h3 className="font-bold mb-2">Q. 설치 후 어떻게 실행하나요?</h3>
              <p className="text-gray-600">
                홈 화면에 생긴 워크인 아이콘을 누르면 일반 앱처럼 실행됩니다
              </p>
            </div>

            <div className="border-l-4 border-gray-300 pl-4">
              <h3 className="font-bold mb-2">Q. 설치를 꼭 해야 하나요?</h3>
              <p className="text-gray-600">
                설치하지 않아도 브라우저에서 사용할 수 있지만, 설치하면 더 빠르고 편리하게 사용할 수 있습니다
              </p>
            </div>

            <div className="border-l-4 border-gray-300 pl-4">
              <h3 className="font-bold mb-2">Q. 앱을 삭제하고 싶어요</h3>
              <p className="text-gray-600">
                일반 앱처럼 홈 화면에서 아이콘을 길게 눌러 삭제할 수 있습니다
              </p>
            </div>

            <div className="border-l-4 border-gray-300 pl-4">
              <h3 className="font-bold mb-2">Q. 업데이트는 어떻게 하나요?</h3>
              <p className="text-gray-600">
                자동으로 업데이트됩니다. 별도로 업데이트할 필요가 없습니다
              </p>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-12 text-center">
          <a
            href="/"
            className="inline-block px-8 py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition"
          >
            ← 홈으로 돌아가기
          </a>
        </div>
      </div>
    </div>
  );
}
