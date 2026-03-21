# FutureConnection — Frontend UI/UX Build Plan

> Stack: Next.js (App Router), TypeScript, Tailwind CSS, Zustand, Axios, SignalR

---

## 1. Architecture Overview

```
src/
├── app/                    # Pages (Next.js App Router)
├── components/             # Reusable UI components
├── api/                    # API service files (one per backend service)
├── store/                  # Zustand global state stores
├── hooks/                  # Custom React hooks
├── types/                  # TypeScript types/interfaces
├── lib/                    # Utilities (api client, utils, etc.)
└── constants/              # App-wide constants
```

---

## 2. Role-Based Access

| Role | Access |
|------|--------|
| **Guest** | Landing, Login, Register, Forgot Password, Verify Email, Public profiles, Job listings, Community Q&A (read-only), Company pages |
| **Freelancer** | Everything + Apply for jobs, Social feed, Connections, Contracts, Community participation, Chat |
| **Employer** | Everything + Post jobs, Application pipeline, Contracts, Agency management, Hiring analytics |
| **Admin** | Everything + User management, Audit log, Badge/Tag/JobType management, Dispute resolution |

---

## 3. Page Inventory

### 3.1 Auth Pages

| Page | Route | Status | APIs Used |
|------|-------|--------|-----------|
| Landing | `/` | exists | — |
| Login | `/login` | exists | `POST /auth/login`, `POST /auth/refresh-token` |
| Register | `/register` | exists | `POST /auth/register` |
| Verify Email | `/verify-email` | **missing** | `GET /auth/verify-email?token=` |
| Email Sent | `/check-your-email` | **missing** | — (static confirmation screen) |
| Resend Verification | (modal/link on login) | **missing** | `POST /auth/resend-verification` |
| Forgot Password | `/forgot-password` | **missing** | `POST /auth/forgot-password` |
| Reset Password | `/reset-password` | **missing** | `POST /auth/reset-password` |
| Change Password OTP | `/account/change-password` | **missing** | `POST /auth/change-password/request-otp`, `POST /auth/change-password/verify-otp`, `POST /auth/change-password` |
| Onboarding | `/onboarding` | **missing** | `PUT /auth/users/{id}`, `POST /auth/users/{id}/avatar`, `PUT /profiles/{id}` |

**Auth Flow Diagrams:**

```
Register → Check Your Email → [click link] → Verify Email ✓ → Onboarding → Home

Login → (if unverified) → banner: "Verify your email" + Resend link

Forgot Password → Check Your Email → [click link] → Reset Password → Login

Change Password → Request OTP → Enter OTP → Enter new password → Done
```

**OAuth2 Login Flow:**
```
Login page → "Login with GitHub" button
  → Redirect to GitHub OAuth consent screen
  → GitHub redirects back to /oauth/callback?code=xxx
  → Frontend POSTs code to POST /auth/oauth/github
  → Receives JWT + user, stores tokens, redirects to /onboarding (new) or / (existing)
```

**Onboarding Wizard Steps:**
1. Avatar upload + display name
2. Role confirmation (Freelancer / Employer)
3. Bio, location, social links
4. Skills / CV upload (Freelancer)
5. Company creation (Employer)

---

### 3.2 Profile Pages

| Page | Route | Status | APIs Used |
|------|-------|--------|-----------|
| My Profile | `/profile` | exists (stub) | `GET /profiles/{id}`, `PUT /profiles/{id}` |
| Public Profile | `/profile/[id]` | **missing** | `GET /profiles/{id}`, `GET /profiles/{id}/cvs`, `GET /profiles/{id}/certificates`, `GET /profiles/{id}/projects`, `GET /profiles/{id}/endorsements`, `GET /profiles/{id}/social-media`, `GET /profiles/{id}/open-source`, `GET /questions/reputation/{id}` |
| Edit Profile | `/profile/edit` | **missing** | `PUT /profiles/{id}`, `POST /profiles/{id}/cvs`, `DELETE /profiles/cvs/{id}`, `POST /profiles/{id}/certificates`, `PUT /profiles/certificates/{id}`, `DELETE /profiles/certificates/{id}`, `POST /profiles/{id}/projects`, `PUT /profiles/projects/{id}`, `DELETE /profiles/projects/{id}`, `POST /profiles/{id}/social-media`, `PUT /profiles/social-media/{id}`, `POST /profiles/{id}/open-source`, `DELETE /profiles/open-source/{id}` |
| Account Settings | `/account/settings` | **missing** | `PUT /auth/users/{id}`, `POST /auth/users/{id}/avatar`, `DELETE /auth/users/{id}` |

