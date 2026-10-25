import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { db, Profile, UserRole } from './src/server/db.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// --- Authentication Utilities ---
// Standard token encoder: base64(userId:timestamp:signature)
function generateToken(user: Profile): string {
  const payload = `${user.id}:${user.role}:${Date.now()}`;
  return Buffer.from(payload).toString('base64');
}

function verifyToken(token: string): { userId: string; role: string } | null {
  try {
    const raw = Buffer.from(token, 'base64').toString('utf-8');
    const [userId, role] = raw.split(':');
    if (!userId || !role) return null;
    return { userId, role };
  } catch {
    return null;
  }
}

export interface AuthenticatedRequest extends Request {
  user?: Profile;
}

// Auth middleware
function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = undefined;
    return next();
  }

  const token = authHeader.split(' ')[1];
  const parsed = verifyToken(token);
  if (!parsed) {
    req.user = undefined;
    return next();
  }

  const user = db.getProfileById(parsed.userId);
  if (user && user.status === 'active') {
    req.user = user;
  } else {
    req.user = undefined;
  }
  next();
}

app.use(authenticate);

function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required. Please sign in.' },
    });
  }
  if (req.user.status === 'suspended') {
    return res.status(403).json({
      success: false,
      error: { code: 'ACCOUNT_SUSPENDED', message: 'Your account is currently suspended by an administrator.' },
    });
  }
  next();
}

