# Database Schema Document — LearnSphere

## 1. Entity Relationship Overview
The database uses a clean relational schema with UUID primary keys, foreign key constraints, timestamps, and status enums.

### Core Tables

#### 1. `profiles`
- `id`: UUID (Primary Key)
- `email`: VARCHAR(255) UNIQUE NOT NULL
- `password_hash`: VARCHAR(255) NOT NULL
- `full_name`: VARCHAR(255) NOT NULL
- `role`: ENUM ('student', 'instructor', 'admin') DEFAULT 'student'
- `avatar_url`: TEXT
- `bio`: TEXT
- `headline`: VARCHAR(255)
- `status`: ENUM ('active', 'suspended') DEFAULT 'active'
- `created_at`: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
- `updated_at`: TIMESTAMP WITH TIME ZONE DEFAULT NOW()

#### 2. `courses`
- `id`: UUID (Primary Key)
- `instructor_id`: UUID REFERENCES profiles(id) ON DELETE CASCADE
- `title`: VARCHAR(255) NOT NULL
- `slug`: VARCHAR(255) UNIQUE NOT NULL
- `description`: TEXT NOT NULL
- `category`: VARCHAR(100) NOT NULL
- `difficulty`: ENUM ('Beginner', 'Intermediate', 'Advanced') DEFAULT 'Beginner'
- `thumbnail_url`: TEXT
- `learning_objectives`: JSONB (Array of strings)
- `prerequisites`: JSONB (Array of strings)
- `estimated_duration_hours`: NUMERIC(4,1) DEFAULT 1.0
- `status`: ENUM ('draft', 'published', 'archived', 'pending_approval') DEFAULT 'draft'
- `created_at`: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
- `updated_at`: TIMESTAMP WITH TIME ZONE DEFAULT NOW()

#### 3. `lessons`
- `id`: UUID (Primary Key)
- `course_id`: UUID REFERENCES courses(id) ON DELETE CASCADE
- `title`: VARCHAR(255) NOT NULL
- `description`: TEXT
- `content`: TEXT
- `video_url`: TEXT
- `duration_minutes`: INTEGER DEFAULT 10
- `order_index`: INTEGER NOT NULL DEFAULT 0
- `attachments`: JSONB (Array of { name, url, size })
- `created_at`: TIMESTAMP WITH TIME ZONE DEFAULT NOW()

#### 4. `enrollments`
- `id`: UUID (Primary Key)
- `student_id`: UUID REFERENCES profiles(id) ON DELETE CASCADE
- `course_id`: UUID REFERENCES courses(id) ON DELETE CASCADE
- `enrolled_at`: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
- `completed_at`: TIMESTAMP WITH TIME ZONE
- `last_accessed_at`: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
- CONSTRAINT unique_student_course UNIQUE (student_id, course_id)

#### 5. `lesson_progress`
- `id`: UUID (Primary Key)
- `enrollment_id`: UUID REFERENCES enrollments(id) ON DELETE CASCADE
- `student_id`: UUID REFERENCES profiles(id) ON DELETE CASCADE
- `lesson_id`: UUID REFERENCES lessons(id) ON DELETE CASCADE
- `is_completed`: BOOLEAN DEFAULT TRUE
- `completed_at`: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
- CONSTRAINT unique_student_lesson UNIQUE (student_id, lesson_id)

#### 6. `quizzes`
- `id`: UUID (Primary Key)
- `course_id`: UUID REFERENCES courses(id) ON DELETE CASCADE
- `title`: VARCHAR(255) NOT NULL
- `description`: TEXT
- `passing_percentage`: INTEGER NOT NULL DEFAULT 70
- `time_limit_minutes`: INTEGER DEFAULT 15
- `created_at`: TIMESTAMP WITH TIME ZONE DEFAULT NOW()

#### 7. `quiz_questions`
- `id`: UUID (Primary Key)
- `quiz_id`: UUID REFERENCES quizzes(id) ON DELETE CASCADE
- `question_text`: TEXT NOT NULL
- `explanation`: TEXT
- `points`: INTEGER DEFAULT 10
- `options`: JSONB (Array of { id, text, is_correct })
- `order_index`: INTEGER DEFAULT 0

#### 8. `quiz_attempts`
- `id`: UUID (Primary Key)
- `quiz_id`: UUID REFERENCES quizzes(id) ON DELETE CASCADE
- `student_id`: UUID REFERENCES profiles(id) ON DELETE CASCADE
- `course_id`: UUID REFERENCES courses(id) ON DELETE CASCADE
- `score`: INTEGER NOT NULL
- `total_points`: INTEGER NOT NULL
- `percentage`: NUMERIC(5,2) NOT NULL
- `passed`: BOOLEAN NOT NULL
- `submitted_at`: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
- `answers`: JSONB

#### 9. `certificates`
- `id`: UUID (Primary Key)
- `certificate_code`: VARCHAR(64) UNIQUE NOT NULL  -- e.g. 'LS-2026-98A1B2'
- `student_id`: UUID REFERENCES profiles(id) ON DELETE CASCADE
- `course_id`: UUID REFERENCES courses(id) ON DELETE CASCADE
- `student_name`: VARCHAR(255) NOT NULL
- `course_title`: VARCHAR(255) NOT NULL
- `instructor_name`: VARCHAR(255) NOT NULL
- `issued_at`: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
- `score_achieved`: NUMERIC(5,2)
- CONSTRAINT unique_cert_student_course UNIQUE (student_id, course_id)

#### 10. `announcements`
- `id`: UUID (Primary Key)
- `course_id`: UUID REFERENCES courses(id) ON DELETE CASCADE
- `instructor_id`: UUID REFERENCES profiles(id) ON DELETE CASCADE
- `title`: VARCHAR(255) NOT NULL
- `content`: TEXT NOT NULL
- `created_at`: TIMESTAMP WITH TIME ZONE DEFAULT NOW()

#### 11. `notifications`
- `id`: UUID (Primary Key)
- `user_id`: UUID REFERENCES profiles(id) ON DELETE CASCADE
- `title`: VARCHAR(255) NOT NULL
- `message`: TEXT NOT NULL
- `type`: ENUM ('course', 'quiz', 'certificate', 'system') DEFAULT 'system'
- `is_read`: BOOLEAN DEFAULT FALSE
- `link`: TEXT
- `created_at`: TIMESTAMP WITH TIME ZONE DEFAULT NOW()

#### 12. `admin_activity_logs`
- `id`: UUID (Primary Key)
- `admin_id`: UUID REFERENCES profiles(id) ON DELETE SET NULL
- `action`: VARCHAR(100) NOT NULL -- 'SUSPEND_USER', 'ACTIVATE_USER', 'APPROVE_COURSE', etc.
- `target_type`: VARCHAR(50) NOT NULL -- 'USER', 'COURSE', 'ROLE'
- `target_id`: VARCHAR(100) NOT NULL
- `details`: JSONB
- `created_at`: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