**Profile Page Sections:**
- Header: avatar, name, role, location, connections count, social links, endorse button
- About / bio
- CV list (download links)
- Certificates (with expiry badges)
- Personal Projects (with GitHub + deploy links)
- Open Source Contributions
- Endorsements (by skill, grouped)
- Reputation score (from CommunityService)

**Account Settings Sections:**
- Personal info (name, email, phone)
- Change password (with OTP flow)
- Connected accounts (GitHub / Google OAuth badge + connect/disconnect)
- Danger zone (delete account)

---

### 3.3 Social Feed Pages

| Page | Route | Status | APIs Used |
|------|-------|--------|-----------|
| Feed | `/feed` | **missing** | `GET /posts`, `POST /posts`, `POST /posts/{id}/reactions`, `GET /posts/{id}/comments`, `POST /posts/{id}/comments`, `POST /comments/{id}/reactions` |
| Post Detail | `/feed/[id]` | **missing** | `GET /posts/{id}`, `GET /posts/{id}/comments`, `POST /posts/{id}/comments`, `PUT /comments/{id}`, `DELETE /comments/{id}` |
| Connections | `/connections` | **missing** | `GET /connections`, `GET /connections/pending`, `POST /connections`, `PUT /connections/{id}/respond`, `DELETE /connections/{id}` |

**Feed Component Layout:**
- Left sidebar: profile summary, quick links
- Center: CreatePost box + infinite scroll feed
- Right sidebar: People You May Know, trending tags

---

### 3.4 Job Pages

| Page | Route | Status | APIs Used |
|------|-------|--------|-----------|
| Job Board | `/jobs` | exists | `GET /jobs`, `GET /job-types`, `GET /tags` |
| Job Detail | `/jobs/[id]` | **missing** | `GET /jobs/{id}`, `GET /jobs/{id}/job-tags`, `GET /companies/{id}`, `POST /jobs/{id}/apply` |
| Apply for Job | `/jobs/[id]/apply` | **missing** | `POST /jobs/{id}/apply` |
| My Applications | `/applications` | **missing** | Uses application data from job listings |

**Job Board Filters:** keyword, location type (Remote/Hybrid/On-site), seniority, salary range, job type, tags

---

### 3.5 Employer Pages

| Page | Route | Status | APIs Used |
|------|-------|--------|-----------|
| Dashboard | `/employer` | exists (stub) | `GET /jobs`, `GET /companies/{id}` |
| My Jobs | `/employer/jobs` | exists | `GET /jobs`, `DELETE /jobs/{id}` |
| Create Job | `/employer/jobs/new` | exists | `POST /jobs`, `GET /job-types`, `GET /tags` |
| Edit Job | `/employer/jobs/[id]/edit` | **missing** | `GET /jobs/{id}`, `PUT /jobs/{id}`, `POST /jobs/{id}/job-tags`, `DELETE /jobs/{id}/job-tags/{tagId}` |
| Application Pipeline | `/employer/pipeline` | exists | `GET /jobs/{id}/applications`, `PUT /jobs/applications/{id}/status` |
| Agency | `/employer/agency` | exists | `GET /agencies`, `POST /agencies`, `PUT /agencies/{id}`, `DELETE /agencies/{id}`, `POST /agencies/{id}/members`, `DELETE /agencies/{id}/members/{memberId}` |
| Hiring Analytics | `/employer/analytics` | **missing** | `GET /jobs`, `GET /jobs/{id}/applications` (aggregate client-side) |

**Pipeline View:** Kanban board with columns: Pending → Reviewed → Accepted / Rejected

---

### 3.6 Company Pages

| Page | Route | Status | APIs Used |
|------|-------|--------|-----------|
| Companies List | `/companies` | **missing** | `GET /companies` |
| Company Detail | `/companies/[id]` | **missing** | `GET /companies/{id}`, `GET /companies/{id}/jobs`, `GET /companies/{id}/followers`, `POST /companies/{id}/follow`, `DELETE /companies/{id}/follow` |
| Create/Edit Company | `/companies/new` or `/companies/[id]/edit` | **missing** | `POST /companies`, `PUT /companies/{id}` |

---

### 3.7 Freelance / Contract Pages

