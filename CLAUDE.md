# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**워크인 (WorkIn)** is a GPS-based attendance tracking system MVP for Acompany, replacing manual paper-based check-in/check-out with automated digital records. The system serves 30 employees and includes both employee and admin functionality.

## Tech Stack

### Frontend
- **Next.js 14** (App Router) - SSR/PWA capabilities
- **TypeScript 5.x** - Type safety
- **Tailwind CSS 3.x** - Styling
- **Zustand 4.x** - Lightweight state management
- **@ducanh2912/next-pwa** - Progressive Web App support

### Backend & Database
- **Firebase Auth** - Email/password and Kakao login
- **Firestore** - Real-time NoSQL database with offline support
- **Cloud Functions** - Serverless backend (Excel generation, GPS validation)
- **Cloud Storage** - Excel and backup storage

### Infrastructure (Planned)
- **AWS ECS Fargate** - Next.js container deployment
- **ALB** - Load balancer with HTTPS
- **ECR** - Docker image registry
- **Terraform** - Infrastructure as code
- **GitHub Actions** - CI/CD pipeline

## Development Commands

### Frontend Development
```bash
cd frontend

# Start development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Type checking only (no build)
npm run type-check
```

## Architecture

### Directory Structure
```
walkin/
├── frontend/              # Next.js application
│   ├── app/              # App Router pages and layouts
│   │   ├── layout.tsx    # Root layout with PWA metadata
│   │   ├── page.tsx      # Landing page
│   │   └── globals.css   # Global styles
│   ├── components/       # React components (to be organized as ui/, layout/, features/)
│   ├── lib/              # Utility functions
│   ├── store/            # Zustand stores
│   │   └── useAuthStore.ts  # Authentication state
│   ├── types/            # TypeScript type definitions
│   │   └── index.ts      # User, Attendance, Location types
│   └── public/           # Static files including PWA manifest
└── prd.md                # Product Requirements Document (Korean)
```

### PWA Configuration
- Service Worker configured via `next.config.mjs` with `@ducanh2912/next-pwa`
- Disabled in development mode
- Manifest at `/public/manifest.json` for home screen installation
- Supports offline functionality for attendance recording

### State Management
- **Zustand** is used for global state (lightweight, minimal boilerplate)
- `useAuthStore` manages user authentication state (user, isAuthenticated, setUser, logout)
- Firebase Auth integration planned

### Type System
Key types defined in `types/index.ts`:
- `User` - Employee/admin with optional Kakao fields
- `Attendance` - Check-in/out records with GPS location and work hours
- `Location` - GPS coordinates with accuracy
- `CheckInOut` - Single check event with status (normal/late/early/approved/pending)

## Firestore Data Model

### Collections
1. **users** - Document ID: Firebase Auth UID
   - Fields: uid, email, name, kakaoId?, profileImage?, role, createdAt, lastLoginAt
   - Roles: "employee" | "admin"

2. **attendance** - Document ID: {uid}_{YYYY-MM-DD}
   - Fields: uid, name, date, checkIn, checkOut, workHours, timestamps
   - CheckIn/Out include GPS location and status

3. **approvals** - Exception requests for GPS out-of-range
   - Fields: uid, name, type, reason, location, status, reviewedBy, reviewedAt
   - Status: "pending" | "approved" | "rejected"

4. **settings** - Document ID: "company_config"
   - Fields: companyName, officeLocation, checkInRadius (1000m), checkOutRadius (3000m), workStartTime, lateThreshold

## Development Phases (per PRD)

### Phase 1: Infrastructure + Core (2 weeks)
- Terraform setup (VPC, ECS, ALB)
- Firebase Auth (email/password + Kakao)
- GPS check-in/out UI
- PWA configuration

### Phase 2: Views + Admin (2 weeks)
- Employee calendar view (current month + 3 months history)
- Admin dashboard with real-time Firestore listeners
- Excel download Cloud Function
- Auto-calculate late/early status

