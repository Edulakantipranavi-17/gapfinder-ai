import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, BookOpen, Sparkles, X, FileText, AlertCircle, RefreshCw } from 'lucide-react';
import { Course, Document, Topic } from '../types';

interface AddCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddCourseModal: React.FC<AddCourseModalProps> = ({ isOpen, onClose }) => {
  const { addCourse, setIsGeneratingAI } = useApp();

  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [examDate, setExamDate] = useState('2026-11-20');
  const [syllabusText, setSyllabusText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleCreateCourse = async () => {
    if (!title.trim() || !code.trim()) {
      setError('Course title and code are required.');
      return;
    }
    if (!syllabusText.trim() || syllabusText.trim().length < 40) {
      setError('Please provide at least a brief syllabus outline.');
      return;
    }

    setIsProcessing(true);
    setIsGeneratingAI(true);
    try {
      const courseId = `course-${Date.now()}`;
      const docId = `doc-syl-${Date.now()}`;

      // Call extraction endpoint
      let extractedTopics: Topic[] = [];
      try {
        const res = await fetch('/api/syllabus/extract-topics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            syllabusText,
            courseTitle: title.trim(),
          }),
        });
        const data = await res.json();
        if (data.topics) {
          extractedTopics = data.topics.map((t: any, i: number) => ({
            id: `top-${courseId}-${i + 1}`,
            courseId,
            unit: t.unit || `Unit ${i + 1}`,
            name: t.name,
            description: t.description,
            weightage: t.weightage || 25,
            difficulty: t.difficulty || 'Intermediate',
            prerequisites: t.prerequisites || [],
            relatedChunkIds: [`chunk-${docId}-1`],
            status: 'unassessed' as const,
            masteryScore: 0,
            lastAssessed: null,
            questionsAttempted: 0,
            questionsCorrect: 0,
            diagnosisReason: 'Unassessed. Complete diagnostic quiz to establish baseline mastery score.',
            identifiedMisconceptions: [],
            recommendedAction: 'Take initial diagnostic quiz.',
          }));
        }
      } catch (err) {
        console.warn('Fallback to basic topics:', err);
      }

      if (extractedTopics.length === 0) {
        extractedTopics = [
          {
            id: `top-${courseId}-1`,
            courseId,
            unit: 'Unit 1: Fundamentals',
            name: `${title.trim()} Core Principles`,
            description: 'Key definitions, foundational paradigms, and base mechanisms.',
            weightage: 35,
            difficulty: 'Beginner',
            prerequisites: [],
            relatedChunkIds: [`chunk-${docId}-1`],
            status: 'unassessed',
            masteryScore: 0,
            lastAssessed: null,
            questionsAttempted: 0,
            questionsCorrect: 0,
            diagnosisReason: 'Unassessed.',
            identifiedMisconceptions: [],
            recommendedAction: 'Take diagnostic quiz.',
          },
          {
            id: `top-${courseId}-2`,
            courseId,
            unit: 'Unit 2: Advanced Applications',
            name: `${title.trim()} Analytical Problem Solving`,
            description: 'Complex scenarios, multi-step problem solving, and edge-case behaviors.',
            weightage: 65,
            difficulty: 'Advanced',
            prerequisites: ['Core Principles'],
            relatedChunkIds: [`chunk-${docId}-1`],
            status: 'unassessed',
            masteryScore: 0,
            lastAssessed: null,
            questionsAttempted: 0,
            questionsCorrect: 0,
            diagnosisReason: 'Unassessed.',
            identifiedMisconceptions: [],
            recommendedAction: 'Take diagnostic quiz.',
          },
        ];
      }

      const syllabusDoc: Document = {
        id: docId,
        title: `${code.toUpperCase()} Official Syllabus & Blueprint.md`,
        type: 'syllabus',
        uploadedAt: new Date().toISOString(),
        content: syllabusText,
        wordCount: syllabusText.split(/\s+/).length,
        chunks: [
          {
            id: `chunk-${docId}-1`,
            docId,
            docTitle: `${code.toUpperCase()} Official Syllabus & Blueprint.md`,
            section: 'Course Blueprint & Objectives',
            text: syllabusText.slice(0, 1000),
            keywords: [title, code, 'Syllabus'],
          },
        ],
      };

