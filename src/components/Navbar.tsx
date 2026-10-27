import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Target, 
  HelpCircle, 
  Calendar, 
  FolderGit2, 
  FileText, 
  MessageSquare, 
  Cpu, 
  ChevronDown, 
  Plus, 
  RotateCcw, 
  Sparkles,
  ShieldCheck,
  UserCheck,
  Play,
  Orbit,
  Headphones,
  Share2,
  Check,
  Copy,
  ExternalLink,
  Globe,
  AlertCircle,
  X
} from 'lucide-react';

interface NavbarProps {
  onOpenAuth: () => void;
  onOpenArchitecture: () => void;
  onOpenAddCourse: () => void;
  onOpenTour: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAuth,
  onOpenArchitecture,
  onOpenAddCourse,
  onOpenTour,
}) => {
  const {
    currentUser,
    courses,
    activeCourseId,
    activeCourse,
    setActiveCourseId,
    activeTab,
    setActiveTab,
    resetAllData,
  } = useApp();

  const [courseDropdownOpen, setCourseDropdownOpen] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const getPublicUrl = () => {
    if (typeof window === 'undefined') return '';
    const origin = window.location.origin;
    // Cloud Run preview URL uses ais-pre- instead of ais-dev-
    return origin.includes('-dev-') ? origin.replace('-dev-', '-pre-') : origin;
  };

  const handleCopyShareLink = () => {
    const publicUrl = getPublicUrl();
    navigator.clipboard.writeText(publicUrl);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 3000);
  };

  const tabs = [
    { id: 'diagnosis', label: 'Gap Diagnosis', icon: Target, badge: activeCourse?.gapReport ? `${activeCourse.gapReport.weakCount} Weak` : 'Ready' },
    { id: 'quiz', label: 'Diagnostic Quiz', icon: HelpCircle, badge: 'RAG Test' },
    { id: 'plan', label: 'Revision Plan', icon: Calendar, badge: activeCourse?.revisionPlan ? `${activeCourse.revisionPlan.daysAvailable}d Plan` : 'Generate' },
    { id: 'topics', label: 'Topic Map', icon: FolderGit2, badge: `${activeCourse?.topics.length || 0}` },
    { id: 'galaxy', label: '3D Galaxy', icon: Orbit, badge: 'Three.js' },
    { id: 'music', label: 'Study Beats', icon: Headphones, badge: 'Lyria AI' },
    { id: 'materials', label: 'Materials & Chunks', icon: FileText, badge: `${activeCourse?.documents.length || 0} Docs` },
    { id: 'assistant', label: 'Topic Tutor', icon: MessageSquare, badge: 'Citations' },
    { id: 'architecture', label: 'AI Architecture', icon: Cpu, badge: 'Docs' },
  ] as const;

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-xl">
      {/* Top Utility Bar for Judges / Demo Credentials */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 border-b border-indigo-900/40 px-4 py-1.5 text-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-indigo-300">GapFinder AI Live:</span>
          <span className="text-slate-300 hidden sm:inline">Diagnostic-first revision engine grounded in syllabus & past papers.</span>
          <span className="bg-indigo-900/80 text-indigo-200 border border-indigo-700/50 px-2 py-0.5 rounded text-[10px] font-mono font-medium">
            Strict RAG + Citations
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              handleCopyShareLink();
              setShowShareModal(true);
            }}
            className="text-emerald-300 hover:text-white flex items-center gap-1 font-semibold transition cursor-pointer bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-700/60 px-2.5 py-0.5 rounded"
            title="Get the public link to share with friends or judges"
          >
            {shareCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>Share Public Link</span>
          </button>

          <span className="text-slate-700">|</span>

          <button
            onClick={() => setActiveTab('music')}
            className="text-purple-300 hover:text-white flex items-center gap-1 font-medium transition cursor-pointer"
          >
            <Headphones className="w-3.5 h-3.5" />
            <span>Study Beats (Lyria AI)</span>
          </button>

          <span className="text-slate-700">|</span>

          <button
            onClick={onOpenArchitecture}
            className="text-indigo-300 hover:text-white flex items-center gap-1 font-medium underline underline-offset-2 transition"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>AI Pipeline & Architecture</span>
          </button>

          <span className="text-slate-700">|</span>

          {resetConfirm ? (
            <div className="flex items-center gap-1.5 bg-rose-950/80 border border-rose-800/80 px-2 py-0.5 rounded text-[11px]">
              <span className="text-rose-200">Reset to sample?</span>
              <button
                onClick={() => {
                  resetAllData();
                  setResetConfirm(false);
                }}
                className="text-rose-400 hover:text-white font-bold underline"
              >
                Yes
              </button>
              <button
                onClick={() => setResetConfirm(false)}
                className="text-slate-400 hover:text-white ml-1"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setResetConfirm(true)}
              title="Reset sample data back to clean evaluation state"
              className="text-slate-400 hover:text-rose-300 flex items-center gap-1 transition"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Sample</span>
            </button>
          )}

          <span className="text-slate-700">|</span>

          {/* Quick User / Judge Switcher */}
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 px-2.5 py-0.5 rounded-full transition cursor-pointer"
          >
            <span>{currentUser.avatar}</span>
            <span className="font-medium text-slate-100 max-w-[120px] truncate">{currentUser.name}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {currentUser.role === 'judge' ? 'Judge Mode' : 'Student'}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Brand Logo & Tagline */}
        <div className="flex items-center gap-3">
          <div 
            onClick={() => setActiveTab('diagnosis')}
            className="cursor-pointer flex items-center gap-2.5 group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Target className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                  GapFinder
                </span>
                <span className="bg-indigo-500 text-white font-extrabold text-[10px] px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-slate-400 -mt-0.5 hidden md:block">
                Syllabus-Grounded Diagnostic Revision
              </p>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-800 mx-1 hidden sm:block" />

          {/* Course Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setCourseDropdownOpen(!courseDropdownOpen)}
              className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-200 transition"
            >
              <div className="text-left">
                <div className="text-[10px] uppercase font-semibold text-indigo-400 tracking-wider">Active Course</div>
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <span className="truncate max-w-[140px] sm:max-w-[200px]">{activeCourse?.title || 'Select Course'}</span>
                  <span className="text-xs text-slate-400 font-mono">({activeCourse?.code})</span>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 ml-1" />
            </button>

            {courseDropdownOpen && (
              <div 
                className="absolute left-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 p-2"
                onClick={() => setCourseDropdownOpen(false)}
              >
                <div className="px-2 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Switch Enrolled Syllabus
                </div>
                {courses.map((course) => (
                  <button
                    key={course.id}
                    onClick={() => setActiveCourseId(course.id)}
                    className={`w-full text-left p-2.5 rounded-lg transition mb-1 flex items-start justify-between ${
                      course.id === activeCourseId
                        ? 'bg-indigo-600/20 border border-indigo-500/40 text-white'
                        : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-medium text-sm flex items-center gap-1.5">
                        <span>{course.title}</span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                        <span className="font-mono text-indigo-300">{course.code}</span>
                        <span>•</span>
                        <span>{course.topics.length} topics mapped</span>
                      </div>
                    </div>
                    {course.gapReport && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-mono">
                        {course.gapReport.weakCount} weak
                      </span>
                    )}
                  </button>
                ))}

                <div className="border-t border-slate-800 mt-2 pt-2">
                  <button
                    onClick={() => {
                      setCourseDropdownOpen(false);
                      onOpenAddCourse();
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 rounded-lg text-xs font-semibold transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Upload New Syllabus / Material</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Action: Start Diagnostic Quiz */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenTour}
            className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-900/90 to-violet-900/90 hover:from-indigo-850 hover:to-violet-850 border border-indigo-700/60 text-indigo-200 hover:text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm transition cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-indigo-400 text-indigo-400" />
            <span>How It Works</span>
          </button>

          <button
            onClick={() => setActiveTab('quiz')}
            className="hidden lg:flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-md shadow-emerald-900/30 transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Take Diagnostic Quiz</span>
          </button>
          
          <button
            onClick={() => setActiveTab('plan')}
            className="hidden sm:flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-md shadow-indigo-900/30 transition"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>View Revision Plan</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 overflow-x-auto scrollbar-none flex items-center gap-1 border-t border-slate-800/80 pt-1 pb-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer relative ${
                isActive
                  ? 'bg-slate-800 text-white font-semibold shadow-inner'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive
                      ? 'bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 font-semibold'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
              {isActive && (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Public Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative text-left">
            <button
              onClick={() => setShowShareModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Share GapFinder AI</h3>
                <p className="text-xs text-slate-400">Send this public link to friends, teachers, or judges</p>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 mb-4">
              <div className="text-[11px] text-slate-400 font-mono mb-1.5 flex items-center justify-between">
                <span>Public Share URL:</span>
                <span className="text-emerald-400 font-sans font-semibold text-[10px] bg-emerald-950 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                  ✓ Anyone can open
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={getPublicUrl()}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-indigo-300 font-mono w-full select-all focus:outline-none"
                />
                <button
                  onClick={handleCopyShareLink}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 shrink-0 transition"
                >
                  {shareCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{shareCopied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Why Friend Saw Page Not Found Explanation & 2-Step Fix */}
            <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3.5 mb-5 space-y-2.5 text-xs">
              <div className="flex items-center gap-2 text-amber-300 font-semibold text-xs">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Fixing "Page Not Found" for Your Friend:</span>
              </div>

              <div className="space-y-2 text-slate-300 text-[11px] leading-relaxed">
                <div className="flex items-start gap-2 bg-slate-900 p-2 rounded-lg border border-slate-800">
                  <span className="w-5 h-5 rounded-full bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</span>
                  <div>
                    <span className="font-semibold text-white">Click "Share" in the AI Studio Header:</span>
                    <p className="text-slate-400 mt-0.5">
                      Look at the very top-right corner of the Google AI Studio screen (near your profile). Click the blue/white <strong className="text-indigo-300">Share</strong> button and switch permission to <strong className="text-emerald-300">"Anyone with the link"</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2 bg-slate-900 p-2 rounded-lg border border-slate-800">
                  <span className="w-5 h-5 rounded-full bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</span>
                  <div>
                    <span className="font-semibold text-white">Share the Preview Link:</span>
                    <p className="text-slate-400 mt-0.5">
                      Use the public link copied above (which contains <code className="text-emerald-300 bg-slate-950 px-1 py-0.5 rounded">-pre-</code>). Never copy the private link with <code className="text-rose-300 bg-slate-950 px-1 py-0.5 rounded">-dev-</code>, because <code className="text-rose-300">-dev-</code> requires your personal login.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white transition"
              >
                Close
              </button>
              <button
                onClick={handleCopyShareLink}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-lg shadow-indigo-600/30"
              >
                {shareCopied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                <span>{shareCopied ? 'Copied to Clipboard!' : 'Copy & Send to Friend'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

