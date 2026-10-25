import fs from 'fs';
import path from 'path';

export type UserRole = 'student' | 'instructor' | 'admin';
export type UserStatus = 'active' | 'suspended';
export type CourseStatus = 'draft' | 'published' | 'archived';
export type CourseDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface Profile {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  bio?: string;
  headline?: string;
  status: UserStatus;
  streak_days: number;
  last_activity_date?: string;
  created_at: string;
  updated_at: string;
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
}

export interface Enrollment {
  id: string;
  student_id: string;
  course_id: string;
  enrolled_at: string;
  completed_at?: string;
  last_accessed_at: string;
}

export interface LessonProgress {
  id: string;
  enrollment_id: string;
  student_id: string;
  lesson_id: string;
  is_completed: boolean;
  completed_at: string;
}

export interface QuizOption {
  id: string;
  text: string;
  is_correct: boolean;
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
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  quiz_title: string;
  student_id: string;
  student_name: string;
  course_id: string;
  score: number;
  total_points: number;
  percentage: number;
  passed: boolean;
  submitted_at: string;
  answers: Record<string, string>;
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

export interface Notification {
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
  target_type: 'USER' | 'COURSE' | 'ROLE' | 'QUIZ';
  target_id: string;
  details: Record<string, unknown>;
  created_at: string;
}

export interface DatabaseSchema {
  profiles: Profile[];
  courses: Course[];
  lessons: Lesson[];
  enrollments: Enrollment[];
  lesson_progress: LessonProgress[];
  quizzes: Quiz[];
  quiz_questions: QuizQuestion[];
  quiz_attempts: QuizAttempt[];
  certificates: Certificate[];
  announcements: Announcement[];
  notifications: Notification[];
  admin_activity_logs: AdminActivityLog[];
}

const DATA_DIR = path.resolve(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

function getInitialSeedData(): DatabaseSchema {
  const studentId = 'usr-student-001';
  const instructorId = 'usr-inst-001';
  const instructor2Id = 'usr-inst-002';
  const adminId = 'usr-admin-001';

  const course1Id = 'crs-react-001';
  const course2Id = 'crs-python-002';
  const course3Id = 'crs-uiux-003';
  const course4Id = 'crs-ai-004';
  const courseDraftId = 'crs-draft-005';

  const profiles: Profile[] = [
    {
      id: studentId,
      email: 'student@learnsphere.io',
      password_hash: 'Student123!', // In secure mock/prod verified
      full_name: 'Alex Rivera',
      role: 'student',
      headline: 'Aspiring Full-Stack Software Engineer',
      bio: 'Enthusiastic developer learning modern React, TypeScript, and AI-driven web architectures.',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces',
      status: 'active',
      streak_days: 5,
      last_activity_date: new Date().toISOString().split('T')[0],
      created_at: '2026-09-01T10:00:00Z',
      updated_at: '2026-10-24T14:30:00Z',
    },
    {
      id: instructorId,
      email: 'instructor@learnsphere.io',
      password_hash: 'Instructor123!',
      full_name: 'Dr. Elena Vance',
      role: 'instructor',
      headline: 'Principal Engineer & Computer Science Educator',
      bio: 'Over 12 years in distributed systems and cloud web platforms. Passionate about hands-on software mastery.',
      avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=faces',
      status: 'active',
      streak_days: 14,
      last_activity_date: new Date().toISOString().split('T')[0],
      created_at: '2026-08-15T09:00:00Z',
      updated_at: '2026-10-24T12:00:00Z',
    },
    {
      id: instructor2Id,
      email: 'sarah@learnsphere.io',
      password_hash: 'Instructor123!',
      full_name: 'Sarah Jenkins',
      role: 'instructor',
      headline: 'Staff Product Designer & UX Strategist',
      bio: 'Design systems lead specializing in accessible interfaces and micro-interactions.',
      avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=faces',
      status: 'active',
      streak_days: 8,
      last_activity_date: new Date().toISOString().split('T')[0],
      created_at: '2026-08-20T09:00:00Z',
      updated_at: '2026-10-20T12:00:00Z',
    },
    {
      id: adminId,
      email: 'admin@learnsphere.io',
      password_hash: 'Admin123!',
      full_name: 'Marcus Chen',
      role: 'admin',
      headline: 'Head of Academic Operations & Platform Security',
      bio: 'Oversees curricula quality, instructor approvals, and institutional trust.',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces',
      status: 'active',
      streak_days: 21,
      last_activity_date: new Date().toISOString().split('T')[0],
      created_at: '2026-07-01T08:00:00Z',
      updated_at: '2026-10-25T08:00:00Z',
    },
  ];

  const courses: Course[] = [
    {
      id: course1Id,
      instructor_id: instructorId,
      instructor_name: 'Dr. Elena Vance',
      title: 'Full-Stack React 19 & TypeScript Architecture',
      slug: 'fullstack-react-typescript-architecture',
      description: 'Master component composition, server actions, custom state hooks, and high-performance frontend patterns using React 19 and strict TypeScript.',
      category: 'Development',
      difficulty: 'Intermediate',
      thumbnail_url: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=80',
      learning_objectives: [
        'Build production-grade applications with React 19 functional patterns',
        'Model strict types for server contracts, props, and compound state',
        'Implement resilient data fetching and optimistic state updates',
        'Deploy verified server-side full stack architecture',
      ],
      prerequisites: ['Basic JavaScript (ES6+)', 'HTML & CSS fundamentals'],
      estimated_duration_hours: 6.5,
      status: 'published',
      rating: 4.9,
      enrollments_count: 142,
      created_at: '2026-09-05T10:00:00Z',
      updated_at: '2026-10-20T11:00:00Z',
    },
    {
      id: course2Id,
      instructor_id: instructorId,
      instructor_name: 'Dr. Elena Vance',
      title: 'Python for Data Analysis & Scientific Computing',
      slug: 'python-data-analysis-scientific-computing',
      description: 'Harness NumPy, Pandas, and Matplotlib to wrangle datasets, discover hidden statistical insights, and generate publication-quality visual models.',
      category: 'Data Science',
      difficulty: 'Beginner',
      thumbnail_url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
      learning_objectives: [
        'Vectorized calculations with high-throughput NumPy arrays',
        'Data cleaning, transformation, and joins in Pandas',
        'Exploratory data analysis and interactive charting',
      ],
      prerequisites: ['No prior programming experience required'],
      estimated_duration_hours: 8.0,
      status: 'published',
      rating: 4.8,
      enrollments_count: 98,
      created_at: '2026-09-12T14:00:00Z',
      updated_at: '2026-10-18T09:00:00Z',
    },
    {
      id: course3Id,
      instructor_id: instructor2Id,
      instructor_name: 'Sarah Jenkins',
      title: 'Design Systems & Enterprise UI/UX Foundations',
      slug: 'design-systems-enterprise-ui-ux',
      description: 'Craft scalable design tokens, WCAG AA compliant color systems, fluid typography, and consistent reusable design patterns across cross-platform products.',
      category: 'Design',
      difficulty: 'Intermediate',
      thumbnail_url: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&auto=format&fit=crop&q=80',
      learning_objectives: [
        'Establish semantic design token hierarchies (color, spacing, elevation)',
        'Ensure 100% WCAG contrast and keyboard accessibility compliance',
        'Bridge developer handoff with crisp component specs',
      ],
      prerequisites: ['Figma or Sketch familiarity'],
      estimated_duration_hours: 5.0,
      status: 'published',
      rating: 4.95,
      enrollments_count: 67,
      created_at: '2026-09-20T08:30:00Z',
      updated_at: '2026-10-15T16:00:00Z',
    },
    {
      id: course4Id,
      instructor_id: instructorId,
      instructor_name: 'Dr. Elena Vance',
      title: 'Building Intelligent AI Agents with LLMs',
      slug: 'building-intelligent-ai-agents-llms',
      description: 'Engineer robust autonomous agents using tool calling, vector search grounding, semantic routing, and structured JSON output pipelines.',
      category: 'AI & Machine Learning',
      difficulty: 'Advanced',
      thumbnail_url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop&q=80',
      learning_objectives: [
        'Configure tool declarations and structured function calling',
        'Implement resilient multi-turn agent conversation loops',
        'Evaluate hallucination rates and guardrail parameters',
      ],
      prerequisites: ['Intermediate TypeScript or Python'],
      estimated_duration_hours: 9.5,
      status: 'published',
      rating: 4.9,
      enrollments_count: 115,
      created_at: '2026-10-01T10:00:00Z',
      updated_at: '2026-10-22T10:00:00Z',
    },
    {
      id: courseDraftId,
      instructor_id: instructorId,
      instructor_name: 'Dr. Elena Vance',
      title: 'Cloud-Native Microservices with Docker & Kubernetes',
      slug: 'cloud-native-microservices-docker-k8s',
      description: 'Work-in-progress curriculum covering container orchestration, service meshes, zero-downtime rolling deploys, and cluster telemetry.',
      category: 'Development',
      difficulty: 'Advanced',
      thumbnail_url: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&auto=format&fit=crop&q=80',
      learning_objectives: [
        'Containerize multi-stage Node/Go services',
        'Deploy Pods, Deployments, and Ingress controllers',
      ],
      prerequisites: ['Linux command line comfort'],
      estimated_duration_hours: 11.0,
      status: 'draft',
      rating: 0,
      enrollments_count: 0,
      created_at: '2026-10-22T15:00:00Z',
      updated_at: '2026-10-24T18:00:00Z',
    },
  ];

  const lessons: Lesson[] = [
    // Course 1 Lessons
    {
      id: 'lsn-react-101',
      course_id: course1Id,
      title: '1. Foundations: React 19 Core Mental Model & JSX Compilation',
      description: 'Learn the architectural shifts in React 19, compiler optimizations, and modern execution paradigms.',
      content: `### Welcome to React 19 Architecture

React 19 introduces automatic memoization through the React Compiler, eliminating excessive \`useMemo\` and \`useCallback\` boilerplate.

#### Core Objectives
- Understand compiler AST transformation
- Analyze why pure component rendering is the cornerstone of reliability
- Explore the elimination of manual memoization handles

\`\`\`tsx
// Pure functional components without manual useMemo wrappers
export function MetricBadge({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1 bg-violet-50 text-violet-700 rounded-full text-xs font-semibold">
      <span>{label}</span>
      <span className="bg-violet-200 px-1.5 py-0.5 rounded-full">{count}</span>
    </div>
  );
}
\`\`\`
`,
      video_url: 'https://www.youtube.com/embed/SqcY0GlETPk',
      duration_minutes: 15,
      order_index: 0,
      attachments: [
        { name: 'React19_Architecture_Cheatsheet.pdf', url: '#', size: '1.4 MB' },
        { name: 'Starter_Boilerplate.zip', url: '#', size: '2.1 MB' },
      ],
      created_at: '2026-09-05T11:00:00Z',
    },
    {
      id: 'lsn-react-102',
      course_id: course1Id,
      title: '2. Strict Typing with Generics, Discriminated Unions & Zod',
      description: 'Master advanced TypeScript patterns to eliminate runtime regressions and type leakages.',
      content: `### Discriminated Unions in Application State

When modeling network states, avoid loose booleans like \`isLoading\` and \`isError\`. Instead, model explicit states with tagged unions:

\`\`\`typescript
type RemoteData<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T; timestamp: number }
  | { status: 'error'; message: string; code: number };
\`\`\`

This guarantees complete type safety when rendering UI branches.
`,
      video_url: 'https://www.youtube.com/embed/b0IZo2Aho9Y',
      duration_minutes: 20,
      order_index: 1,
      attachments: [
        { name: 'TypeScript_Handbook_Extract.pdf', url: '#', size: '890 KB' },
      ],
      created_at: '2026-09-05T12:00:00Z',
    },
    {
      id: 'lsn-react-103',
      course_id: course1Id,
      title: '3. Custom Compound Hooks & State Machines',
      description: 'Build robust interactive state controllers for complex UI widgets.',
      content: `### Compound Component Pattern

By combining Context with sub-components, you provide flexible, ergonomic APIs for consumers:

\`\`\`tsx
<Tabs defaultValue="overview">
  <Tabs.List>
    <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
    <Tabs.Trigger value="reviews">Reviews</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="overview">Course details...</Tabs.Content>
</Tabs>
\`\`\`
`,
      video_url: 'https://www.youtube.com/embed/dpw9NFzb3J8',
      duration_minutes: 25,
      order_index: 2,
      created_at: '2026-09-06T10:00:00Z',
    },
    {
      id: 'lsn-react-104',
      course_id: course1Id,
      title: '4. Production Deployment & Telemetry Checklist',
      description: 'Prepare your full-stack bundle for production edge networks.',
      content: `### Production Readiness Checklist

1. Audit bundle size with \`rollup-plugin-visualizer\`.
2. Configure HTTP Security Headers: Content-Security-Policy, HSTS, and X-Content-Type-Options.
3. Validate client and server environment secrets separation.
4. Establish synthetic uptime monitoring.
`,
      video_url: 'https://www.youtube.com/embed/8aGhZQkoFbQ',
      duration_minutes: 18,
      order_index: 3,
      created_at: '2026-09-07T14:00:00Z',
    },

    // Course 2 Lessons (Python)
    {
      id: 'lsn-py-201',
      course_id: course2Id,
      title: '1. Python Data Ecosystem: Anaconda, Jupyter & Virtual Envs',
      description: 'Setup an isolated scientific Python workspace with modern package management.',
      content: 'Learn to configure conda and uv for lightning-fast scientific package installations.',
      video_url: 'https://www.youtube.com/embed/rfscVS0vtbw',
      duration_minutes: 20,
      order_index: 0,
      created_at: '2026-09-12T15:00:00Z',
    },
    {
      id: 'lsn-py-202',
      course_id: course2Id,
      title: '2. High Performance NumPy Matrices & Broadcasting',
      description: 'Eliminate slow Python for-loops using contiguous C-arrays and vectorized operations.',
      content: 'Master array slicing, matrix dot products, and axis reductions.',
      video_url: 'https://www.youtube.com/embed/QUT1VHiLmmI',
      duration_minutes: 25,
      order_index: 1,
      created_at: '2026-09-12T16:00:00Z',
    },
    {
      id: 'lsn-py-203',
      course_id: course2Id,
      title: '3. Pandas DataFrames: GroupBy, Merging & Time Series',
      description: 'Process gigabytes of tabular logs, fill missing values, and extract temporal patterns.',
      content: 'Techniques for memory-efficient data grouping and custom aggregations.',
      video_url: 'https://www.youtube.com/embed/vmEHCJofslg',
      duration_minutes: 30,
      order_index: 2,
      created_at: '2026-09-13T10:00:00Z',
    },

    // Course 3 Lessons (Design Systems)
    {
      id: 'lsn-ds-301',
      course_id: course3Id,
      title: '1. Semantic Design Tokens: Philosophy & Architecture',
      description: 'Why hex codes in components break at scale: building primitive and semantic token scales.',
      content: 'Learn how multi-brand and dark/light themes rely on abstracted token pointers.',
      video_url: 'https://www.youtube.com/embed/c9Wg6Cb_YlU',
      duration_minutes: 18,
      order_index: 0,
      created_at: '2026-09-20T09:00:00Z',
    },
    {
      id: 'lsn-ds-302',
      course_id: course3Id,
      title: '2. Accessible Component Patterns: Focus Rings & ARIA',
      description: 'Building modals, comboboxes, and dropdowns that pass accessibility audits with zero exceptions.',
      content: 'Master keyboard trapping, aria-expanded, and screen reader announcements.',
      video_url: 'https://www.youtube.com/embed/20SHvU2PKsM',
      duration_minutes: 22,
      order_index: 1,
      created_at: '2026-09-20T10:00:00Z',
    },

    // Course 4 Lessons (AI Agents)
    {
      id: 'lsn-ai-401',
      course_id: course4Id,
      title: '1. Autonomous Agent Architectures & ReAct Loops',
      description: 'Reasoning and Acting (ReAct) flow design: Thought, Action, Observation.',
      content: 'Designing state machines that govern how LLMs decide whether to call tools or respond directly.',
      video_url: 'https://www.youtube.com/embed/sal78ACtGTc',
      duration_minutes: 24,
      order_index: 0,
      created_at: '2026-10-01T11:00:00Z',
    },
    {
      id: 'lsn-ai-402',
      course_id: course4Id,
      title: '2. Structured Tool Declarations & JSON Schema Extraction',
      description: 'Strict schema specification for external APIs and database queries.',
      content: 'Preventing parameter hallucination with declarative Zod and JSON Schema definitions.',
      video_url: 'https://www.youtube.com/embed/9bZkp7q19f0',
      duration_minutes: 28,
      order_index: 1,
      created_at: '2026-10-01T12:00:00Z',
    },
  ];

  // Enrollments
  const enrollments: Enrollment[] = [
    {
      id: 'enr-alex-react',
      student_id: studentId,
      course_id: course1Id,
      enrolled_at: '2026-10-10T09:00:00Z',
      last_accessed_at: '2026-10-24T14:30:00Z',
    },
    {
      id: 'enr-alex-python',
      student_id: studentId,
      course_id: course2Id,
      enrolled_at: '2026-10-18T11:15:00Z',
      last_accessed_at: '2026-10-23T16:00:00Z',
    },
  ];

  // Student Alex Rivera has completed 2 out of 4 lessons for React 19 (50% progress!)
  const lesson_progress: LessonProgress[] = [
    {
      id: 'prg-001',
      enrollment_id: 'enr-alex-react',
      student_id: studentId,
      lesson_id: 'lsn-react-101',
      is_completed: true,
      completed_at: '2026-10-12T10:30:00Z',
    },
    {
      id: 'prg-002',
      enrollment_id: 'enr-alex-react',
      student_id: studentId,
      lesson_id: 'lsn-react-102',
      is_completed: true,
      completed_at: '2026-10-14T11:45:00Z',
    },
  ];

  // Quizzes
  const quiz1Id = 'qz-react-final';
  const quizzes: Quiz[] = [
    {
      id: quiz1Id,
      course_id: course1Id,
      title: 'React 19 Architecture & Patterns Comprehensive Exam',
      description: 'Assess your comprehension of compiler memoization, strict union typing, and compound component patterns.',
      passing_percentage: 75,
      time_limit_minutes: 15,
      created_at: '2026-09-08T09:00:00Z',
    },
    {
      id: 'qz-py-01',
      course_id: course2Id,
      title: 'Python Scientific Computing Midterm',
      description: 'Vectorization, broadcasting rules, and DataFrame aggregation techniques.',
      passing_percentage: 70,
      time_limit_minutes: 20,
      created_at: '2026-09-14T09:00:00Z',
    },
  ];

  const quiz_questions: QuizQuestion[] = [
    {
      id: 'qq-react-1',
      quiz_id: quiz1Id,
      question_text: 'What major optimization does the React 19 Compiler provide out of the box?',
      explanation: 'The React Compiler analyzes code and performs automatic fine-grained memoization without requiring manual useMemo or useCallback hooks.',
      points: 25,
      order_index: 0,
      options: [
        { id: 'opt-r1-a', text: 'It converts JSX directly into WebAssembly binary bytecode', is_correct: false },
        { id: 'opt-r1-b', text: 'It automatically memoizes values and functions, reducing manual useMemo/useCallback boilerplate', is_correct: true },
        { id: 'opt-r1-c', text: 'It forces all components to render on the server exclusively', is_correct: false },
        { id: 'opt-r1-d', text: 'It replaces CSS styles with inline JavaScript objects', is_correct: false },
      ],
    },
    {
      id: 'qq-react-2',
      quiz_id: quiz1Id,
      question_text: 'Why is modeling remote API states as Discriminated Unions superior to multiple boolean flags (isLoading, isError)?',
      explanation: 'Discriminated unions ensure impossible states (such as loading AND error both being true simultaneously) cannot exist at compile time.',
      points: 25,
      order_index: 1,
      options: [
        { id: 'opt-r2-a', text: 'It decreases bundle size by over 50%', is_correct: false },
        { id: 'opt-r2-b', text: 'It eliminates impossible states (e.g. isLoading: true and isError: true simultaneously)', is_correct: true },
        { id: 'opt-r2-c', text: 'It allows bypassing TypeScript compiler checks', is_correct: false },
        { id: 'opt-r2-d', text: 'It makes all API calls execute synchronously', is_correct: false },
      ],
    },
    {
      id: 'qq-react-3',
      quiz_id: quiz1Id,
      question_text: 'Which pattern allows a parent component to implicitly share state with deeply nested child components while providing an intuitive JSX API?',
      explanation: 'The Compound Component pattern (often built with React Context) enables coordinated sub-components like Select and Option.',
      points: 25,
      order_index: 2,
      options: [
        { id: 'opt-r3-a', text: 'The Compound Component Pattern', is_correct: true },
        { id: 'opt-r3-b', text: 'The Singleton Prototype Pattern', is_correct: false },
        { id: 'opt-r3-c', text: 'The Global Window Storage Pattern', is_correct: false },
        { id: 'opt-r3-d', text: 'The Proxy Interceptor Loop', is_correct: false },
      ],
    },
    {
      id: 'qq-react-4',
      quiz_id: quiz1Id,
      question_text: 'Where should progress percentages and quiz scores be calculated in a secure enterprise LMS?',
      explanation: 'All calculations of course progress and quiz grades must be performed server-side to prevent tampering or client spoofing.',
      points: 25,
      order_index: 3,
      options: [
        { id: 'opt-r4-a', text: 'In localStorage in the browser', is_correct: false },
        { id: 'opt-r4-b', text: 'Exclusively on the server backend to guarantee tamper-proof records', is_correct: true },
        { id: 'opt-r4-c', text: 'Inside client CSS variables', is_correct: false },
        { id: 'opt-r4-d', text: 'In URL query parameters', is_correct: false },
      ],
    },
  ];

  const quiz_attempts: QuizAttempt[] = [];

  const certificates: Certificate[] = [
    {
      id: 'crt-demo-001',
      certificate_code: 'LS-2026-REACT-8849',
      student_id: studentId,
      course_id: course1Id,
      student_name: 'Alex Rivera',
      course_title: 'Full-Stack React 19 & TypeScript Architecture',
      instructor_name: 'Dr. Elena Vance',
      issued_at: '2026-10-20T17:00:00Z',
      score_achieved: 100,
    },
  ];

  const announcements: Announcement[] = [
    {
      id: 'ann-001',
      course_id: course1Id,
      course_title: 'Full-Stack React 19 & TypeScript Architecture',
      instructor_id: instructorId,
      instructor_name: 'Dr. Elena Vance',
      title: 'Course Materials & Interactive Sandbox Updated',
      content: 'We have refreshed Lesson 2 with additional code sandboxes for strict generic types. Check out the updated attachments tab!',
      created_at: '2026-10-21T10:00:00Z',
    },
    {
      id: 'ann-002',
      course_id: course2Id,
      course_title: 'Python for Data Analysis & Scientific Computing',
      instructor_id: instructorId,
      instructor_name: 'Dr. Elena Vance',
      title: 'Office Hours & Live Q&A Scheduled',
      content: 'Join our weekly office hours this Thursday at 4:00 PM UTC to discuss vectorized NumPy algorithms and DataFrame performance.',
      created_at: '2026-10-23T15:00:00Z',
    },
  ];

  const notifications: Notification[] = [
    {
      id: 'notif-001',
      user_id: studentId,
      title: 'New Announcement in React 19 Architecture',
      message: 'Dr. Elena Vance posted an update regarding interactive code sandboxes.',
      type: 'course',
      is_read: false,
      link: '/student/my-learning',
      created_at: '2026-10-21T10:05:00Z',
    },
    {
      id: 'notif-002',
      user_id: studentId,
      title: '5-Day Learning Streak Active! 🔥',
      message: 'Great momentum! You have completed lessons 5 days in a row.',
      type: 'system',
      is_read: true,
      link: '/student',
      created_at: '2026-10-24T09:00:00Z',
    },
    {
      id: 'notif-003',
      user_id: instructorId,
      title: 'New Course Enrollment',
      message: 'Alex Rivera enrolled in Python for Data Analysis & Scientific Computing.',
      type: 'course',
      is_read: false,
      link: '/instructor/students',
      created_at: '2026-10-18T11:15:00Z',
    },
  ];

  const admin_activity_logs: AdminActivityLog[] = [
    {
      id: 'log-001',
      admin_id: adminId,
      admin_name: 'Marcus Chen',
      action: 'APPROVE_COURSE',
      target_type: 'COURSE',
      target_id: course1Id,
      details: { title: 'Full-Stack React 19 & TypeScript Architecture', status: 'published' },
      created_at: '2026-09-05T09:30:00Z',
    },
    {
      id: 'log-002',
      admin_id: adminId,
      admin_name: 'Marcus Chen',
      action: 'APPROVE_COURSE',
      target_type: 'COURSE',
      target_id: course4Id,
      details: { title: 'Building Intelligent AI Agents with LLMs', status: 'published' },
      created_at: '2026-10-01T09:45:00Z',
    },
    {
      id: 'log-003',
      admin_id: adminId,
      admin_name: 'Marcus Chen',
      action: 'VERIFY_INSTRUCTOR',
      target_type: 'USER',
      target_id: instructor2Id,
      details: { email: 'sarah@learnsphere.io', verified: true },
      created_at: '2026-08-20T10:00:00Z',
    },
  ];

  return {
    profiles,
    courses,
    lessons,
    enrollments,
    lesson_progress,
    quizzes,
    quiz_questions,
    quiz_attempts,
    certificates,
    announcements,
    notifications,
    admin_activity_logs,
  };
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.warn('[DB] Could not load persisted data from disk, falling back to seed data:', err);
    }

    const initial = getInitialSeedData();
    this.persist(initial);
    return initial;
  }

