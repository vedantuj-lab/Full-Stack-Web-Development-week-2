import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { Quiz, QuizAttemptResult, QuestionBreakdown } from '../../types';
import confetti from 'canvas-confetti';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  RotateCcw,
  Award,
  ChevronLeft,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export const QuizPlayerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<QuizAttemptResult | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const fetchQuiz = async () => {
    if (!id) return;
    setIsLoading(true);
    setResult(null);
    setSelectedAnswers({});
    try {
      const res = await api.getQuiz(id);
      if (res.success && res.data) {
        setQuiz(res.data);
      }
    } catch (err) {
      console.error('Failed to load quiz:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuiz();
  }, [id]);

  const handleSelectOption = (questionId: string, optionId: string) => {
    if (result) return; // locked if submitted
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
    setValidationError(null);
  };

  const handleSubmit = async () => {
    if (!quiz || !quiz.questions) return;

    // Check all questions answered
    const unanswered = quiz.questions.filter((q) => !selectedAnswers[q.id]);
    if (unanswered.length > 0) {
      setValidationError(`Please answer all questions before submitting (${unanswered.length} unanswered).`);
      return;
    }

    setIsSubmitting(true);
    setValidationError(null);

    try {
      const res = await api.submitQuizAttempt(quiz.id, selectedAnswers);
      if (res.success && res.data) {
        setResult(res.data);
        if (res.data.passed) {
          try {
            confetti({
              particleCount: 150,
              spread: 80,
              origin: { y: 0.6 },
            });
          } catch {
            // fallback
          }
        }
      } else {
        setValidationError(res.error?.message || 'Submission failed');
      }
    } catch (err: any) {
      setValidationError(err.message || 'Submission error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] py-16 px-4 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Quiz Not Found</h2>
        <Link to="/student" className="px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-semibold">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFD] py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to={`/student/learn/${quiz.course_id}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-purple-700 transition"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Course Player</span>
          </Link>

          <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
            Passing Threshold: {quiz.passing_percentage}%
          </span>
        </div>

        {/* Quiz Title Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 mb-8 shadow-xs">
          <div className="flex items-center gap-2 text-purple-600 text-xs font-bold uppercase tracking-wider mb-2">
            <HelpCircle className="w-4 h-4" />
            <span>Assessment Examination</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {quiz.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
            {quiz.description || 'Answer the questions below to evaluate your conceptual and practical mastery. Scores are calculated authoritatively on the server.'}
          </p>
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-4 text-xs text-slate-500">
            <span>{quiz.questions?.length || 0} Multiple-Choice Questions</span>
            <span>&bull;</span>
            <span>{quiz.totalPoints || 100} Total Points</span>
          </div>
        </div>

        {/* Result Summary Banner (if submitted) */}
        {result && (
          <div
            className={`rounded-2xl p-6 sm:p-8 mb-8 text-white shadow-lg ${
              result.passed
                ? 'bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 border border-emerald-500/40'
                : 'bg-gradient-to-r from-rose-900 via-red-900 to-slate-900 border border-rose-500/40'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-3 bg-white/20">
                  {result.passed ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                      <span>ASSESSMENT PASSED</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-rose-300" />
                      <span>NEEDS IMPROVEMENT</span>
                    </>
                  )}
                </div>

                <h2 className="text-3xl font-extrabold tracking-tight">
                  Your Score: {result.percentage}%
                </h2>
                <p className="text-xs sm:text-sm text-slate-200 mt-1">
                  Earned {result.earnedScore} of {result.totalPoints} points (Required to pass: {result.passingPercentage}%).
                </p>
              </div>

              <div className="flex flex-col gap-2">
                {result.passed ? (
                  <Link
                    to="/student/certificates"
                    className="px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 text-center"
                  >
                    <Award className="w-4 h-4" />
                    <span>View / Claim Certificate</span>
                  </Link>
                ) : (
                  <button
                    onClick={fetchQuiz}
                    className="px-5 py-3 bg-white text-rose-950 hover:bg-slate-100 font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Retake Assessment</span>
                  </button>
                )}

                <Link
                  to={`/student/learn/${quiz.course_id}`}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl text-center transition"
                >
                  Return to Lessons
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Validation Alert */}
        {validationError && (
          <div className="p-4 mb-6 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Questions List */}
        <div className="space-y-6 mb-10">
          {quiz.questions?.map((question, qIdx) => {
            const breakdown = result?.questionBreakdown?.find(
              (b) => b.questionId === question.id
            );

            return (
              <div
                key={question.id}
                className={`bg-white rounded-2xl border p-6 sm:p-7 shadow-xs transition ${
                  breakdown
                    ? breakdown.isCorrect
                      ? 'border-emerald-300 ring-1 ring-emerald-100'
                      : 'border-rose-300 ring-1 ring-rose-100'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Question {qIdx + 1} ({question.points} pts)
                  </span>
                  {breakdown && (
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                        breakdown.isCorrect
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {breakdown.isCorrect ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>+{breakdown.pointsEarned} pts (Correct)</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          <span>0 pts (Incorrect)</span>
                        </>
                      )}
                    </span>
                  )}
                </div>

                <p className="text-base font-bold text-slate-900 mb-5 leading-snug">
                  {question.question_text}
                </p>

                {/* Options */}
                <div className="space-y-2.5">
                  {question.options.map((option) => {
                    const isSelected = selectedAnswers[question.id] === option.id;
                    const isCorrectAnswer = breakdown?.correctOptionId === option.id;

                    let optionStyle = 'border-slate-200 hover:border-slate-300 text-slate-800';

                    if (result) {
                      if (isCorrectAnswer) {
                        optionStyle = 'border-emerald-500 bg-emerald-50/80 text-emerald-950 font-semibold';
                      } else if (isSelected && !breakdown?.isCorrect) {
                        optionStyle = 'border-rose-500 bg-rose-50 text-rose-950';
                      } else {
                        optionStyle = 'border-slate-200 opacity-60 text-slate-500';
                      }
                    } else if (isSelected) {
                      optionStyle = 'border-purple-600 bg-purple-50/80 text-purple-950 font-semibold shadow-2xs';
                    }

                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => handleSelectOption(question.id, option.id)}
                        disabled={!!result}
                        className={`w-full text-left p-3.5 rounded-xl border text-xs flex items-center justify-between gap-3 transition ${optionStyle}`}
                      >
                        <span className="flex-1 leading-relaxed">{option.text}</span>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${
                            isSelected
                              ? 'border-purple-600 bg-purple-600 text-white'
                              : 'border-slate-300'
                          }`}
                        >
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Explanation on result view */}
                {breakdown && breakdown.explanation && (
                  <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl">
                    <span className="font-bold text-slate-800 block mb-0.5">Explanation:</span>
                    <span>{breakdown.explanation}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Submit Action Bar */}
        {!result && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 sticky bottom-6 z-20">
            <div className="text-xs text-slate-600">
              Answered{' '}
              <strong className="text-purple-700">
                {Object.keys(selectedAnswers).length}
              </strong>{' '}
              of {quiz.questions?.length || 0} questions
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md shadow-purple-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Evaluating on Server...' : 'Submit Assessment'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
