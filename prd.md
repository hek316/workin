# 워크인(WorkIn) MVP 제품 요구사항 명세서 (PRD)

**문서 버전:** v1.1  
**작성일:** 2025년 11월 14일  
**작성자:** Product Manager  
**대상:** 개발팀, 디자인팀, QA팀  
**프로젝트 코드명:** WorkIn MVP

---

## 1. 배경 및 문제 정의

### 1.1 현재 문제 상황
Acompany 회사는 현재 **수기로 출퇴근 기록**을 관리하고 있습니다. 이로 인해 다음과 같은 문제가 발생하고 있습니다:

- **직원**: 매일 수기 작성의 번거로움, 작성 누락 시 급여 계산 오류 발생
- **관리자**: 30명의 출퇴근 기록을 일일이 확인하고 집계하는 데 월 20시간 이상 소요
- **회사**: 부정확한 근태 데이터로 인한 급여 분쟁 및 노무 리스크

### 1.2 솔루션
**워크인**은 GPS 기반 자동화된 출퇴근 기록 시스템으로, 버튼 클릭 한 번으로 정확한 근태 관리를 가능하게 합니다.

### 1.3 왜 지금인가?
- 중소기업 근태관리 시장의 디지털 전환 가속화
- 기존 솔루션(하이웍스 등)의 높은 진입장벽 (복잡성, 비용)
- PWA 기술의 성숙으로 앱 설치 없이 네이티브 앱 수준의 경험 제공 가능

---

## 2. 타겟 유저 및 페르소나

### 2.1 Primary Persona: 직원 민지
```
이름: 김민지 (27세)
직책: 마케팅 팀원
근무 환경: 주 5일 출근 (월-금), 가끔 외근
기술 수준: 스마트폰 앱 사용에 익숙한 Z세대

Pain Points:
- "매일 아침 수기 작성 깜빡하면 월말에 일일이 복구해야 해요"
- "외근 갔을 때 출퇴근 어떻게 처리하는지 매번 헷갈려요"
- "GPS 위치 추적당하는 건 아니겠죠? 개인정보 걱정돼요"

Goals:
- 10초 안에 출퇴근 기록 완료
- 언제든 내 기록 확인 가능
- 개인정보 걱정 없이 사용
```

### 2.2 Secondary Persona: 관리자 수현
```
이름: 박수현 (35세)
직책: 인사팀 리더
관리 직원 수: 30명
기술 수준: 기본적인 엑셀, 웹 사용 가능

Pain Points:
- "매일 30명의 출퇴근 확인하는데 1시간씩 걸려요"
- "누가 지각했는지 일일이 계산하고 표시해야 해요"
- "월말 급여 계산 시 데이터 정리에 하루 종일 걸려요"

Goals:
- 실시간으로 전체 직원 출퇴근 현황 한눈에 파악
- 클릭 한 번으로 엑셀 다운로드
- 복잡한 기술 지식 없이 직관적으로 사용
```

---

## 3. 제품 목표 및 성공 지표

### 3.1 제품 목표
**Primary Goal:** Acompany 직원들의 수기 출퇴근 기록을 100% 디지털 자동화로 전환

**Secondary Goals:**
- 관리자의 근태 관리 시간 90% 단축 (월 20시간 → 2시간)
- MVP 검증 후 타 중소기업 확장 준비

---

## 4. MVP 범위 및 우선순위

### 4.1 MVP에 포함되는 기능 (In Scope)
✅ 직원용 출퇴근 기록 (GPS 기반)
✅ 직원용 출퇴근 기록 조회 (당월 + 과거 3개월)
✅ 관리자용 실시간 대시보드
✅ 관리자용 엑셀 다운로드
✅ 이메일/비밀번호 로그인
✅ 카카오 간편 로그인
✅ GPS 범위 외 예외 요청/승인 시스템  

### 4.2 MVP에 포함되지 않는 기능 (Out of Scope)
❌ 모바일 네이티브 앱 (PWA만 제공)  
❌ 다중 사업장 관리  
❌ 복잡한 근무 형태 (3교대, 시차 출퇴근 등)  
❌ 급여 계산 연동  
❌ 휴가/연차 관리  
❌ 알림톡/문자 발송  

