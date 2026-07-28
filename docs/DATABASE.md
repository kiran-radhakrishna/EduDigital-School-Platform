# Database Schema

PostgreSQL via Prisma. Full source of truth: `backend/prisma/schema.prisma`. This document is a
map of the 64 models grouped by domain, not a field-by-field reprint — read the schema file
alongside this for exact columns/relations.

**Core convention**: the public API is keyed by `User.id` everywhere, never by a role-profile's
own internal id (`Student.id`, `Teacher.id`, etc). See
[`ARCHITECTURE.md`](ARCHITECTURE.md#the-public-api-is-keyed-by-userid-convention).

## Identity & core entities

- `School` — tenant root; almost every other model has an (often optional) `schoolId`.
- `User` — one row per login, `role: UserRole` (`STUDENT | TEACHER | PARENT | AUTHORITY |
  ADMINISTRATOR`), `emailVerified`. Has exactly one of the five role-profile relations below.
- `Student`, `Teacher`, `Parent`, `Authority`, `Administrator` — 1:1 with `User` via `userId`.
  `AUTHORITY` and `ADMINISTRATOR` are structurally identical; the frontend collapses both to a
  single `'admin'` role (`backend/src/services/userMapper.ts`), but the raw Prisma role is
  preserved in the JWT/`req.userRole` for authorization checks that must distinguish them (e.g.
  AI features' persona framing).
- `ParentStudent` — many-to-many join between `Parent` and `Student`.
- `AcademicYear`, `Subject`, `SchoolClass`, `ClassAssignment` (teacher↔subject↔class),
  `Enrollment` (student↔class).

## Academic operations (Phase 3B)

- `AttendanceRecord` — one row per student/class/date.
- `Assignment`, `AssignmentSubmission` (auto-created PENDING for every enrolled student when an
  assignment is created; transitions to SUBMITTED then GRADED).
- `Grade` — free-form (`GradeType`, score/maxScore); `grade.service.ts` computes GPA and
  per-subject averages on read rather than storing them.
- `TimetableSlot` — day/time/class/subject/teacher.

## Notifications & wellbeing (Phase 3C)

- `Notification`, `NotificationPreference`.
- `WellbeingCheckIn` (`emotion`, `confidence`, derived `stressLevel`/`riskLevel` — computed by
  the deterministic, rule-based `wellbeing.service.computeInsights`, not by AI), `WellbeingSkip`.

## School administration (Phase 6)

- **Library**: `BookCategory`, `BookAuthor`, `LibraryBook` (tracks `totalQuantity` /
  `availableQuantity`), `BookIssue`, `BookFine` (late fines computed on return).
- **Inventory**: `AssetCategory`, `Asset` (quantity/availableQuantity/lowStockThreshold),
  `AssetAssignment`, `AssetMaintenance`.
- **Staff/HR**: `Department`, `Designation`, `Staff` (1:1 with an existing `User`),
  `LeaveRequest`, `LeaveBalance` (unique per staff/leaveType/year).
- **Fees**: `FeeStructure`, `FeeInvoice` (status derived from payments vs. amount+lateFine),
  `FeePayment` (unique `receiptNumber`), `FeeInstallment`. No payment gateway integration —
  payments are recorded, not processed.
- **Transport**: `Bus`, `Driver`, `Route`, `Stop`, `StudentTransport` (one active assignment per
  student, upsert-based reassignment).

## AI (Phase 7A/7B)

- `AIConversation` (`provider`, `model`, `feature` — tags which AI feature a thread belongs to,
  e.g. `'tutor'`, `'study-planner'`, `null` for the generic `/ai/chat` endpoint), `AIMessage`
  (`role: USER | ASSISTANT | SYSTEM` — SYSTEM holds the persona/context prompt for a thread),
  `AIUsage` (token accounting, per-user and per-school).
- `StudyPlan` — the one AI feature with dedicated structured storage beyond chat history; a plan
  is real persisted output, not just a conversation turn. Optionally links back to the
  conversation that generated it.

## Security & sessions (Phase 8)

- `RefreshToken` — opaque, hashed (`tokenHash`, SHA-256), rotated on every use, revocable.
- `PasswordResetToken`, `EmailVerificationToken` — same shape (hashed, single-use `usedAt`,
  time-limited).
- `AuditLog` — `userId?` (nullable — some events like failed logins to an unknown email have no
  user to attribute), `action` (a closed string union, see `services/audit.service.ts`),
  `metadata: Json?`, `ipAddress`.

## Indexing conventions

Every foreign key has a corresponding `@@index`; composite indexes are added where a query
consistently filters or sorts on more than one field together (e.g. `AuditLog` has both
`[userId, createdAt]` and `[action, createdAt]`, since the log is queried both ways). New models
should follow this pattern — index every field a service actually filters or orders by, not
speculatively.

## Migrations

`backend/prisma/migrations/` — one directory per migration, applied in order. There is **no
separate staging database**; `prisma migrate dev` applies directly to the live Neon database
(see [`DEPLOYMENT.md`](DEPLOYMENT.md#database-migrations)). Data migrations (e.g. backfilling a
new column) are hand-added to the generated `migration.sql` before applying — see the
`emailVerified` backfill in `20260728164405_phase8_production_readiness/migration.sql` for the
pattern: existing rows get a sensible default via an `UPDATE` statement appended after the
`ALTER TABLE`.