### Phase 3: Exceptions + Optimization (1 week)
- GPS out-of-range approval flow
- Daily Firestore backups
- Sentry error tracking
- CloudWatch alarms

## Key Features

### Employee Features
- **GPS Check-in/out**: Button click records location within office radius
- **History View**: Current month + 3 months of attendance records
- **Exception Requests**: Request approval when outside GPS range

### Admin Features
- **Real-time Dashboard**: View all employee attendance status
- **Excel Export**: Download attendance records
- **Approval Management**: Review GPS exception requests

### Authentication
- **Kakao Login** (primary): Custom token flow via Cloud Function
- **Email/Password** (backup): Firebase Auth default

## Important Context

### GPS Validation
- **Check-in radius**: 1000m from office
- **Check-out radius**: 3000m from office (more lenient)
- **Late threshold**: 5 minutes after 09:00 (09:05+)

### Firebase Advantages for This Project
- Real-time sync: Employee check-in instantly updates admin dashboard
- Offline support: Records saved locally, synced when online
- No custom backend needed: Direct SDK access from frontend
- Free tier sufficient: 30 employees well within limits (50k reads, 20k writes/day)

### Deployment Strategy
- Next.js runs on ECS Fargate (not Vercel) for infrastructure control
- Firestore handles all data and real-time features
- No REST API layer needed initially

## Environment Variables

Required in `.env.local`:
```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Kakao
NEXT_PUBLIC_KAKAO_APP_KEY=
NEXT_PUBLIC_KAKAO_REDIRECT_URI=

# Company Config
NEXT_PUBLIC_COMPANY_NAME=Acompany
NEXT_PUBLIC_OFFICE_LAT=37.5665
NEXT_PUBLIC_OFFICE_LNG=126.9780
```

## Jira Workflow

### Working with Jira Tickets

When working on Jira tickets, follow this workflow:

1. **Read Ticket Details**
   - Use `mcp__atlassian__getJiraIssue` to fetch the ticket details
   - Identify all acceptance criteria and checklist items in the ticket description

2. **Complete Development Tasks**
   - Implement the required changes
   - Ensure all acceptance criteria are met

3. **Integration Testing (MANDATORY)**

   **Before marking any Jira ticket as complete:**

   - **For Frontend Changes**:
     - Use Playwright MCP tools to verify the changes work correctly
     - Navigate to the changed pages using `mcp__playwright__browser_navigate`
     - Take screenshots and verify UI with `mcp__playwright__browser_snapshot`
     - Test user interactions with `mcp__playwright__browser_click`, `mcp__playwright__browser_type`, etc.

   - **For Backend Changes**:
     - Make actual API calls to verify the endpoint works correctly
     - Test with valid and invalid inputs
     - Verify error handling and response formats
     - Check Firebase/Firestore data changes if applicable

4. **Update Acceptance Criteria Checklist**
   - After successful testing, update the ticket to mark checklist items as completed
   - Use `mcp__atlassian__editJiraIssue` to update the description with checked items
   - Change `[ ]` to `[x]` for completed acceptance criteria

5. **Transition Ticket**
   - Only after all acceptance criteria are verified and checked
   - Use `mcp__atlassian__transitionJiraIssue` to move the ticket to the appropriate status

### Example Workflow

```
1. Fetch ticket: mcp__atlassian__getJiraIssue
2. Implement changes in code
3. Test with Playwright (frontend) or API calls (backend)
4. Update checklist: mcp__atlassian__editJiraIssue (mark items as [x])
5. Transition: mcp__atlassian__transitionJiraIssue (e.g., to "Done")
```

**IMPORTANT**: Never mark a ticket as complete without integration testing. Manual verification through actual testing is required for all changes.

## Monitoring (Planned)

- **Sentry**: Frontend error tracking
- **CloudWatch**: ECS logs, CPU/memory metrics
- **Firebase Console**: Firestore usage, Cloud Functions performance
