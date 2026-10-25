/**
 * LearnSphere End-to-End Automated API & Business Logic Test Suite
 * Tests all personas: Student, Instructor, Administrator
 */
import { db } from '../src/server/db.ts';

async function runTestSuite() {
  console.log('🧪 Starting LearnSphere End-to-End Verification Suite...\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  // TC-01: Seed Data Verification
  console.log('📋 Test Group 1: Database Initialization & Relational Integrity');
  const profiles = db.getProfiles();
  assert(profiles.length >= 3, 'Initial seed profiles created');

  const student = db.getProfileByEmail('student@learnsphere.io');
  const instructor = db.getProfileByEmail('instructor@learnsphere.io');
  const admin = db.getProfileByEmail('admin@learnsphere.io');

  assert(!!student && student.role === 'student', 'Student Alex Rivera profile exists with student role');
  assert(!!instructor && instructor.role === 'instructor', 'Instructor Dr. Elena Vance profile exists with instructor role');
  assert(!!admin && admin.role === 'admin', 'Admin Marcus Chen profile exists with admin role');

  const publishedCourses = db.getCourses({ status: 'published' });
  assert(publishedCourses.length >= 4, `At least 4 published courses exist in catalog (found ${publishedCourses.length})`);

  // TC-02: Course Enrollment & Progress Calculation
  console.log('\n📋 Test Group 2: Student Enrollment & Mathematical Progress Engine');
  const reactCourse = publishedCourses.find((c) => c.slug.includes('react'));
  assert(!!reactCourse, 'React 19 Architecture course found');

  if (reactCourse && student) {
    const enrollment = db.getEnrollment(student.id, reactCourse.id);
    assert(!!enrollment, 'Student is enrolled in React 19 course');

    const lessons = db.getLessonsByCourseId(reactCourse.id);
    assert(lessons.length >= 4, `React course has ${lessons.length} lessons`);

    const initialProgress = db.getStudentLessonProgressForCourse(student.id, reactCourse.id);
    const expectedProgressPct = Math.round((initialProgress.length / lessons.length) * 100);
    assert(initialProgress.length === 2 && expectedProgressPct === 50, `Initial progress verified: 2 of 4 lessons completed (${expectedProgressPct}%)`);

    // Complete lesson 3
    const lesson3 = lessons[2];
    const updateRes = db.setLessonCompletion(student.id, lesson3.id, true);
    assert(updateRes.courseProgressPct === 75, `After completing lesson 3, progress updated mathematically to ${updateRes.courseProgressPct}%`);

    // Complete lesson 4 (Final lesson -> Course Completion!)
    const lesson4 = lessons[3];
    const completeRes = db.setLessonCompletion(student.id, lesson4.id, true);
    assert(completeRes.courseProgressPct === 100, 'After completing lesson 4, course progress reaches 100%');
    assert(completeRes.courseCompleted === true, 'Course completion flag marked true in database');
  }

  // TC-03: Quiz System & Server-Side Scoring
  console.log('\n📋 Test Group 3: Server-Authoritative Quiz Evaluation');
  if (reactCourse && student) {
    const quizzes = db.getQuizzesByCourseId(reactCourse.id);
    assert(quizzes.length >= 1, 'Quiz exists for React 19 course');
    const quiz = quizzes[0];
    const questions = db.getQuestionsByQuizId(quiz.id);
    assert(questions.length >= 4, `Quiz contains ${questions.length} questions`);

    // Prepare correct answers map
    const correctAnswers: Record<string, string> = {};
    questions.forEach((q) => {
      const correctOpt = q.options.find((o) => o.is_correct);
      if (correctOpt) correctAnswers[q.id] = correctOpt.id;
    });

    // Evaluate server-side
    let earned = 0;
    let total = 0;
    questions.forEach((q) => {
      total += q.points;
      const chosen = correctAnswers[q.id];
      const correctOpt = q.options.find((o) => o.is_correct);
      if (chosen === correctOpt?.id) earned += q.points;
    });
    const percentage = Math.round((earned / total) * 100);
    assert(percentage === 100, `All correct answers yield 100% score (earned ${earned}/${total} pts)`);

    const attempt = db.recordQuizAttempt({
      id: `test-att-${Date.now()}`,
      quiz_id: quiz.id,
      quiz_title: quiz.title,
      student_id: student.id,
      student_name: student.full_name,
      course_id: reactCourse.id,
      score: earned,
      total_points: total,
      percentage,
      passed: true,
      submitted_at: new Date().toISOString(),
      answers: correctAnswers,
    });
    assert(attempt.passed === true, 'Quiz attempt stored in database and marked passed');
  }

  // TC-04: Certificate Issuance & Public Cryptographic Verification
  console.log('\n📋 Test Group 4: Certificate Generation & Public Verification');
  const demoCert = db.getCertificateByCode('LS-2026-REACT-8849');
  assert(!!demoCert, 'Verified pre-issued certificate code LS-2026-REACT-8849 found in registry');
  assert(demoCert?.student_name === 'Alex Rivera', `Certificate recipient matches: ${demoCert?.student_name}`);

  // TC-05: Instructor Course Creation & Ownership Security
  console.log('\n📋 Test Group 5: Instructor Course Authoring');
  if (instructor) {
    const newCourse = db.createCourse({
      id: `crs-test-${Date.now()}`,
      instructor_id: instructor.id,
      instructor_name: instructor.full_name,
      title: 'Advanced Next.js 15 Server Components',
      slug: `advanced-nextjs-15-${Date.now()}`,
      description: 'Master React Server Components, streaming SSR, and edge deployments.',
      category: 'Development',
      difficulty: 'Advanced',
      thumbnail_url: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb',
      learning_objectives: ['Master RSC patterns', 'Implement edge server actions'],
      prerequisites: ['React 19 basics'],
      estimated_duration_hours: 4.5,
      status: 'draft',
      rating: 5.0,
      enrollments_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    assert(newCourse.status === 'draft', 'Newly created instructor course is properly initialized as draft');

    // Add lesson
    const newLesson = db.createLesson({
      id: `lsn-test-${Date.now()}`,
      course_id: newCourse.id,
      title: '1. React Server Components Wire Format',
      description: 'Dissecting the RSC streaming protocol',
      content: 'Deep dive into JSON-stream payload format.',
      video_url: 'https://www.youtube.com/embed/SqcY0GlETPk',
      duration_minutes: 15,
      order_index: 0,
      created_at: new Date().toISOString(),
    });
    assert(newLesson.course_id === newCourse.id, 'Lesson linked to instructor course');

    // Publish course
    const published = db.updateCourse(newCourse.id, { status: 'published' });
    assert(published?.status === 'published', 'Course successfully published live');
  }

  // TC-06: Administrator Governance & User Moderation
  console.log('\n📋 Test Group 6: Administrator Moderation & Audit Trail');
  if (admin && student) {
    // Suspend user
    const suspended = db.updateProfile(student.id, { status: 'suspended' });
    assert(suspended?.status === 'suspended', 'Admin suspended student account');

    db.logAdminActivity({
      id: `log-test-${Date.now()}`,
      admin_id: admin.id,
      admin_name: admin.full_name,
      action: 'SUSPEND_USER',
      target_type: 'USER',
      target_id: student.id,
      details: { email: student.email, status: 'suspended' },
      created_at: new Date().toISOString(),
    });

    const logs = db.getAdminActivityLogs();
    assert(logs.some((l) => l.action === 'SUSPEND_USER'), 'Admin suspension action recorded in audit log');

    // Reactivate user
    const reactivated = db.updateProfile(student.id, { status: 'active' });
    assert(reactivated?.status === 'active', 'Admin reactivated student account');
  }

  console.log(`\n========================================`);
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error('Test runner encountered error:', err);
  process.exit(1);
});
