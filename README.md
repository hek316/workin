# WorkIn (워크인)

GPS 기반 출퇴근 기록 시스템 MVP - Acompany용

## 프로젝트 개요

**WorkIn**은 30명 규모의 직원을 위한 GPS 기반 출퇴근 자동 기록 시스템입니다. 기존의 수기 출퇴근 기록을 디지털화하여 효율성을 높이고, 직원과 관리자 모두에게 편리한 기능을 제공합니다.

## 기술 스택

### Frontend
- Next.js 14 (App Router)
- TypeScript 5.x
- Tailwind CSS 3.x
- Zustand 4.x (State Management)
- PWA Support (@ducanh2912/next-pwa)

### Backend
- Spring Boot 3.4.0
- Java 17
- Gradle
- Firebase Admin SDK 9.2.0

### Infrastructure
- Docker & Docker Compose
- Firebase (Auth, Firestore, Cloud Functions, Storage)

## 로컬 개발 환경 설정

### 사전 요구사항

- Docker Desktop 설치
- Docker Compose 설치

### Docker를 이용한 실행 (권장)

1. **환경 변수 설정**
   ```bash
   cp .env.example .env
   # .env 파일을 열어 Firebase 및 기타 설정값을 입력하세요
   ```

2. **Docker Compose로 모든 서비스 실행**
   ```bash
   docker-compose up
   ```

3. **서비스 접속**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:8080
   - Backend Health Check: http://localhost:8080/actuator/health

4. **서비스 중지**
   ```bash
   docker-compose down
   ```

5. **백그라운드 실행**
   ```bash
   docker-compose up -d
   ```

6. **로그 확인**
   ```bash
   # 모든 서비스 로그
   docker-compose logs -f

   # Frontend 로그만
   docker-compose logs -f frontend

   # Backend 로그만
   docker-compose logs -f backend
   ```

### 개별 서비스 실행 (Docker 없이)

#### Frontend

```bash
cd frontend
npm install
npm run dev
# http://localhost:3000
```

#### Backend

```bash
cd backend/walkin-backend
./gradlew bootRun
# http://localhost:8080
```

## 개발 가이드

### Hot Reload

Docker Compose 환경에서는 소스 코드 변경 시 자동으로 Hot Reload가 작동합니다.

- **Frontend**: 파일 저장 시 자동 리로드
- **Backend**: Spring Boot DevTools를 통한 자동 재시작

### 컨테이너 재빌드

Dockerfile이나 의존성 변경 시:

```bash
docker-compose up --build
```

특정 서비스만 재빌드:

```bash
docker-compose up --build frontend
docker-compose up --build backend
```

### 컨테이너 초기화

모든 컨테이너와 볼륨 삭제:

```bash
docker-compose down -v
```

## 주요 기능

### 직원 기능
- GPS 기반 출퇴근 체크
- 출퇴근 기록 조회 (현재 월 + 최근 3개월)
- GPS 범위 외 예외 요청

### 관리자 기능
- 실시간 직원 출퇴근 현황 대시보드
- 출퇴근 기록 엑셀 다운로드
- GPS 예외 요청 승인/거부

## 프로젝트 구조

```
walkin/
├── frontend/              # Next.js 애플리케이션
│   ├── app/              # App Router 페이지
│   ├── components/       # React 컴포넌트
│   ├── lib/              # 유틸리티 함수
│   ├── store/            # Zustand 스토어
│   ├── types/            # TypeScript 타입
│   ├── public/           # 정적 파일
│   └── Dockerfile        # Frontend 컨테이너 설정
├── backend/              # Spring Boot 애플리케이션
│   └── walkin-backend/
│       ├── src/          # Java 소스 코드
│       ├── build.gradle  # 빌드 설정
│       └── Dockerfile    # Backend 컨테이너 설정
├── docker-compose.yml    # Docker Compose 설정
├── .env.example          # 환경 변수 예제
└── prd.md               # 제품 요구사항 문서
```

## 라이선스

Private Project - Acompany

## 문의

프로젝트 관련 문의: hek3167@gmail.com