  private persist(dataToSave?: DatabaseSchema) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave || this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[DB] Persist error:', err);
    }
  }

  public resetToDefault() {
    this.data = getInitialSeedData();
    this.persist();
    return this.data;
  }

  // --- Profiles / Users ---
  public getProfiles(): Profile[] {
    return this.data.profiles;
  }

  public getProfileById(id: string): Profile | undefined {
    return this.data.profiles.find((p) => p.id === id);
  }

  public getProfileByEmail(email: string): Profile | undefined {
    return this.data.profiles.find((p) => p.email.toLowerCase() === email.toLowerCase());
  }

  public createProfile(profile: Profile): Profile {
    this.data.profiles.push(profile);
    this.persist();
    return profile;
  }

  public updateProfile(id: string, updates: Partial<Profile>): Profile | undefined {
    const idx = this.data.profiles.findIndex((p) => p.id === id);
    if (idx === -1) return undefined;
    this.data.profiles[idx] = {
      ...this.data.profiles[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.persist();
    return this.data.profiles[idx];
  }

  // --- Courses ---
  public getCourses(filter?: { category?: string; difficulty?: string; search?: string; status?: CourseStatus }): Course[] {
    let result = [...this.data.courses];

    if (filter?.status) {
      result = result.filter((c) => c.status === filter.status);
    }

    if (filter?.category && filter.category !== 'All') {
      result = result.filter((c) => c.category.toLowerCase() === filter.category!.toLowerCase());
    }

    if (filter?.difficulty && filter.difficulty !== 'All') {
      result = result.filter((c) => c.difficulty.toLowerCase() === filter.difficulty!.toLowerCase());
    }

    if (filter?.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.instructor_name.toLowerCase().includes(q)
      );
    }

    return result;
  }

  public getCourseById(id: string): Course | undefined {
    return this.data.courses.find((c) => c.id === id);
  }

  public createCourse(course: Course): Course {
    this.data.courses.unshift(course);
    this.persist();
    return course;
  }

  public updateCourse(id: string, updates: Partial<Course>): Course | undefined {
    const idx = this.data.courses.findIndex((c) => c.id === id);
    if (idx === -1) return undefined;
    this.data.courses[idx] = {
      ...this.data.courses[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.persist();
    return this.data.courses[idx];
  }

  public deleteCourse(id: string): boolean {
    const beforeLen = this.data.courses.length;
    this.data.courses = this.data.courses.filter((c) => c.id !== id);
    this.data.lessons = this.data.lessons.filter((l) => l.course_id !== id);
    this.data.enrollments = this.data.enrollments.filter((e) => e.course_id !== id);
    this.persist();
    return this.data.courses.length < beforeLen;
  }

  // --- Lessons ---
  public getLessonsByCourseId(courseId: string): Lesson[] {
    return this.data.lessons
      .filter((l) => l.course_id === courseId)
      .sort((a, b) => a.order_index - b.order_index);
  }

  public getLessonById(id: string): Lesson | undefined {
    return this.data.lessons.find((l) => l.id === id);
  }

  public createLesson(lesson: Lesson): Lesson {
    this.data.lessons.push(lesson);
    this.persist();
    return lesson;
  }

  public updateLesson(id: string, updates: Partial<Lesson>): Lesson | undefined {
    const idx = this.data.lessons.findIndex((l) => l.id === id);
    if (idx === -1) return undefined;
    this.data.lessons[idx] = {
      ...this.data.lessons[idx],
      ...updates,
    };
    this.persist();
    return this.data.lessons[idx];
  }

  public deleteLesson(id: string): boolean {
    const beforeLen = this.data.lessons.length;
    this.data.lessons = this.data.lessons.filter((l) => l.id !== id);
    this.data.lesson_progress = this.data.lesson_progress.filter((p) => p.lesson_id !== id);
    this.persist();
    return this.data.lessons.length < beforeLen;
  }

  // --- Enrollments & Progress ---
  public getEnrollment(studentId: string, courseId: string): Enrollment | undefined {
    return this.data.enrollments.find((e) => e.student_id === studentId && e.course_id === courseId);
  }

  public getEnrollmentsByStudent(studentId: string): Enrollment[] {
    return this.data.enrollments.filter((e) => e.student_id === studentId);
  }

  public getEnrollmentsByCourse(courseId: string): Enrollment[] {
    return this.data.enrollments.filter((e) => e.course_id === courseId);
  }

  public createEnrollment(studentId: string, courseId: string): Enrollment {
    const existing = this.getEnrollment(studentId, courseId);
    if (existing) return existing;

    const newEnr: Enrollment = {
      id: `enr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      student_id: studentId,
      course_id: courseId,
      enrolled_at: new Date().toISOString(),
      last_accessed_at: new Date().toISOString(),
    };
    this.data.enrollments.unshift(newEnr);

    // Increment course enrollments count
    const course = this.getCourseById(courseId);
    if (course) {
      course.enrollments_count = (course.enrollments_count || 0) + 1;
    }

    this.persist();
    return newEnr;
  }

  public getLessonProgress(studentId: string, lessonId: string): LessonProgress | undefined {
    return this.data.lesson_progress.find((p) => p.student_id === studentId && p.lesson_id === lessonId);
  }

  public getStudentLessonProgressForCourse(studentId: string, courseId: string): LessonProgress[] {
    const courseLessons = this.getLessonsByCourseId(courseId);
    const lessonIds = new Set(courseLessons.map((l) => l.id));
    return this.data.lesson_progress.filter((p) => p.student_id === studentId && lessonIds.has(p.lesson_id) && p.is_completed);
  }

  public setLessonCompletion(studentId: string, lessonId: string, completed: boolean): { progress: LessonProgress | null; courseProgressPct: number; courseCompleted: boolean } {
    const lesson = this.getLessonById(lessonId);
    if (!lesson) throw new Error('Lesson not found');

    const enrollment = this.getEnrollment(studentId, lesson.course_id);
    if (!enrollment) throw new Error('Student is not enrolled in this course');

    enrollment.last_accessed_at = new Date().toISOString();

    const existingIdx = this.data.lesson_progress.findIndex(
      (p) => p.student_id === studentId && p.lesson_id === lessonId
    );

    let progressObj: LessonProgress | null = null;

    if (completed) {
      if (existingIdx !== -1) {
        this.data.lesson_progress[existingIdx].is_completed = true;
        this.data.lesson_progress[existingIdx].completed_at = new Date().toISOString();
        progressObj = this.data.lesson_progress[existingIdx];
      } else {
        progressObj = {
          id: `prg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          enrollment_id: enrollment.id,
          student_id: studentId,
          lesson_id: lessonId,
          is_completed: true,
          completed_at: new Date().toISOString(),
        };
        this.data.lesson_progress.push(progressObj);
      }
    } else {
      if (existingIdx !== -1) {
        this.data.lesson_progress.splice(existingIdx, 1);
      }
    }

    // Calculate course progress percentage mathematically
    const courseLessons = this.getLessonsByCourseId(lesson.course_id);
    const totalLessons = courseLessons.length;
    const completedProgresses = this.getStudentLessonProgressForCourse(studentId, lesson.course_id);
    const completedCount = completedProgresses.length;

    const courseProgressPct = totalLessons === 0 ? 0 : Math.round((completedCount / totalLessons) * 100);
    const courseCompleted = totalLessons > 0 && completedCount === totalLessons;

    if (courseCompleted && !enrollment.completed_at) {
      enrollment.completed_at = new Date().toISOString();
    } else if (!courseCompleted && enrollment.completed_at) {
      enrollment.completed_at = undefined;
    }

    this.persist();
    return { progress: progressObj, courseProgressPct, courseCompleted };
  }

  // --- Quizzes ---
  public getQuizzesByCourseId(courseId: string): Quiz[] {
    return this.data.quizzes.filter((q) => q.course_id === courseId);
  }

  public getQuizById(id: string): Quiz | undefined {
    return this.data.quizzes.find((q) => q.id === id);
  }

  public createQuiz(quiz: Quiz, questions: QuizQuestion[]): Quiz {
    this.data.quizzes.push(quiz);
    this.data.quiz_questions.push(...questions);
    this.persist();
    return quiz;
  }

  public getQuestionsByQuizId(quizId: string): QuizQuestion[] {
    return this.data.quiz_questions
      .filter((qq) => qq.quiz_id === quizId)
      .sort((a, b) => a.order_index - b.order_index);
  }

  public recordQuizAttempt(attempt: QuizAttempt): QuizAttempt {
    this.data.quiz_attempts.unshift(attempt);
    this.persist();
    return attempt;
  }

  public getAttemptsByStudent(studentId: string): QuizAttempt[] {
    return this.data.quiz_attempts.filter((qa) => qa.student_id === studentId);
  }

  public getAttemptsByCourse(courseId: string): QuizAttempt[] {
    return this.data.quiz_attempts.filter((qa) => qa.course_id === courseId);
  }

  // --- Certificates ---
  public getCertificatesByStudent(studentId: string): Certificate[] {
    return this.data.certificates.filter((c) => c.student_id === studentId);
  }

  public getCertificateByCode(code: string): Certificate | undefined {
    return this.data.certificates.find((c) => c.certificate_code.toUpperCase() === code.toUpperCase());
  }

  public getCertificate(studentId: string, courseId: string): Certificate | undefined {
    return this.data.certificates.find((c) => c.student_id === studentId && c.course_id === courseId);
  }

  public createCertificate(cert: Certificate): Certificate {
    this.data.certificates.unshift(cert);
    this.persist();
    return cert;
  }

  // --- Announcements ---
  public getAnnouncementsByCourseId(courseId: string): Announcement[] {
    return this.data.announcements
      .filter((a) => a.course_id === courseId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public createAnnouncement(announcement: Announcement): Announcement {
    this.data.announcements.unshift(announcement);
    this.persist();
    return announcement;
  }

  // --- Notifications ---
  public getNotificationsByUser(userId: string): Notification[] {
    return this.data.notifications
      .filter((n) => n.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public markNotificationAsRead(id: string, userId: string): boolean {
    const notif = this.data.notifications.find((n) => n.id === id && n.user_id === userId);
    if (!notif) return false;
    notif.is_read = true;
    this.persist();
    return true;
  }

  public createNotification(notif: Notification): Notification {
    this.data.notifications.unshift(notif);
    this.persist();
    return notif;
  }

  // --- Audit Logs ---
  public getAdminActivityLogs(): AdminActivityLog[] {
    return this.data.admin_activity_logs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public logAdminActivity(log: AdminActivityLog): AdminActivityLog {
    this.data.admin_activity_logs.unshift(log);
    this.persist();
    return log;
  }
}

export const db = new Database();
