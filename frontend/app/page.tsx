export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          워크인 (WorkIn)
        </h1>
        <p className="text-center text-lg">
          GPS 기반 자동화된 출퇴근 기록 시스템
        </p>
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Next.js 14 + TypeScript + Tailwind CSS
          </p>
        </div>
      </div>
    </main>
  );
}
