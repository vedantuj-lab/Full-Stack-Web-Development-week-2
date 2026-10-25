import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { Certificate } from '../../types';
import {
  Award,
  CheckCircle2,
  ExternalLink,
  Printer,
  Share2,
  BookOpen,
  Calendar,
  ShieldCheck,
  X,
} from 'lucide-react';

export const CertificatesPage: React.FC = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCertificates = async () => {
    setIsLoading(true);
    try {
      const res = await api.getMyCertificates();
      if (res.success && res.data) {
        setCertificates(res.data);
      }
    } catch (err) {
      console.error('Failed to load certificates:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#FDFCFD] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold mb-2">
            <Award className="w-3.5 h-3.5 text-amber-600" />
            <span>Verified Credentials</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Earned Certificates
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Official proof of completion and skill verification. Every certificate has a permanent cryptographic registry code.
          </p>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="animate-pulse bg-white rounded-2xl h-56 border border-slate-200" />
            ))}
          </div>
        ) : certificates.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto shadow-xs">
            <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No Certificates Earned Yet</h3>
            <p className="text-xs text-slate-500 mt-1 mb-6 leading-relaxed">
              Complete 100% of the lessons in any enrolled course to unlock your official verified certificate of completion.
            </p>
            <Link
              to="/student"
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-xl transition"
            >
              Resume Course Progress
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className="bg-white rounded-2xl border border-amber-200/80 p-6 shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="p-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
                      <Award className="w-6 h-6" />
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {cert.certificate_code}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-1 line-clamp-2">
                    {cert.course_title}
                  </h3>

                  <p className="text-xs text-slate-500 mb-4">
                    Awarded to <strong className="text-slate-800">{cert.student_name}</strong>
                  </p>

                  <div className="space-y-1.5 text-xs text-slate-600 pt-3 border-t border-slate-100 mb-6">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Instructor:</span>
                      <span className="font-medium text-slate-800">{cert.instructor_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Issue Date:</span>
                      <span className="font-medium text-slate-800">
                        {new Date(cert.issued_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Verified Grade:</span>
                      <span className="font-bold text-emerald-600">{cert.score_achieved}%</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setSelectedCert(cert)}
                    className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs rounded-xl transition text-center shadow-xs"
                  >
                    View Certificate
                  </button>
                  <Link
                    to={`/verify?code=${cert.certificate_code}`}
                    className="p-2 text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition"
                    title="Verify in Public Registry"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Full Modal Viewer for Certificate */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-8">
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              <button
                onClick={handlePrint}
                className="p-2 bg-white/80 hover:bg-white text-slate-700 rounded-xl shadow-xs transition"
                title="Print or Save PDF"
              >
                <Printer className="w-4 h-4" />
              </button>
              <button
                onClick={() => setSelectedCert(null)}
                className="p-2 bg-white/80 hover:bg-white text-slate-700 rounded-xl shadow-xs transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Certificate Artwork */}
            <div className="p-8 sm:p-12 text-center bg-radial from-amber-50/60 to-white border-8 border-double border-amber-300 m-4 rounded-2xl relative">
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500 to-amber-700 flex items-center justify-center text-white mx-auto mb-4 shadow-md">
                <Award className="w-8 h-8" />
              </div>

              <h2 className="text-xs uppercase tracking-widest font-extrabold text-amber-800 mb-1">
                LearnSphere Academic Board
              </h2>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mb-4 font-serif">
                Certificate of Completion
              </h1>

              <p className="text-xs text-slate-500 font-medium">This is proudly presented to</p>
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 my-2 font-serif underline decoration-amber-400 decoration-2 underline-offset-8">
                {selectedCert.student_name}
              </h3>

              <p className="text-xs text-slate-500 max-w-md mx-auto mt-4 leading-relaxed">
                for successfully fulfilling all curriculum requirements and passing comprehensive assessments for:
              </p>

              <h4 className="text-lg sm:text-xl font-bold text-violet-800 my-3 font-sans">
                {selectedCert.course_title}
              </h4>

              <div className="grid grid-cols-2 gap-4 pt-6 mt-6 border-t border-amber-200 max-w-md mx-auto text-left text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Instructor</span>
                  <span className="font-serif font-bold text-slate-800 text-sm">
                    {selectedCert.instructor_name}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Date of Issuance</span>
                  <span className="font-semibold text-slate-800">
                    {new Date(selectedCert.issued_at).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500">
                <span className="font-mono font-bold text-slate-700">
                  ID: {selectedCert.certificate_code}
                </span>
                <Link
                  to={`/verify?code=${selectedCert.certificate_code}`}
                  className="text-violet-600 hover:text-violet-700 font-semibold underline flex items-center gap-1"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Verify in Official Registry</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
