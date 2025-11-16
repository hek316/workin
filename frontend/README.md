# 워크인 프론트엔드

GPS 기반 자동화된 출퇴근 기록 시스템의 프론트엔드 애플리케이션입니다.

## 기술 스택

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS 3.x
- **State Management**: Zustand 4.x
- **PWA**: @ducanh2912/next-pwa

## 시작하기

### 개발 서버 실행

```bash
npm run dev
```

개발 서버가 [http://localhost:3000](http://localhost:3000)에서 실행됩니다.

### 프로덕션 빌드

```bash
npm run build
npm run start
```

### Lint 검사

```bash
npm run lint
```

### TypeScript 타입 체크

```bash
npm run type-check
```

## 폴더 구조

```
frontend/
├── app/                    # Next.js App Router 페이지
│   ├── layout.tsx         # 루트 레이아웃
│   ├── page.tsx           # 홈 페이지
│   └── globals.css        # 글로벌 CSS
├── components/            # 재사용 가능한 컴포넌트
├── lib/                   # 유틸리티 함수
├── store/                 # Zustand 상태 관리
├── types/                 # TypeScript 타입 정의
├── public/                # 정적 파일
│   ├── manifest.json      # PWA Manifest
│   └── robots.txt         # SEO
├── next.config.mjs        # Next.js 설정
├── tailwind.config.ts     # Tailwind CSS 설정
└── tsconfig.json          # TypeScript 설정
```

## PWA 기능

이 앱은 PWA(Progressive Web App)로 구성되어 있어 모바일 홈 화면에 추가할 수 있습니다.

- **오프라인 지원**: Service Worker를 통한 캐싱
- **앱 아이콘**: 192x192, 512x512 크기의 아이콘 지원
- **독립 실행**: 브라우저 UI 없이 앱처럼 실행

## 환경 변수

다음 환경 변수를 `.env.local` 파일에 설정하세요:

```env
# Firebase 설정
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Kakao 설정
NEXT_PUBLIC_KAKAO_APP_KEY=
NEXT_PUBLIC_KAKAO_REDIRECT_URI=

# 회사 설정
NEXT_PUBLIC_COMPANY_NAME=
NEXT_PUBLIC_OFFICE_LAT=
NEXT_PUBLIC_OFFICE_LNG=
```

## 배포

이 프로젝트는 AWS ECS Fargate에 Docker 컨테이너로 배포됩니다. GitHub Actions를 통해 자동 배포가 구성되어 있습니다.
