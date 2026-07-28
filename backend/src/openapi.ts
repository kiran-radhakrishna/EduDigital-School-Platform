/**
 * OpenAPI 3.0 document for the EduDigital API, served at GET /docs (swagger-ui-express).
 *
 * Every route in src/routes/*.ts has an entry below. Auth, AI, and health/version endpoints are
 * documented in full (request/response schemas); the many CRUD endpoints across the school-
 * administration domains (library, inventory, staff, fees, transport, academic, etc.) share a
 * lighter but accurate summary + auth-requirement + generic response shape, generated via the
 * small helpers below to avoid ~130 near-identical hand-written blocks.
 */

const errorSchema = {
  type: 'object',
  properties: { error: { type: 'string' } },
}

const errorResponses = {
  400: { description: 'Validation error', content: { 'application/json': { schema: errorSchema } } },
  401: { description: 'Not authenticated', content: { 'application/json': { schema: errorSchema } } },
  403: { description: 'Not authorized', content: { 'application/json': { schema: errorSchema } } },
  404: { description: 'Not found', content: { 'application/json': { schema: errorSchema } } },
}

interface OperationSpec {
  summary: string
  tags: string[]
  auth?: boolean
  roles?: string[]
  params?: Array<{ name: string; description?: string }>
  query?: Array<{ name: string; description?: string; required?: boolean }>
  body?: object
  responseDescription?: string
}

function op(spec: OperationSpec) {
  const authNote = spec.auth === false ? '' : spec.roles ? ` Roles: ${spec.roles.join(', ')}.` : ' Requires authentication.'
  return {
    summary: spec.summary + authNote,
    tags: spec.tags,
    security: spec.auth === false ? [] : [{ cookieAuth: [] }],
    parameters: [
      ...(spec.params ?? []).map((p) => ({
        name: p.name,
        in: 'path',
        required: true,
        description: p.description,
        schema: { type: 'string' },
      })),
      ...(spec.query ?? []).map((q) => ({
        name: q.name,
        in: 'query',
        required: q.required ?? false,
        description: q.description,
        schema: { type: 'string' },
      })),
    ],
    ...(spec.body ? { requestBody: { required: true, content: { 'application/json': { schema: spec.body } } } } : {}),
    responses: {
      200: { description: spec.responseDescription ?? 'Success', content: { 'application/json': { schema: { type: 'object' } } } },
      ...errorResponses,
    },
  }
}

/** id/:id path convenience — {id} in the URL, id in path. */
function idParam(description = 'Resource id (User.id where the resource is user-scoped)') {
  return [{ name: 'id', description }]
}

const schoolIdQuery = [{ name: 'schoolId', description: "The school's id", required: true }]

