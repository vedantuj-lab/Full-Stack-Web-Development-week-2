import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../api/client';
import { Certificate } from '../../types';
import {
  Award,
  Search,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Calendar,
  User,
  BookOpen,
  Share2,
} from 'lucide-react';

export const VerifyCertificatePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialCode = searchParams.get('code') || 'LS-2026-REACT-8849';
  const [code, setCode] = useState(initialCode);
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async (codeToVerify: string) => {
    if (!codeToVerify.trim()) return;
    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const res = await api.verifyCertificate(codeToVerify.trim());
      if (res.success && res.data) {
        setCertificate(res.data);
      } else {
        setCertificate(null);
        setError(res.error?.message || 'Certificate code not found in LearnSphere registry.');
      }
    } catch (err: any) {
      setCertificate(null);
      setError(err.message || 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialCode) {
      handleVerify(initialCode);
    }
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleVerify(code);
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] py-14">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-100 text-violet-800 text-xs font-semibold mb-3">
            <ShieldCheck className="w-4 h-4 text-violet-600" />
            <span>Public Credential Registry</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Verify LearnSphere Certificate
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            Validate the authenticity of course completion certificates issued by LearnSphere.
          </p>
        </div>

        {/* Search Input Box */}
        <form onSubmit={handleSearchSubmit} className="max-w-lg mx-auto mb-10">
          <div className="flex gap-2 bg-white p-2 rounded-2xl border border-slate-300 shadow-sm">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter Certificate Code (e.g. LS-2026-REACT-8849)"
                className="w-full pl-9 pr-3 py-2 text-sm text-slate-800 font-mono uppercase focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs rounded-xl transition shadow-xs disabled:opacity-50"
            >
              {isLoading ? 'Verifying...' : 'Verify'}
            </button>
          </div>
          <p className="text-[11px] text-slate-500 text-center mt-2">
            Try sample code: <button type="button" onClick={() => { setCode('LS-2026-REACT-8849'); handleVerify('LS-2026-REACT-8849'); }} className="text-violet-600 font-mono font-semibold underline">LS-2026-REACT-8849</button>
          </p>
        </form>

        {/* Result Area */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600 mx-auto"></div>
            <p className="text-xs text-slate-500 mt-3">Validating against certificate registry...</p>
          </div>
        )}

        {!isLoading && error && hasSearched && (
          <div className="bg-white rounded-2xl border border-rose-200 p-8 text-center max-w-md mx-auto shadow-xs">
            <XCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">Invalid or Unverified Credential</h3>
            <p className="text-xs text-slate-600 mt-1 mb-4">{error}</p>
            <p className="text-[11px] text-slate-400">
              Please double check the code format. Official LearnSphere certificate IDs begin with "LS-".
            </p>
          </div>
        )}

        {!isLoading && certificate && (
          <div className="bg-white rounded-3xl border-2 border-violet-200 shadow-xl overflow-hidden max-w-2xl mx-auto">
            {/* Top Seal Banner */}
            <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-rose-600 p-6 text-white text-center relative overflow-hidden">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-white text-xs font-semibold mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>OFFICIALLY VERIFIED RECORD</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight">Certificate of Completion</h2>
              <p className="text-xs text-violet-100 font-mono mt-1">
                Registry ID: {certificate.certificate_code}
              </p>
            </div>

            {/* Certificate Details */}
            <div className="p-8 sm:p-10 text-center space-y-6">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">
                  This Certifies That
                </p>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                  {certificate.student_name}
                </h3>
              </div>

              <div>
                <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">
                  Has Successfully Completed All Curriculum Requirements For
                </p>
                <h4 className="text-xl font-bold text-violet-700 mt-1 max-w-md mx-auto">
                  {certificate.course_title}
                </h4>
              </div>

              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto pt-6 border-t border-slate-100 text-left text-xs">
                <div>
                  <span className="text-slate-400 block">Instructor</span>
                  <strong className="text-slate-800">{certificate.instructor_name}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Issue Date</span>
                  <strong className="text-slate-800">
                    {new Date(certificate.issued_at).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Exam Score</span>
                  <strong className="text-emerald-700">{certificate.score_achieved}% (Passed)</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Issuer</span>
                  <strong className="text-slate-800">LearnSphere Academic Board</strong>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(window.location.href);
                    alert('Verification link copied to clipboard!');
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Copy Verification URL</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
