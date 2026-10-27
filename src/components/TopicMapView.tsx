import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  FolderGit2, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  ArrowRight, 
  FileText, 
  BookOpen, 
  Layers, 
  ExternalLink,
  ChevronRight,
  TrendingDown,
  Orbit
} from 'lucide-react';
import { Topic, MasteryStatus } from '../types';

interface TopicMapViewProps {
  onStartQuizForTopic: (topicId: string) => void;
  onAskAboutTopic: (topicName: string) => void;
}

export const TopicMapView: React.FC<TopicMapViewProps> = ({
  onStartQuizForTopic,
  onAskAboutTopic,
}) => {
  const { activeCourse, setActiveTab } = useApp();
  const [selectedUnit, setSelectedUnit] = useState<string>('all');

  const topics = activeCourse.topics;

  // Group topics by Unit
  const units = Array.from(new Set(topics.map((t) => t.unit)));

  const filteredTopics = topics.filter((t) => {
    if (selectedUnit === 'all') return true;
    return t.unit === selectedUnit;
  });

  const getStatusBadge = (status: MasteryStatus) => {
    switch (status) {
      case 'weak':
        return { label: 'Weak Gap (< 50%)', class: 'bg-rose-950 text-rose-300 border-rose-800' };
      case 'medium':
        return { label: 'Medium (50-75%)', class: 'bg-amber-950 text-amber-300 border-amber-800' };
      case 'strong':
        return { label: 'Strong (> 75%)', class: 'bg-emerald-950 text-emerald-300 border-emerald-800' };
      default:
        return { label: 'Unassessed', class: 'bg-slate-800 text-slate-400 border-slate-700' };
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
                <FolderGit2 className="w-3.5 h-3.5" />
                <span>Extracted Curriculum Hierarchy</span>
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {activeCourse.title} ({activeCourse.code})
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Syllabus Topic Map & Cognitive Graph
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Deconstructed from your course syllabus into core units, difficulty levels, prerequisite chains, and exam weightages.
            </p>
          </div>

          {/* Unit Filter */}
          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Filter Unit:</span>
            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 font-medium"
            >
              <option value="all">All Syllabus Units ({topics.length} topics)</option>
              {units.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
            <button
              onClick={() => setActiveTab('galaxy')}
              className="px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs rounded-lg shadow transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ml-1"
            >
              <Orbit className="w-3.5 h-3.5" />
              <span>3D Galaxy</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Topics grouped or displayed */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredTopics.map((topic) => {
          const badge = getStatusBadge(topic.status);
          const relatedChunks = activeCourse.documents.flatMap((d) => d.chunks).filter((c) => topic.relatedChunkIds?.includes(c.id));

          return (
            <div
              key={topic.id}
              className={`rounded-2xl border transition bg-slate-900/90 shadow-xl overflow-hidden p-5 flex flex-col justify-between ${
                topic.status === 'weak' ? 'border-rose-900/60' : 'border-slate-800'
              }`}
            >
              <div>
                {/* Unit & Status */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-950/80 border border-indigo-800 px-2 py-0.5 rounded">
                    {topic.unit}
                  </span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${badge.class}`}>
                    {badge.label}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mt-1">
                  {topic.name}
                </h3>

                <p className="text-slate-300 text-xs mt-1.5 leading-relaxed">
                  {topic.description}
                </p>

                {/* Prerequisites */}
                {topic.prerequisites && topic.prerequisites.length > 0 && (
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Prereqs:</span>
                    {topic.prerequisites.map((p, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                )}

                {/* Grounded Material Chunks Linkage */}
                <div className="mt-3 pt-3 border-t border-slate-800/80 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-400 font-medium mb-1">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Grounded Document Sections ({relatedChunks.length}):</span>
                  </div>
                  {relatedChunks.length > 0 ? (
                    <div className="space-y-1">
                      {relatedChunks.slice(0, 2).map((chunk) => (
                        <div
                          key={chunk.id}
                          className="text-[11px] text-slate-300 bg-slate-950/60 border border-slate-800/60 p-2 rounded truncate"
                        >
                          <span className="text-indigo-400 font-semibold">{chunk.docTitle}</span> — {chunk.section}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-500 italic">Connected across general course syllabus.</span>
                  )}
                </div>
              </div>

              {/* Bottom stats & action */}
              <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div>
                    <span className="text-slate-500">Weightage:</span>{' '}
                    <strong className="text-white font-mono">{topic.weightage}%</strong>
                  </div>
                  <span className="text-slate-700">|</span>
                  <div>
                    <span className="text-slate-500">Mastery:</span>{' '}
                    <strong className={topic.status === 'weak' ? 'text-rose-400 font-mono' : 'text-emerald-400 font-mono'}>
                      {topic.masteryScore}%
                    </strong>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onAskAboutTopic(topic.name)}
                    className="text-xs text-indigo-300 hover:text-white px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
                  >
                    Explain
                  </button>

                  <button
                    onClick={() => onStartQuizForTopic(topic.id)}
                    className="text-xs font-semibold text-white px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition flex items-center gap-1 cursor-pointer"
                  >
                    <span>Run Diagnostic</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
