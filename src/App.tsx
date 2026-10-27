import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { GapReportView } from './components/GapReportView';
import { DiagnosticQuizView } from './components/DiagnosticQuizView';
import { RevisionPlanView } from './components/RevisionPlanView';
import { TopicMapView } from './components/TopicMapView';
import { MaterialUploadView } from './components/MaterialUploadView';
import { AssistantView } from './components/AssistantView';
import { ArchitectureModal } from './components/ArchitectureModal';
import { AuthModal } from './components/AuthModal';
import { AddCourseModal } from './components/AddCourseModal';
import { InteractiveTourModal } from './components/InteractiveTourModal';
import { ThreeKnowledgeGalaxy } from './components/ThreeKnowledgeGalaxy';
import { StudyMusicPlayer } from './components/StudyMusicPlayer';
import { StudyMusicStudioView } from './components/StudyMusicStudioView';
import { 
  Target, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  Calendar, 
  Cpu, 
  RefreshCw,
  FolderGit2,
  FileText,
  MessageSquare,
  Play
} from 'lucide-react';

function AppContent() {
  const { activeTab, setActiveTab, activeCourse, isGeneratingAI } = useApp();

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [archModalOpen, setArchModalOpen] = useState(false);
  const [addCourseModalOpen, setAddCourseModalOpen] = useState(false);
  const [tourModalOpen, setTourModalOpen] = useState(false);
  const [quizTargetTopicId, setQuizTargetTopicId] = useState<string | undefined>(undefined);

  const handleStartQuizForTopic = (topicId: string) => {
    setQuizTargetTopicId(topicId);
    setActiveTab('quiz');
  };

  const handleAskAboutGap = (topicName: string, gapDetails: string) => {
    setActiveTab('assistant');
  };

  const handleAskAboutTopic = (topicName: string) => {
    setActiveTab('assistant');
  };

  const handleAskAboutBlock = (action: string, citation: string) => {
    setActiveTab('assistant');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenArchitecture={() => setArchModalOpen(true)}
        onOpenAddCourse={() => setAddCourseModalOpen(true)}
        onOpenTour={() => setTourModalOpen(true)}
      />

      {/* Background Subtle Gradient Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-20 left-1/4 w-[600px] h-[600px] bg-indigo-900/10 rounded-full blur-[140px]" />
        <div className="absolute top-96 right-1/4 w-[500px] h-[500px] bg-rose-900/10 rounded-full blur-[140px]" />
      </div>

      {/* AI Generating Floating Pill Indicator */}
      {isGeneratingAI && (
        <div className="fixed bottom-6 right-6 z-50 bg-indigo-600/90 text-white border border-indigo-400/40 px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 text-xs font-semibold backdrop-blur animate-pulse">
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          <span>GapFinder AI Diagnostic Engine Active...</span>
        </div>
      )}

      {/* Main Content View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 relative z-10">
        {/* Quick Interactive Guided Tour Banner */}
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-violet-950/80 border border-indigo-800/50 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center flex-shrink-0">
              <Play className="w-4 h-4 fill-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-sm">How GapFinder AI Works:</span>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded font-mono font-medium">
                  5-Step Diagnostic Loop
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                1. Ingest Material ➔ 2. Map Topics ➔ 3. Diagnostic Test ➔ 4. Diagnose Gaps ➔ 5. Prioritize Revision
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setTourModalOpen(true)}
              className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Take Interactive Tour</span>
            </button>
          </div>
        </div>

        {/* Ambient Study & Focus Music Player (Lyria + Web Audio) */}
        <div className="mb-6">
          <StudyMusicPlayer />
        </div>

        {activeTab === 'diagnosis' && (
          <GapReportView
            onStartQuizForTopic={handleStartQuizForTopic}
            onAskAboutGap={handleAskAboutGap}
          />
        )}

        {activeTab === 'quiz' && (
          <DiagnosticQuizView
            initialTopicId={quizTargetTopicId}
            onNavigateToDiagnosis={() => setActiveTab('diagnosis')}
            onNavigateToPlan={() => setActiveTab('plan')}
          />
        )}

        {activeTab === 'plan' && (
          <RevisionPlanView
            onStartQuizForTopic={handleStartQuizForTopic}
            onAskAboutBlock={handleAskAboutBlock}
          />
        )}

        {activeTab === 'topics' && (
          <TopicMapView
            onStartQuizForTopic={handleStartQuizForTopic}
            onAskAboutTopic={handleAskAboutTopic}
          />
        )}

        {activeTab === 'galaxy' && (
          <ThreeKnowledgeGalaxy
            onSelectTopicForQuiz={handleStartQuizForTopic}
            onAskAboutTopic={handleAskAboutTopic}
          />
        )}

        {activeTab === 'music' && <StudyMusicStudioView />}

        {activeTab === 'materials' && (
          <MaterialUploadView onTopicsUpdated={() => setActiveTab('topics')} />
        )}

        {activeTab === 'assistant' && <AssistantView />}

        {activeTab === 'architecture' && (
          <div className="space-y-6">
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 sm:p-8">
              <h1 className="text-2xl font-bold text-white mb-2">System Architecture & AI Workflow</h1>
              <p className="text-slate-300 text-xs sm:text-sm">
                Click below to launch the full interactive architecture and RAG verification dossier.
              </p>
              <button
                onClick={() => setArchModalOpen(true)}
                className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition"
              >
                Open Architecture Inspector
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-850 bg-slate-950/80 py-6 text-xs text-slate-500 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-white">GapFinder AI</span>
            <span>—</span>
            <span>Syllabus-Grounded Diagnostic Revision Engine</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => setArchModalOpen(true)}
              className="hover:text-slate-300 underline underline-offset-2 transition"
            >
              RAG Pipeline Docs
            </button>
            <span>•</span>
            <button
              onClick={() => setAuthModalOpen(true)}
              className="hover:text-slate-300 underline underline-offset-2 transition"
            >
              Demo Credentials & Judge Switcher
            </button>
            <span>•</span>
            <span>Strict Citation Grounding (Zero Hallucination)</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      <ArchitectureModal isOpen={archModalOpen} onClose={() => setArchModalOpen(false)} />
      <AddCourseModal isOpen={addCourseModalOpen} onClose={() => setAddCourseModalOpen(false)} />
      <InteractiveTourModal
        isOpen={tourModalOpen}
        onClose={() => setTourModalOpen(false)}
        onNavigateToTab={(tab) => setActiveTab(tab)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