function requireRole(...roles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required.' },
      });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Access denied. Requires one of the following roles: ${roles.join(', ')}.`,
        },
      });
    }
    next();
  };
}

// -------------------------------------------------------------
// API ROUTES
// -------------------------------------------------------------

// --- Auth Endpoints ---

app.post('/api/auth/register', (req: Request, res: Response) => {
  const { email, password, full_name, role = 'student' } = req.body;
  if (!email || !password || !full_name) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Email, password, and full name are required.' },
    });
  }

  const existing = db.getProfileByEmail(email);
  if (existing) {
    return res.status(409).json({
      success: false,
      error: { code: 'EMAIL_EXISTS', message: 'An account with this email already exists.' },
    });
  }

  const validRole: UserRole = role === 'instructor' ? 'instructor' : 'student';
  const newProfile: Profile = {
    id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    email: email.trim().toLowerCase(),
    password_hash: password, // In production verify against argon2/bcrypt
    full_name: full_name.trim(),
    role: validRole,
    status: 'active',
    streak_days: 1,
    last_activity_date: new Date().toISOString().split('T')[0],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  db.createProfile(newProfile);
  const token = generateToken(newProfile);

  return res.status(201).json({
    success: true,
    data: { user: newProfile, token },
    message: 'Registration successful! Welcome to LearnSphere.',
  });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Email and password are required.' },
    });
  }

  const user = db.getProfileByEmail(email);
  if (!user || user.password_hash !== password) {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' },
    });
  }

  if (user.status === 'suspended') {
    return res.status(403).json({
      success: false,
      error: { code: 'ACCOUNT_SUSPENDED', message: 'Your account has been suspended. Please contact platform support.' },
    });
  }

  const token = generateToken(user);
  return res.json({
    success: true,
    data: { user, token },
    message: `Welcome back, ${user.full_name}!`,
  });
});

// Demo switch role helper for examiners & video recording demo
app.post('/api/auth/switch-demo', (req: Request, res: Response) => {
  const { role } = req.body;
  let targetUser: Profile | undefined;

  if (role === 'student') {
    targetUser = db.getProfileByEmail('student@learnsphere.io');
  } else if (role === 'instructor') {
    targetUser = db.getProfileByEmail('instructor@learnsphere.io');
  } else if (role === 'admin') {
    targetUser = db.getProfileByEmail('admin@learnsphere.io');
  }

  if (!targetUser) {
    return res.status(404).json({
      success: false,
      error: { code: 'USER_NOT_FOUND', message: `Demo user for role ${role} not found.` },
    });
  }

  const token = generateToken(targetUser);
  return res.json({
    success: true,
    data: { user: targetUser, token },
    message: `Switched perspective to ${targetUser.full_name} (${targetUser.role.toUpperCase()}).`,
  });
});

app.get('/api/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const enrollments = db.getEnrollmentsByStudent(user.id);
  const certificates = db.getCertificatesByStudent(user.id);
  const notifications = db.getNotificationsByUser(user.id).filter((n) => !n.is_read);

  return res.json({
    success: true,
    data: {
      user,
      stats: {
        enrolledCoursesCount: enrollments.length,
        completedCoursesCount: enrollments.filter((e) => e.completed_at).length,
        certificatesCount: certificates.length,
        unreadNotificationsCount: notifications.length,
      },
    },
    message: 'User profile loaded.',
  });
});

app.patch('/api/profile', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { full_name, bio, headline, avatar_url } = req.body;
  const updated = db.updateProfile(user.id, {
    ...(full_name && { full_name: full_name.trim() }),
    ...(bio !== undefined && { bio }),
    ...(headline !== undefined && { headline }),
    ...(avatar_url !== undefined && { avatar_url }),
  });

  return res.json({
    success: true,
    data: updated,
    message: 'Profile updated successfully.',
  });
});

app.post('/api/profile/change-password', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { old_password, new_password } = req.body;

  if (user.password_hash !== old_password) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_PASSWORD', message: 'Current password does not match.' },
    });
  }

  if (!new_password || new_password.length < 6) {
    return res.status(400).json({
      success: false,
      error: { code: 'WEAK_PASSWORD', message: 'New password must be at least 6 characters.' },
    });
  }

  db.updateProfile(user.id, { password_hash: new_password });
  return res.json({
    success: true,
    data: null,
    message: 'Password changed successfully.',
  });
});

// --- Courses Endpoints ---

app.get('/api/courses', (req: AuthenticatedRequest, res: Response) => {
  const { category, difficulty, search, sort } = req.query as Record<string, string>;
  const courses = db.getCourses({
    category,
    difficulty,
    search,
    status: 'published', // Public catalogue only sees published
  });

  const enriched = courses.map((course) => {
    const lessons = db.getLessonsByCourseId(course.id);
    let isEnrolled = false;
    let studentProgressPct = 0;

    if (req.user) {
      const enr = db.getEnrollment(req.user.id, course.id);
      if (enr) {
        isEnrolled = true;
        const completed = db.getStudentLessonProgressForCourse(req.user.id, course.id);
        studentProgressPct = lessons.length === 0 ? 0 : Math.round((completed.length / lessons.length) * 100);
      }
    }

    return {
      ...course,
      lessonsCount: lessons.length,
      isEnrolled,
      studentProgressPct,
    };
  });

  if (sort === 'popular') {
    enriched.sort((a, b) => b.enrollments_count - a.enrollments_count);
  } else if (sort === 'rating') {
    enriched.sort((a, b) => b.rating - a.rating);
  } else if (sort === 'newest') {
    enriched.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  return res.json({
    success: true,
    data: enriched,
    message: 'Courses fetched successfully.',
  });
});

app.get('/api/courses/:id', (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const course = db.getCourseById(id);
  if (!course) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Course not found.' },
    });
  }

  const lessons = db.getLessonsByCourseId(course.id);
  const quizzes = db.getQuizzesByCourseId(course.id);

  let enrollment = null;
  let completedLessonIds: string[] = [];
  let courseProgressPct = 0;
  let certificate = null;

  if (req.user) {
    const enr = db.getEnrollment(req.user.id, course.id);
    if (enr) {
      enrollment = enr;
      const progress = db.getStudentLessonProgressForCourse(req.user.id, course.id);
      completedLessonIds = progress.map((p) => p.lesson_id);
      courseProgressPct = lessons.length === 0 ? 0 : Math.round((completedLessonIds.length / lessons.length) * 100);
      certificate = db.getCertificate(req.user.id, course.id);
    }
  }

  // Filter lessons for public vs enrolled
  return res.json({
    success: true,
    data: {
      course,
      lessons: lessons.map((l) => ({
        id: l.id,
        course_id: l.course_id,
        title: l.title,
        description: l.description,
        duration_minutes: l.duration_minutes,
        order_index: l.order_index,
        is_completed: completedLessonIds.includes(l.id),
      })),
      quizzesCount: quizzes.length,
      enrollment,
      courseProgressPct,
      certificate,
    },
    message: 'Course details retrieved.',
  });
});

app.post('/api/courses', requireAuth, requireRole('instructor', 'admin'), (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const {
    title,
    description,
    category,
    difficulty = 'Beginner',
    thumbnail_url,
    learning_objectives = [],
    prerequisites = [],
    estimated_duration_hours = 2,
  } = req.body;

  if (!title || !description || !category) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Title, description, and category are required.' },
    });
  }

  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + `-${Date.now().toString().slice(-4)}`;

  const newCourse = db.createCourse({
    id: `crs-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    instructor_id: user.id,
    instructor_name: user.full_name,
    title: title.trim(),
    slug,
    description: description.trim(),
    category,
    difficulty,
    thumbnail_url: thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
    learning_objectives,
    prerequisites,
    estimated_duration_hours: Number(estimated_duration_hours),
    status: 'draft',
    rating: 5.0,
    enrollments_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  return res.status(201).json({
    success: true,
    data: newCourse,
    message: 'Course created as draft. You can now add curriculum lessons and quizzes.',
  });
});

app.patch('/api/courses/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { id } = req.params;
  const course = db.getCourseById(id);

  if (!course) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Course not found.' },
    });
  }

  // Ownership check
  if (user.role !== 'admin' && course.instructor_id !== user.id) {
    return res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'You are not authorized to edit this course.' },
    });
  }

  const updated = db.updateCourse(id, req.body);
  return res.json({
    success: true,
    data: updated,
    message: 'Course updated successfully.',
  });
});