| Page | Route | Status | APIs Used |
|------|-------|--------|-----------|
| Contracts List | `/contracts` | exists (stub) | `GET /contracts` |
| Contract Detail | `/contracts/[id]` | **missing** | `GET /contracts/{id}`, `GET /contracts/{id}/milestones`, `GET /contracts/{id}/reviews`, `GET /contracts/{id}/transactions`, `POST /contracts/{id}/reviews`, `PUT /contracts/{id}/status` |
| Milestone Management | (within contract detail) | — | `POST /contracts/{id}/milestones`, `PUT /contracts/milestones/{id}/complete`, `PUT /contracts/milestones/{id}/pay` |
| Create Contract | `/contracts/new` | **missing** | `POST /contracts` |
| Disputes | (within contract detail) | — | `POST /contracts/{id}/disputes`, `PUT /contracts/disputes/{id}/resolve` (Admin) |

**Contract Detail Sections:**
- Status bar (PendingSignature → Active → Completed)
- Milestone tracker (with completion & payment states)
- Transaction history
- Dispute panel
- Review section (after completion)

---

### 3.8 Community Pages (Q&A)

| Page | Route | Status | APIs Used |
|------|-------|--------|-----------|
| Questions List | `/community` | exists | `GET /questions`, `GET /tags` |
| Question Detail | `/community/questions/[id]` | exists | `GET /questions/{id}`, `GET /questions/{id}/answers`, `POST /questions/{id}/answers`, `POST /questions/{id}/vote`, `POST /questions/answers/{id}/vote`, `PUT /questions/answers/{id}/accept`, `POST /questions/{id}/bounties`, `POST /questions/bounties/{id}/award` |
| Ask Question | `/community/ask` | **missing** | `POST /questions`, `POST /questions/{id}/tags`, `GET /tags` |
| User Reputation | (within profile) | — | `GET /questions/reputation/{userId}` |
| Badges | `/community/badges` | **missing** | `GET /badges` |

---

### 3.9 Chat / Messages Pages

| Page | Route | Status | APIs Used |
|------|-------|--------|-----------|
| Messages | `/messages` | exists (stub) | `GET /channels`, `GET /channels/{id}/messages`, `POST /channels/{id}/messages`, `GET /groups`, `GET /groups/{id}/messages`, `POST /groups/{id}/messages` |
| Group Chat | `/messages/groups/[id]` | **missing** | `GET /groups/{id}`, `GET /groups/{id}/messages`, `POST /groups/{id}/messages`, `GET /groups/{id}/members`, `POST /groups/{id}/members`, `DELETE /groups/{id}/members/{memberId}` |
| Create Group | (modal) | — | `POST /groups` |

**Messages Layout:**
- Left panel: conversation list (DMs + Groups), search
- Center: message thread with real-time via SignalR
- Right panel: group/channel info, members

---

### 3.10 Admin Pages

| Page | Route | Status | APIs Used |
|------|-------|--------|-----------|
| User Management | `/admin/users` | exists | `GET /auth/users`, `DELETE /auth/users/{id}` |
| Audit Log | `/admin/audit` | exists | — |
| Tag Management | `/admin/tags` | **missing** | `GET /tags`, `POST /tags`, `GET /badges`, `POST /badges` |
| Job Types | `/admin/job-types` | **missing** | `GET /job-types`, `POST /job-types` |
| Dispute Resolution | `/admin/disputes` | **missing** | `PUT /contracts/disputes/{id}/resolve` |

---

## 4. Component Architecture

### Shared Components
```
components/
├── layout/
│   ├── Navbar.tsx                  # Top nav with auth state + email-verified banner
│   ├── Sidebar.tsx                 # Role-aware sidebar nav
│   └── PageContainer.tsx           # Max-width wrapper
├── ui/
│   ├── Avatar.tsx
│   ├── Badge.tsx                   # Status badges (Active, Pending, Verified, etc.)
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Modal.tsx
│   ├── OtpInput.tsx                # 6-digit OTP input with auto-focus
│   ├── Pagination.tsx
│   ├── SearchInput.tsx
│   └── EmptyState.tsx
└── forms/
    ├── FileUpload.tsx              # For CV/avatar/media uploads
    └── RichTextEditor.tsx          # For post/question content
```

