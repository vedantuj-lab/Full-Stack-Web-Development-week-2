# Test Plan Document — LearnSphere

## 1. Scope & Strategy
The testing suite verifies all functional requirements from `docs/PRD.md` and API contracts from `docs/API_CONTRACT.md` across three levels:
1. **Backend Integration & Unit Tests**: Automated script executing real HTTP requests to verify Authentication, Authorization, Course Enrollment, Lesson Completion, Quiz Scoring, Certificate Issuance, and Admin Moderation.
2. **Frontend Component & Role-Routing Tests**: Validating protected routes, role gates, form validation, and reactive UI updates.
3. **End-to-End Persona Verification**: Simulating real student, instructor, and admin journeys.

---

## 2. Test Cases Matrix

| Test ID | Persona | Action / Flow | Expected Result |
|---|---|---|---|
| TC-AUTH-01 | Guest | Register new student account | Returns 201, user stored in DB, token issued |
| TC-AUTH-02 | User | Login with invalid password | Returns 401 with descriptive error message |
| TC-AUTH-03 | Suspended | Login with suspended account | Returns 403 `ACCOUNT_SUSPENDED` |
| TC-ROLE-01 | Student | Attempt to access `/admin` or `/api/admin/*` | Returns 403 Forbidden |
| TC-ROLE-02 | Instructor | Attempt to edit another instructor's course | Returns 403 Forbidden |
| TC-STUDENT-01 | Student | Enroll in a published course | Enrollment record created in DB |
| TC-STUDENT-02 | Student | Attempt duplicate enrollment | Handled gracefully with conflict notice |
| TC-STUDENT-03 | Student | Complete a lesson | DB records progress; course progress % increases mathematically |
| TC-STUDENT-04 | Student | Complete final lesson & pass quiz | Course completed, certificate issued with unique `LS-` code |
| TC-QUIZ-01 | Student | Submit quiz answers | Answers evaluated on server; returns score and pass/fail |
| TC-CERT-01 | Public | Verify certificate code on `/verify/:code` | Returns student name, course, issue date, and valid seal |
| TC-INST-01 | Instructor | Create new draft course | Created with status `draft`, visible in instructor studio |
| TC-INST-02 | Instructor | Add lessons to owned course | Lessons stored in database with sequential ordering |
| TC-INST-03 | Instructor | Publish course | Course status transitions to `published`, visible in catalog |
| TC-INST-04 | Instructor | View student performance table | Displays only students enrolled in instructor's courses |
| TC-ADMIN-01 | Admin | View platform analytics | Real aggregates queried from database |
| TC-ADMIN-02 | Admin | Suspend a student account | Target account status set to `suspended`, audit log recorded |
| TC-ADMIN-03 | Admin | Moderate course (approve / unpublish) | Course status updated, audit log saved |