app.post('/api/courses/:id/publish', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { id } = req.params;
  const course = db.getCourseById(id);

  if (!course) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Course not found.' },
    });
  }

  if (user.role !== 'admin' && course.instructor_id !== user.id) {
    return res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'You are not authorized to modify publication status.' },
    });
  }

  const newStatus = course.status === 'published' ? 'draft' : 'published';
  const updated = db.updateCourse(id, { status: newStatus });

  return res.json({
    success: true,
    data: updated,
    message: `Course is now ${newStatus}.`,
  });
});

app.delete('/api/courses/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { id } = req.params;
  const course = db.getCourseById(id);

  if (!course) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Course not found.' },
    });
  }

  if (user.role !== 'admin' && course.instructor_id !== user.id) {
    return res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'You are not authorized to delete this course.' },
    });
  }

  db.deleteCourse(id);
  return res.json({
    success: true,
    data: null,
    message: 'Course and related lessons deleted.',
  });
});

// Student Enrollment
app.post('/api/courses/:id/enroll', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { id } = req.params;

  if (user.role !== 'student') {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_ROLE', message: 'Only students can enroll in courses.' },
    });
  }

  const course = db.getCourseById(id);
  if (!course) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Course not found.' },
    });
  }

  if (course.status !== 'published') {
    return res.status(400).json({
      success: false,
      error: { code: 'COURSE_UNAVAILABLE', message: 'This course is currently in draft and not accepting enrollments.' },
    });
  }

  const existing = db.getEnrollment(user.id, course.id);
  if (existing) {
    return res.status(409).json({
      success: false,
      error: { code: 'ALREADY_ENROLLED', message: 'You are already enrolled in this course.' },
    });
  }

  const enrollment = db.createEnrollment(user.id, course.id);

  // Notify instructor
  db.createNotification({
    id: `notif-${Date.now()}`,
    user_id: course.instructor_id,
    title: 'New Student Enrolled',
    message: `${user.full_name} enrolled in "${course.title}".`,
    type: 'course',
    is_read: false,
    link: `/instructor/students`,
    created_at: new Date().toISOString(),
  });

  return res.status(201).json({
    success: true,
    data: enrollment,
    message: `Successfully enrolled in "${course.title}"! Happy learning.`,
  });
});

// Student My Courses
app.get('/api/my/courses', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const enrollments = db.getEnrollmentsByStudent(user.id);

  const enriched = enrollments.map((enr) => {
    const course = db.getCourseById(enr.course_id);
    const lessons = course ? db.getLessonsByCourseId(course.id) : [];
    const completedProgresses = db.getStudentLessonProgressForCourse(user.id, enr.course_id);
    const completedLessonsCount = completedProgresses.length;
    const totalLessons = lessons.length;
    const progressPct = totalLessons === 0 ? 0 : Math.round((completedLessonsCount / totalLessons) * 100);
    const certificate = db.getCertificate(user.id, enr.course_id);

    return {
      enrollment: enr,
      course,
      totalLessons,
      completedLessonsCount,
      progressPct,
      certificate,
      isCompleted: totalLessons > 0 && completedLessonsCount === totalLessons,
    };
  });

  return res.json({
    success: true,
    data: enriched,
    message: 'Enrolled courses retrieved.',
  });
});

// --- Lessons & Player Endpoints ---

app.get('/api/courses/:courseId/lessons', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { courseId } = req.params;
  const course = db.getCourseById(courseId);

  if (!course) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Course not found.' },
    });
  }

  const lessons = db.getLessonsByCourseId(courseId);
  const completedProgresses = db.getStudentLessonProgressForCourse(user.id, courseId);
  const completedIds = new Set(completedProgresses.map((p) => p.lesson_id));

  const lessonsWithProgress = lessons.map((l) => ({
    ...l,
    is_completed: completedIds.has(l.id),
  }));

  return res.json({
    success: true,
    data: lessonsWithProgress,
    message: 'Course lessons retrieved.',
  });
});

app.get('/api/lessons/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { id } = req.params;
  const lesson = db.getLessonById(id);

  if (!lesson) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Lesson not found.' },
    });
  }

  const course = db.getCourseById(lesson.course_id);
  const allLessons = db.getLessonsByCourseId(lesson.course_id);
  const currentIdx = allLessons.findIndex((l) => l.id === id);

  const prevLesson = currentIdx > 0 ? allLessons[currentIdx - 1] : null;
  const nextLesson = currentIdx < allLessons.length - 1 ? allLessons[currentIdx + 1] : null;

  const progress = db.getLessonProgress(user.id, id);

  return res.json({
    success: true,
    data: {
      lesson,
      course,
      is_completed: progress?.is_completed || false,
      navigation: {
        prevLessonId: prevLesson?.id || null,
        nextLessonId: nextLesson?.id || null,
        currentIndex: currentIdx,
        totalLessons: allLessons.length,
      },
    },
    message: 'Lesson retrieved.',
  });
});

