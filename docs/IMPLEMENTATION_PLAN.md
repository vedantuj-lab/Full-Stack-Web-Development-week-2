# Implementation Plan Document — LearnSphere

## Existing State Inspection
- Empty template with minimal `App.tsx` and dependencies (`express`, `motion`, `lucide-react`).
- Need full-stack setup: `server.ts` with Vite middleware in dev (`npm run dev` with `"dev": "tsx server.ts"`).
- Database: Embedded structured JSON database engine (`src/server/db.ts`) with PostgreSQL schema compatibility, ACID write safety, foreign keys, and seed data covering realistic courses, quizzes, and users.
- Comprehensive REST API endpoints according to `docs/API_CONTRACT.md`.
- Frontend architecture: React Router 7 / modern routes with public views (Landing, Explore Courses, Course Detail, Verify Certificate), Auth modal/pages, Student Dashboard, Instructor Studio, and Admin Command Center.

## Implementation Stages

### Stage 1: Full-Stack Foundation & Database Engine
- Build `src/server/db.ts`: In-memory + disk-synced structured relational store with pre-populated demo users, courses, lessons, quizzes, attempts, and certificates.
- Build Express REST API server in `server.ts` with JWT/session bearer auth, role validation middlewares, and routes matching `docs/API_CONTRACT.md`.
- Mount Vite middlewares for seamless single-port full-stack execution on port 3000.

### Stage 2: Authentication, Role Sessions & Demo Quick-Switcher
- Implement persistent client-side and server-side auth provider (`src/context/AuthContext.tsx`).
- Support standard Registration, Login, Logout, and a Quick-Switch toolbar for testing/recording student, instructor, and admin perspectives instantaneously.

### Stage 3: Public Landing Page & Course Discovery
- Polished Landing Page with hero section, stats, role gateway cards, featured course carousel, and category filters.
- Course Explorer with live search, category filter, difficulty tags, and detail modal with lesson preview.

### Stage 4: Student Learning Journey
- Student Dashboard (`Overview`, `Explore`, `My Learning`, `Assessments`, `Certificates`, `Notifications`).
- Enrollment action with duplicate prevention.
- Interactive Lesson Player: Video player, lesson list sidebar, completion toggle, automatic progress bar update ($progress = \frac{completed}{total} \times 100$).
- Server-side Quiz Runner: timer, multiple choice, instant server scoring, attempt record.
- Certificate Generation & Public Verification: Certificate rendering with confetti celebration, downloadable certificate view, and public `/verify/:code` page.

### Stage 5: Instructor Studio
- Instructor Dashboard (`Overview`, `My Courses`, `Create Course`, `Lessons`, `Quiz Builder`, `Students`, `Announcements`, `Analytics`).
- New Course creation & draft/publish toggle.
- Lesson management: Add, edit, and reorder lessons.
- Quiz Builder: Add questions, configure options and correct keys, set passing threshold.
- Student cohort performance table with progress % and quiz scores.

### Stage 6: Administrator Command Center
- Admin Dashboard (`Overview`, `Users`, `Courses`, `Audit Logs`, `Reports`).
- User Management: Search users, toggle active/suspended status, change roles.
- Course Moderation: View all platform courses, approve/reject/unpublish courses.
- Audit Log feed with timestamped administrative actions.
- Real platform analytics charts using Recharts.

### Stage 7: Polishing, Verification & Demo Readiness
- Toast notifications, error boundaries, responsive drawer for mobile, theme-consistent color schemes (Warm White/Violet for Public, Purple for Student, Emerald for Instructor, Charcoal/Amber for Admin).
- Full automated API test script to verify end-to-end workflows.
