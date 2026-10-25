# System Architecture Document — LearnSphere

## 1. High-Level Architecture Overview

LearnSphere employs a full-stack, decoupled-yet-unified web application architecture consisting of:
- **Client Layer**: Single Page Application built on React 19, TypeScript, Tailwind CSS, Vite, and React Router. Implements role-segmented dashboard layouts (Student, Instructor, Admin, and Public).
- **Server Layer**: Express.js REST API server providing unified endpoints under `/api/*`, JWT-based stateless session authorization, server-side payload validation, and static asset serving.
- **Database & Persistence Layer**: Relational schema design with JSON file-backed ACID simulation storage or PostgreSQL/Supabase compatibility. Complete referential integrity, foreign key relations, unique constraints, and initial deterministic seed data for reliable demos and tests.
- **Security Boundary**: Server-side role enforcement middleware (`requireAuth`, `requireRole('instructor')`, `requireRole('admin')`). Critical evaluations such as quiz scoring, lesson completion counts, progress percentages, and certificate eligibility are strictly executed server-side.

```
+---------------------------------------------------------------------------------------+
|                                    LearnSphere UI                                    |
|   +-------------------+  +-------------------+  +-------------------+  +------------+ |
|   |   Public Portal   |  | Student Dashboard |  |Instructor Studio  |  |Admin Portal| |
|   | (Catalog, Verify) |  | (Learn, Quizzes)  |  | (Builder, Cohort) |  | (Users, Log| |
|   +-------------------+  +-------------------+  +-------------------+  +------------+ |
+-------------------------------------------|-------------------------------------------+
                                            | REST API / JSON (Bearer Auth)
                                            v
+---------------------------------------------------------------------------------------+
|                               Express.js API Layer                                    |
|   Middlewares: cors, json, authMiddleware, roleGuard, inputValidation, auditLogger     |
|   Routes: /api/auth, /api/courses, /api/lessons, /api/quizzes, /api/certificates, etc.|
+-------------------------------------------|-------------------------------------------+
                                            | Data Repository / ORM
                                            v
+---------------------------------------------------------------------------------------+
|                               Relational Database Engine                              |
|   Tables: profiles, courses, lessons, enrollments, lesson_progress, quizzes,          |
|           quiz_questions, quiz_attempts, certificates, announcements, notifications,  |
|           audit_logs                                                                  |
+---------------------------------------------------------------------------------------+
```

## 2. Role-Based Color Palette & Design System
To reinforce context clarity across user roles:
- **Landing & Public**: Warm White (`#FAFAF8`), Deep Violet (`#4F46E5`), Vivid Coral accents (`#F43F5E`).
- **Student Dashboard**: Royal Indigo (`#4338CA`), Lavender tints (`#EEF2FF`), Warm Neutrals (`#1F2937`).
- **Instructor Studio**: Forest Emerald (`#059669`), Charcoal (`#111827`), Warm Cream (`#F9FAFB`).
- **Administrator Command**: Obsidian Charcoal (`#0F172A`), Golden Amber (`#D97706`), Neutral Slate (`#475569`).

## 3. Server-authoritative Security Rules
1. **Never Trust Client Role**: The client sends credentials or bearer token; the server loads the trusted profile from the DB.
2. **Never Trust Client Progress/Score**: Quiz submissions send question answers (`{ questionId, selectedOptionId }`); the server looks up correct keys, calculates percentage, verifies pass mark, logs the attempt, and updates certificate qualification.
3. **Course Ownership**: Instructors can only mutate, add lessons to, or archive courses where `instructor_id === req.user.id`. Admins can moderate all courses.
