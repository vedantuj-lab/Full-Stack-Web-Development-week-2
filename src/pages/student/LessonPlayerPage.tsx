import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { Course, Lesson, Quiz } from '../../types';
import confetti from 'canvas-confetti';
import {
  PlayCircle,
  CheckCircle2,
  Circle,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Download,
  FileText,
  Award,
  Sparkles,
  HelpCircle,
  Menu,
  X,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

export const LessonPlayerPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'attachments' | 'quizzes'>('content');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showCertificateClaimModal, setShowCertificateClaimModal] = useState(false);
  const [certificateClaimed, setCertificateClaimed] = useState<any>(null);

  const fetchPlayerData = async () => {
    if (!courseId) return;
    setIsLoading(true);
    try {
      const [courseRes, lessonsRes, quizzesRes] = await Promise.all([
        api.getCourse(courseId),
        api.getCourseLessons(courseId),
        api.getCourseQuizzes(courseId),
      ]);

      if (courseRes.success && courseRes.data) {
        setCourse(courseRes.data.course);
        setCertificateClaimed(courseRes.data.certificate);
      }

      if (lessonsRes.success && lessonsRes.data) {
        const lessonList = lessonsRes.data;
        setLessons(lessonList);

        // Select requested lesson or first incomplete or first lesson
        const requestedLessonId = searchParams.get('lesson');
        if (requestedLessonId) {
          const match = lessonList.find((l: Lesson) => l.id === requestedLessonId);
          if (match) setCurrentLesson(match);
          else setCurrentLesson(lessonList[0]);
        } else {
          const firstIncomplete = lessonList.find((l: Lesson) => !l.is_completed);
          setCurrentLesson(firstIncomplete || lessonList[0]);
        }
      }

      if (quizzesRes.success && quizzesRes.data) {
        setQuizzes(quizzesRes.data);
      }
    } catch (err) {
      console.error('Failed to load lesson player data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayerData();
  }, [courseId]);

  const selectLesson = (lesson: Lesson) => {
    setCurrentLesson(lesson);
    setSearchParams({ lesson: lesson.id });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const completedCount = lessons.filter((l) => l.is_completed).length;
  const totalLessons = lessons.length;
  const progressPct = totalLessons === 0 ? 0 : Math.round((completedCount / totalLessons) * 100);
  const allLessonsCompleted = totalLessons > 0 && completedCount === totalLessons;

  const handleToggleComplete = async () => {
    if (!currentLesson || isUpdatingProgress) return;
    setIsUpdatingProgress(true);

    const nextCompletedState = !currentLesson.is_completed;
    try {
      const res = await api.setLessonComplete(currentLesson.id, nextCompletedState);
      if (res.success && res.data) {
        // Update lesson status in local list
        setLessons((prev) =>
          prev.map((l) =>
            l.id === currentLesson.id ? { ...l, is_completed: nextCompletedState } : l
          )
        );
        setCurrentLesson((prev) => (prev ? { ...prev, is_completed: nextCompletedState } : null));

        // If completed all lessons and not yet claimed, trigger confetti celebration!
        if (res.data.courseCompleted) {
          try {
            confetti({
              particleCount: 120,
              spread: 70,
              origin: { y: 0.6 },
            });
          } catch {
            // fallback
          }
          setShowCertificateClaimModal(true);
        }
      }
    } catch (err) {
      console.error('Failed to update lesson completion:', err);
    } finally {
      setIsUpdatingProgress(false);
    }
  };

  const handleClaimCertificate = async () => {
    if (!courseId) return;
    try {
      const res = await api.claimCertificate(courseId);
      if (res.success && res.data) {
        setCertificateClaimed(res.data);
        setShowCertificateClaimModal(false);
        navigate('/student/certificates');
      } else {
        alert(res.error?.message || 'Could not claim certificate');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to claim certificate');
    }
  };

  const currentIdx = lessons.findIndex((l) => l.id === currentLesson?.id);
  const prevLesson = currentIdx > 0 ? lessons[currentIdx - 1] : null;
  const nextLesson = currentIdx < lessons.length - 1 ? lessons[currentIdx + 1] : null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Player Navigation Bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between sticky top-7 z-30">
        <div className="flex items-center gap-3">
          <Link
            to="/student"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            title="Back to Student Dashboard"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider">
              {course?.category} &bull; Course Player
            </span>
            <h2 className="text-sm font-bold text-white truncate max-w-sm sm:max-w-md">
              {course?.title}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Progress Indicator */}
          <div className="hidden sm:flex items-center gap-3 text-xs">
            <span className="text-slate-400 font-medium">
              Progress: <strong className="text-purple-400">{completedCount}/{totalLessons}</strong> ({progressPct}%)
            </span>
            <div className="w-24 bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
              <div
                className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* Toggle Curriculum Sidebar */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg flex items-center gap-1.5 text-xs font-semibold transition"
          >
            <Menu className="w-4 h-4" />
            <span className="hidden md:inline">Curriculum</span>
          </button>
        </div>
      </div>

      {/* Main Content Area & Sidebar */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left / Center: Video Player & Lecture Content */}
        <div className="flex-1 overflow-y-auto bg-slate-950 p-4 sm:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Video Player Frame */}
            {currentLesson?.video_url && (
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl border border-slate-800">
                <iframe
                  src={currentLesson.video_url}
                  title={currentLesson.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              </div>
            )}

            {/* Lesson Title & Controls */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
                <div>
                  <span className="text-xs font-semibold text-purple-400">
                    Lesson {currentIdx + 1} of {totalLessons} &bull; {currentLesson?.duration_minutes} mins
                  </span>
                  <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">
                    {currentLesson?.title}
                  </h1>
                </div>

                {/* Mark as Completed Button */}
                <button
                  onClick={handleToggleComplete}
                  disabled={isUpdatingProgress}
                  className={`px-4 py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition shadow-sm ${
                    currentLesson?.is_completed
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}
                >
                  {currentLesson?.is_completed ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Completed! (Click to Undo)</span>
                    </>
                  ) : (
                    <>
                      <Circle className="w-4 h-4" />
                      <span>Mark Lesson as Complete</span>
                    </>
                  )}
                </button>
              </div>

              {/* Navigation Arrows */}
              <div className="flex items-center justify-between pt-4 text-xs font-semibold">
                <button
                  disabled={!prevLesson}
                  onClick={() => prevLesson && selectLesson(prevLesson)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous Lesson</span>
                </button>

                {nextLesson ? (
                  <button
                    onClick={() => selectLesson(nextLesson)}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition"
                  >
                    <span>Next Lesson</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  quizzes.length > 0 && (
                    <Link
                      to={`/student/quiz/${quizzes[0].id}`}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition"
                    >
                      <HelpCircle className="w-4 h-4" />
                      <span>Take Course Quiz &rarr;</span>
                    </Link>
                  )
                )}
              </div>
            </div>

            {/* 100% Course Completion Banner */}
            {allLessonsCompleted && (
              <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 border border-emerald-600/40 rounded-2xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center flex-shrink-0">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      Curriculum Complete! (100%)
                    </h3>
                    <p className="text-xs text-emerald-200 mt-0.5">
                      You have verified all {totalLessons} lessons in this course. Claim your official verified certificate!
                    </p>
                  </div>
                </div>

                {certificateClaimed ? (
                  <Link
                    to="/student/certificates"
                    className="px-5 py-2.5 bg-white text-emerald-950 font-bold text-xs rounded-xl hover:bg-emerald-50 transition shadow-sm flex items-center gap-1.5 flex-shrink-0"
                  >
                    <Award className="w-4 h-4 text-emerald-600" />
                    <span>View Certificate</span>
                  </Link>
                ) : (
                  <button
                    onClick={handleClaimCertificate}
                    className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl transition shadow-md flex items-center gap-1.5 flex-shrink-0"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Claim Certificate Now</span>
                  </button>
                )}
              </div>
            )}

            {/* Tabs Navigation */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="flex border-b border-slate-800 bg-slate-900/60 text-xs font-semibold">
                <button
                  onClick={() => setActiveTab('content')}
                  className={`px-5 py-3 border-b-2 transition ${
                    activeTab === 'content'
                      ? 'border-purple-500 text-purple-400 bg-slate-800/40'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Lecture Notes & Code
                </button>
                <button
                  onClick={() => setActiveTab('attachments')}
                  className={`px-5 py-3 border-b-2 transition flex items-center gap-1.5 ${
                    activeTab === 'attachments'
                      ? 'border-purple-500 text-purple-400 bg-slate-800/40'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>Attachments</span>
                  {currentLesson?.attachments && currentLesson.attachments.length > 0 && (
                    <span className="bg-purple-900 text-purple-200 text-[10px] px-1.5 py-0.2 rounded-full">
                      {currentLesson.attachments.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('quizzes')}
                  className={`px-5 py-3 border-b-2 transition flex items-center gap-1.5 ${
                    activeTab === 'quizzes'
                      ? 'border-purple-500 text-purple-400 bg-slate-800/40'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Course Quizzes ({quizzes.length})</span>
                </button>
              </div>

              {/* Tab Contents */}
              <div className="p-6">
                {activeTab === 'content' && (
                  <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed whitespace-pre-line font-sans">
                    {currentLesson?.content || currentLesson?.description}
                  </div>
                )}

                {activeTab === 'attachments' && (
                  <div>
                    {currentLesson?.attachments && currentLesson.attachments.length > 0 ? (
                      <div className="divide-y divide-slate-800">
                        {currentLesson.attachments.map((file, i) => (
                          <div
                            key={i}
                            className="py-3 flex items-center justify-between text-xs hover:bg-slate-800/40 px-2 rounded-lg transition"
                          >
                            <div className="flex items-center gap-2.5">
                              <FileText className="w-4 h-4 text-purple-400" />
                              <span className="font-medium text-slate-200">{file.name}</span>
                              <span className="text-slate-500">({file.size})</span>
                            </div>
                            <button
                              onClick={() => alert(`Downloading ${file.name}`)}
                              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg flex items-center gap-1 text-[11px]"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic">No downloadable files attached to this lesson.</p>
                    )}
                  </div>
                )}

                {activeTab === 'quizzes' && (
                  <div className="space-y-4">
                    {quizzes.length === 0 ? (
                      <p className="text-xs text-slate-500 italic">No quizzes created for this course yet.</p>
                    ) : (
                      quizzes.map((quiz) => (
                        <div
                          key={quiz.id}
                          className="p-4 bg-slate-800/50 border border-slate-700/60 rounded-xl flex items-center justify-between gap-4"
                        >
                          <div>
                            <h4 className="text-sm font-bold text-white">{quiz.title}</h4>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {quiz.questionsCount || 4} questions &bull; Passing threshold: {quiz.passing_percentage}%
                            </p>
                          </div>
                          <Link
                            to={`/student/quiz/${quiz.id}`}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-xl transition"
                          >
                            Start Quiz &rarr;
                          </Link>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Curriculum Course Outline */}
        {isSidebarOpen && (
          <div className="w-full lg:w-80 bg-slate-900 border-l border-slate-800 flex flex-col h-auto lg:h-[calc(100vh-7rem)] overflow-y-auto">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Course Content
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {completedCount} of {totalLessons} completed ({progressPct}%)
                </p>
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-2 space-y-1 divide-y divide-slate-800/50 flex-1">
              {lessons.map((lesson, idx) => {
                const isSelected = lesson.id === currentLesson?.id;
                return (
                  <button
                    key={lesson.id}
                    onClick={() => selectLesson(lesson)}
                    className={`w-full text-left p-3 rounded-xl transition flex items-start gap-3 ${
                      isSelected
                        ? 'bg-purple-950/70 border border-purple-500/40 text-white'
                        : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      {lesson.is_completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-600" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs font-medium leading-snug ${isSelected ? 'font-bold text-white' : ''}`}>
                        {idx + 1}. {lesson.title}
                      </p>
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        {lesson.duration_minutes}m video
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quizzes Section in Sidebar */}
            {quizzes.length > 0 && (
              <div className="p-4 border-t border-slate-800 bg-slate-900/90">
                <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-2">
                  Assessments
                </h4>
                {quizzes.map((quiz) => (
                  <Link
                    key={quiz.id}
                    to={`/student/quiz/${quiz.id}`}
                    className="block p-2.5 rounded-xl bg-purple-950/40 border border-purple-800/40 hover:bg-purple-900/50 text-xs text-purple-200 font-medium transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate">{quiz.title}</span>
                      <ArrowRight className="w-3.5 h-3.5 flex-shrink-0 ml-1" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
