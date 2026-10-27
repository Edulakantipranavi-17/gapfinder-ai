import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Circle, 
  AlertTriangle, 
  Sparkles, 
  RotateCcw, 
  BookOpen, 
  FileText, 
  ChevronRight, 
  TrendingUp, 
  Filter,
  Check,
  RefreshCw,
  Flame,
  Zap,
  Target
} from 'lucide-react';
import { RevisionPlan, RevisionDay, RevisionBlock } from '../types';

interface RevisionPlanViewProps {
  onStartQuizForTopic?: (topicId: string) => void;
  onAskAboutBlock?: (action: string, citation: string) => void;
}

export const RevisionPlanView: React.FC<RevisionPlanViewProps> = ({
  onStartQuizForTopic,
  onAskAboutBlock,
}) => {
  const { activeCourse, setRevisionPlan, togglePlanBlock, setActiveTab, isGeneratingAI, setIsGeneratingAI } = useApp();

  const [daysAvailable, setDaysAvailable] = useState<number>(activeCourse.revisionPlan?.daysAvailable || 7);
  const [hoursPerDay, setHoursPerDay] = useState<number>(activeCourse.revisionPlan?.hoursPerDay || 2.5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [filterPriority, setFilterPriority] = useState<'all' | 'High' | 'Medium' | 'Low'>('all');

  const plan = activeCourse.revisionPlan;

  // Calculate completed stats
  const allBlocks = plan?.days.flatMap((d) => d.blocks) || [];
  const completedBlocks = allBlocks.filter((b) => b.completed).length;
  const progressPercent = allBlocks.length > 0 ? Math.round((completedBlocks / allBlocks.length) * 100) : 0;
  const totalAllocatedMinutes = allBlocks.reduce((acc, b) => acc + (b.estimatedMinutes || 0), 0);

  // Generate / Regenerate plan using API
  const handleRegeneratePlan = async () => {
    setIsGenerating(true);
    setIsGeneratingAI(true);
    try {
      const res = await fetch('/api/plan/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseTitle: activeCourse.title,
          examDate: activeCourse.examDate,
          daysAvailable,
          hoursPerDay,
          gapReport: activeCourse.gapReport,
          topics: activeCourse.topics,
        }),
      });

      const data = await res.json();
      if (data.days && data.days.length > 0) {
        const newPlan: RevisionPlan = {
          id: `rev-${Date.now()}`,
          courseId: activeCourse.id,
          generatedAt: new Date().toISOString(),
          examDate: activeCourse.examDate,
          daysAvailable,
          hoursPerDay,
          totalAllocatedHours: daysAvailable * hoursPerDay,
          overallRiskLevel: (activeCourse.gapReport?.examRiskScore || 50) > 60 ? 'High' : 'Medium',
          overallStrategy: data.overallStrategy || 'Prioritized diagnostic remediation schedule.',
          days: data.days.map((d: any, dayIdx: number) => ({
            dayNumber: d.dayNumber || dayIdx + 1,
            dateLabel: d.dateLabel || `Day ${dayIdx + 1}`,
            focus: d.focus || 'Targeted topic gap remediation',
            blocks: (d.blocks || []).map((b: any, bIdx: number) => ({
              id: `block-${dayIdx + 1}-${bIdx + 1}`,
              topicId: b.topicId || 'top-cs301-vm',
              topicName: b.topicName,
              priority: b.priority || 'High',
              estimatedMinutes: b.estimatedMinutes || 45,
              action: b.action,
              sourceCitation: b.sourceCitation || 'Course Lecture Notes',
              completed: false,
              type: b.type || 'concept_review',
            })),
          })),
        };

        setRevisionPlan(newPlan);
      }
    } catch (err) {
      console.error('Error generating revision plan:', err);
    } finally {
      setIsGenerating(false);
      setIsGeneratingAI(false);
    }
  };

  const getBlockTypeBadge = (type: RevisionBlock['type']) => {
    switch (type) {
      case 'concept_review':
        return { label: 'Concept Remediation', color: 'bg-purple-950 text-purple-300 border-purple-800' };
      case 'worked_example':
        return { label: 'Worked Example', color: 'bg-blue-950 text-blue-300 border-blue-800' };
      case 'past_paper_drill':
        return { label: 'Past Paper Drill', color: 'bg-amber-950 text-amber-300 border-amber-800' };
      case 'active_recall':
        return { label: 'Active Recall Check', color: 'bg-emerald-950 text-emerald-300 border-emerald-800' };
      default:
        return { label: 'Study Block', color: 'bg-slate-800 text-slate-300 border-slate-700' };
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Revision Plan Header Card */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/70 border border-slate-800 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Adaptive Gap-Prioritized Timetable</span>
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Syllabus: {activeCourse.code}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Personalized Revision Plan
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
                Ordinary study plans divide time equally. GapFinder AI dedicates 80% of your available hours directly to the topics and misconceptions you missed in diagnostic quizzes.
              </p>
            </div>

            {/* Customization Controls: Days & Daily Hours */}
            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl flex flex-wrap items-center gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Days Until Exam:
                </label>
                <div className="flex items-center gap-1">
                  {[3, 7, 14].map((d) => (
                    <button
                      key={d}
                      onClick={() => setDaysAvailable(d)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                        daysAvailable === d
                          ? 'bg-indigo-600 text-white shadow'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {d}d
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Daily Study Hours:
                </label>
                <select
                  value={hoursPerDay}
                  onChange={(e) => setHoursPerDay(Number(e.target.value))}
                  className="bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 font-semibold"
                >
                  <option value={1.5}>1.5 hrs / day</option>
                  <option value={2.5}>2.5 hrs / day</option>
                  <option value={4.0}>4.0 hrs / day</option>
                </select>
              </div>

              <div className="self-end">
                <button
                  onClick={handleRegeneratePlan}
                  disabled={isGenerating}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-md transition disabled:opacity-50 cursor-pointer"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Optimizing Plan...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Adapt to New Gaps</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Plan Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6">
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
              <span className="text-[11px] uppercase font-semibold text-slate-400">Total Commitment</span>
              <div className="text-xl font-bold text-white mt-0.5 flex items-baseline gap-1">
                <span>{(daysAvailable * hoursPerDay).toFixed(1)}</span>
                <span className="text-xs text-slate-400">study hours</span>
              </div>
              <div className="text-[10px] text-indigo-400 mt-1">
                Across {daysAvailable} dedicated days
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
              <span className="text-[11px] uppercase font-semibold text-slate-400">Weak Topics Focus</span>
              <div className="text-xl font-bold text-rose-400 mt-0.5 flex items-baseline gap-1">
                <span>~78%</span>
                <span className="text-xs text-slate-400">time allocation</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Remediates critical blind spots first
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
              <span className="text-[11px] uppercase font-semibold text-slate-400">Progress Closed</span>
              <div className="text-xl font-bold text-emerald-400 mt-0.5 flex items-baseline gap-1">
                <span>{progressPercent}%</span>
                <span className="text-xs text-slate-400">({completedBlocks}/{allBlocks.length} tasks)</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
              <span className="text-[11px] uppercase font-semibold text-slate-400">Synthesis Strategy</span>
              <div className="text-xs font-semibold text-indigo-200 mt-1 line-clamp-2">
                {plan?.overallStrategy || 'Spaced revision targeting flagged misconceptions.'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter by Priority */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <h2 className="text-lg font-bold text-white">Daily Study Blocks & Direct References</h2>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-xl">
          {(['all', 'High', 'Medium', 'Low'] as const).map((pri) => (
            <button
              key={pri}
              onClick={() => setFilterPriority(pri)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                filterPriority === pri
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {pri === 'all' ? 'All Blocks' : `${pri} Priority`}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline Days */}
      {plan?.days && plan.days.length > 0 ? (
        <div className="space-y-6">
          {plan.days.map((day) => {
            const filteredBlocks = day.blocks.filter((b) => {
              if (filterPriority === 'all') return true;
              return b.priority === filterPriority;
            });

            if (filteredBlocks.length === 0 && filterPriority !== 'all') return null;

            const dayMinutes = day.blocks.reduce((acc, b) => acc + (b.estimatedMinutes || 0), 0);
            const isDayCompleted = day.blocks.every((b) => b.completed);

            return (
              <div
                key={day.dayNumber}
                className={`rounded-2xl border transition bg-slate-900/90 shadow-xl overflow-hidden p-5 sm:p-6 ${
                  isDayCompleted ? 'border-emerald-900/50 opacity-80' : 'border-slate-800'
                }`}
              >
                {/* Day Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 font-extrabold text-sm flex items-center justify-center">
                      D{day.dayNumber}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white">{day.dateLabel}</h3>
                        <span className="text-xs text-slate-500">•</span>
                        <span className="text-xs font-semibold text-indigo-400 font-mono">
                          {dayMinutes} mins scheduled
                        </span>
                        {isDayCompleted && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                            Day Completed
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5 font-medium">
                        Focus: {day.focus}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('quiz')}
                    className="self-start sm:self-auto text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 transition"
                  >
                    <span>Verify with Diagnostic Quiz</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Blocks in Day */}
                <div className="mt-4 space-y-3">
                  {filteredBlocks.map((block) => {
                    const badge = getBlockTypeBadge(block.type);
                    return (
                      <div
                        key={block.id}
                        className={`p-4 rounded-xl border transition flex items-start justify-between gap-4 ${
                          block.completed
                            ? 'bg-slate-950/40 border-slate-850 opacity-70'
                            : block.priority === 'High'
                            ? 'bg-slate-950/70 border-rose-900/40 hover:border-rose-700/60'
                            : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start gap-3 flex-1">
                          {/* Toggle Checkbox */}
                          <button
                            onClick={() => togglePlanBlock(day.dayNumber, block.id)}
                            className="mt-0.5 text-slate-400 hover:text-emerald-400 transition cursor-pointer flex-shrink-0"
                            title={block.completed ? 'Mark incomplete' : 'Mark complete'}
                          >
                            {block.completed ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                            ) : (
                              <Circle className="w-5 h-5 text-slate-600 hover:text-slate-400" />
                            )}
                          </button>

                          <div className="flex-1">
                            {/* Badges */}
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                                block.priority === 'High'
                                  ? 'bg-rose-950 text-rose-300 border-rose-800'
                                  : block.priority === 'Medium'
                                  ? 'bg-amber-950 text-amber-300 border-amber-800'
                                  : 'bg-slate-800 text-slate-400 border-slate-700'
                              }`}>
                                {block.priority} Priority
                              </span>

                              <span className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${badge.color}`}>
                                {badge.label}
                              </span>

                              <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {block.estimatedMinutes} mins
                              </span>

                              <span className="text-xs font-semibold text-slate-200">
                                {block.topicName}
                              </span>
                            </div>

                            {/* Action Instruction */}
                            <p className={`text-xs sm:text-sm font-medium leading-relaxed ${
                              block.completed ? 'text-slate-400 line-through' : 'text-slate-100'
                            }`}>
                              {block.action}
                            </p>

                            {/* Exact Source Citation */}
                            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-indigo-300">
                              <BookOpen className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                              <span className="text-[11px] text-slate-400 font-mono">Reference:</span>
                              <span className="text-[11px] font-semibold bg-indigo-950/80 border border-indigo-800/60 px-2 py-0.5 rounded text-indigo-200">
                                {block.sourceCitation}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Action buttons on block */}
                        {onAskAboutBlock && (
                          <button
                            onClick={() => onAskAboutBlock(block.action, block.sourceCitation)}
                            className="text-xs text-slate-400 hover:text-indigo-300 bg-slate-900 border border-slate-800 hover:border-slate-700 px-2.5 py-1 rounded-lg transition hidden md:block whitespace-nowrap cursor-pointer"
                          >
                            Ask Tutor
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-slate-900/50 rounded-2xl border border-slate-800 p-8">
          <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No Revision Plan Generated Yet</h3>
          <p className="text-slate-400 text-xs max-w-md mx-auto mt-1 mb-5">
            Click "Generate Adaptive Plan" to turn your diagnostic gaps into an actionable revision schedule.
          </p>
          <button
            onClick={handleRegeneratePlan}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition"
          >
            Generate Adaptive Revision Plan
          </button>
        </div>
      )}
    </div>
  );
};
