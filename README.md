# LearnSphere — Full-Stack Online Learning Management Platform

> *"Learn Smarter. Track Progress. Achieve More."*

LearnSphere is a full-stack, enterprise-grade Online Learning Management Platform built on React 19, TypeScript, Tailwind CSS, Node.js, Express, and a relational schema engine.

---

## 🌟 Key Personas & Features

### 🎓 1. Student Portal
- **Course Discovery**: Live catalog search, category filters (`Development`, `Data Science`, `Design`, `AI & Machine Learning`), difficulty pills (`Beginner`, `Intermediate`, `Advanced`), and sorting.
- **Course Enrollment**: Server-enforced single active enrollment, duplicate prevention.
- **Interactive Lesson Player**: Video lectures, markdown lesson notes, code snippets, downloadable project materials, and previous/next curriculum navigation.
- **Mathematical Progress Engine**: Calculated strictly on the server ($Progress = \frac{\text{Completed Lessons}}{\text{Total Lessons}} \times 100\%$).
- **Server-Graded Quizzes**: Multi-question assessments with time limits. Correct answer keys are held on the server to prevent tampering.
- **Cryptographic Certificates**: Once 100% of lessons are completed, students unlock verified certificates with permanent unique identifiers (e.g., `LS-2026-REACT-8849`).
- **Learning Streaks**: Daily streak counter to encourage consistent learning habits.

### 💼 2. Instructor Studio
- **Curriculum Authoring**: Full course creation workflow with metadata, descriptions, prerequisites, and learning objectives.
- **Lifecycle Management**: Save drafts, preview live courses, and toggle between `draft` and `published` states.
- **Lesson Management**: Add, update, and order video lessons, attachments, and lecture notes.
- **Quiz Builder**: Build multiple-choice assessments, assign point weights, define correct options, configure passing thresholds, and write answer explanations.
- **Cohort Roster**: Review enrolled students, track real-time progress percentages, and monitor quiz scores.
- **Broadcast Announcements**: Send instant course announcements to all enrolled students.

### 🛡️ 3. Administrator Command Center
- **Platform Health & KPIs**: Real-time counts for users, instructors, students, published courses, and platform completions.
- **Identity & Access Governance**: Search accounts, toggle account suspension (`active` vs `suspended`), and promote user roles.
- **Course Moderation**: Review all submitted curricula, approve published courses, or move courses back to draft for revisions.
- **Audit Activity Logs**: Immutable chronological record of administrative actions (suspensions, role changes, course approvals).
- **Interactive Reports**: Visual charts powered by Recharts for category distributions and enrollment volume.

---

## 🚀 Quick Demo Accounts (1-Click Switcher)

LearnSphere includes a **Live Demo Navigator** bar at the top of the interface allowing instant perspective switching:

| Role | Name | Email | Password | Pre-loaded State |
|---|---|---|---|---|
| **Student** | Alex Rivera | `student@learnsphere.io` | `Student123!` | Enrolled in 2 courses (React 19 & Python); 50% completed; pre-issued certificate |
| **Instructor** | Dr. Elena Vance | `instructor@learnsphere.io` | `Instructor123!` | 3 published courses, 1 draft course; enrolled student cohorts |
| **Administrator** | Marcus Chen | `admin@learnsphere.io` | `Admin123!` | Platform oversight, user suspension controls, course moderation |

---

## 📹 Video Recording Guide (2:45 – 3:00 Timeline)

| Time | Screen / Feature | What to Demonstrate & Explain |
|---|---|---|
| **0:00 – 0:15** | Landing Page | Introduce the problem (fragmented tools) and LearnSphere's unified solution. |
| **0:15 – 0:30** | Course Catalogue | Show course discovery, search bar, category pills, and difficulty filters. |
| **0:30 – 0:50** | Student Dashboard | Show enrolled courses, active learning streak (5 days), and progress bars. |
| **0:50 – 1:15** | Lesson Player | Play a video lecture, toggle "Mark as Complete", show progress incrementing to 100%. |
| **1:15 – 1:35** | Quiz Assessment | Complete a multiple-choice quiz, submit, and display server-calculated score and breakdown. |
| **1:35 – 1:50** | Verified Certificate | Open certificate modal, show unique cryptographic code (`LS-2026-REACT-8849`), and test public verification on `/verify`. |
| **1:50 – 2:10** | Instructor Studio | Switch to Instructor, show Course Management, Draft/Publish toggle, and Student Cohort roster. |
| **2:10 – 2:30** | Administrator Command | Switch to Admin, demonstrate user suspension/reactivation and course moderation. |
| **2:30 – 2:45** | Architecture & Integrity | Highlight server-authoritative progress, role guards, and audit trail. |
| **2:45 – 3:00** | Closing Screen | Display project tagline, live URL, and GitHub repository. |

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React 19, TypeScript, Tailwind CSS, React Router, Lucide React, Recharts, Canvas-Confetti.
- **Backend**: Node.js, Express REST API, server-side payload validation, role authorization guards.
- **Persistence**: Relational schema engine with file-persisted JSON database (`.data/db.json`), ACID writes, referential integrity, and seed data.
- **Security**: Stateless Bearer token authentication, server-calculated grades and progress, zero client credential leakage.

---

## 🧪 Testing Instructions

Run the end-to-end test suite to verify database integrity, progress math, quiz scoring, and admin controls:

\`\`\`bash
# Run automated test suite (24 assertions across 6 test groups)
npx tsx scripts/test-e2e.ts

# Run production build check
npm run build

# Run linter
npm run lint
\`\`\`
