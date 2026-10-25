import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../../api/client';
import { Course } from '../../types';
import {
  Users,
  Award,
  CheckCircle2,
  Clock,
  Send,
  MessageSquare,
  X,
  ChevronLeft,
} from 'lucide-react';

export const StudentRosterPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialCourseId = searchParams.get('course') || '';

  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState(initialCourseId);
  const [rosterData, setRosterData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Announcement modal
  const [showAnnounceModal, setShowAnnounceModal] = useState(false);
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [isSendingAnn, setIsSendingAnn] = useState(false);

  useEffect(() => {
    const loadCourses = async () => {
      const res = await api.getInstructorCourses();
      if (res.success && res.data) {
        setCourses(res.data);
        if (!selectedCourseId && res.data.length > 0) {
          setSelectedCourseId(res.data[0].id);
        }
      }
    };
    loadCourses();
  }, []);

  useEffect(() => {
    if (!selectedCourseId) return;
    const loadRoster = async () => {
      setIsLoading(true);
      try {
        const res = await api.getInstructorStudents(selectedCourseId);
        if (res.success && res.data) {
          setRosterData(res.data);
        }
      } catch (err) {
        console.error('Failed to load roster:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadRoster();
  }, [selectedCourseId]);

  const handleSendAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId) return;
    setIsSendingAnn(true);
    try {
      const res = await api.createAnnouncement(selectedCourseId, {
        title: annTitle,
        content: annContent,
      });
      if (res.success) {
        setShowAnnounceModal(false);
        setAnnTitle('');
        setAnnContent('');
        alert('Announcement broadcast to all enrolled students in this course!');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to post announcement');
    } finally {
      setIsSendingAnn(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/instructor/courses"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-700 transition mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Manage Courses</span>
        </Link>

        {/* Header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 mb-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-2">
              <Users className="w-3.5 h-3.5" />
              <span>Student Cohort Analytics</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Enrolled Students Roster
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Authorized performance overview for students enrolled in your courses.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAnnounceModal(true)}
              className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs rounded-xl transition flex items-center gap-1.5 border border-emerald-200"
            >
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>Post Announcement</span>
            </button>
          </div>
        </div>

        {/* Course Filter Dropdown */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 shadow-xs flex items-center justify-between gap-4">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-2">
            <span>Filter Course:</span>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="px-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </label>

          <span className="text-xs text-slate-500 font-medium">
            Total Enrolled: <strong className="text-slate-900">{rosterData?.totalEnrolled || 0}</strong>
          </span>
        </div>

        {/* Student Table */}
        {isLoading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
          </div>
        ) : !rosterData || rosterData.roster.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-800">No Students Enrolled Yet</h3>
            <p className="text-xs text-slate-500 mt-1">
              As soon as students enroll, their completion percentages and assessment activity will appear here.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                  <tr>
                    <th className="px-6 py-3.5">Student</th>
                    <th className="px-6 py-3.5">Enrolled Date</th>
                    <th className="px-6 py-3.5">Completed Lessons</th>
                    <th className="px-6 py-3.5">Progress</th>
                    <th className="px-6 py-3.5">Certificate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rosterData.roster.map((student: any) => (
                    <tr key={student.enrollmentId} className="hover:bg-slate-50/70 transition">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{student.studentName}</div>
                        <div className="text-slate-400 text-[11px]">{student.studentEmail}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {new Date(student.enrolledAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-slate-700">
                        {student.completedLessonsCount} / {student.totalLessons} lessons
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-emerald-600 h-2 rounded-full"
                              style={{ width: `${student.progressPct}%` }}
                            />
                          </div>
                          <span className="font-bold text-slate-800">{student.progressPct}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {student.hasCertificate ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            <Award className="w-3 h-3 text-amber-600" />
                            <span>Awarded</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">In progress</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Broadcast Announcement Modal */}
      {showAnnounceModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 relative">
            <button
              onClick={() => setShowAnnounceModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-1">
              Broadcast Course Announcement
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              This message will be dispatched directly to all enrolled students' notifications.
            </p>

            <form onSubmit={handleSendAnnouncement} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Subject Title</label>
                <input
                  type="text"
                  required
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  placeholder="e.g. New Live Q&A Session Scheduled"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Announcement Message</label>
                <textarea
                  required
                  rows={4}
                  value={annContent}
                  onChange={(e) => setAnnContent(e.target.value)}
                  placeholder="Enter message details for your students..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAnnounceModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSendingAnn}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSendingAnn ? 'Dispatching...' : 'Dispatch Announcement'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
