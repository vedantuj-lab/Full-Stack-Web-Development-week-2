import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { Course } from '../../types';
import {
  HelpCircle,
  Plus,
  Trash2,
  CheckCircle2,
  ChevronLeft,
  AlertCircle,
  Check,
} from 'lucide-react';

interface QuestionDraft {
  id: string;
  question_text: string;
  points: number;
  explanation: string;
  options: { id: string; text: string; is_correct: boolean }[];
}

export const QuizBuilderPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialCourseId = searchParams.get('course') || '';
  const navigate = useNavigate();

  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState(initialCourseId);
  const [title, setTitle] = useState('Course Midterm Assessment');
  const [description, setDescription] = useState('Evaluate core concept mastery and architectural principles.');
  const [passingPercentage, setPassingPercentage] = useState(70);
  const [timeLimit, setTimeLimit] = useState(15);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const [questions, setQuestions] = useState<QuestionDraft[]>([
    {
      id: 'q1',
      question_text: 'Which hook in React handles asynchronous data fetching and side effects?',
      points: 25,
      explanation: 'useEffect is designed specifically for side effects like network requests and subscriptions.',
      options: [
        { id: 'opt1', text: 'useState', is_correct: false },
        { id: 'opt2', text: 'useEffect', is_correct: true },
        { id: 'opt3', text: 'useContext', is_correct: false },
        { id: 'opt4', text: 'useRef', is_correct: false },
      ],
    },
    {
      id: 'q2',
      question_text: 'What ensures that calculations of progress and quiz grades cannot be manipulated?',
      points: 25,
      explanation: 'Server-side evaluation guarantees tamper-proof validation independent of client requests.',
      options: [
        { id: 'opt5', text: 'Browser LocalStorage', is_correct: false },
        { id: 'opt6', text: 'Server-authoritative evaluation and database storage', is_correct: true },
        { id: 'opt7', text: 'HTML data attributes', is_correct: false },
        { id: 'opt8', text: 'CSS selectors', is_correct: false },
      ],
    },
  ]);

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

  const handleAddQuestion = () => {
    const newQId = `q_${Date.now()}`;
    setQuestions((prev) => [
      ...prev,
      {
        id: newQId,
        question_text: 'New question text here...',
        points: 25,
        explanation: 'Explanation for correct answer',
        options: [
          { id: `${newQId}_opt1`, text: 'First option', is_correct: true },
          { id: `${newQId}_opt2`, text: 'Second option', is_correct: false },
          { id: `${newQId}_opt3`, text: 'Third option', is_correct: false },
          { id: `${newQId}_opt4`, text: 'Fourth option', is_correct: false },
        ],
      },
    ]);
  };

  const handleRemoveQuestion = (id: string) => {
    if (questions.length <= 1) {
      alert('A quiz must have at least one question.');
      return;
    }
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const handleQuestionTextChange = (qId: string, text: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === qId ? { ...q, question_text: text } : q))
    );
  };

  const handleExplanationChange = (qId: string, explanation: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === qId ? { ...q, explanation } : q))
    );
  };

  const handleOptionTextChange = (qId: string, optId: string, text: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qId
          ? {
              ...q,
              options: q.options.map((opt) => (opt.id === optId ? { ...opt, text } : opt)),
            }
          : q
      )
    );
  };

  const handleSetCorrectOption = (qId: string, optId: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qId
          ? {
              ...q,
              options: q.options.map((opt) => ({
                ...opt,
                is_correct: opt.id === optId,
              })),
            }
          : q
      )
    );
  };

  const handleSaveQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId) {
      alert('Please select a course for this quiz');
      return;
    }

    // Verify each question has a correct option selected
    for (const q of questions) {
      const hasCorrect = q.options.some((opt) => opt.is_correct);
      if (!hasCorrect) {
        alert(`Question "${q.question_text}" needs one correct option selected.`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const res = await api.createQuiz(selectedCourseId, {
        title,
        description,
        passing_percentage: Number(passingPercentage),
        time_limit_minutes: Number(timeLimit),
        questions,
      });

      if (res.success) {
        setFeedback('Quiz created and published to course curriculum!');
        setTimeout(() => {
          navigate(`/instructor/curriculum/${selectedCourseId}`);
        }, 1200);
      } else {
        alert(res.error?.message || 'Failed to save quiz');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to save quiz');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/instructor/courses"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-700 transition mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Courses</span>
        </Link>

        {/* Header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 mb-8 shadow-xs">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-semibold mb-2">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Assessment Authoring Tool</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Quiz & Assessment Builder
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Build server-evaluated quizzes with passing scores and explanations. Correct answer keys are securely stored on the backend.
          </p>
        </div>

        {feedback && (
          <div className="p-4 mb-6 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        <form onSubmit={handleSaveQuiz} className="space-y-6">
          {/* Metadata */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Quiz Settings</h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Course *
              </label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} ({c.status})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Quiz Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. React 19 Architectural Mastery Exam"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Passing Score (%)
                </label>
                <input
                  type="number"
                  min="50"
                  max="100"
                  value={passingPercentage}
                  onChange={(e) => setPassingPercentage(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Time Limit (minutes)
                </label>
                <input
                  type="number"
                  min="5"
                  max="120"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                Questions ({questions.length})
              </h3>
              <button
                type="button"
                onClick={handleAddQuestion}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Question</span>
              </button>
            </div>

            {questions.map((question, qIdx) => (
              <div
                key={question.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs relative space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Question {qIdx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveQuestion(question.id)}
                    className="p-1 text-slate-400 hover:text-red-600 rounded"
                    title="Delete Question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Question Text
                  </label>
                  <input
                    type="text"
                    required
                    value={question.question_text}
                    onChange={(e) => handleQuestionTextChange(question.id, e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Multiple choice options */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    Answer Options (Select the correct radio button):
                  </label>
                  <div className="space-y-2">
                    {question.options.map((opt, oIdx) => (
                      <div key={opt.id} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`correct_${question.id}`}
                          checked={opt.is_correct}
                          onChange={() => handleSetCorrectOption(question.id, opt.id)}
                          className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                        />
                        <input
                          type="text"
                          required
                          value={opt.text}
                          onChange={(e) =>
                            handleOptionTextChange(question.id, opt.id, e.target.value)
                          }
                          placeholder={`Option ${oIdx + 1}`}
                          className={`flex-1 px-3 py-1.5 text-xs border rounded-xl focus:outline-none ${
                            opt.is_correct
                              ? 'border-emerald-500 bg-emerald-50/50 font-medium'
                              : 'border-slate-300'
                          }`}
                        />
                        {opt.is_correct && (
                          <span className="text-[10px] text-emerald-700 font-bold px-2 py-0.5 rounded bg-emerald-100">
                            CORRECT
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Explanation (Shown after submission)
                  </label>
                  <input
                    type="text"
                    value={question.explanation}
                    onChange={(e) => handleExplanationChange(question.id, e.target.value)}
                    placeholder="Why this answer is correct..."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Link
              to="/instructor/courses"
              className="px-5 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 disabled:opacity-50"
            >
              {isSubmitting ? 'Publishing Quiz...' : 'Save & Publish Quiz'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