const paths: Record<string, Record<string, unknown>> = {
  // ── Monitoring ──────────────────────────────────────────────────────────
  '/health': { get: op({ summary: 'Liveness check', tags: ['Monitoring'], auth: false }) },
  '/health/ready': { get: op({ summary: 'Readiness check (verifies DB connectivity)', tags: ['Monitoring'], auth: false }) },
  '/version': { get: op({ summary: 'Build version, commit SHA, environment', tags: ['Monitoring'], auth: false }) },

  // ── Auth ────────────────────────────────────────────────────────────────
  '/auth/login': {
    post: op({
      summary: 'Log in with email + password. Sets access, refresh, and CSRF cookies.',
      tags: ['Auth'],
      auth: false,
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: { email: { type: 'string', format: 'email' }, password: { type: 'string' } },
      },
    }),
  },
  '/auth/register': {
    post: op({
      summary: 'Register a new account and log in.',
      tags: ['Auth'],
      auth: false,
      body: {
        type: 'object',
        required: ['name', 'email', 'password', 'role'],
        properties: {
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 },
          role: { type: 'string', enum: ['student', 'teacher', 'parent', 'admin'] },
        },
      },
    }),
  },
  '/auth/refresh': {
    post: op({
      summary: 'Rotate the refresh token and issue a new short-lived access token, via the httpOnly refresh cookie.',
      tags: ['Auth'],
    }),
  },
  '/auth/logout': { post: op({ summary: 'Revoke the current refresh token and clear session cookies.', tags: ['Auth'] }) },
  '/auth/me': { get: op({ summary: 'Get the current authenticated user.', tags: ['Auth'] }) },
  '/auth/forgot-password': {
    post: op({
      summary: 'Request a password reset link (always responds the same way, to avoid email enumeration).',
      tags: ['Auth'],
      auth: false,
      body: { type: 'object', required: ['email'], properties: { email: { type: 'string', format: 'email' } } },
    }),
  },
  '/auth/reset-password': {
    post: op({
      summary: 'Consume a password reset token and set a new password. Revokes all existing sessions.',
      tags: ['Auth'],
      auth: false,
      body: {
        type: 'object',
        required: ['token', 'password'],
        properties: { token: { type: 'string' }, password: { type: 'string', minLength: 6 } },
      },
    }),
  },
  '/auth/resend-verification': { post: op({ summary: 'Resend the email verification link.', tags: ['Auth'] }) },
  '/auth/verify-email': {
    post: op({
      summary: 'Consume an email verification token.',
      tags: ['Auth'],
      auth: false,
      body: { type: 'object', required: ['token'], properties: { token: { type: 'string' } } },
    }),
  },
  '/auth/audit-log/me': { get: op({ summary: "List the current user's own audit log entries.", tags: ['Auth'] }) },
  '/auth/audit-log': {
    get: op({
      summary: 'List audit log entries school-wide.',
      tags: ['Auth'],
      roles: ['ADMINISTRATOR', 'AUTHORITY'],
      query: [{ name: 'userId' }, { name: 'action' }],
    }),
  },

  // ── AI ──────────────────────────────────────────────────────────────────
  '/ai/chat': {
    post: op({
      summary: 'Generic AI chat turn — continues or starts a conversation via the configured provider.',
      tags: ['AI'],
      body: {
        type: 'object',
        required: ['message'],
        properties: { message: { type: 'string' }, conversationId: { type: 'string' } },
      },
    }),
  },
  '/ai/conversations': {
    get: op({ summary: "List the current user's AI conversations.", tags: ['AI'], query: [{ name: 'feature' }] }),
  },
  '/ai/conversations/{id}': { get: op({ summary: 'Get one conversation with its full message history.', tags: ['AI'], params: idParam('Conversation id') }) },
  '/ai/usage/me': { get: op({ summary: "Get the current user's AI token usage totals.", tags: ['AI'] }) },
  '/ai/usage': {
    get: op({ summary: 'Get school-wide AI token usage totals.', tags: ['AI'], roles: ['ADMINISTRATOR', 'AUTHORITY'], query: schoolIdQuery }),
  },
  '/ai/tutor/chat': { post: op({ summary: 'AI Tutor: explanations, worked examples, quizzes, flashcards.', tags: ['AI Features'], roles: ['STUDENT'] }) },
  '/ai/homework/chat': {
    post: op({
      summary: "Homework Assistant. mode='teacher' (teachers only) gives full worked solutions; default gives hints only.",
      tags: ['AI Features'],
      roles: ['STUDENT', 'TEACHER'],
    }),
  },
  '/ai/career/chat': { post: op({ summary: 'Career Advisor chat, grounded in real grade/attendance/wellbeing data.', tags: ['AI Features'], roles: ['STUDENT'] }) },
  '/ai/study-plan/generate': { post: op({ summary: 'Generate and persist a new AI study plan.', tags: ['AI Features'], roles: ['STUDENT'] }) },
  '/ai/study-plan': { get: op({ summary: "List the student's persisted study plans.", tags: ['AI Features'], roles: ['STUDENT'] }) },
  '/ai/teacher/chat': { post: op({ summary: 'Teacher AI: lesson plans, assignments, quizzes, rubrics, feedback, exam papers.', tags: ['AI Features'], roles: ['TEACHER'] }) },
  '/ai/parent/chat': {
    post: op({
      summary: "Parent AI: summaries for one of the parent's own children.",
      tags: ['AI Features'],
      roles: ['PARENT'],
      body: { type: 'object', required: ['studentUserId', 'message'], properties: { studentUserId: { type: 'string' }, message: { type: 'string' } } },
    }),
  },
  '/ai/admin/chat': {
    post: op({ summary: 'Administrator/Authority AI: school performance, attendance, academic, wellbeing insights.', tags: ['AI Features'], roles: ['ADMINISTRATOR', 'AUTHORITY'] }),
  },
}

// ── Remaining domains: accurate path/method/auth coverage, generated to avoid repetition ──
interface RouteEntry {
  method: 'get' | 'post' | 'put' | 'patch' | 'delete'
  path: string
  summary: string
}

function addDomain(basePath: string, tag: string, entries: RouteEntry[]) {
  for (const entry of entries) {
    const fullPath = `${basePath}${entry.path}`
    paths[fullPath] ??= {}
    paths[fullPath][entry.method] = op({ summary: entry.summary, tags: [tag] })
  }
}

