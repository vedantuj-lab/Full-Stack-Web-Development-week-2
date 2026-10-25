# Product Requirements Document (PRD) — LearnSphere

## 1. Executive Summary
**LearnSphere** is a full-stack, enterprise-grade Online Learning Management Platform (LMS) designed with the tagline: *"Learn Smarter. Track Progress. Achieve More."*

LearnSphere delivers three distinct, secure, and cohesive role-tailored workflows:
1. **Student Experience**: Discover published courses, enroll, stream video lessons, mark progress, take server-evaluated quizzes, earn cryptographically verified certificates, track learning streaks, and receive notifications.
2. **Instructor Studio**: Create and edit courses, structure curriculum modules/lessons with video and attachments, design quizzes with passing marks, manage publication state (draft/published), publish announcements, and review real-time enrolled student performance.
3. **Administrator Command Center**: Platform-wide monitoring, user management with role controls and account suspension/reactivation, course moderation (approve/reject/archive), system activity audit logs, and analytics.

---

## 2. Key Personas & Core Workflows

### 2.1 Student
- **Workflow**: Discover Course -> Register / Login -> Enroll -> Learn & Complete Lessons -> Submit Assessment -> Track Progress -> Complete Course -> Earn & Verify Certificate.
- **Pain Points Solved**: Fragmented learning tools, lost lesson progress, lack of verifiable credentials.

### 2.2 Instructor
- **Workflow**: Apply / Sign in -> Create Course (Draft) -> Add Lessons & Materials -> Build Quizzes with server-held keys -> Publish Course -> Monitor Student Cohorts & Grades.
- **Pain Points Solved**: Complicated course authoring tools, lack of ownership verification, difficult quiz creation.

### 2.3 Administrator
- **Workflow**: Sign in with administrative privileges -> Platform health overview -> Audit user accounts (suspend/activate) -> Moderate submitted courses -> Review compliance logs.
- **Pain Points Solved**: Absence of platform auditability, unauthorized privilege escalations, content moderation bottlenecks.

---

## 3. Functional Requirements
- **FR-1 Authentication & RBAC**: Secure credential auth, role validation (`student`, `instructor`, `admin`), account status check (`active`, `suspended`), protected client & server routes.
- **FR-2 Course Discovery & Catalog**: Search by keyword/instructor, filter by category (`Development`, `Design`, `Data Science`, `Business`, `AI & Machine Learning`), filter by difficulty (`Beginner`, `Intermediate`, `Advanced`), sort options.
- **FR-3 Student Enrollment & Progress Engine**: Server-enforced single active enrollment, mathematical progress calculation ($Progress \% = \frac{\text{Completed Lessons}}{\text{Total Lessons}} \times 100$), streak tracking.
- **FR-4 Interactive Lesson Player**: Video lesson rendering, lesson notes, attachments, previous/next lesson navigation, toggle completion status with instantaneous server synchronization.
- **FR-5 Server-Side Quizzes & Assessments**: Server-side grade calculation (answers never leaked to client prior to submission), minimum passing score threshold, attempt history logging.
- **FR-6 Cryptographically Identifiable Certificates**: Unique identifier generation (`LS-CERT-[UUID]`), printable/downloadable format, public verification endpoint.
- **FR-7 Instructor Course & Curriculum Builder**: Multi-step course creation, drag/reorder lessons, rich lesson content editor, quiz creator with point weights.
- **FR-8 Administrative Control & Audit Logging**: Audit log for administrative actions (suspensions, moderations), user listing with search and status toggles, platform KPI summaries.
- **FR-9 Notifications & Announcements**: Course-wide instructor announcements broadcast to enrolled students, system notifications for achievements and certificate unlocks.
