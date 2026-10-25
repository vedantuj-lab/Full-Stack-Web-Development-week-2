import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { QuickDemoBar } from './components/common/QuickDemoBar';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { AuthModal } from './components/common/AuthModal';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { CourseCatalogPage } from './pages/public/CourseCatalogPage';
import { CourseDetailPage } from './pages/public/CourseDetailPage';
import { VerifyCertificatePage } from './pages/public/VerifyCertificatePage';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { LessonPlayerPage } from './pages/student/LessonPlayerPage';
import { QuizPlayerPage } from './pages/student/QuizPlayerPage';
import { CertificatesPage } from './pages/student/CertificatesPage';

// Instructor Pages
import { InstructorDashboard } from './pages/instructor/InstructorDashboard';
import { InstructorCoursesPage } from './pages/instructor/InstructorCoursesPage';
import { CurriculumManagerPage } from './pages/instructor/CurriculumManagerPage';
import { QuizBuilderPage } from './pages/instructor/QuizBuilderPage';
import { StudentRosterPage } from './pages/instructor/StudentRosterPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminModerationPage } from './pages/admin/AdminModerationPage';
import { AdminActivityLogsPage } from './pages/admin/AdminActivityLogsPage';
import { AdminReportsPage } from './pages/admin/AdminReportsPage';

// Common
import { ProfilePage } from './pages/common/ProfilePage';
import { UserRole } from './types';

// Protected Route Guard
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  onOpenAuth: () => void;
}> = ({ children, allowedRoles, onOpenAuth }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Authentication Required</h2>
        <p className="text-xs text-slate-500 mb-6 max-w-sm">
          You must be signed in to access this portal. Please log in or use the quick switcher at the top.
        </p>
        <button
          onClick={onOpenAuth}
          className="px-5 py-2.5 bg-violet-600 text-white rounded-xl text-xs font-semibold shadow-xs hover:bg-violet-700 transition"
        >
          Sign In / Select Demo Persona
        </button>
      </div>
    );
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Unauthorized Access</h2>
        <p className="text-xs text-slate-500 mb-6 max-w-sm">
          Your current role is <strong className="text-slate-800">{user.role}</strong>. This section requires:{' '}
          <strong className="text-violet-700">{allowedRoles.join(', ')}</strong>. Use the Live Demo Navigator above to switch perspective.
        </p>
        <div className="flex gap-3">
          <Navigate to="/" replace />
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

function MainLayout() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const location = useLocation();

  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const isPlayerView = location.pathname.includes('/student/learn/');

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF8] text-slate-800">
      <QuickDemoBar />
      <Navbar onOpenAuth={handleOpenAuth} />

      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage onOpenAuth={handleOpenAuth} />} />
          <Route path="/courses" element={<CourseCatalogPage />} />
          <Route path="/courses/:id" element={<CourseDetailPage onOpenAuth={handleOpenAuth} />} />
          <Route path="/verify" element={<VerifyCertificatePage />} />

          {/* Student Routes */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={['student']} onOpenAuth={() => handleOpenAuth('login')}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/learn/:courseId"
            element={
              <ProtectedRoute allowedRoles={['student']} onOpenAuth={() => handleOpenAuth('login')}>
                <LessonPlayerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/quiz/:id"
            element={
              <ProtectedRoute allowedRoles={['student']} onOpenAuth={() => handleOpenAuth('login')}>
                <QuizPlayerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/certificates"
            element={
              <ProtectedRoute allowedRoles={['student']} onOpenAuth={() => handleOpenAuth('login')}>
                <CertificatesPage />
              </ProtectedRoute>
            }
          />

          {/* Instructor Routes */}
          <Route
            path="/instructor"
            element={
              <ProtectedRoute allowedRoles={['instructor', 'admin']} onOpenAuth={() => handleOpenAuth('login')}>
                <InstructorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/instructor/courses"
            element={
              <ProtectedRoute allowedRoles={['instructor', 'admin']} onOpenAuth={() => handleOpenAuth('login')}>
                <InstructorCoursesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/instructor/curriculum/:courseId"
            element={
              <ProtectedRoute allowedRoles={['instructor', 'admin']} onOpenAuth={() => handleOpenAuth('login')}>
                <CurriculumManagerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/instructor/quiz-builder"
            element={
              <ProtectedRoute allowedRoles={['instructor', 'admin']} onOpenAuth={() => handleOpenAuth('login')}>
                <QuizBuilderPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/instructor/students"
            element={
              <ProtectedRoute allowedRoles={['instructor', 'admin']} onOpenAuth={() => handleOpenAuth('login')}>
                <StudentRosterPage />
              </ProtectedRoute>
            }
          />

          {/* Administrator Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']} onOpenAuth={() => handleOpenAuth('login')}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['admin']} onOpenAuth={() => handleOpenAuth('login')}>
                <AdminUsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/moderation"
            element={
              <ProtectedRoute allowedRoles={['admin']} onOpenAuth={() => handleOpenAuth('login')}>
                <AdminModerationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/logs"
            element={
              <ProtectedRoute allowedRoles={['admin']} onOpenAuth={() => handleOpenAuth('login')}>
                <AdminActivityLogsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute allowedRoles={['admin']} onOpenAuth={() => handleOpenAuth('login')}>
                <AdminReportsPage />
              </ProtectedRoute>
            }
          />

          {/* Common Account Profile */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute onOpenAuth={() => handleOpenAuth('login')}>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {!isPlayerView && <Footer />}

      <AuthModal
        isOpen={authModalOpen}
        initialMode={authMode}
        onClose={() => setAuthModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <MainLayout />
      </AuthProvider>
    </BrowserRouter>
  );
}