---

## 5. 기술 스택 (Tech Stack)

### 5.1 Frontend
| 기술 | 버전 | 선택 이유 |
|------|------|-----------|
| **Next.js** | 14 (App Router) | PWA 설정 간단, SSR로 초기 로딩 빠름 |
| **TypeScript** | 5.x | 타입 안정성, 코드 가독성 향상 |
| **Tailwind CSS** | 3.x | 빠른 UI 개발, 반응형 디자인 |
| **Zustand** | 4.x | 가벼운 상태관리 |

### 5.2 Backend & Database
| 기술 | 선택 이유 |
|------|-----------|
| **Firebase Auth** | 이메일/비밀번호 로그인, 세션 관리 자동화 |
| **Kakao SDK** | 카카오 간편 로그인 (한국 사용자 95% 보유) |
| **Firestore** | 실시간 동기화, 오프라인 캐싱, NoSQL로 빠른 개발 |
| **Cloud Functions** | 서버리스 백엔드 로직 (엑셀 생성, 백업, GPS 검증) |
| **Cloud Storage** | 엑셀 파일 및 백업 데이터 저장 |

### 5.3 Infrastructure
| 기술 | 용도 |
|------|------|
| **ECS Fargate** | Next.js 프론트엔드 컨테이너 배포 |
| **ALB** | 로드 밸런서, HTTPS |
| **ECR** | 도커 이미지 저장소 |
| **CloudFront** | CDN (선택사항, 성능 최적화) |

### 5.4 DevOps
| 기술 | 용도 |
|------|------|
| **Terraform** | ECS/ALB/VPC 인프라 코드화 |
| **GitHub Actions** | CI/CD (빌드 → ECR 푸시 → ECS 배포) |
| **Docker** | 컨테이너화 |

### 5.5 Monitoring & Logging
| 기술 | 용도 |
|------|------|
| **CloudWatch** | ECS 컨테이너 로그, CPU/메모리 모니터링 |
| **Sentry** | 프론트엔드 에러 트래킹, 실시간 알림 |
| **Firebase Console** | Firestore 사용량, Cloud Functions 성능 |

### 5.6 왜 Firestore + ECS 하이브리드인가?
- ✅ **실시간 동기화**: 직원 출근 → 관리자 대시보드 즉시 갱신 (WebSocket 불필요)
- ✅ **오프라인 지원**: 지하철에서도 출퇴근 기록 가능 (나중에 자동 동기화)
- ✅ **빠른 MVP**: REST API 레이어 불필요, Firestore SDK로 직접 접근
- ✅ **무료 티어**: 30명 규모는 Firebase 무료 (읽기 50,000/일, 쓰기 20,000/일)
- ✅ **ECS 활용**: Next.js는 ECS로 배포해 인프라 제어권 유지

---

## 6. 데이터베이스 스키마 (Firestore Collections)

### 6.1 \`users\` 컬렉션
**용도:** 직원 및 관리자 정보 저장