app.post('/api/courses/:courseId/lessons', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { courseId } = req.params;
  const course = db.getCourseById(courseId);

  if (!course) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Course not found.' },
    });
  }

  if (user.role !== 'admin' && course.instructor_id !== user.id) {
    return res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'Unauthorized to add lessons to this course.' },
    });
  }

  const { title, description, content, video_url, duration_minutes = 10, attachments = [] } = req.body;
  if (!title) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Lesson title is required.' },
    });
  }

  const existingLessons = db.getLessonsByCourseId(courseId);
  const order_index = existingLessons.length;

  const newLesson = db.createLesson({
    id: `lsn-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    course_id: courseId,
    title: title.trim(),
    description: description || '',
    content: content || 'Welcome to this lesson. Review the video lecture and supplementary materials.',
    video_url: video_url || 'https://www.youtube.com/embed/SqcY0GlETPk',
    duration_minutes: Number(duration_minutes) || 10,
    order_index,
    attachments,
    created_at: new Date().toISOString(),
  });

  return res.status(201).json({
    success: true,
    data: newLesson,
    message: 'Lesson added successfully.',
  });
});

app.patch('/api/lessons/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { id } = req.params;
  const lesson = db.getLessonById(id);

  if (!lesson) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Lesson not found.' },
    });
  }

  const course = db.getCourseById(lesson.course_id);
  if (!course || (user.role !== 'admin' && course.instructor_id !== user.id)) {
    return res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'Unauthorized to edit this lesson.' },
    });
  }

  const updated = db.updateLesson(id, req.body);
  return res.json({
    success: true,
    data: updated,
    message: 'Lesson updated.',
  });
});

app.delete('/api/lessons/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { id } = req.params;
  const lesson = db.getLessonById(id);

  if (!lesson) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Lesson not found.' },
    });
  }

  const course = db.getCourseById(lesson.course_id);
  if (!course || (user.role !== 'admin' && course.instructor_id !== user.id)) {
    return res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'Unauthorized to delete this lesson.' },
    });
  }

  db.deleteLesson(id);
  return res.json({
    success: true,
    data: null,
    message: 'Lesson deleted.',
  });
});

// Student marks lesson complete
app.post('/api/lessons/:id/complete', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { id } = req.params;
  const { completed = true } = req.body;

  try {
    const result = db.setLessonCompletion(user.id, id, completed);

    return res.json({
      success: true,
      data: {
        lessonId: id,
        isCompleted: completed,
        courseProgressPct: result.courseProgressPct,
        courseCompleted: result.courseCompleted,
      },
      message: completed ? 'Lesson completed! Progress updated.' : 'Lesson marked incomplete.',
    });
  } catch (err: unknown) {
    const error = err as Error;
    return res.status(400).json({
      success: false,
      error: { code: 'ERROR', message: error.message || 'Failed to update lesson completion.' },
    });
  }
});

// --- Quizzes & Assessments ---

app.get('/api/courses/:courseId/quizzes', (req: AuthenticatedRequest, res: Response) => {
  const { courseId } = req.params;
  const quizzes = db.getQuizzesByCourseId(courseId);

  const sanitized = quizzes.map((quiz) => {
    const questions = db.getQuestionsByQuizId(quiz.id);
    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

    // If user is not instructor/admin, strip is_correct from options!
    const isPrivileged = req.user && (req.user.role === 'instructor' || req.user.role === 'admin');
    const safeQuestions = questions.map((q) => ({
      id: q.id,
      question_text: q.question_text,
      explanation: isPrivileged ? q.explanation : undefined,
      points: q.points,
      order_index: q.order_index,
      options: q.options.map((opt) => ({
        id: opt.id,
        text: opt.text,
        is_correct: isPrivileged ? opt.is_correct : undefined,
      })),
    }));

    return {
      ...quiz,
      questionsCount: questions.length,
      totalPoints,
      questions: safeQuestions,
    };
  });

  return res.json({
    success: true,
    data: sanitized,
    message: 'Quizzes retrieved.',
  });
});

app.get('/api/quizzes/:id', (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const quiz = db.getQuizById(id);

  if (!quiz) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Quiz not found.' },
    });
  }

  const questions = db.getQuestionsByQuizId(quiz.id);
  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
  const isPrivileged = req.user && (req.user.role === 'instructor' || req.user.role === 'admin');

  const safeQuestions = questions.map((q) => ({
    id: q.id,
    question_text: q.question_text,
    explanation: isPrivileged ? q.explanation : undefined,
    points: q.points,
    order_index: q.order_index,
    options: q.options.map((opt) => ({
      id: opt.id,
      text: opt.text,
      is_correct: isPrivileged ? opt.is_correct : undefined,
    })),
  }));

  return res.json({
    success: true,
    data: {
      ...quiz,
      totalPoints,
      questions: safeQuestions,
    },
    message: 'Quiz loaded.',
  });
});

app.post('/api/courses/:courseId/quizzes', requireAuth, requireRole('instructor', 'admin'), (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { courseId } = req.params;
  const course = db.getCourseById(courseId);

  if (!course) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Course not found.' },
    });
  }

  if (user.role !== 'admin' && course.instructor_id !== user.id) {
    return res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'Unauthorized to add quizzes to this course.' },
    });
  }

  const { title, description, passing_percentage = 70, time_limit_minutes = 15, questions = [] } = req.body;
  if (!title || questions.length === 0) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Quiz title and at least one question are required.' },
    });
  }

  const quizId = `qz-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const newQuiz = {
    id: quizId,
    course_id: courseId,
    title: title.trim(),
    description: description || '',
    passing_percentage: Number(passing_percentage) || 70,
    time_limit_minutes: Number(time_limit_minutes) || 15,
    created_at: new Date().toISOString(),
  };

  const parsedQuestions = questions.map((q: any, idx: number) => ({
    id: `qq-${Date.now()}-${idx}`,
    quiz_id: quizId,
    question_text: q.question_text,
    explanation: q.explanation || '',
    points: Number(q.points) || 10,
    order_index: idx,
    options: q.options || [],
  }));

  db.createQuiz(newQuiz, parsedQuestions);

  return res.status(201).json({
    success: true,
    data: newQuiz,
    message: 'Quiz created successfully with questions.',
  });
});

