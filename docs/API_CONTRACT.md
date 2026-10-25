# API Contract Document — LearnSphere

## 1. Response Standard Format
All REST endpoints adhere strictly to the following envelopes:

### Success Response:
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

### Error Response:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR | UNAUTHORIZED | FORBIDDEN | NOT_FOUND | CONFLICT",
    "message": "Descriptive human-readable error"
  }
}
```

---

## 2. Authentication & Profile Endpoints
- `POST /api/auth/register` — Body: `{ email, password, full_name, role? }`. Returns user profile & token.
- `POST /api/auth/login` — Body: `{ email, password }`. Returns user profile & token.
- `POST /api/auth/logout` — Destroys session / token cookie.
- `POST /api/auth/switch-demo` — Body: `{ role: 'student' | 'instructor' | 'admin' }`. Facilitates instantaneous 1-click test role login for examiners & demo recording without losing database state!
- `GET /api/me` — Returns authenticated profile with active enrollments & stats.
- `PATCH /api/profile` — Body: `{ full_name?, bio?, headline?, avatar_url? }`. Updates profile info.
- `POST /api/profile/change-password` — Body: `{ old_password, new_password }`.

---

## 3. Course Endpoints
- `GET /api/courses` — Query: `?category=&difficulty=&search=&sort=`. Returns published courses with lesson counts & instructor details.
- `GET /api/courses/:id` — Returns course details, public curriculum preview, and student enrollment status if logged in.
- `POST /api/courses` (Instructor/Admin) — Body: course metadata. Creates new draft course.
- `PATCH /api/courses/:id` (Instructor owner/Admin) — Updates course metadata.
- `POST /api/courses/:id/publish` (Instructor owner/Admin) — Toggles published/draft state.
- `POST /api/courses/:id/enroll` (Student) — Authenticated student enrolls in a published course. Checks duplicates.
- `GET /api/my/courses` (Student) — Returns student's enrolled courses with dynamic progress % and completed lesson count.

---

## 4. Lessons & Progress Endpoints
- `GET /api/courses/:courseId/lessons` — Returns full lesson list. If student, includes completion flags.
- `POST /api/courses/:courseId/lessons` (Instructor owner/Admin) — Adds a new lesson.
- `PATCH /api/lessons/:id` (Instructor owner/Admin) — Updates title, content, video_url, duration, attachments.
- `DELETE /api/lessons/:id` (Instructor owner/Admin) — Deletes a lesson.
- `POST /api/lessons/:id/complete` (Student) — Marks/unmarks lesson completed. Recalculates course progress % server-side. Checks if course is 100% completed and eligible for certificate!

---

## 5. Assessments & Quizzes Endpoints
- `GET /api/courses/:courseId/quizzes` — Returns quizzes for course. Correct answer keys are STRIPPED for students!
- `POST /api/courses/:courseId/quizzes` (Instructor/Admin) — Creates quiz with questions, options, point weights, and correct answers.
- `GET /api/quizzes/:id` — Detailed quiz with questions (without correct keys).
- `POST /api/quizzes/:id/attempts` (Student) — Body: `{ answers: { [questionId]: selectedOptionId } }`. Evaluates answers server-side, calculates percentage and pass/fail, saves attempt record, and returns detailed score breakdown.
- `GET /api/my/assessments` (Student) — Returns all student's quiz attempts.

---

## 6. Certificates Endpoints
- `GET /api/my/certificates` (Student) — Lists earned certificates.
- `POST /api/courses/:courseId/claim-certificate` (Student) — Verifies all course lessons are completed and any required quiz passed. Issues unique certificate code.
- `GET /api/certificates/:code/verify` (Public) — Returns verified certificate details for any public verification check.

---

## 7. Instructor Studio Endpoints
- `GET /api/instructor/overview` — Course counts (draft vs published), total students enrolled, recent activities.
- `GET /api/instructor/courses` — Instructor's courses with enrollment stats.
- `GET /api/instructor/courses/:courseId/students` — Cohort roster with progress % and quiz scores.
- `GET /api/instructor/analytics` — Enrollment distributions and completion metrics.
- `POST /api/courses/:courseId/announcements` — Post course announcement.

---

## 8. Administrator Endpoints
- `GET /api/admin/overview` — Platform KPIs: total users, students, instructors, courses, completions.
- `GET /api/admin/users` — Search/filter users.
- `PATCH /api/admin/users/:id/status` — Suspend or reactivate user accounts.
- `PATCH /api/admin/users/:id/role` — Update user role (e.g. promote to instructor or admin).
- `GET /api/admin/courses` — All courses with status filters.
- `POST /api/admin/courses/:id/approve` — Approve pending course.
- `POST /api/admin/courses/:id/reject` — Reject/unpublish course.
- `GET /api/admin/activity-logs` — Audit log timeline.
- `GET /api/admin/reports` — Platform trends & metrics data.