\`\`\`typescript
// 문서 ID: Firebase Auth UID
{
  uid: string;                    // Firebase Auth UID
  email: string;                  // minjik@acompany.com or "kakao_{kakao_id}@walkin.com"
  name: string;                   // "김민지"
  kakaoId?: string;               // 카카오 고유 ID (카카오 로그인 시)
  profileImage?: string;          // 카카오 프로필 이미지 (카카오 로그인 시)
  role: "employee" | "admin";     // 역할
  createdAt: Timestamp;           // 계정 생성일
  lastLoginAt: Timestamp;         // 마지막 로그인
}
\`\`\`

**인덱스:**
- \`email\` (unique) - 로그인 조회
- \`role\` - 관리자/직원 필터링

---

### 6.2 \`attendance\` 컬렉션
**용도:** 출퇴근 기록 저장

\`\`\`typescript
// 문서 ID: {uid}_{YYYY-MM-DD} (예: abc123_2025-11-14)
{
  uid: string;                    // 직원 UID
  name: string;                   // "김민지" (조회 성능 향상)
  date: string;                   // "2025-11-14"

  checkIn: {
    time: Timestamp;              // 2025-11-14T09:05:00
    location: {
      lat: number;                // 37.5665
      lng: number;                // 126.9780
      accuracy: number;           // 15 (미터)
    };
    status: "normal" | "late" | "approved" | "pending";
  } | null;

  checkOut: {
    time: Timestamp;              // 2025-11-14T18:30:00
    location: {
      lat: number;
      lng: number;
      accuracy: number;
    };
    status: "normal" | "early" | "approved";
  } | null;

  workHours: number | null;       // 8.42 (시간 단위)
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
\`\`\`

**인덱스:**
- \`uid + date\` (composite) - 특정 직원의 특정 날짜 조회
- \`date\` - 관리자 대시보드 일일 조회
- \`checkIn.status\` - 지각자 필터링

---

### 6.3 \`approvals\` 컬렉션
**용도:** GPS 범위 외 예외 승인 요청

\`\`\`typescript
// 문서 ID: 자동 생성
{
  uid: string;                    // 요청 직원 UID
  name: string;                   // "김민지"
  type: "checkIn" | "checkOut";   // 출근/퇴근 구분
  requestedAt: Timestamp;         // 요청 시각
  reason: string;                 // "외근으로 인한 출근 요청"
  location: {
    lat: number;
    lng: number;
    accuracy: number;
  };
  status: "pending" | "approved" | "rejected";
  reviewedBy: string | null;      // 승인/거부한 관리자 UID
  reviewedAt: Timestamp | null;
  rejectionReason: string | null; // 거부 사유
}
\`\`\`

**인덱스:**
- \`status + requestedAt\` (composite) - 대기 중 요청 정렬 조회

---

### 6.4 \`settings\` 컬렉션
**용도:** 회사 설정 (GPS 반경, 근무 시간 등)

\`\`\`typescript
// 문서 ID: "company_config"
{
  companyName: string;            // "Acompany"
  officeLocation: {
    lat: number;                  // 37.5665
    lng: number;                  // 126.9780
  };
  checkInRadius: number;          // 1000 (미터)
  checkOutRadius: number;         // 3000 (미터)
  workStartTime: string;          // "09:00"
  lateThreshold: number;          // 5 (분) - 09:05 이후 지각
  updatedAt: Timestamp;
}
\`\`\`

---

## 7. 개발 우선순위 및 일정 (Development Phases)

### Phase 1: 인프라 + 핵심 기능 (2주)
| 작업 | 담당 | 예상 시간 |
|------|------|-----------|
| Terraform 인프라 구성 (VPC, ECS, ALB) | DevOps | 8h |
| Next.js 프로젝트 초기 설정 + Firebase 연동 | Frontend | 4h |
| Docker 컨테이너화 (Next.js) | DevOps | 4h |
| GitHub Actions CI/CD 파이프라인 | DevOps | 6h |
| Firebase Auth 이메일/비밀번호 로그인 구현 | Frontend | 4h |
| 카카오 SDK 연동 + 간편 로그인 구현 | Frontend | 6h |
| Firestore 컬렉션 설계 및 보안 규칙 | Backend | 4h |
| GPS 위치 권한 + 출퇴근 기록 UI | Frontend | 10h |
| PWA 설정 (manifest.json, Service Worker) | Frontend | 4h |

**🎯 Phase 1 완료 기준:**
- ✅ ECS에 배포된 Next.js 앱 접속 가능
- ✅ 카카오 간편 로그인 작동
- ✅ 이메일/비밀번호 로그인 작동 (백업용)
- ✅ 출퇴근 기록 Firestore 저장
- ✅ PWA로 모바일 홈 화면 추가 가능

---

### Phase 2: 조회 + 관리자 기능 (2주)
| 작업 | 담당 | 예상 시간 |
|------|------|-----------|
| 직원용 캘린더 조회 UI | Frontend | 8h |
| 관리자 대시보드 실시간 리스너 | Frontend | 10h |
| 지각/조퇴 자동 계산 Cloud Function | Backend | 6h |
| 엑셀 다운로드 Cloud Function | Backend | 8h |
| Firestore 보안 규칙 강화 | Backend | 4h |

**🎯 Phase 2 완료 기준:**
- ✅ 직원 3개월 기록 조회
- ✅ 관리자 실시간 현황 확인
- ✅ 엑셀 다운로드 작동

---

### Phase 3: 예외 처리 + 최적화 (1주)
| 작업 | 담당 | 예상 시간 |
|------|------|-----------|
| GPS 범위 외 예외 요청/승인 UI | Frontend | 8h |
| Firestore 자동 백업 (Cloud Scheduler) | Backend | 4h |
| Sentry 에러 트래킹 설정 | DevOps | 3h |
| CloudWatch 알람 설정 | DevOps | 3h |

**🎯 Phase 3 완료 기준:**
- ✅ 예외 승인 플로우 작동
- ✅ 일일 자동 백업
- ✅ 에러 트래킹 활성화

---

### 전체 일정: 5주

---

## 8. Terraform 인프라 구성 개요

### 8.1 필요한 리소스
\`\`\`
VPC
├── Public Subnets (2개 AZ)
├── Private Subnets (2개 AZ)
├── Internet Gateway
├── NAT Gateway
└── Route Tables

ECS Cluster
└── Frontend Service (Fargate)
    └── Task Definition (Next.js 컨테이너)

ALB (Application Load Balancer)
└── Target Group: Frontend (포트 3000)

ECR (Elastic Container Registry)
└── walkin-frontend 레포지토리

CloudWatch
└── ECS Logs (/aws/ecs/walkin-frontend)
\`\`\`

### 8.2 모니터링 설정

#### CloudWatch
- **ECS 컨테이너 로그**: `/aws/ecs/walkin-frontend`
- **메트릭 알람**:
  - ECS CPU > 80% (5분 연속)
  - ALB 5xx 에러 > 10개/분
  - ECS 태스크 0개 (서비스 다운)

#### Sentry
- **Frontend**: Next.js SDK - 페이지 로드 에러, Firestore 호출 실패
- **알림**: Slack 연동, 에러율 5% 초과 시 즉시 알림

#### Firebase Console
- Firestore 읽기/쓰기 사용량
- Cloud Functions 실행 시간
- Auth 활성 사용자 수

---

### 8.3 환경 변수
\`\`\`
# Next.js (.env.local)

# Firebase 설정
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=walkin.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=walkin
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=walkin.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxx

# Kakao 설정
NEXT_PUBLIC_KAKAO_APP_KEY=xxx
NEXT_PUBLIC_KAKAO_REDIRECT_URI=https://walkin.com/auth/kakao/callback

# Sentry
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx

# 회사 설정
NEXT_PUBLIC_COMPANY_NAME=Acompany
NEXT_PUBLIC_OFFICE_LAT=37.5665
NEXT_PUBLIC_OFFICE_LNG=126.9780
\`\`\`

---

### 8.4 카카오 로그인 구현 가이드

#### 1. Kakao Developers 설정
1. https://developers.kakao.com 에서 앱 생성
2. **플랫폼 추가**: Web (https://walkin.com)
3. **Redirect URI 등록**: https://walkin.com/auth/kakao/callback
4. **동의 항목 설정**:
   - 필수: 닉네임, 프로필 이미지
   - 선택: 카카오계정(이메일)

#### 2. Firebase Custom Token 방식
\`\`\`typescript
// 1. 카카오 로그인 → 카카오 액세스 토큰 획득
// 2. Cloud Function으로 액세스 토큰 전송
// 3. Cloud Function에서 Firebase Custom Token 생성
// 4. 프론트엔드에서 Custom Token으로 Firebase Auth 로그인
\`\`\`

#### 3. Firestore users 컬렉션
\`\`\`typescript
{
  uid: string;              // Firebase UID
  email: string;            // 카카오 이메일 or "kakao_{kakao_id}@walkin.com"
  name: string;             // 카카오 닉네임
  kakaoId: string;          // 카카오 고유 ID
  profileImage: string;     // 카카오 프로필 이미지
  role: "employee" | "admin";
  createdAt: Timestamp;
  lastLoginAt: Timestamp;
}
\`\`\`

---

**문서 종료**