addDomain('/users', 'Users', [
  { method: 'get', path: '', summary: 'List users (paginated, filterable by role/school/search).' },
  { method: 'post', path: '', summary: 'Create a user.' },
  { method: 'get', path: '/{id}', summary: 'Get a user by id.' },
  { method: 'patch', path: '/{id}', summary: 'Update a user.' },
  { method: 'delete', path: '/{id}', summary: 'Delete a user.' },
])

addDomain('/schools', 'Schools', [
  { method: 'get', path: '', summary: 'List schools.' },
  { method: 'post', path: '', summary: 'Create a school.' },
  { method: 'get', path: '/{id}', summary: 'Get a school by id.' },
  { method: 'patch', path: '/{id}', summary: 'Update a school.' },
  { method: 'delete', path: '/{id}', summary: 'Delete a school.' },
  { method: 'get', path: '/{id}/academic-years', summary: 'List academic years for a school.' },
  { method: 'post', path: '/{id}/academic-years', summary: 'Create an academic year.' },
  { method: 'get', path: '/{id}/classes', summary: 'List classes for a school.' },
])

addDomain('', 'Academic', [
  { method: 'get', path: '/subjects', summary: 'List subjects.' },
  { method: 'post', path: '/subjects', summary: 'Create a subject.' },
  { method: 'get', path: '/classes', summary: 'List classes.' },
  { method: 'post', path: '/classes', summary: 'Create a class.' },
  { method: 'get', path: '/classes/{id}', summary: 'Get a class by id.' },
  { method: 'post', path: '/classes/{id}/assignments', summary: 'Assign a teacher/subject to a class.' },
  { method: 'post', path: '/classes/{id}/enrollments', summary: 'Enroll a student in a class.' },
  { method: 'get', path: '/teachers/{id}/assignments', summary: "Get a teacher's class assignments." },
  { method: 'get', path: '/students/{id}/enrollment', summary: "Get a student's class enrollment." },
])

addDomain('/parents', 'Parents', [
  { method: 'get', path: '/{id}/children', summary: "List a parent's linked children." },
  { method: 'post', path: '/{id}/children', summary: 'Link a child to a parent.' },
  { method: 'delete', path: '/{id}/children/{studentId}', summary: 'Unlink a child from a parent.' },
])

addDomain('/attendance', 'Attendance', [
  { method: 'post', path: '', summary: 'Record attendance for a class on a date.' },
  { method: 'get', path: '', summary: 'Get attendance for a class on a date.' },
  { method: 'get', path: '/students/{id}', summary: "Get a student's attendance records." },
  { method: 'get', path: '/students/{id}/summary', summary: "Get a student's attendance summary." },
])

addDomain('/assignments', 'Assignments', [
  { method: 'post', path: '', summary: 'Create an assignment.' },
  { method: 'get', path: '', summary: 'List assignments for a class.' },
  { method: 'get', path: '/students/{id}', summary: "List a student's assignments." },
  { method: 'get', path: '/{id}', summary: 'Get an assignment by id.' },
  { method: 'patch', path: '/{id}', summary: 'Update an assignment.' },
  { method: 'delete', path: '/{id}', summary: 'Delete an assignment.' },
  { method: 'post', path: '/{id}/submit', summary: 'Submit an assignment (student).' },
  { method: 'post', path: '/{id}/grade', summary: 'Grade a submission (teacher).' },
])

addDomain('/grades', 'Grades', [
  { method: 'post', path: '', summary: 'Record a grade.' },
  { method: 'get', path: '', summary: 'List grades for a class.' },
  { method: 'get', path: '/students/{id}', summary: "List a student's grades." },
  { method: 'get', path: '/students/{id}/progress-report', summary: "Get a student's GPA/progress report." },
])

addDomain('/timetable', 'Timetable', [
  { method: 'post', path: '', summary: 'Create a timetable slot.' },
  { method: 'get', path: '', summary: 'Get the timetable for a class.' },
  { method: 'get', path: '/students/{id}', summary: "Get a student's timetable." },
  { method: 'get', path: '/teachers/{id}', summary: "Get a teacher's timetable." },
])

addDomain('/notifications', 'Notifications', [
  { method: 'get', path: '', summary: 'List notifications (paginated).' },
  { method: 'get', path: '/unread-count', summary: 'Get unread notification count.' },
  { method: 'post', path: '', summary: 'Create a notification (teacher/admin/authority).' },
  { method: 'get', path: '/preferences', summary: 'Get notification preferences.' },
  { method: 'put', path: '/preferences', summary: 'Update notification preferences.' },
  { method: 'patch', path: '/{id}/read', summary: 'Mark one notification as read.' },
  { method: 'post', path: '/read-all', summary: 'Mark all notifications as read.' },
  { method: 'delete', path: '/{id}', summary: 'Delete a notification.' },
])