      const newCourse: Course = {
        id: courseId,
        title: title.trim(),
        code: code.trim().toUpperCase(),
        department: 'Academic Studies',
        examDate,
        daysRemaining: Math.max(1, Math.round((new Date(examDate).getTime() - Date.now()) / (1000 * 3600 * 24))),
        studyHoursPerDay: 2.0,
        documents: [syllabusDoc],
        topics: extractedTopics,
        gapReport: null,
        revisionPlan: null,
        quizHistory: [],
      };

      addCourse(newCourse);
      onClose();
    } catch (err) {
      console.error('Error creating course:', err);
      setError('Failed to process syllabus.');
    } finally {
      setIsProcessing(false);
      setIsGeneratingAI(false);
    }
  };

  const loadPreset = (presetTitle: string, presetCode: string, sampleSyl: string) => {
    setTitle(presetTitle);
    setCode(presetCode);
    setSyllabusText(sampleSyl);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Import New Syllabus & Build Topic Map</h3>
              <p className="text-xs text-slate-400">Map any curriculum into diagnostic assessment topics</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xs font-bold">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 bg-rose-950/80 border border-rose-800 text-rose-200 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick presets */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 mb-1.5 block">
              Quick Academic Presets:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() =>
                  loadPreset(
                    'Data Structures & Algorithms',
                    'CS 201',
                    `# CS 201 Data Structures & Algorithms
Unit 1: Graph Algorithms & Shortest Path (Weightage: 30%)
Dijkstra vs Bellman-Ford, negative weight cycles, A* search heuristics, Minimum Spanning Trees (Kruskal & Prim).
Unit 2: Dynamic Programming & Recurrence (Weightage: 35%)
Overlapping subproblems, optimal substructure, 0/1 Knapsack vs Unbounded Knapsack, Longest Common Subsequence (LCS).
Unit 3: Self-Balancing Trees (Weightage: 20%)
AVL rotations, Red-Black tree invariants, B-trees in databases.
Unit 4: Amortized Complexity & Disjoint Sets (Weightage: 15%)
Union-Find with path compression, Aggregate method, Accounting method.`
                  )
                }
                className="text-left p-2.5 rounded-xl border border-slate-800 bg-slate-950/70 hover:border-indigo-500 text-xs transition"
              >
                <div className="font-bold text-white">CS 201: Data Structures & Algorithms</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Graphs, DP, AVL Trees, Amortized</div>
              </button>

              <button
                type="button"
                onClick={() =>
                  loadPreset(
                    'Organic Chemistry: Mechanisms & Synthesis',
                    'CHEM 220',
                    `# CHEM 220 Organic Chemistry II
Unit 1: Carbonyl Addition & Condensation (Weightage: 35%)
Aldol condensation, Claisen ester condensation, Grignard reagents, enolate nucleophilicity.
Unit 2: Electrophilic Aromatic Substitution (Weightage: 30%)
Ortho/para vs meta directors, Friedel-Crafts alkylation and acylation limitations, resonance stabilization of arenium ions.
Unit 3: Spectroscopy & Structure Elucidation (Weightage: 35%)
1H-NMR chemical shift, coupling constants (J-values), 13C-NMR DEPT, IR characteristic absorption frequencies.`
                  )
                }
                className="text-left p-2.5 rounded-xl border border-slate-800 bg-slate-950/70 hover:border-indigo-500 text-xs transition"
              >
                <div className="font-bold text-white">CHEM 220: Organic Chemistry II</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Enolates, Aromatic EAS, NMR Spectroscopy</div>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Course Title</label>
              <input
                type="text"
                placeholder="e.g. Distributed Systems"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Course Code</label>
              <input
                type="text"
                placeholder="e.g. CS 452"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Target Exam Date</label>
            <input
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Syllabus Outline / Learning Objectives (Paste Text/Markdown)
            </label>
            <textarea
              rows={7}
              placeholder="Paste units, chapters, grading weightages, and key topics..."
              value={syllabusText}
              onChange={(e) => setSyllabusText(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white font-mono focus:outline-none focus:border-indigo-500 leading-relaxed"
            />
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateCourse}
            disabled={isProcessing}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Extracting Topic Tree...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Deconstruct & Initialize Course</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