### Feature Components
```
components/
├── auth/
│   ├── OnboardingWizard.tsx        # exists
│   ├── OAuthButtons.tsx            # "Continue with GitHub / Google" buttons
│   ├── EmailVerificationBanner.tsx # Sticky banner shown when email unverified
│   ├── OtpVerificationForm.tsx     # Shared OTP entry + resend timer
│   └── PasswordStrengthBar.tsx     # Visual password strength indicator
├── profile/
│   ├── ProfileHeader.tsx
│   ├── CVSection.tsx
│   ├── CertificateCard.tsx
│   ├── ProjectCard.tsx
│   ├── EndorsementSection.tsx
│   ├── ConnectedAccountsSection.tsx  # OAuth provider badges
│   └── ReputationBadge.tsx
├── social/
│   ├── Feed.tsx                    # exists
│   ├── PostCard.tsx                # exists
│   ├── CreatePost.tsx              # exists
│   ├── CommentList.tsx
│   ├── ReactionBar.tsx
│   └── ConnectionCard.tsx
├── jobs/
│   ├── JobCard.tsx
│   ├── JobFilters.tsx
│   ├── ApplicationForm.tsx
│   └── ApplicationStatusBadge.tsx
├── contracts/
│   ├── ContractCard.tsx
│   ├── MilestoneTracker.tsx
│   ├── DisputePanel.tsx
│   └── ReviewForm.tsx
├── community/
│   ├── QuestionCard.tsx
│   ├── AnswerCard.tsx
│   ├── VoteButtons.tsx
│   ├── BountyBadge.tsx
│   └── TagList.tsx
├── chat/
│   ├── ConversationList.tsx
│   ├── MessageThread.tsx
│   ├── MessageInput.tsx
│   └── ReactionPicker.tsx
├── agency/
│   ├── MemberCard.tsx              # exists
│   └── InviteMemberModal.tsx       # exists
└── dashboard/
    ├── FreelancerDashboard.tsx     # exists
    ├── EmployerDashboard.tsx       # exists
    ├── AdminDashboard.tsx          # exists
    ├── CandidateKanban.tsx         # exists
    └── HiringAnalytics.tsx         # exists
```

---

## 5. State Management (Zustand)

| Store | Manages |
|-------|---------|
| `authStore` | user, token, refreshToken, isAuthenticated, isEmailVerified (exists — extend) |
| `notificationStore` | toast/alert queue |
| `chatStore` | active conversation, messages, online status |
| `connectionStore` | pending requests count |
| `feedStore` | cached posts, pagination cursor |

**authStore additions:**
```ts
isEmailVerified: boolean       // from JWT claim "isEmailVerified"
oauthProvider: string | null   // "GitHub" | "Google" | null — from user object
```

---

## 6. API Service Files

| File | Backend Service | Status |
|------|----------------|--------|
| `api/authService.ts` | IdentityService | **create / extend** |
| `api/profileService.ts` | ProfileService | exists |
| `api/socialService.ts` | SocialService | exists |
| `api/jobService.ts` | JobService | exists |
| `api/contractService.ts` | FreelanceService | exists |
| `api/agencyService.ts` | FreelanceService (agencies) | exists |
| `api/communityService.ts` | CommunityService | exists |
| `api/chatService.ts` | ChatService | exists |
| `api/signalrService.ts` | SignalR hub | **create** |

**authService.ts must cover:**
```ts
login(email, password)
register(dto)
refreshToken(token)
logout(userId, token)
changePassword(userId, currentPassword, newPassword)

// Email verification
sendVerificationEmail(email)
verifyEmail(token)

// Forgot / Reset password
forgotPassword(email)
resetPassword(token, newPassword)

// Change password OTP
requestChangePasswordOtp()
verifyChangePasswordOtp(otp)

// OAuth2
oauthGitHub(code, redirectUri)
oauthGoogle(code, redirectUri)
```

---

## 7. OAuth2 Frontend Integration

### Setup per provider

**GitHub:**
1. Create OAuth App at `github.com/settings/developers`
2. Set callback URL to `http://localhost:3000/oauth/callback/github`
3. Store `NEXT_PUBLIC_GITHUB_CLIENT_ID` in `.env.local`

**Google:**
1. Create credentials at `console.cloud.google.com`
2. Set authorized redirect URI to `http://localhost:3000/oauth/callback/google`
3. Store `NEXT_PUBLIC_GOOGLE_CLIENT_ID` in `.env.local`

