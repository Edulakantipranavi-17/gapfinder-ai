import React, { useState } from 'react';
import { 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Target, 
  HelpCircle, 
  Calendar, 
  FolderGit2, 
  FileText, 
  Sparkles, 
  Layers, 
  BrainCircuit, 
  X, 
  Zap,
  Play
} from 'lucide-react';

interface InteractiveTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab: (tab: 'diagnosis' | 'quiz' | 'plan' | 'topics' | 'galaxy' | 'music' | 'materials' | 'assistant') => void;
}

export const InteractiveTourModal: React.FC<InteractiveTourModalProps> = ({
  isOpen,
  onClose,
  onNavigateToTab,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const tourSteps = [
    {
      stepNumber: 1,
      title: 'Step 1: Upload & Ingest Study Materials',
      tabId: 'materials' as const,
      icon: FileText,
      badge: 'Material Ingestion & Chunking',
      summary: 'You upload your course syllabus, lecture notes, textbook chapters, and past exam papers.',
      howItWorks: [
        'GapFinder tokenizes and partitions the text into semantic chunks.',
        'Each chunk is tagged with its document title, section heading, and paragraph coordinates.',
        'This creates an immutable citation ledger—the AI is strictly forbidden from guessing outside these boundaries.',
      ],
      interactiveActionText: 'View Uploaded Materials & Chunks',
      accentColor: 'indigo',
    },
    {
      stepNumber: 2,
      title: 'Step 2: AI Curriculum & Topic Map Extraction',
      tabId: 'topics' as const,
      icon: FolderGit2,
      badge: 'Cognitive Topic Tree',
      summary: 'Gemini analyzes the syllabus text to extract structured units, conceptual prerequisites, and exam weightages.',
      howItWorks: [
        'Deconstructs unstructured syllabus text into explicit units (e.g. Virtual Memory 30%, Deadlocks 30%, CPU Scheduling 20%).',
        'Establishes prerequisite links between foundational concepts and advanced applications.',
        'Maps relevant study chunks to each topic so diagnostic testing can target individual units.',
      ],
      interactiveActionText: 'Inspect Extracted Topic Map',
      accentColor: 'purple',
    },
    {
      stepNumber: 3,
      title: 'Step 3: Grounded Diagnostic Quiz Generation',
      tabId: 'quiz' as const,
      icon: HelpCircle,
      badge: 'Citation-Grounded Testing',
      summary: 'The app generates diagnostic questions using only your uploaded materials—not general internet trivia.',
      howItWorks: [
        'Every question probes tricky conceptual traps (e.g., forgetting to fetch the data frame on a 2-level TLB miss).',
        'Every question carries an explicit source citation badge: [Document Name, Section, Paragraph quote].',
        'Includes distractor rationales explaining why tempting wrong choices are technically false based on your syllabus.',
      ],
      interactiveActionText: 'Try a Diagnostic Test',
      accentColor: 'emerald',
    },
    {
      stepNumber: 4,
      title: 'Step 4: Clinical Gap Diagnosis (The Flagship Output)',
      tabId: 'diagnosis' as const,
      icon: Target,
      badge: 'Evidence-Backed Diagnosis',
      summary: 'Rather than giving a generic score, GapFinder classifies each topic as Weak (<50%), Medium, or Strong with explicit reasoning.',
      howItWorks: [
        'Identifies exact cognitive misconceptions (e.g. "Equates Unsafe state with Deadlock in Banker\'s Algorithm").',
        'Computes an Exam Risk Score (0-100) weighting weak areas against exam syllabus percentages.',
        'States the clinical reason for each rating citing the exact questions missed and boundary constraints overlooked.',
      ],
      interactiveActionText: 'Explore Gap Diagnosis Report',
      accentColor: 'rose',
    },
    {
      stepNumber: 5,
      title: 'Step 5: Personalized Adaptive Revision Plan',
      tabId: 'plan' as const,
      icon: Calendar,
      badge: 'Time-Optimized Spaced Schedule',
      summary: 'Traditional plans divide time equally. GapFinder dedicates 78% of your study hours to your diagnosed weak areas.',
      howItWorks: [
        'Adapts to your available timeline (e.g. 3, 7, or 14 days) and daily study hours (1.5h, 2.5h, 4h).',
        'Builds actionable study blocks: "Trace reference string in FIFO vs LRU" with direct citations to your notes.',
        'Updates automatically: as you retake diagnostic quizzes and improve, the plan rebalances to newly discovered gaps.',
      ],
      interactiveActionText: 'View Adaptive Revision Plan',
      accentColor: 'blue',
    },
  ];

  const current = tourSteps[currentStep];
  const Icon = current.icon;

  const handleJumpToTab = () => {
    onNavigateToTab(current.tabId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Top Bar */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold">
              <Play className="w-4 h-4 fill-indigo-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">How GapFinder AI Works</h2>
              <p className="text-xs text-slate-400">Interactive 5-step guided walkthrough of the diagnostic revision pipeline</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Indicator Progress Bar */}
        <div className="bg-slate-950 px-6 py-3 border-b border-slate-800/80 flex items-center justify-between gap-1 overflow-x-auto">
          {tourSteps.map((step, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentStep(idx)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                currentStep === idx
                  ? 'bg-indigo-600 text-white shadow-md'
                  : currentStep > idx
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{idx + 1}.</span>
              <span>{step.title.split(':')[1]?.trim() || step.title}</span>
            </button>
          ))}
        </div>

        {/* Step Content */}
        <div className="p-6 space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {current.badge}
              </span>
              <h3 className="text-xl font-extrabold text-white mt-1.5 flex items-center gap-2">
                <Icon className="w-5 h-5 text-indigo-400" />
                <span>{current.title}</span>
              </h3>
              <p className="text-slate-300 text-sm mt-1 leading-relaxed">
                {current.summary}
              </p>
            </div>

            <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-indigo-400 flex-shrink-0">
              <span className="text-lg font-black">{currentStep + 1}/5</span>
            </div>
          </div>

          {/* Detailed mechanism breakdown */}
          <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 space-y-2.5">
            <span className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
              <BrainCircuit className="w-3.5 h-3.5 text-indigo-400" />
              How the Engine Executes This:
            </span>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
              {current.howItWorks.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/90 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 text-xs font-semibold rounded-xl flex items-center gap-1 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          <button
            onClick={handleJumpToTab}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Jump to {current.interactiveActionText}</span>
          </button>

          {currentStep < tourSteps.length - 1 ? (
            <button
              onClick={() => setCurrentStep((prev) => Math.min(tourSteps.length - 1, prev + 1))}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-1 cursor-pointer"
            >
              <span>Next Step</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition"
            >
              Finish Tour
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