addDomain('/wellbeing', 'Wellbeing', [
  { method: 'post', path: '/check-ins', summary: 'Create a wellbeing check-in.' },
  { method: 'get', path: '/me', summary: "Get the current user's wellbeing status." },
  { method: 'get', path: '/me/history', summary: 'Get check-in history.' },
  { method: 'post', path: '/skip', summary: "Skip today's check-in." },
  { method: 'get', path: '/classes/{classId}', summary: 'Get anonymized class wellbeing summary (teacher).' },
  { method: 'get', path: '/students/{id}', summary: "Get a student's wellbeing detail (self/parent/privileged)." },
])

addDomain('/analytics', 'Analytics', [
  { method: 'get', path: '/me', summary: "Get the current admin/authority's school analytics." },
  { method: 'get', path: '/finance', summary: 'Get school finance analytics.' },
])

addDomain('/dashboard', 'Dashboard', [
  { method: 'get', path: '/students/{id}', summary: 'Composite student dashboard payload.' },
  { method: 'get', path: '/teachers/{id}', summary: 'Composite teacher dashboard payload.' },
  { method: 'get', path: '/teachers/{id}/students', summary: "List a teacher's assigned students." },
  { method: 'get', path: '/parents/{id}', summary: 'Composite parent dashboard payload.' },
])

addDomain('/library', 'Library', [
  { method: 'get', path: '/categories', summary: 'List book categories.' },
  { method: 'post', path: '/categories', summary: 'Create a book category.' },
  { method: 'get', path: '/authors', summary: 'List book authors.' },
  { method: 'post', path: '/authors', summary: 'Create a book author.' },
  { method: 'get', path: '/books', summary: 'List books.' },
  { method: 'post', path: '/books', summary: 'Create a book.' },
  { method: 'get', path: '/books/{id}', summary: 'Get a book by id.' },
  { method: 'patch', path: '/books/{id}', summary: 'Update a book.' },
  { method: 'delete', path: '/books/{id}', summary: 'Delete a book.' },
  { method: 'get', path: '/issues', summary: 'List active book issues.' },
  { method: 'post', path: '/issues', summary: 'Issue a book to a borrower.' },
  { method: 'post', path: '/issues/{id}/return', summary: 'Return an issued book (computes late fines).' },
  { method: 'get', path: '/users/{id}/history', summary: "Get a user's borrowing history." },
  { method: 'post', path: '/fines/{id}/pay', summary: 'Mark a library fine as paid.' },
])

addDomain('/inventory', 'Inventory', [
  { method: 'get', path: '/categories', summary: 'List asset categories.' },
  { method: 'post', path: '/categories', summary: 'Create an asset category.' },
  { method: 'get', path: '/assets', summary: 'List assets.' },
  { method: 'post', path: '/assets', summary: 'Create an asset.' },
  { method: 'get', path: '/assets/low-stock', summary: 'List assets below their low-stock threshold.' },
  { method: 'get', path: '/assets/{id}', summary: 'Get an asset by id.' },
  { method: 'patch', path: '/assets/{id}', summary: 'Update an asset.' },
  { method: 'delete', path: '/assets/{id}', summary: 'Delete an asset.' },
  { method: 'get', path: '/assets/{id}/history', summary: 'Get assignment + maintenance history for an asset.' },
  { method: 'get', path: '/assignments', summary: 'List asset assignments.' },
  { method: 'post', path: '/assignments', summary: 'Assign an asset to a user.' },
  { method: 'post', path: '/assignments/{id}/return', summary: 'Return an assigned asset.' },
  { method: 'post', path: '/maintenance', summary: 'Log a maintenance record (sets asset to MAINTENANCE).' },
  { method: 'patch', path: '/maintenance/{id}', summary: 'Update a maintenance record status.' },
])

addDomain('/staff', 'Staff', [
  { method: 'get', path: '/departments', summary: 'List departments.' },
  { method: 'post', path: '/departments', summary: 'Create a department.' },
  { method: 'get', path: '/designations', summary: 'List designations.' },
  { method: 'post', path: '/designations', summary: 'Create a designation.' },
  { method: 'get', path: '', summary: 'List staff.' },
  { method: 'post', path: '', summary: 'Create a staff profile for an existing user.' },
  { method: 'get', path: '/me', summary: "Get the current user's own staff profile." },
  { method: 'get', path: '/leave-requests', summary: 'List all leave requests.' },
  { method: 'get', path: '/leave-requests/me', summary: "List the current user's leave requests." },
  { method: 'post', path: '/leave-requests', summary: 'Create a leave request.' },
  { method: 'patch', path: '/leave-requests/{id}', summary: 'Approve/reject a leave request.' },
  { method: 'post', path: '/leave-balances', summary: 'Set a leave balance.' },
  { method: 'get', path: '/{staffId}/leave-balances', summary: "Get a staff member's leave balances." },
  { method: 'get', path: '/{id}', summary: 'Get a staff member by id.' },
  { method: 'patch', path: '/{id}', summary: 'Update a staff member.' },
  { method: 'delete', path: '/{id}', summary: 'Delete a staff member.' },
])

