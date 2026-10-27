import React, { useState } from 'react';
import { 
  Cpu, 
  Layers, 
  ShieldCheck, 
  Database, 
  BrainCircuit, 
  CheckCircle2, 
  ArrowRight, 
  FileText, 
  Zap, 
  Split, 
  Sparkles,
  GitCommit,
  X
} from 'lucide-react';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'pipeline' | 'retrieval_vs_gen' | 'roadmap'>('pipeline');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
              <Cpu className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">GapFinder AI System Architecture</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Judge Technical Specification
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                RAG Pipeline, Grounding Citations, and Separation of Retrieval vs Generation
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-slate-800 bg-slate-950/40">
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition ${
              activeTab === 'pipeline'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            1. RAG & Diagnostic Pipeline
          </button>
          <button
            onClick={() => setActiveTab('retrieval_vs_gen')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition ${
              activeTab === 'retrieval_vs_gen'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            2. Retrieval vs Generation Separation
          </button>
          <button
            onClick={() => setActiveTab('roadmap')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition ${
              activeTab === 'roadmap'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            3. Future Scalability & LMS Roadmap
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-300 text-xs sm:text-sm">
          {activeTab === 'pipeline' && (
            <div className="space-y-6">
              {/* Architecture Diagram */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                <span className="text-xs uppercase font-bold text-indigo-400 tracking-wider">
                  Diagnostic Workflow Architecture
                </span>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                  {/* Step 1 */}
                  <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl space-y-1.5">
                    <div className="w-6 h-6 rounded bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-xs">1</div>
                    <div className="font-bold text-white">Ingestion & Chunking</div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Syllabus, notes, textbooks & past papers are tokenized and partitioned into semantic chunks with document provenance and paragraph metadata.
                    </p>
                  </div>

                  {/* Step 2 */}
                  <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl space-y-1.5">
                    <div className="w-6 h-6 rounded bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-xs">2</div>
                    <div className="font-bold text-white">Curriculum Mapping</div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Gemini 3.8 Flash deconstructs syllabus text into hierarchical Units, learning objectives, exam weightages, and conceptual dependencies.
                    </p>
                  </div>

                  {/* Step 3 */}
                  <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl space-y-1.5">
                    <div className="w-6 h-6 rounded bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-xs">3</div>
                    <div className="font-bold text-white">Citation-Grounded Testing</div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Questions are generated solely from retrieved chunks. Each question mandates an exact source citation, distractor rationales, and common trap diagnosis.
                    </p>
                  </div>

                  {/* Step 4 */}
                  <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl space-y-1.5">
                    <div className="w-6 h-6 rounded bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-xs">4</div>
                    <div className="font-bold text-white">Diagnosis & Revision Plan</div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Evaluates student blunders, classifies topics as Weak/Medium/Strong with explicit reasoning, and builds an adaptive day-by-day revision timetable.
                    </p>
                  </div>
                </div>
              </div>

              {/* Technical Pipeline Details */}
              <div className="space-y-3">
                <h3 className="font-bold text-white text-base">Key Pipeline Components:</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5">
                    <div className="font-semibold text-indigo-300 flex items-center gap-1.5">
                      <FileText className="w-4 h-4" />
                      <span>1. Semantic Chunking & Provenance Tagging</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Each study asset is tagged with <code className="text-indigo-300 font-mono">docTitle</code>, <code className="text-indigo-300 font-mono">section</code>, and <code className="text-indigo-300 font-mono">pageOrParagraph</code>. This creates immutable evidence citations.
                    </p>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5">
                    <div className="font-semibold text-emerald-300 flex items-center gap-1.5">
                      <BrainCircuit className="w-4 h-4" />
                      <span>2. Clinical Diagnostic Evaluation</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Rather than just counting raw scores, the evaluation endpoint <code className="text-emerald-300 font-mono">/api/quiz/evaluate</code> models student cognitive mistakes to formulate specific root causes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'retrieval_vs_gen' && (
            <div className="space-y-4">
              <div className="bg-indigo-950/40 border border-indigo-800/40 p-4 rounded-xl">
                <h3 className="font-bold text-white text-sm">
                  Mandatory AI Requirement: Separation of Retrieval and Generation
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  A common flaw in educational AI tools is allowing the LLM to invent questions or concepts from general training memory. GapFinder AI strictly isolates retrieval from generation.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Retrieval Layer */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-400 font-bold">
                    <Database className="w-4 h-4" />
                    <span>WHERE RETRIEVAL IS USED:</span>
                  </div>
                  <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
                    <li>Selecting relevant lecture notes and syllabus sections matching the target topic.</li>
                    <li>Extracting verbatim text chunks to inject as deterministic context.</li>
                    <li>Providing verifiable grounding citations with document title and paragraph coordinates.</li>
                    <li>Restricting the model so it cannot refer to external out-of-scope curricula.</li>
                  </ul>
                </div>

                {/* Generation Layer */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <Sparkles className="w-4 h-4" />
                    <span>WHERE GENERATION IS USED:</span>
                  </div>
                  <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
                    <li>Formulating plausible distractor options and identifying specific student cognitive traps.</li>
                    <li>Clinical diagnosis: diagnosing *why* a particular wrong choice reflects a fundamental misconception.</li>
                    <li>Personalized scheduling: balancing available days and study hours to optimize spaced repetition.</li>
                    <li>Explaining complex proofs step-by-step using only the retrieved citation bounds.</li>
                  </ul>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="font-bold text-white mb-1">Hallucination Guardrails:</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Temperature is clamped to 0.2 across evaluation and question generation. Structured JSON schemas (<code className="text-indigo-300 font-mono">responseMimeType: "application/json"</code>) enforce that every item must have an explicit <code className="text-indigo-300 font-mono">citation</code> object matching source text.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'roadmap' && (
            <div className="space-y-4">
              <h3 className="font-bold text-white text-base">Future Scalability & Enhancements</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5">
                  <div className="font-bold text-indigo-300">1. Teacher & Cohort Analytics Dashboard</div>
                  <p className="text-slate-400">
                    Aggregating diagnostic gap reports across an entire class so professors immediately spot which exam question will trigger widespread failure before exam day.
                  </p>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5">
                  <div className="font-bold text-indigo-300">2. Canvas, Blackboard & LMS Integration</div>
                  <p className="text-slate-400">
                    One-click sync with institutional syllabus modules, assignment feedback, and gradebook APIs to automatically populate notes.
                  </p>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5">
                  <div className="font-bold text-indigo-300">3. Spaced-Repetition Push & Calendar Reminders</div>
                  <p className="text-slate-400">
                    Direct export to Google Calendar and iCal with 10-minute active recall drills scheduled right when forgetting curves spike.
                  </p>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5">
                  <div className="font-bold text-indigo-300">4. Multi-Language & Mathematical Proof Verification</div>
                  <p className="text-slate-400">
                    Multilingual diagnostic generation and step-by-step LaTeX verification for advanced STEM coursework.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-mono">
            GapFinder AI Engine • Powered by Gemini 3.8 Flash & Grounded RAG
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl"
          >
            Close Overview
          </button>
        </div>
      </div>
    </div>
  );
};
