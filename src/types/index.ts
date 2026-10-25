export type UserRole = 'student' | 'instructor' | 'admin';
export type UserStatus = 'active' | 'suspended';
export type CourseStatus = 'draft' | 'published' | 'archived';
export type CourseDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  bio?: string;
  headline?: string;
  status: UserStatus;
  streak_days: number;
  last_activity_date?: string;
  created_at: string;
}

export interface Course {
  id: string;
  instructor_id: string;
  instructor_name: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  difficulty: CourseDifficulty;
  thumbnail_url: string;
  learning_objectives: string[];
  prerequisites: string[];
  estimated_duration_hours: number;
  status: CourseStatus;
  rating: number;
  enrollments_count: number;
  created_at: string;
  updated_at: string;
  lessonsCount?: number;
  isEnrolled?: boolean;
  studentProgressPct?: number;
}

export interface LessonAttachment {
  name: string;
  url: string;
  size: string;
}

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  description: string;
  content: string;
  video_url: string;
  duration_minutes: number;
  order_index: number;
  attachments?: LessonAttachment[];
  created_at: string;
  is_completed?: boolean;
}

export interface Enrollment {
  id: string;
  student_id: string;
  course_id: string;
  enrolled_at: string;
  completed_at?: string;
  last_accessed_at: string;
}

export interface QuizOption {
  id: string;
  text: string;
  is_correct?: boolean;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question_text: string;
  explanation?: string;
  points: number;
  options: QuizOption[];
  order_index: number;
}

export interface Quiz {
  id: string;
  course_id: string;
  title: string;
  description: string;
  passing_percentage: number;
  time_limit_minutes: number;
  created_at: string;
  questionsCount?: number;
  totalPoints?: number;
  questions?: QuizQuestion[];
}

export interface QuestionBreakdown {
  questionId: string;
  questionText: string;
  selectedOptionId?: string;
  correctOptionId?: string;
  isCorrect: boolean;
  explanation?: string;
  pointsEarned: number;
  maxPoints: number;
}

export interface QuizAttemptResult {
  attempt: {
    id: string;
    quiz_id: string;
    quiz_title: string;
    score: number;
    total_points: number;
    percentage: number;
    passed: boolean;
    submitted_at: string;
  };
  percentage: number;
  passed: boolean;
  earnedScore: number;
  totalPoints: number;
  passingPercentage: number;
  questionBreakdown: QuestionBreakdown[];
}

export interface Certificate {
  id: string;
  certificate_code: string;
  student_id: string;
  course_id: string;
  student_name: string;
  course_title: string;
  instructor_name: string;
  issued_at: string;
  score_achieved: number;
}

export interface Announcement {
  id: string;
  course_id: string;
  course_title: string;
  instructor_id: string;
  instructor_name: string;
  title: string;
  content: string;
  created_at: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'course' | 'quiz' | 'certificate' | 'system';
  is_read: boolean;
  link?: string;
  created_at: string;
}

export interface AdminActivityLog {
  id: string;
  admin_id: string;
  admin_name: string;
  action: string;
  target_type: string;
  target_id: string;
  details: Record<string, any>;
  created_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  error?: {
    code: string;
    message: string;
  };
}
