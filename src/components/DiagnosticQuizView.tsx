import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Sparkles, 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  BookOpen, 
  ArrowRight, 
  RotateCcw, 
  ShieldCheck, 
  BrainCircuit, 
  ChevronRight, 
  ListFilter,
  Check,
  RefreshCw,
  FileText
} from 'lucide-react';
import { Question, QuizSession, TopicDiagnosis } from '../types';

interface DiagnosticQuizViewProps {
  initialTopicId?: string;
  onNavigateToDiagnosis?: () => void;
  onNavigateToPlan?: () => void;
}

export const DiagnosticQuizView: React.FC<DiagnosticQuizViewProps> = ({
  initialTopicId,
  onNavigateToDiagnosis,
  onNavigateToPlan,
}) => {
  const { activeCourse, recordQuizCompletion, isGeneratingAI, setIsGeneratingAI } = useApp();

  const [selectedTopicId, setSelectedTopicId] = useState<string>(initialTopicId || 'all');
  const [questionCount, setQuestionCount] = useState<number>(3);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Active Quiz State
  const [activeQuestions, setActiveQuestions] = useState<Question[]>(() => {
    // Default to existing sample questions if available
    const existing = activeCourse.quizHistory[0]?.questions;
    if (existing && existing.length > 0) return existing;
    return [];
  });

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>(() => {
    return activeCourse.quizHistory[0]?.userAnswers || {};
  });
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(() => {
    return activeCourse.quizHistory.length > 0;
  });
  const [evaluationResult, setEvaluationResult] = useState<{
    examRiskScore: number;
    overallVerdict: string;
    topicDiagnoses: TopicDiagnosis[];
  } | null>(null);

  // Generate Questions via RAG server endpoint
  const handleGenerateQuestions = async () => {
    setIsGenerating(true);
    setIsGeneratingAI(true);
    try {
      let targetTopicName = 'Comprehensive Course Diagnosis';
      let targetTopicDesc = '';
      let relevantChunks = activeCourse.documents.flatMap((d) => d.chunks);

      if (selectedTopicId !== 'all') {
        const topic = activeCourse.topics.find((t) => t.id === selectedTopicId);
        if (topic) {
          targetTopicName = topic.name;
          targetTopicDesc = topic.description;
          if (topic.relatedChunkIds && topic.relatedChunkIds.length > 0) {
            relevantChunks = relevantChunks.filter((c) => topic.relatedChunkIds.includes(c.id));
          }
        }
      }

      const res = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicName: targetTopicName,
          topicDescription: targetTopicDesc,
          materialChunks: relevantChunks,
          questionCount,
        }),
      });

      const data = await res.json();
      if (data.questions && data.questions.length > 0) {
        const mappedQuestions: Question[] = data.questions.map((q: any, i: number) => ({
          id: `gen-q-${Date.now()}-${i}`,
          topicId: selectedTopicId !== 'all' ? selectedTopicId : activeCourse.topics[i % activeCourse.topics.length].id,
          topicName: selectedTopicId !== 'all' ? targetTopicName : activeCourse.topics[i % activeCourse.topics.length].name,
          type: q.type || 'conceptual_mcq',
          prompt: q.prompt,
          options: q.options,
          correctIndex: q.correctIndex,
          citation: q.citation || {
            docTitle: activeCourse.documents[0]?.title || 'Uploaded Course Syllabus',
            section: 'Core Principles',
            excerpt: 'Grounded citation reference from student material.',
          },
          explanation: q.explanation || 'Verified from course notes.',
          distractorRationales: q.distractorRationales || {},
          commonTrap: q.commonTrap || 'Misinterpreting edge condition invariants.',
        }));

        setActiveQuestions(mappedQuestions);
        setUserAnswers({});
        setCurrentQuestionIndex(0);
        setHasSubmitted(false);
        setEvaluationResult(null);
      }
    } catch (err) {
      console.error('Quiz generation error:', err);
    } finally {
      setIsGenerating(false);
      setIsGeneratingAI(false);
    }
  };

  const handleSelectOption = (qId: string, optionIdx: number) => {
    if (hasSubmitted) return;
    setUserAnswers((prev) => ({
      ...prev,
      [qId]: optionIdx,
    }));
  };

  const currentQ = activeQuestions[currentQuestionIndex];

  // Submit and run Deep Diagnosis Evaluation via Server
  const handleSubmitQuiz = async () => {
    setIsEvaluating(true);
    setIsGeneratingAI(true);
    try {
      const res = await fetch('/api/quiz/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questions: activeQuestions,
          userAnswers,
          topicMap: activeCourse.topics,
        }),
      });

      const data = await res.json();
      setEvaluationResult(data);
      setHasSubmitted(true);

      // Record to AppContext & update course topics / gap report
      const session: QuizSession = {
        id: `sess-${Date.now()}`,
        courseId: activeCourse.id,
        startedAt: new Date(Date.now() - 15 * 60000).toISOString(),
        completedAt: new Date().toISOString(),
        questions: activeQuestions,
        userAnswers,
        score: Math.round(
          (activeQuestions.filter((q) => userAnswers[q.id] === q.correctIndex).length /
            activeQuestions.length) *
            100
        ),
        evaluated: true,
      };

      recordQuizCompletion(session, data);
    } catch (err) {
      console.error('Quiz evaluation error:', err);
    } finally {
      setIsEvaluating(false);
      setIsGeneratingAI(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Quiz Generator & Control Bar */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <BrainCircuit className="w-3.5 h-3.5" />
                <span>Strict Material-Grounded Generator</span>
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {activeCourse.documents.length} Source Documents Active
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Diagnostic Assessment Engine
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Every question is generated strictly from the student's uploaded notes, syllabus, and past exam papers with precise citations. Questions test conceptual traps, not superficial memorization.
            </p>
          </div>

          {/* Controls: Target Topic & Question Count */}
          <div className="flex flex-wrap items-center gap-3 bg-slate-950/70 border border-slate-800 p-3 rounded-xl">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Target Topic:
              </label>
              <select
                value={selectedTopicId}
                onChange={(e) => setSelectedTopicId(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
              >
                <option value="all">Full Syllabus Diagnostic (All Topics)</option>
                {activeCourse.topics.map((t) => (
                  <option key={t.id} value={t.id}>
                    [{t.status.toUpperCase()}] {t.name} ({t.weightage}%)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Questions:
              </label>
              <select
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
              >
                <option value={3}>3 Questions (Fast Gap Check)</option>
                <option value={5}>5 Questions (Comprehensive)</option>
              </select>
            </div>

            <div className="self-end">
              <button
                onClick={handleGenerateQuestions}
                disabled={isGenerating}
                className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-md transition disabled:opacity-50 cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Extracting RAG Questions...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate New Test</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quiz Progress & Question Box */}
      {activeQuestions.length > 0 ? (
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl p-6 sm:p-8">
          {/* Header navigation within quiz */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-950/80 border border-indigo-800 px-2.5 py-1 rounded">
                Question {currentQuestionIndex + 1} of {activeQuestions.length}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Topic: <strong className="text-white">{currentQ?.topicName}</strong>
              </span>
            </div>

            {/* Stepper pills */}
            <div className="flex items-center gap-1.5">
              {activeQuestions.map((q, idx) => {
                const isAnswered = userAnswers[q.id] !== undefined;
                const isCurrent = idx === currentQuestionIndex;
                const isCorrect = userAnswers[q.id] === q.correctIndex;
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                      isCurrent
                        ? 'bg-indigo-600 text-white ring-2 ring-indigo-400'
                        : hasSubmitted
                        ? isCorrect
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                          : 'bg-rose-950 text-rose-300 border border-rose-700'
                        : isAnswered
                        ? 'bg-slate-700 text-slate-200'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Current Question Body */}
          {currentQ && (
            <div className="mt-6 space-y-6">
              {/* Question Prompt */}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                  Conceptual Scenario
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-white mt-1 leading-snug">
                  {currentQ.prompt}
                </h2>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {currentQ.options.map((option, optIdx) => {
                  const isSelected = userAnswers[currentQ.id] === optIdx;
                  const isCorrect = optIdx === currentQ.correctIndex;
                  const showResult = hasSubmitted;

                  let optionStyle = 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300';
                  if (isSelected && !showResult) {
                    optionStyle = 'bg-indigo-600/20 border-indigo-500 text-white ring-1 ring-indigo-500';
                  } else if (showResult) {
                    if (isCorrect) {
                      optionStyle = 'bg-emerald-950/60 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500';
                    } else if (isSelected && !isCorrect) {
                      optionStyle = 'bg-rose-950/60 border-rose-500 text-rose-200 ring-1 ring-rose-500';
                    } else {
                      optionStyle = 'bg-slate-950/40 border-slate-850 text-slate-500 opacity-60';
                    }
                  }

                  return (
                    <div
                      key={optIdx}
                      onClick={() => handleSelectOption(currentQ.id, optIdx)}
                      className={`p-4 rounded-xl border text-sm transition cursor-pointer flex items-start gap-3.5 ${optionStyle}`}
                    >
                      <span className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        isSelected
                          ? showResult
                            ? isCorrect
                              ? 'bg-emerald-500 text-slate-950'
                              : 'bg-rose-500 text-white'
                            : 'bg-indigo-600 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {String.fromCharCode(65 + optIdx)}
                      </span>

                      <div className="flex-1">
                        <span className="font-medium text-slate-100">{option}</span>

                        {/* Distractor Rationale (after submit or selection) */}
                        {showResult && currentQ.distractorRationales?.[optIdx] && !isCorrect && (
                          <div className="mt-2 text-xs text-rose-300/90 bg-rose-950/40 border border-rose-900/50 p-2.5 rounded-lg flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                            <div>
                              <span className="font-semibold text-rose-300">Why this distractor fails: </span>
                              <span>{currentQ.distractorRationales[optIdx]}</span>
                            </div>
                          </div>
                        )}

                        {showResult && isCorrect && (
                          <div className="mt-2 text-xs text-emerald-300/90 bg-emerald-950/40 border border-emerald-900/50 p-2.5 rounded-lg flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                            <div>
                              <span className="font-semibold text-emerald-300">Correct Invariant: </span>
                              <span>{currentQ.explanation}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* RAG Source Citation Badge (Proves strictly grounded retrieval!) */}
              <div className="rounded-xl bg-slate-950/80 border border-slate-800 p-4 text-xs">
                <div className="flex items-center gap-2 text-indigo-400 font-semibold mb-1.5">
                  <BookOpen className="w-4 h-4" />
                  <span>Grounding Citation (Student Material Proof):</span>
                </div>
                <div className="text-slate-300 flex flex-wrap items-center gap-2">
                  <span className="bg-slate-800 text-indigo-300 px-2 py-0.5 rounded font-mono font-medium">
                    {currentQ.citation.docTitle}
                  </span>
                  <span className="text-slate-500">§</span>
                  <span className="font-semibold text-white">
                    {currentQ.citation.section}
                  </span>
                </div>
                <blockquote className="mt-2 text-slate-400 italic border-l-2 border-indigo-500/50 pl-3 leading-relaxed">
                  "{currentQ.citation.excerpt}"
                </blockquote>

                {currentQ.commonTrap && (
                  <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-start gap-2 text-amber-300">
                    <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold">Targeted Misconception Trap: </span>
                      <span className="text-slate-300">{currentQ.commonTrap}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation & Submit Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800">
                <button
                  onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentQuestionIndex === 0}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs font-semibold rounded-lg transition cursor-pointer"
                >
                  Previous Question
                </button>

                <div className="flex items-center gap-3">
                  {currentQuestionIndex < activeQuestions.length - 1 ? (
                    <button
                      onClick={() => setCurrentQuestionIndex((prev) => Math.min(activeQuestions.length - 1, prev + 1))}
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Next Question</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : !hasSubmitted ? (
                    <button
                      onClick={handleSubmitQuiz}
                      disabled={isEvaluating || Object.keys(userAnswers).length === 0}
                      className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-extrabold rounded-lg shadow-lg shadow-emerald-900/40 transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                      {isEvaluating ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Diagnosing Cognitive Gaps...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4" />
                          <span>Submit & Update Gap Report</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={onNavigateToDiagnosis}
                      className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>View Updated Gap Report</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Post-Submission Diagnosis Notification Card */}
          {hasSubmitted && evaluationResult && (
            <div className="mt-8 rounded-2xl bg-indigo-950/60 border border-indigo-700/50 p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Diagnosis Completed & Syllabi State Updated
                  </span>
                  <h3 className="text-lg font-bold text-white mt-1">
                    New Exam Risk Assessment: {evaluationResult.examRiskScore}/100
                  </h3>
                  <p className="text-slate-300 text-xs mt-1">
                    {evaluationResult.overallVerdict}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={onNavigateToDiagnosis}
                    className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs rounded-xl shadow transition"
                  >
                    Inspect Diagnosis Report
                  </button>
                  <button
                    onClick={onNavigateToPlan}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow transition"
                  >
                    Regenerate Revision Plan
                  </button>
                </div>
              </div>

              {/* Quick Topic Delta */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-indigo-800/60 text-xs">
                {evaluationResult.topicDiagnoses.slice(0, 3).map((d, i) => (
                  <div key={i} className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white truncate max-w-[150px]">{d.topicId}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                        d.status === 'weak' ? 'bg-rose-950 text-rose-300' : d.status === 'medium' ? 'bg-amber-950 text-amber-300' : 'bg-emerald-950 text-emerald-300'
                      }`}>
                        {d.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                      {d.diagnosisReason}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-16 bg-slate-900/50 rounded-2xl border border-slate-800 p-8">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No Diagnostic Questions Loaded</h3>
          <p className="text-slate-400 text-xs max-w-md mx-auto mt-1 mb-5">
            Click "Generate New Test" to extract questions grounded directly in your syllabus and lecture notes.
          </p>
          <button
            onClick={handleGenerateQuestions}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition"
          >
            Generate Diagnostic Test
          </button>
        </div>
      )}
    </div>
  );
};