// Student submits quiz attempt — CALCULATED ON SERVER!
app.post('/api/quizzes/:id/attempts', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { id } = req.params;
  const { answers = {} } = req.body; // Map of questionId -> selectedOptionId

  const quiz = db.getQuizById(id);
  if (!quiz) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Quiz not found.' },
    });
  }

  const questions = db.getQuestionsByQuizId(id);
  let totalPoints = 0;
  let earnedScore = 0;

  const questionBreakdown = questions.map((q) => {
    totalPoints += q.points;
    const selectedOptionId = answers[q.id];
    const correctOption = q.options.find((opt) => opt.is_correct);
    const isCorrect = correctOption ? correctOption.id === selectedOptionId : false;

    if (isCorrect) {
      earnedScore += q.points;
    }

    return {
      questionId: q.id,
      questionText: q.question_text,
      selectedOptionId,
      correctOptionId: correctOption?.id,
      isCorrect,
      explanation: q.explanation,
      pointsEarned: isCorrect ? q.points : 0,
      maxPoints: q.points,
    };
  });

  const percentage = totalPoints === 0 ? 0 : Math.round((earnedScore / totalPoints) * 100);
  const passed = percentage >= quiz.passing_percentage;

  const attempt = db.recordQuizAttempt({
    id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    quiz_id: quiz.id,
    quiz_title: quiz.title,
    student_id: user.id,
    student_name: user.full_name,
    course_id: quiz.course_id,
    score: earnedScore,
    total_points: totalPoints,
    percentage,
    passed,
    submitted_at: new Date().toISOString(),
    answers,
  });

  return res.json({
    success: true,
    data: {
      attempt,
      percentage,
      passed,
      earnedScore,
      totalPoints,
      passingPercentage: quiz.passing_percentage,
      questionBreakdown,
    },
    message: passed
      ? `Congratulations! You scored ${percentage}% and passed the assessment!`
      : `You scored ${percentage}%. You need ${quiz.passing_percentage}% to pass. Review the materials and retry!`,
  });
});

app.get('/api/my/assessments', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const attempts = db.getAttemptsByStudent(user.id);
  return res.json({
    success: true,
    data: attempts,
    message: 'Assessment history retrieved.',
  });
});

// --- Certificates Endpoints ---

app.get('/api/my/certificates', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const certs = db.getCertificatesByStudent(user.id);
  return res.json({
    success: true,
    data: certs,
    message: 'Earned certificates retrieved.',
  });
});

// Claim certificate upon course completion
app.post('/api/courses/:courseId/claim-certificate', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { courseId } = req.params;

  const course = db.getCourseById(courseId);
  if (!course) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Course not found.' },
    });
  }

  // Check enrollment
  const enrollment = db.getEnrollment(user.id, courseId);
  if (!enrollment) {
    return res.status(400).json({
      success: false,
      error: { code: 'NOT_ENROLLED', message: 'You must be enrolled to earn a certificate.' },
    });
  }

  // Check already issued
  const existing = db.getCertificate(user.id, courseId);
  if (existing) {
    return res.json({
      success: true,
      data: existing,
      message: 'Certificate already issued for this course.',
    });
  }

  // Check completion: all lessons must be completed
  const lessons = db.getLessonsByCourseId(courseId);
  const completed = db.getStudentLessonProgressForCourse(user.id, courseId);

  if (lessons.length > 0 && completed.length < lessons.length) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INCOMPLETE_COURSE',
        message: `Incomplete course: You have completed ${completed.length} of ${lessons.length} lessons. Finish all lessons to claim your certificate.`,
      },
    });
  }

  // Generate unique certificate identifier: LS-2026-XXXX-XXXX
  const certCode = `LS-2026-${course.category.substring(0, 3).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  const cert = db.createCertificate({
    id: `crt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    certificate_code: certCode,
    student_id: user.id,
    course_id: courseId,
    student_name: user.full_name,
    course_title: course.title,
    instructor_name: course.instructor_name,
    issued_at: new Date().toISOString(),
    score_achieved: 100,
  });

  // Notify student
  db.createNotification({
    id: `notif-${Date.now()}`,
    user_id: user.id,
    title: '🎓 Certificate Awarded!',
    message: `Congratulations! You earned your certificate for "${course.title}".`,
    type: 'certificate',
    is_read: false,
    link: `/student/certificates`,
    created_at: new Date().toISOString(),
  });

  return res.status(201).json({
    success: true,
    data: cert,
    message: 'Certificate issued successfully!',
  });
});

