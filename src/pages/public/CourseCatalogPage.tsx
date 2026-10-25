import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { Course } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  Search,
  Filter,
  Clock,
  BookOpen,
  Star,
  CheckCircle2,
  SlidersHorizontal,
  GraduationCap,
} from 'lucide-react';

const CATEGORIES = ['All', 'Development', 'Data Science', 'Design', 'AI & Machine Learning'];
const DIFFICULTIES = ['All', 'Beginner', 'Intermediate', 'Advanced'];

export const CourseCatalogPage: React.FC = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedSort, setSelectedSort] = useState('popular');

  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      const res = await api.getCourses({
        category: selectedCategory,
        difficulty: selectedDifficulty,
        search,
        sort: selectedSort,
      });
      if (res.success && res.data) {
        setCourses(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [selectedCategory, selectedDifficulty, selectedSort]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCourses();
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-100 text-violet-800 text-xs font-semibold mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Discover Knowledge</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Explore Course Catalog
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Browse published curricula, learn with real projects, and earn verifiable certificates.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 mb-8 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by course title, topic, or instructor..."
                className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </form>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-slate-400 hidden sm:inline" />
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white text-slate-700"
              >
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Recently Published</option>
              </select>
            </div>
          </div>

          {/* Category & Difficulty Pills */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-slate-400 font-medium mr-1">Category:</span>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-full font-medium transition ${
                    selectedCategory === cat
                      ? 'bg-violet-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-slate-400 font-medium mr-1">Level:</span>
              {DIFFICULTIES.map((diff) => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`px-3 py-1 rounded-full font-medium transition ${
                    selectedDifficulty === diff
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between text-xs text-slate-500 mb-4 px-1">
          <span>Showing {courses.length} courses</span>
          {user && (
            <span className="text-purple-600 font-medium flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Enrolled courses highlighted</span>
            </span>
          )}
        </div>

        {/* Course Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse bg-white rounded-2xl border border-slate-200 h-96" />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">No courses match your query</h3>
            <p className="text-xs text-slate-500 mt-1">
              Try adjusting your category pills or search terms.
            </p>
            <button
              onClick={() => {
                setSearch('');
                setSelectedCategory('All');
                setSelectedDifficulty('All');
              }}
              className="mt-4 px-4 py-2 bg-violet-50 text-violet-700 text-xs font-semibold rounded-lg hover:bg-violet-100 transition"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div
                key={course.id}
                className={`bg-white rounded-2xl border transition duration-200 flex flex-col overflow-hidden shadow-xs hover:shadow-lg ${
                  course.isEnrolled
                    ? 'border-purple-300 ring-1 ring-purple-200'
                    : 'border-slate-200'
                }`}
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-slate-100 overflow-hidden">
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    className="w-full h-full object-cover hover:scale-105 transition duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80';
                    }}
                  />
                  <div className="absolute top-2.5 left-2.5 flex gap-1.5">
                    <span className="px-2 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-medium">
                      {course.category}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-violet-600/90 backdrop-blur-xs text-white text-[10px] font-medium">
                      {course.difficulty}
                    </span>
                  </div>

                  {course.isEnrolled && (
                    <div className="absolute top-2.5 right-2.5">
                      <span className="px-2.5 py-1 rounded-full bg-purple-600 text-white text-[10px] font-bold shadow-md flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Enrolled ({course.studentProgressPct}%)</span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1 text-amber-500 text-xs font-semibold mb-1.5">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{course.rating.toFixed(1)}</span>
                      <span className="text-slate-400 font-normal">
                        ({course.enrollments_count} enrolled)
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 mb-2 line-clamp-1 hover:text-violet-600 transition">
                      <Link to={`/courses/${course.id}`}>{course.title}</Link>
                    </h3>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                      {course.description}
                    </p>
                  </div>

                  <div>
                    {/* Progress Bar if enrolled */}
                    {course.isEnrolled && (
                      <div className="mb-3">
                        <div className="flex justify-between text-[11px] font-medium text-slate-600 mb-1">
                          <span>Course Progress</span>
                          <span className="text-purple-700 font-bold">{course.studentProgressPct}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-purple-600 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${course.studentProgressPct}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 mb-3">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{course.estimated_duration_hours} hrs</span>
                      </span>
                      <span className="truncate max-w-[140px]">
                        Instructor: {course.instructor_name}
                      </span>
                    </div>

                    {course.isEnrolled ? (
                      <Link
                        to={`/student/learn/${course.id}`}
                        className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs text-center block transition shadow-xs"
                      >
                        Continue Learning &rarr;
                      </Link>
                    ) : (
                      <Link
                        to={`/courses/${course.id}`}
                        className="w-full py-2.5 rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-700 font-semibold text-xs text-center block transition"
                      >
                        View Details & Enroll
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
