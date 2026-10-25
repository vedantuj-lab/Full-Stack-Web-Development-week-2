import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../api/client';
import { Course, Lesson } from '../../types';
import {
  ChevronLeft,
  Plus,
  PlayCircle,
  Clock,
  Trash2,
  FileEdit,
  FileText,
  X,
  CheckCircle2,
  Video,
} from 'lucide-react';

export const CurriculumManagerPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [videoUrl, setVideoUrl] = useState('https://www.youtube.com/embed/SqcY0GlETPk');
  const [duration, setDuration] = useState('15');
  const [attachmentName, setAttachmentName] = useState('');

  const loadData = async () => {
    if (!courseId) return;
    setIsLoading(true);
    try {
      const [courseRes, lessonsRes] = await Promise.all([
        api.getCourse(courseId),
        api.getCourseLessons(courseId),
      ]);
      if (courseRes.success && courseRes.data) setCourse(courseRes.data.course);
      if (lessonsRes.success && lessonsRes.data) setLessons(lessonsRes.data);
    } catch (err) {
      console.error('Failed to load curriculum:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [courseId]);

  const handleOpenAdd = () => {
    setEditingLesson(null);
    setTitle('');
    setDescription('');
    setContent('### Lesson Overview\n\nExplain key concepts and provide code snippets here.');
    setVideoUrl('https://www.youtube.com/embed/SqcY0GlETPk');
    setDuration('15');
    setAttachmentName('');
    setShowAddModal(true);
  };

  const handleOpenEdit = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setTitle(lesson.title);
    setDescription(lesson.description || '');
    setContent(lesson.content || '');
    setVideoUrl(lesson.video_url || '');
    setDuration(String(lesson.duration_minutes || 10));
    setAttachmentName(lesson.attachments?.[0]?.name || '');
    setShowAddModal(true);
  };

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId) return;
    setIsSubmitting(true);

    const attachments = attachmentName.trim()
      ? [{ name: attachmentName.trim(), url: '#', size: '1.2 MB' }]
      : [];

    try {
      if (editingLesson) {
        const res = await api.updateLesson(editingLesson.id, {
          title,
          description,
          content,
          video_url: videoUrl,
          duration_minutes: parseInt(duration, 10) || 10,
          attachments,
        });
        if (res.success) {
          setShowAddModal(false);
          await loadData();
        }
      } else {
        const res = await api.createLesson(courseId, {
          title,
          description,
          content,
          video_url: videoUrl,
          duration_minutes: parseInt(duration, 10) || 10,
          attachments,
        });
        if (res.success) {
          setShowAddModal(false);
          await loadData();
        }
      }
    } catch (err: any) {
      alert(err.message || 'Failed to save lesson');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLesson = async (id: string, lessonTitle: string) => {
    if (!window.confirm(`Delete lesson "${lessonTitle}"?`)) return;
    try {
      await api.deleteLesson(id);
      setLessons((prev) => prev.filter((l) => l.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete lesson');
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/instructor/courses"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-700 transition mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Manage Courses</span>
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
              Curriculum Editor
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              {course?.title || 'Course Curriculum'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {lessons.length} lessons authored &bull; All changes persist automatically to the database
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Lesson</span>
          </button>
        </div>

        {/* Lessons List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-white rounded-2xl h-16 border border-slate-200" />
            ))}
          </div>
        ) : lessons.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto">
            <PlayCircle className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-800">No Lessons in this Course</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Add your first lecture with video stream URL and lecture notes.
            </p>
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl"
            >
              Add First Lesson
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
            {lessons.map((lesson, idx) => (
              <div
                key={lesson.id}
                className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-50 transition"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-800 font-bold text-xs flex items-center justify-center flex-shrink-0">
                    {idx + 1}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 truncate">{lesson.title}</h4>
                    <p className="text-xs text-slate-500 truncate">{lesson.description}</p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{lesson.duration_minutes}m</span>
                      </span>
                      {lesson.video_url && (
                        <span className="flex items-center gap-1 text-emerald-600">
                          <Video className="w-3 h-3" />
                          <span>Video Attached</span>
                        </span>
                      )}
                      {lesson.attachments && lesson.attachments.length > 0 && (
                        <span className="flex items-center gap-1 text-purple-600">
                          <FileText className="w-3 h-3" />
                          <span>{lesson.attachments.length} Resource(s)</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(lesson)}
                    className="p-2 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                    title="Edit Lesson"
                  >
                    <FileEdit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteLesson(lesson.id, lesson.title)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Delete Lesson"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Lesson Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 relative my-8">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-1">
              {editingLesson ? 'Edit Lesson' : 'Add New Lesson'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Configure video lectures, instructional notes, and downloadable student materials.
            </p>

            <form onSubmit={handleSaveLesson} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Lesson Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 1. Introduction to Component Trees"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Duration (minutes)</label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Attachment File Name</label>
                  <input
                    type="text"
                    value={attachmentName}
                    onChange={(e) => setAttachmentName(e.target.value)}
                    placeholder="e.g. Starter_Project.zip"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Video Stream Embed URL</label>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/embed/..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Summary Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief synopsis of what is learned in this lesson"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Lesson Notes & Markdown Content
                </label>
                <textarea
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter markdown, code samples, or reference instructions..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono text-[11px]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : editingLesson ? 'Update Lesson' : 'Add to Curriculum'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
