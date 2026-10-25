import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ShieldCheck, Award, Heart, Sparkles, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-rose-500 flex items-center justify-center text-white shadow-md">
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Learn<span className="text-violet-400">Sphere</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed mb-6">
              "Learn Smarter. Track Progress. Achieve More."
              <br />
              Enterprise-grade online learning platform connecting students, instructors, and administrators with verifiable credentials.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Full-Stack Verified Architecture &bull; PostgreSQL Schema Compliant</span>
            </div>
          </div>

          {/* Platform Explore */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link to="/courses" className="hover:text-white transition">
                  Course Catalog
                </Link>
              </li>
              <li>
                <Link to="/courses?category=Development" className="hover:text-white transition">
                  Full-Stack Development
                </Link>
              </li>
              <li>
                <Link to="/courses?category=Data+Science" className="hover:text-white transition">
                  Data & Python
                </Link>
              </li>
              <li>
                <Link to="/courses?category=AI+%26+Machine+Learning" className="hover:text-white transition">
                  AI & LLM Agents
                </Link>
              </li>
              <li>
                <Link to="/verify" className="hover:text-white transition flex items-center gap-1 text-violet-400">
                  <Award className="w-3.5 h-3.5" />
                  <span>Verify Credential</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* User Portals */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
              Portals & Roles
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link to="/student" className="hover:text-purple-400 transition">
                  Student Dashboard
                </Link>
              </li>
              <li>
                <Link to="/instructor" className="hover:text-emerald-400 transition">
                  Instructor Studio
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-amber-400 transition">
                  Administrator Command
                </Link>
              </li>
              <li>
                <Link to="/student/certificates" className="hover:text-white transition">
                  Verified Certificates
                </Link>
              </li>
            </ul>
          </div>

          {/* Architecture & Trust */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
              Security & Trust
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Server-Side Progress</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Tamper-Proof Quizzes</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Cryptographic IDs</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Role-Based Guards</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} LearnSphere LMS. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="text-slate-400">Google AI Studio Build &bull; Hackathon Edition</span>
            <Link to="/verify" className="hover:text-slate-300 transition">
              Registry Lookup
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