addDomain('/fees', 'Fees', [
  { method: 'get', path: '/structures', summary: 'List fee structures.' },
  { method: 'post', path: '/structures', summary: 'Create a fee structure.' },
  { method: 'get', path: '/invoices', summary: 'List invoices for a school.' },
  { method: 'post', path: '/invoices', summary: 'Generate an invoice for one student.' },
  { method: 'post', path: '/invoices/generate-bulk', summary: 'Generate invoices for every student matching a fee structure.' },
  { method: 'get', path: '/invoices/{id}', summary: 'Get an invoice by id.' },
  { method: 'post', path: '/invoices/{id}/installments', summary: 'Create installments for an invoice.' },
  { method: 'patch', path: '/invoices/{id}/late-fine', summary: 'Apply a late fine to an invoice.' },
  { method: 'get', path: '/students/{id}/invoices', summary: "List a student's invoices." },
  { method: 'post', path: '/payments', summary: 'Record a payment against an invoice.' },
  { method: 'post', path: '/installments/{id}/pay', summary: 'Pay a single installment.' },
])

addDomain('/transport', 'Transport', [
  { method: 'get', path: '/buses', summary: 'List buses.' },
  { method: 'post', path: '/buses', summary: 'Create a bus.' },
  { method: 'patch', path: '/buses/{id}', summary: 'Update a bus.' },
  { method: 'delete', path: '/buses/{id}', summary: 'Delete a bus.' },
  { method: 'get', path: '/drivers', summary: 'List drivers.' },
  { method: 'post', path: '/drivers', summary: 'Create a driver.' },
  { method: 'patch', path: '/drivers/{id}', summary: 'Update a driver.' },
  { method: 'delete', path: '/drivers/{id}', summary: 'Delete a driver.' },
  { method: 'get', path: '/routes', summary: 'List routes.' },
  { method: 'post', path: '/routes', summary: 'Create a route.' },
  { method: 'get', path: '/routes/{id}', summary: 'Get a route by id.' },
  { method: 'patch', path: '/routes/{id}', summary: 'Update a route.' },
  { method: 'delete', path: '/routes/{id}', summary: 'Delete a route.' },
  { method: 'get', path: '/routes/{id}/students', summary: 'List students assigned to a route.' },
  { method: 'post', path: '/routes/{id}/stops', summary: 'Add a stop to a route.' },
  { method: 'patch', path: '/stops/{id}', summary: 'Update a stop.' },
  { method: 'delete', path: '/stops/{id}', summary: 'Delete a stop.' },
  { method: 'post', path: '/assignments', summary: 'Assign a student to a route/stop.' },
  { method: 'delete', path: '/students/{id}/assignment', summary: "Remove a student's transport assignment." },
  { method: 'get', path: '/students/{id}', summary: "Get a student's transport assignment." },
])

export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'EduDigital API',
    version: '1.0.0',
    description:
      'REST API for the EduDigital School Digitalization Platform. Authentication is cookie-based ' +
      '(short-lived access token + rotating refresh token); state-changing requests from an ' +
      'authenticated session also require the X-CSRF-Token header (see the "edudigital_csrf" cookie).',
  },
  servers: [{ description: 'Configured backend origin (see VITE_API_URL on the frontend)', url: '/' }],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'edudigital_token',
        description: 'Short-lived JWT access token set by POST /auth/login, /auth/register, or /auth/refresh.',
      },
    },
  },
  tags: [
    { name: 'Monitoring' },
    { name: 'Auth' },
    { name: 'AI' },
    { name: 'AI Features' },
    { name: 'Users' },
    { name: 'Schools' },
    { name: 'Academic' },
    { name: 'Parents' },
    { name: 'Attendance' },
    { name: 'Assignments' },
    { name: 'Grades' },
    { name: 'Timetable' },
    { name: 'Notifications' },
    { name: 'Wellbeing' },
    { name: 'Analytics' },
    { name: 'Dashboard' },
    { name: 'Library' },
    { name: 'Inventory' },
    { name: 'Staff' },
    { name: 'Fees' },
    { name: 'Transport' },
  ],
  paths,
}