### Callback Page
```
app/oauth/callback/[provider]/page.tsx
```
This page receives the `?code=` query param from the OAuth provider, POSTs it to the backend, and handles the response:
- Success → store tokens → redirect to `/onboarding` (new user) or `/` (existing)
- Error → redirect to `/login?error=oauth_failed`

### OAuthButtons Component
```tsx
// Redirects to provider's authorization URL with correct scopes + redirect_uri
<OAuthButtons />  // renders GitHub + Google buttons
```

---

## 8. SignalR Real-Time Integration

Connect to `ws://localhost:[port]/chathub` after login.

**Events to handle:**
- `ReceiveMessage` → append to active conversation
- Reconnect on disconnect with exponential backoff

---

## 9. Build Order (Priority)

### Phase 1 — Auth & Core Shell *(updated)*
1. `authService.ts` — all methods including email verification, reset, OTP, OAuth
2. Layout: Navbar (auth state + unverified email banner), Sidebar (role-aware)
3. Login page — add OAuth buttons (GitHub, Google), "Forgot password?" link
4. Register page — add OAuth buttons, password strength bar
5. `/verify-email` — token verification landing page
6. `/check-your-email` — confirmation screen after register/forgot-password
7. `/forgot-password` — email entry form
8. `/reset-password` — new password form (reads token from URL)
9. `/account/change-password` — OTP request → OTP entry → new password form
10. `/oauth/callback/[provider]` — OAuth code exchange handler
11. `/onboarding` — wizard

### Phase 2 — Profile
12. My Profile page (view + edit sections)
13. Public Profile `/profile/[id]`
14. Edit Profile `/profile/edit`
15. Account Settings `/account/settings` — includes connected OAuth accounts section

### Phase 3 — Social
16. Feed page `/feed`
17. Post detail `/feed/[id]`
18. Connections page `/connections`

### Phase 4 — Jobs & Companies
19. Job Board `/jobs` (with filters)
20. Job Detail `/jobs/[id]` + Apply
21. Companies `/companies` + Company Detail
22. Employer: Create/Edit Job, Pipeline (Kanban)

### Phase 5 — Contracts & Freelance
23. Contracts list `/contracts`
24. Contract detail `/contracts/[id]` with milestones, disputes, reviews
25. Create Contract `/contracts/new`

### Phase 6 — Community Q&A
26. Questions list `/community` (with tag filter)
27. Question Detail (votes, answers, bounty, accept)
28. Ask Question `/community/ask`

### Phase 7 — Chat
29. Messages page `/messages` with SignalR
30. Group management

### Phase 8 — Admin
31. Tag + JobType + Badge management
32. Dispute resolution panel

---

## 10. Missing Pages Summary

| Priority | Page | Route |
|----------|------|-------|
| 🔴 High | Verify Email landing | `/verify-email` |
| 🔴 High | Check Your Email screen | `/check-your-email` |
| 🔴 High | Forgot Password | `/forgot-password` |
| 🔴 High | Reset Password | `/reset-password` |
| 🔴 High | OAuth Callback | `/oauth/callback/[provider]` |
| 🔴 High | Onboarding | `/onboarding` |
| 🔴 High | Public Profile | `/profile/[id]` |
| 🔴 High | Edit Profile | `/profile/edit` |
| 🔴 High | Job Detail | `/jobs/[id]` |
| 🔴 High | Social Feed | `/feed` |
| 🟡 Medium | Change Password (OTP) | `/account/change-password` |
| 🟡 Medium | Account Settings | `/account/settings` |
| 🟡 Medium | Connections | `/connections` |
| 🟡 Medium | Contract Detail | `/contracts/[id]` |
| 🟡 Medium | Create Contract | `/contracts/new` |
| 🟡 Medium | Post Detail | `/feed/[id]` |
| 🟡 Medium | Ask Question | `/community/ask` |
| 🟡 Medium | Companies List | `/companies` |
| 🟡 Medium | Company Detail | `/companies/[id]` |
| 🟡 Medium | Edit Job | `/employer/jobs/[id]/edit` |
| 🟢 Low | Group Chat | `/messages/groups/[id]` |
| 🟢 Low | Admin Tags/Jobs/Badges | `/admin/tags`, `/admin/job-types` |
| 🟢 Low | Admin Disputes | `/admin/disputes` |
| 🟢 Low | Hiring Analytics | `/employer/analytics` |
| 🟢 Low | Badges Gallery | `/community/badges` |
