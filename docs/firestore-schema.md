# Firestore Database Schema

WorkIn 프로젝트의 Firestore 데이터베이스 스키마 문서입니다.

## Collections

### 1. `users`

사용자 정보를 저장하는 컬렉션입니다.

**Document ID:** Firebase Auth UID

**Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `uid` | string | ✅ | Firebase Auth UID (document ID와 동일) |
| `email` | string | ✅ | 사용자 이메일 |
| `name` | string | ✅ | 사용자 이름 |
| `role` | string | ✅ | 사용자 역할 (`employee` or `admin`) |
| `createdAt` | Timestamp | ✅ | 계정 생성 시각 |
| `lastLoginAt` | Timestamp | ✅ | 마지막 로그인 시각 |
| `kakaoId` | string | ❌ | 카카오 계정 ID (카카오 로그인 사용 시) |
| `profileImage` | string | ❌ | 프로필 이미지 URL (카카오 로그인 사용 시) |

**Security Rules:**
- 사용자는 자신의 문서만 읽기 가능
- 관리자는 모든 사용자 문서 읽기 가능
- 회원가입 시 자신의 문서 생성 가능 (role은 `employee`로 고정)
- 사용자는 자신의 문서 수정 가능 (단, `uid`와 `role`은 수정 불가)
- 관리자만 사용자 문서 삭제 가능

**Indexes:**
- `email` (ASCENDING)
- `role` (ASCENDING) + `createdAt` (DESCENDING)

**Example:**

```json
{
  "uid": "abc123xyz",
  "email": "employee@acompany.com",
  "name": "홍길동",
  "role": "employee",
  "createdAt": "2025-11-19T12:00:00Z",
  "lastLoginAt": "2025-11-19T15:30:00Z"
}
```

---

### 2. `attendance`

출퇴근 기록을 저장하는 컬렉션입니다. (SCRUM-7에서 구현 예정)

**Document ID:** `{uid}_{YYYY-MM-DD}` (예: `abc123_2025-11-19`)

**Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `uid` | string | ✅ | 사용자 UID |
| `name` | string | ✅ | 사용자 이름 (조회 편의성) |
| `date` | string | ✅ | 날짜 (YYYY-MM-DD 형식) |
| `checkIn` | object | ❌ | 출근 정보 |
| `checkIn.timestamp` | Timestamp | ✅ | 출근 시각 |
| `checkIn.location` | object | ✅ | GPS 위치 |
| `checkIn.location.latitude` | number | ✅ | 위도 |
| `checkIn.location.longitude` | number | ✅ | 경도 |
| `checkIn.location.accuracy` | number | ✅ | GPS 정확도 (미터) |
| `checkIn.status` | string | ✅ | 출근 상태 (`normal`, `late`, `approved`) |
| `checkOut` | object | ❌ | 퇴근 정보 |
| `checkOut.timestamp` | Timestamp | ✅ | 퇴근 시각 |
| `checkOut.location` | object | ✅ | GPS 위치 |
| `checkOut.status` | string | ✅ | 퇴근 상태 (`normal`, `early`, `approved`) |
| `workHours` | number | ❌ | 근무 시간 (분 단위) |

**Security Rules:**
- 사용자는 자신의 출퇴근 기록만 읽기 가능
- 관리자는 모든 출퇴근 기록 읽기 가능
- 사용자는 자신의 출퇴근 기록 생성 가능
- 사용자는 자신의 출퇴근 기록 수정 가능
- 관리자도 출퇴근 기록 수정 가능 (승인 처리 등)
- 관리자만 출퇴근 기록 삭제 가능

**Indexes:**
- `uid` (ASCENDING) + `date` (DESCENDING)

---

### 3. `approvals`

GPS 범위 밖 출퇴근 승인 요청을 저장하는 컬렉션입니다. (SCRUM-7에서 구현 예정)

**Document ID:** Auto-generated

**Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `uid` | string | ✅ | 사용자 UID |
| `name` | string | ✅ | 사용자 이름 |
| `type` | string | ✅ | 요청 타입 (`checkIn` or `checkOut`) |
| `date` | string | ✅ | 날짜 (YYYY-MM-DD) |
| `reason` | string | ✅ | 사유 |
| `location` | object | ✅ | GPS 위치 |
| `status` | string | ✅ | 승인 상태 (`pending`, `approved`, `rejected`) |
| `createdAt` | Timestamp | ✅ | 요청 생성 시각 |
| `reviewedBy` | string | ❌ | 승인/거부한 관리자 UID |
| `reviewedAt` | Timestamp | ❌ | 승인/거부 시각 |
| `reviewComment` | string | ❌ | 관리자 코멘트 |

**Security Rules:**
- 사용자는 자신의 승인 요청만 읽기 가능
- 관리자는 모든 승인 요청 읽기 가능
- 사용자는 자신의 승인 요청 생성 가능 (status는 `pending`으로 고정)
- 사용자는 자신의 `pending` 상태 요청만 수정 가능
- 관리자는 모든 승인 요청 수정 가능 (승인/거부 처리)
- 관리자만 승인 요청 삭제 가능

**Indexes:**
- `status` (ASCENDING) + `createdAt` (DESCENDING)

---

### 4. `settings`

회사 및 시스템 설정을 저장하는 컬렉션입니다.

**Document ID:** `company_config`

**Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `companyName` | string | ✅ | 회사 이름 |
| `officeLocation` | object | ✅ | 사무실 위치 |
| `officeLocation.latitude` | number | ✅ | 위도 |
| `officeLocation.longitude` | number | ✅ | 경도 |
| `checkInRadius` | number | ✅ | 출근 허용 반경 (미터, 기본: 1000) |
| `checkOutRadius` | number | ✅ | 퇴근 허용 반경 (미터, 기본: 3000) |
| `workStartTime` | string | ✅ | 근무 시작 시간 (HH:mm 형식, 예: "09:00") |
| `lateThreshold` | number | ✅ | 지각 판정 기준 (분, 기본: 5) |

**Security Rules:**
- 인증된 모든 사용자 읽기 가능
- 관리자만 수정 가능

**Example:**

```json
{
  "companyName": "Acompany",
  "officeLocation": {
    "latitude": 37.5665,
    "longitude": 126.9780
  },
  "checkInRadius": 1000,
  "checkOutRadius": 3000,
  "workStartTime": "09:00",
  "lateThreshold": 5
}
```

---

## Helper Functions

### User Functions (`frontend/lib/firestore/users.ts`)

```typescript
// Create user document after signup
createUser(uid, email, name, kakaoId?, profileImage?): Promise<User>

// Get user by UID
getUserByUid(uid): Promise<User | null>

// Update last login timestamp
updateLastLogin(uid): Promise<void>

// Update user profile (name, profileImage)
updateUserProfile(uid, updates): Promise<void>

// Check if user exists
userExists(uid): Promise<boolean>
```

---

## Deployment

### Deploy Security Rules

```bash
firebase deploy --only firestore:rules
```

### Deploy Indexes

```bash
firebase deploy --only firestore:indexes
```

### Deploy All Firestore Configuration

```bash
firebase deploy --only firestore
```

---

## Notes

- 모든 Timestamp 필드는 `serverTimestamp()` 사용
- Document ID는 가능한 한 의미 있는 값 사용 (예: `{uid}_{date}`)
- 보안 규칙은 최소 권한 원칙 적용
- 인덱스는 쿼리 패턴에 따라 추가 생성 필요 시 업데이트
