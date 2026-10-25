import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { Course } from '../../types';
import {
  BookOpen,
  Plus,
  CheckCircle2,
  FileEdit,
  Trash2,
  HelpCircle,
  Users,
  Eye,
  X,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export const InstructorCoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Development');
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('3.5');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [objectives, setObjectives] = useState('');

  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      const res = await api.getInstructorCourses();
      if (res.success && res.data) {
        setCourses(res.data);
      }
    } catch (err) {
      console.error('Failed to load courses:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleTogglePublish = async (course: Course) => {
    try {
      const res = await api.publishCourse(course.id);
      if (res.success) {
        setCourses((prev) =>
          prev.map((c) =>
            c.id === course.id ? { ...c, status: c.status === 'published' ? 'draft' : 'published' } : c
          )
        );
        setFeedbackMessage(`Course "${course.title}" status updated.`);
        setTimeout(() => setFeedbackMessage(null), 3000);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to toggle status');
    }
  };

  const handleDeleteCourse = async (courseId: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) return;
    try {
      const res = await api.deleteCourse(courseId);
      if (res.success) {
        setCourses((prev) => prev.filter((c) => c.id !== courseId));
        setFeedbackMessage(`Course "${title}" deleted.`);
        setTimeout(() => setFeedbackMessage(null), 3000);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete course');
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const learning_objectives = objectives
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await api.createCourse({
        title,
        category,
        difficulty,
        description,
        estimated_duration_hours: parseFloat(duration) || 2,
        thumbnail_url: thumbnailUrl || undefined,
        learning_objectives: learning_objectives.length > 0 ? learning_objectives : ['Master core course concepts'],
      });

      if (res.success) {
        setShowCreateModal(false);
        // Reset
        setTitle('');
        setDescription('');
        setObjectives('');
        setThumbnailUrl('');
        setFeedbackMessage('New draft course created successfully!');
        await fetchCourses();
        setTimeout(() => setFeedbackMessage(null), 3500);
      } else {
        alert(res.error?.message || 'Failed to create course');
      }
    } catch (err: any) {
      alert(err.message || 'Error creating course');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-2">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Curriculum Management</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Manage Courses
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Create, publish, edit curriculum lessons, and configure assessment criteria.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 self-start"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Course</span>
          </button>
        </div>

        {feedbackMessage && (
          <div className="p-4 mb-6 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{feedbackMessage}</span>
          </div>
        )}

        {/* Courses Table / Cards */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-white rounded-2xl h-24 border border-slate-200" />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No Courses Authored Yet</h3>
            <p className="text-xs text-slate-500 mt-1 mb-6">
              Start building your learning materials by creating your first course.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold"
            >
              Create Course
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="divide-y divide-slate-100">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-50/60 transition"
                >
                  <div className="flex gap-4 items-start min-w-0">
                    <img
                      src={course.thumbnail_url}
                      alt={course.title}
                      className="w-20 h-20 rounded-xl object-cover bg-slate-100 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
                          {course.category}
                        </span>
                        <span className="text-[10px] font-medium text-slate-500">
                          {course.difficulty}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            course.status === 'published'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {course.status.toUpperCase()}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 truncate">
                        {course.title}
                      </h3>

                      <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                        {course.description}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
                        <span>{course.lessonsCount} lessons</span>
                        <span>&bull;</span>
                        <span>{course.enrollmentsCount} students enrolled</span>
                        <span>&bull;</span>
                        <span>{course.quizzesCount || 0} quizzes</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Toolbar */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    {/* Publish / Draft Toggle */}
                    <button
                      onClick={() => handleTogglePublish(course)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        course.status === 'published'
                          ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                    >
                      {course.status === 'published' ? 'Unpublish to Draft' : 'Publish Course'}
                    </button>

                    {/* Manage Lessons */}
                    <Link
                      to={`/instructor/curriculum/${course.id}`}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition flex items-center gap-1"
                    >
                      <FileEdit className="w-3.5 h-3.5" />
                      <span>Curriculum ({course.lessonsCount})</span>
                    </Link>

                    {/* Build Quizzes */}
                    <Link
                      to={`/instructor/quiz-builder?course=${course.id}`}
                      className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold rounded-lg transition flex items-center gap-1"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Quiz</span>
                    </Link>

                    {/* Enrolled Students */}
                    <Link
                      to={`/instructor/students?course=${course.id}`}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition flex items-center gap-1"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Roster</span>
                    </Link>

                    {/* Delete */}
                    <button
                      onClick={() => handleDeleteCourse(course.id, course.title)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Delete Course"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create Course Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 relative my-8">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-1">Create New Course</h3>
            <p className="text-xs text-slate-500 mb-4">
              Your course will initially be saved as a Draft so you can add curriculum lessons and quizzes.
            </p>

            <form onSubmit={handleCreateCourse} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Course Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Modern Full-Stack Web Development"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                  >
                    <option value="Development">Development</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Design">Design</option>
                    <option value="AI & Machine Learning">AI & Machine Learning</option>
                    <option value="Business">Business</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e: any) => setDifficulty(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Estimated Hours</label>
                <input
                  type="number"
                  step="0.5"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description *</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summarize course goals and outcomes..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Thumbnail URL</label>
                <input
                  type="url"
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Learning Objectives (one per line)
                </label>
                <textarea
                  rows={2}
                  value={objectives}
                  onChange={(e) => setObjectives(e.target.value)}
                  placeholder="Build reactive web apps&#10;Deploy to production cloud"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Draft Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