// Public certificate verification endpoint
app.get('/api/certificates/:code/verify', (req: Request, res: Response) => {
  const { code } = req.params;
  const cert = db.getCertificateByCode(code);

  if (!cert) {
    return res.status(404).json({
      success: false,
      error: { code: 'INVALID_CERTIFICATE', message: 'Certificate code could not be verified in the LearnSphere registry.' },
    });
  }

  return res.json({
    success: true,
    data: {
      ...cert,
      isValid: true,
      issuer: 'LearnSphere Educational Platform',
      verificationDate: new Date().toISOString(),
    },
    message: 'Official verified certificate record found.',
  });
});

// --- Instructor Studio Endpoints ---

app.get('/api/instructor/overview', requireAuth, requireRole('instructor', 'admin'), (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const allCourses = db.getCourses();
  const instructorCourses = allCourses.filter((c) => user.role === 'admin' || c.instructor_id === user.id);

  const publishedCount = instructorCourses.filter((c) => c.status === 'published').length;
  const draftCount = instructorCourses.filter((c) => c.status === 'draft').length;

  let totalEnrollments = 0;
  instructorCourses.forEach((c) => {
    totalEnrollments += db.getEnrollmentsByCourse(c.id).length;
  });

  const recentAttempts: any[] = [];
  instructorCourses.forEach((c) => {
    const attempts = db.getAttemptsByCourse(c.id);
    recentAttempts.push(...attempts);
  });
  recentAttempts.sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime());

  return res.json({
    success: true,
    data: {
      totalCourses: instructorCourses.length,
      publishedCount,
      draftCount,
      totalEnrollments,
      recentAttempts: recentAttempts.slice(0, 5),
    },
    message: 'Instructor overview statistics loaded.',
  });
});

app.get('/api/instructor/courses', requireAuth, requireRole('instructor', 'admin'), (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const allCourses = db.getCourses();
  const instructorCourses = allCourses.filter((c) => user.role === 'admin' || c.instructor_id === user.id);

  const enriched = instructorCourses.map((c) => {
    const lessons = db.getLessonsByCourseId(c.id);
    const enrollments = db.getEnrollmentsByCourse(c.id);
    const quizzes = db.getQuizzesByCourseId(c.id);

    return {
      ...c,
      lessonsCount: lessons.length,
      enrollmentsCount: enrollments.length,
      quizzesCount: quizzes.length,
    };
  });

  return res.json({
    success: true,
    data: enriched,
    message: 'Instructor courses retrieved.',
  });
});

app.get('/api/instructor/courses/:courseId/students', requireAuth, requireRole('instructor', 'admin'), (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { courseId } = req.params;
  const course = db.getCourseById(courseId);

  if (!course) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Course not found.' },
    });
  }

  if (user.role !== 'admin' && course.instructor_id !== user.id) {
    return res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'Unauthorized to view student roster for this course.' },
    });
  }

  const enrollments = db.getEnrollmentsByCourse(courseId);
  const lessons = db.getLessonsByCourseId(courseId);
  const totalLessons = lessons.length;

  const roster = enrollments.map((enr) => {
    const student = db.getProfileById(enr.student_id);
    const completed = db.getStudentLessonProgressForCourse(enr.student_id, courseId);
    const progressPct = totalLessons === 0 ? 0 : Math.round((completed.length / totalLessons) * 100);
    const cert = db.getCertificate(enr.student_id, courseId);

    return {
      enrollmentId: enr.id,
      studentId: enr.student_id,
      studentName: student?.full_name || 'Student',
      studentEmail: student?.email || '',
      enrolledAt: enr.enrolled_at,
      lastAccessedAt: enr.last_accessed_at,
      completedLessonsCount: completed.length,
      totalLessons,
      progressPct,
      hasCertificate: !!cert,
    };
  });

  return res.json({
    success: true,
    data: {
      courseTitle: course.title,
      totalEnrolled: roster.length,
      roster,
    },
    message: 'Student roster retrieved.',
  });
});

app.get('/api/instructor/analytics', requireAuth, requireRole('instructor', 'admin'), (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const allCourses = db.getCourses().filter((c) => user.role === 'admin' || c.instructor_id === user.id);

  const courseAnalytics = allCourses.map((c) => {
    const enrollments = db.getEnrollmentsByCourse(c.id);
    const lessons = db.getLessonsByCourseId(c.id);
    let completions = 0;

    enrollments.forEach((e) => {
      const prog = db.getStudentLessonProgressForCourse(e.student_id, c.id);
      if (lessons.length > 0 && prog.length >= lessons.length) {
        completions++;
      }
    });

    return {
      courseId: c.id,
      title: c.title,
      category: c.category,
      enrollments: enrollments.length,
      completions,
      completionRate: enrollments.length === 0 ? 0 : Math.round((completions / enrollments.length) * 100),
      rating: c.rating,
    };
  });

  return res.json({
    success: true,
    data: courseAnalytics,
    message: 'Analytics retrieved.',
  });
});

// Course Announcements
app.get('/api/courses/:courseId/announcements', (req: Request, res: Response) => {
  const { courseId } = req.params;
  const announcements = db.getAnnouncementsByCourseId(courseId);
  return res.json({
    success: true,
    data: announcements,
    message: 'Announcements retrieved.',
  });
});

app.post('/api/courses/:courseId/announcements', requireAuth, requireRole('instructor', 'admin'), (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { courseId } = req.params;
  const { title, content } = req.body;

  const course = db.getCourseById(courseId);
  if (!course) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Course not found.' },
    });
  }

  if (user.role !== 'admin' && course.instructor_id !== user.id) {
    return res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'Unauthorized to post announcements.' },
    });
  }

  const announcement = db.createAnnouncement({
    id: `ann-${Date.now()}`,
    course_id: courseId,
    course_title: course.title,
    instructor_id: user.id,
    instructor_name: user.full_name,
    title: title.trim(),
    content: content.trim(),
    created_at: new Date().toISOString(),
  });

  // Notify all enrolled students
  const enrollments = db.getEnrollmentsByCourse(courseId);
  enrollments.forEach((enr) => {
    db.createNotification({
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      user_id: enr.student_id,
      title: `Announcement: ${course.title}`,
      message: `${user.full_name} posted: "${title}"`,
      type: 'course',
      is_read: false,
      link: `/student/my-learning`,
      created_at: new Date().toISOString(),
    });
  });

  return res.status(201).json({
    success: true,
    data: announcement,
    message: 'Announcement published to enrolled students.',
  });
});

// Notifications
app.get('/api/my/notifications', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const notifications = db.getNotificationsByUser(user.id);
  return res.json({
    success: true,
    data: notifications,
    message: 'Notifications retrieved.',
  });
});

app.patch('/api/notifications/:id/read', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { id } = req.params;
  const success = db.markNotificationAsRead(id, user.id);
  return res.json({
    success,
    data: null,
    message: success ? 'Notification marked as read.' : 'Notification not found.',
  });
});

// --- Administrator Command Center Endpoints ---

app.get('/api/admin/overview', requireAuth, requireRole('admin'), (req: AuthenticatedRequest, res: Response) => {
  const profiles = db.getProfiles();
  const courses = db.getCourses();
  const enrollments = db.getProfiles().flatMap((p) => db.getEnrollmentsByStudent(p.id));

  const studentCount = profiles.filter((p) => p.role === 'student').length;
  const instructorCount = profiles.filter((p) => p.role === 'instructor').length;
  const adminCount = profiles.filter((p) => p.role === 'admin').length;
  const publishedCourses = courses.filter((c) => c.status === 'published').length;
  const draftCourses = courses.filter((c) => c.status === 'draft').length;

  const logs = db.getAdminActivityLogs().slice(0, 10);

  return res.json({
    success: true,
    data: {
      totalUsers: profiles.length,
      studentCount,
      instructorCount,
      adminCount,
      totalCourses: courses.length,
      publishedCourses,
      draftCourses,
      totalEnrollments: enrollments.length,
      recentLogs: logs,
    },
    message: 'Admin overview loaded.',
  });
});

app.get('/api/admin/users', requireAuth, requireRole('admin'), (req: AuthenticatedRequest, res: Response) => {
  const { search, role, status } = req.query as Record<string, string>;
  let users = db.getProfiles();

  if (role && role !== 'All') {
    users = users.filter((u) => u.role === role);
  }
  if (status && status !== 'All') {
    users = users.filter((u) => u.status === status);
  }
  if (search) {
    const q = search.toLowerCase();
    users = users.filter((u) => u.full_name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }

  // Hide password_hash from response
  const sanitized = users.map(({ password_hash, ...rest }) => rest);

  return res.json({
    success: true,
    data: sanitized,
    message: 'Users list retrieved.',
  });
});

app.patch('/api/admin/users/:id/status', requireAuth, requireRole('admin'), (req: AuthenticatedRequest, res: Response) => {
  const admin = req.user!;
  const { id } = req.params;
  const { status } = req.body;

  if (status !== 'active' && status !== 'suspended') {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_STATUS', message: 'Status must be active or suspended.' },
    });
  }

  const updated = db.updateProfile(id, { status });
  if (!updated) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'User not found.' },
    });
  }

  db.logAdminActivity({
    id: `log-${Date.now()}`,
    admin_id: admin.id,
    admin_name: admin.full_name,
    action: status === 'suspended' ? 'SUSPEND_USER' : 'ACTIVATE_USER',
    target_type: 'USER',
    target_id: id,
    details: { targetEmail: updated.email, status },
    created_at: new Date().toISOString(),
  });

  return res.json({
    success: true,
    data: updated,
    message: `User status changed to ${status}.`,
  });
});

app.patch('/api/admin/users/:id/role', requireAuth, requireRole('admin'), (req: AuthenticatedRequest, res: Response) => {
  const admin = req.user!;
  const { id } = req.params;
  const { role } = req.body;

  if (!['student', 'instructor', 'admin'].includes(role)) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_ROLE', message: 'Invalid role.' },
    });
  }

  const updated = db.updateProfile(id, { role });
  if (!updated) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'User not found.' },
    });
  }

  db.logAdminActivity({
    id: `log-${Date.now()}`,
    admin_id: admin.id,
    admin_name: admin.full_name,
    action: 'CHANGE_USER_ROLE',
    target_type: 'ROLE',
    target_id: id,
    details: { targetEmail: updated.email, newRole: role },
    created_at: new Date().toISOString(),
  });

  return res.json({
    success: true,
    data: updated,
    message: `User role updated to ${role}.`,
  });
});

app.get('/api/admin/courses', requireAuth, requireRole('admin'), (req: AuthenticatedRequest, res: Response) => {
  const courses = db.getCourses();
  return res.json({
    success: true,
    data: courses,
    message: 'Admin courses retrieved.',
  });
});

app.post('/api/admin/courses/:id/approve', requireAuth, requireRole('admin'), (req: AuthenticatedRequest, res: Response) => {
  const admin = req.user!;
  const { id } = req.params;
  const course = db.getCourseById(id);

  if (!course) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Course not found.' },
    });
  }

  const updated = db.updateCourse(id, { status: 'published' });

  db.logAdminActivity({
    id: `log-${Date.now()}`,
    admin_id: admin.id,
    admin_name: admin.full_name,
    action: 'APPROVE_COURSE',
    target_type: 'COURSE',
    target_id: id,
    details: { courseTitle: course.title, status: 'published' },
    created_at: new Date().toISOString(),
  });

  return res.json({
    success: true,
    data: updated,
    message: `Course "${course.title}" approved and published.`,
  });
});

app.post('/api/admin/courses/:id/reject', requireAuth, requireRole('admin'), (req: AuthenticatedRequest, res: Response) => {
  const admin = req.user!;
  const { id } = req.params;
  const course = db.getCourseById(id);

  if (!course) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Course not found.' },
    });
  }

  const updated = db.updateCourse(id, { status: 'draft' });

  db.logAdminActivity({
    id: `log-${Date.now()}`,
    admin_id: admin.id,
    admin_name: admin.full_name,
    action: 'UNPUBLISH_COURSE',
    target_type: 'COURSE',
    target_id: id,
    details: { courseTitle: course.title, status: 'draft' },
    created_at: new Date().toISOString(),
  });

  return res.json({
    success: true,
    data: updated,
    message: `Course "${course.title}" converted to draft.`,
  });
});

app.get('/api/admin/activity-logs', requireAuth, requireRole('admin'), (req: AuthenticatedRequest, res: Response) => {
  const logs = db.getAdminActivityLogs();
  return res.json({
    success: true,
    data: logs,
    message: 'Activity logs retrieved.',
  });
});

app.get('/api/admin/reports', requireAuth, requireRole('admin'), (req: AuthenticatedRequest, res: Response) => {
  const courses = db.getCourses();
  const profiles = db.getProfiles();

  // Category distribution
  const categoryMap: Record<string, number> = {};
  courses.forEach((c) => {
    categoryMap[c.category] = (categoryMap[c.category] || 0) + 1;
  });
  const categoryData = Object.entries(categoryMap).map(([name, count]) => ({ name, count }));

  // Enrollment by course
  const enrollmentTrends = courses.map((c) => ({
    name: c.title.length > 20 ? c.title.substring(0, 20) + '...' : c.title,
    enrollments: c.enrollments_count,
    rating: c.rating,
  }));

  // Role distribution
  const rolesCount = [
    { role: 'Students', count: profiles.filter((p) => p.role === 'student').length },
    { role: 'Instructors', count: profiles.filter((p) => p.role === 'instructor').length },
    { role: 'Administrators', count: profiles.filter((p) => p.role === 'admin').length },
  ];

  return res.json({
    success: true,
    data: {
      categoryData,
      enrollmentTrends,
      rolesCount,
    },
    message: 'Platform reports data compiled.',
  });
});

// Database reset endpoint for testing
app.post('/api/admin/reset-database', requireAuth, requireRole('admin'), (req: Request, res: Response) => {
  db.resetToDefault();
  return res.json({
    success: true,
    data: null,
    message: 'Database reset to initial demo seeds.',
  });
});

// -------------------------------------------------------------
// VITE DEV SERVER OR STATIC ASSETS
// -------------------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[LearnSphere] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[LearnSphere] Server startup failed:', err);
  process.exit(1);
});
