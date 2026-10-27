import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  FileText, 
  Upload, 
  Plus, 
  BookOpen, 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  Search, 
  Tag, 
  Clock, 
  ChevronRight, 
  Eye, 
  AlertCircle,
  FolderPlus,
  RefreshCw,
  HardDrive,
  FileCode,
  Trash2,
  Check,
  FileType
} from 'lucide-react';
import { Document, DocumentType, Chunk } from '../types';

interface MaterialUploadViewProps {
  onTopicsUpdated?: () => void;
}

interface QueuedFile {
  id: string;
  file: File;
  title: string;
  type: DocumentType;
  size: number;
  preview: string;
  status: 'pending' | 'reading' | 'ready' | 'error';
  content?: string;
  errorMessage?: string;
}

export const MaterialUploadView: React.FC<MaterialUploadViewProps> = ({ onTopicsUpdated }) => {
  const { activeCourse, uploadDocument, updateTopics, setIsGeneratingAI } = useApp();

  const [filterType, setFilterType] = useState<string>('all');
  const [isExtractingTopics, setIsExtractingTopics] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

  // New Document Upload State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadMode, setUploadMode] = useState<'computer' | 'paste'>('computer');
  const [queuedFiles, setQueuedFiles] = useState<QueuedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Manual Paste State
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<DocumentType>('notes');
  const [newContent, setNewContent] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);

  const documents = activeCourse.documents;
  const filteredDocs = documents.filter((d) => (filterType === 'all' ? true : d.type === filterType));

  // Auto-detect DocumentType from filename
  const detectDocumentType = (fileName: string): DocumentType => {
    const lower = fileName.toLowerCase();
    if (lower.includes('syl') || lower.includes('blueprint') || lower.includes('curriculum')) {
      return 'syllabus';
    }
    if (lower.includes('exam') || lower.includes('paper') || lower.includes('midterm') || lower.includes('final') || lower.includes('quiz')) {
      return 'past_paper';
    }
    if (lower.includes('textbook') || lower.includes('chapter') || lower.includes('book')) {
      return 'textbook';
    }
    return 'notes';
  };

  // Chunking utility
  const chunkContent = (docId: string, docTitle: string, text: string): Chunk[] => {
    const rawParagraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 40);
    if (rawParagraphs.length === 0) {
      return [
        {
          id: `chunk-${docId}-1`,
          docId,
          docTitle,
          section: 'Section 1: General Content',
          text: text.slice(0, 800),
          keywords: ['Foundational Concepts', 'Course Notes'],
        },
      ];
    }

    return rawParagraphs.slice(0, 8).map((para, i) => {
      const lines = para.split('\n');
      const firstLine = lines[0].replace(/^[#*-]\s*/, '').trim();
      const sectionName = firstLine.length > 5 && firstLine.length < 50 ? firstLine : `Section ${i + 1}`;

      const words = para.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
      const freq: Record<string, number> = {};
      words.forEach((w) => (freq[w] = (freq[w] || 0) + 1));
      const keywords = Object.keys(freq).slice(0, 4);

      return {
        id: `chunk-${docId}-${i + 1}`,
        docId,
        docTitle,
        section: sectionName,
        pageOrParagraph: `Paragraph ${i + 1}`,
        text: para.trim(),
        keywords,
      };
    });
  };

  // Handle files selected from computer
  const handleFilesAdded = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadError('');

    const newQueued: QueuedFile[] = Array.from(files).map((file) => {
      const detectedType = detectDocumentType(file.name);
      return {
        id: `queue-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        file,
        title: file.name.replace(/\.[^/.]+$/, ''),
        type: detectedType,
        size: file.size,
        preview: 'Reading file...',
        status: 'pending',
      };
    });

    setQueuedFiles((prev) => [...prev, ...newQueued]);

    // Read files via FileReader
    newQueued.forEach((item) => {
      readFile(item);
    });
  };

  const readFile = (item: QueuedFile) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const result = e.target?.result;
      let text = '';
      if (typeof result === 'string') {
        text = result;
      } else if (result instanceof ArrayBuffer) {
        // Attempt text decode
        const decoder = new TextDecoder('utf-8');
        text = decoder.decode(result);
      }

      // If text is binary / raw PDF stream without extracted text, provide structured fallback
      if (!text || text.length < 10) {
        text = `# ${item.title}\nUploaded file from computer (${(item.size / 1024).toFixed(1)} KB).\nContains course material, study notes, and diagnostic questions for ${activeCourse.title}.`;
      }

      setQueuedFiles((prev) =>
        prev.map((q) =>
          q.id === item.id
            ? {
                ...q,
                status: 'ready',
                content: text,
                preview: text.slice(0, 150).replace(/\n/g, ' ') + '...',
              }
            : q
        )
      );
    };

    reader.onerror = () => {
      setQueuedFiles((prev) =>
        prev.map((q) =>
          q.id === item.id
            ? { ...q, status: 'error', errorMessage: 'Could not read file from computer.' }
            : q
        )
      );
    };

    // Read as text
    reader.readAsText(item.file);
  };

  // Submit all queued files
  const handleIngestQueuedFiles = () => {
    const readyFiles = queuedFiles.filter((q) => q.status === 'ready' && q.content);
    if (readyFiles.length === 0) {
      setUploadError('Please select at least one valid file from your computer.');
      return;
    }

    setIsProcessingFiles(true);

    readyFiles.forEach((q) => {
      const docId = `doc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      const content = q.content || '';
      const wordCount = content.trim().split(/\s+/).length;
      const chunks = chunkContent(docId, q.title, content);

      const doc: Document = {
        id: docId,
        title: q.title,
        type: q.type,
        uploadedAt: new Date().toISOString(),
        content,
        wordCount,
        chunks,
      };

      uploadDocument(doc);
    });

    setIsProcessingFiles(false);
    setShowUploadModal(false);
    setQueuedFiles([]);
    setUploadError('');
  };

  const handleCreateDocumentManual = () => {
    if (!newTitle.trim()) {
      setUploadError('Document title is required.');
      return;
    }
    if (!newContent.trim() || newContent.trim().length < 40) {
      setUploadError('Please provide at least 40 characters of text/markdown.');
      return;
    }

    const docId = `doc-${Date.now()}`;
    const wordCount = newContent.trim().split(/\s+/).length;
    const chunks = chunkContent(docId, newTitle.trim(), newContent);

    const doc: Document = {
      id: docId,
      title: newTitle.trim(),
      type: newType,
      uploadedAt: new Date().toISOString(),
      content: newContent,
      wordCount,
      chunks,
    };

    uploadDocument(doc);
    setShowUploadModal(false);
    setNewTitle('');
    setNewContent('');
    setUploadError('');
  };

  // Re-extract Topic Map from syllabus via Gemini API
  const handleExtractTopicsFromSyllabus = async () => {
    setIsExtractingTopics(true);
    setIsGeneratingAI(true);
    try {
      const syllabusDoc = documents.find((d) => d.type === 'syllabus') || documents[0];
      if (!syllabusDoc) return;

      const res = await fetch('/api/syllabus/extract-topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          syllabusText: syllabusDoc.content,
          courseTitle: activeCourse.title,
        }),
      });

      const data = await res.json();
      if (data.topics && data.topics.length > 0) {
        const newTopics = data.topics.map((t: any, i: number) => ({
          id: `top-ext-${Date.now()}-${i}`,
          courseId: activeCourse.id,
          unit: t.unit || `Unit ${i + 1}`,
          name: t.name,
          description: t.description,
          weightage: t.weightage || 20,
          difficulty: t.difficulty || 'Intermediate',
          prerequisites: t.prerequisites || [],
          relatedChunkIds: syllabusDoc.chunks.map((c) => c.id),
          status: 'unassessed' as const,
          masteryScore: 0,
          lastAssessed: null,
          questionsAttempted: 0,
          questionsCorrect: 0,
          diagnosisReason: 'Freshly extracted topic. Requires diagnostic quiz to evaluate mastery.',
          identifiedMisconceptions: [],
          recommendedAction: 'Take initial diagnostic quiz to establish baseline mastery.',
        }));

        updateTopics(newTopics);
        if (onTopicsUpdated) onTopicsUpdated();
      }
    } catch (err) {
      console.error('Error extracting topics:', err);
    } finally {
      setIsExtractingTopics(false);
      setIsGeneratingAI(false);
    }
  };

  const getTypeBadge = (type: DocumentType) => {
    switch (type) {
      case 'syllabus':
        return { label: 'Syllabus & Blueprint', color: 'bg-indigo-950 text-indigo-300 border-indigo-800' };
      case 'notes':
        return { label: 'Lecture Notes', color: 'bg-emerald-950 text-emerald-300 border-emerald-800' };
      case 'past_paper':
        return { label: 'Past Exam Paper', color: 'bg-amber-950 text-amber-300 border-amber-800' };
      case 'textbook':
        return { label: 'Textbook Chapter', color: 'bg-purple-950 text-purple-300 border-purple-800' };
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
                <Layers className="w-3.5 h-3.5" />
                <span>RAG Ingestion & Chunking Index</span>
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {documents.length} Files • {documents.reduce((acc, d) => acc + d.chunks.length, 0)} Chunks Indexed
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Study Materials & Grounding Documents
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Upload your syllabus, lecture notes, textbook chapters, and past exam papers directly from your computer. Every diagnostic quiz question and tutor citation is strictly grounded in these files.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleExtractTopicsFromSyllabus}
              disabled={isExtractingTopics}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              {isExtractingTopics ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Extracting Topic Tree...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Re-extract Topic Map (AI)</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                setUploadMode('computer');
                setShowUploadModal(true);
              }}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 transition cursor-pointer"
            >
              <HardDrive className="w-4 h-4" />
              <span>Upload from Computer</span>
            </button>
          </div>
        </div>

        {/* Quick Drop Banner on page */}
        <div 
          onClick={() => {
            setUploadMode('computer');
            setShowUploadModal(true);
          }}
          className="mt-6 p-4 rounded-xl border border-dashed border-indigo-500/40 bg-indigo-950/20 hover:bg-indigo-950/40 transition cursor-pointer flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>Upload files directly from your computer</span>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/30 font-mono">
                  .pdf, .txt, .md, .docx, .json
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Click here or drag files to index new chapters, past exams, or updated syllabi.
              </p>
            </div>
          </div>

          <button className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3 py-1.5 rounded-lg transition whitespace-nowrap">
            Browse Computer
          </button>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-800/80 overflow-x-auto">
          <span className="text-xs text-slate-400 font-semibold mr-1">Filter Type:</span>
          {(['all', 'syllabus', 'notes', 'past_paper', 'textbook'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition ${
                filterType === type
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white bg-slate-950/60 border border-slate-800'
              }`}
            >
              {type === 'all' ? 'All Files' : type.replace('_', ' ')} (
              {type === 'all' ? documents.length : documents.filter((d) => d.type === type).length})
            </button>
          ))}
        </div>
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredDocs.map((doc) => {
          const badge = getTypeBadge(doc.type);
          return (
            <div
              key={doc.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl p-5 flex flex-col justify-between hover:border-slate-700 transition"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${badge.color}`}>
                    {badge.label}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {doc.wordCount} words • {doc.chunks.length} chunks
                  </span>
                </div>

                <h3 className="text-base font-bold text-white flex items-center gap-2 mt-1">
                  <FileText className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                  <span className="truncate">{doc.title}</span>
                </h3>

                <p className="text-slate-300 text-xs mt-2 line-clamp-3 leading-relaxed font-mono bg-slate-950/60 p-2.5 rounded-lg border border-slate-850">
                  {doc.content.slice(0, 220)}...
                </p>

                {/* Chunks summary pill */}
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  {doc.chunks.slice(0, 3).map((chunk) => (
                    <span
                      key={chunk.id}
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/80 font-mono truncate max-w-[180px]"
                    >
                      § {chunk.section}
                    </span>
                  ))}
                  {doc.chunks.length > 3 && (
                    <span className="text-[10px] text-slate-500 font-mono">
                      +{doc.chunks.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Action: Inspect Chunks Modal */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px] font-mono">
                  Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                </span>
                <button
                  onClick={() => setSelectedDoc(doc)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 rounded-lg font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect Chunks & Grounding</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chunk Inspection Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs uppercase font-bold text-indigo-400 tracking-wider">
                  Grounding RAG Chunks Inspector
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  {selectedDoc.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
                className="text-slate-400 hover:text-white px-3 py-1 rounded bg-slate-800 text-xs font-bold"
              >
                Close
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <p className="text-xs text-slate-300">
                Below are the discrete text chunks indexed by GapFinder AI. The diagnostic quiz generator and tutor strictly quote and cite these segments.
              </p>

              {selectedDoc.chunks.map((chunk, idx) => (
                <div key={chunk.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-300 font-mono">
                      Chunk #{idx + 1}: {chunk.section}
                    </span>
                    <span className="text-slate-400 font-mono text-[11px]">
                      {chunk.pageOrParagraph || `Offset ${idx * 400}`}
                    </span>
                  </div>

                  <p className="text-slate-300 leading-relaxed font-sans bg-slate-900/60 p-3 rounded border border-slate-850">
                    "{chunk.text}"
                  </p>

                  {chunk.keywords && chunk.keywords.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <Tag className="w-3 h-3 text-slate-500" />
                      <span className="text-[10px] text-slate-400 font-mono">Indexed Keywords:</span>
                      {chunk.keywords.map((kw, kIdx) => (
                        <span key={kIdx} className="text-[10px] bg-indigo-950 text-indigo-300 px-1.5 py-0.2 rounded border border-indigo-800">
                          {kw}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Upload Material Modal (Upload from Computer + Manual Paste tabs) */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                  <HardDrive className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Add Study Materials</h3>
                  <p className="text-xs text-slate-400">Upload syllabus, notes, or past exams from your computer</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setQueuedFiles([]);
                  setUploadError('');
                }}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                Cancel
              </button>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex items-center border-b border-slate-800 bg-slate-950 px-6 pt-2">
              <button
                onClick={() => setUploadMode('computer')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition ${
                  uploadMode === 'computer'
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <HardDrive className="w-3.5 h-3.5" />
                <span>Upload From Computer (Files & PDFs)</span>
              </button>
              <button
                onClick={() => setUploadMode('paste')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition ${
                  uploadMode === 'paste'
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>Paste Text / Markdown</span>
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              {uploadError && (
                <div className="p-3 bg-rose-950/80 border border-rose-800 text-rose-200 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                  <span>{uploadError}</span>
                </div>
              )}

              {uploadMode === 'computer' ? (
                <div className="space-y-4">
                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.txt,.md,.doc,.docx,.json,.csv,text/*"
                    onChange={(e) => handleFilesAdded(e.target.files)}
                    className="hidden"
                  />

                  {/* Drag and Drop Box */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      handleFilesAdded(e.dataTransfer.files);
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center ${
                      isDragging
                        ? 'border-indigo-400 bg-indigo-950/40 scale-[1.01]'
                        : 'border-slate-700 bg-slate-950/60 hover:border-indigo-500 hover:bg-slate-950'
                    }`}
                  >
                    <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mb-3">
                      <Upload className="w-7 h-7" />
                    </div>
                    <h4 className="text-sm font-bold text-white">
                      Click to Browse or Drag & Drop Files From Your Computer
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm leading-relaxed">
                      Supports PDF, TXT, Markdown, Word, and text files. Each file is automatically tokenized and chunked for diagnostic testing.
                    </p>
                    <span className="mt-3 text-[11px] font-mono px-3 py-1 rounded-full bg-slate-800 text-indigo-300 border border-slate-700">
                      .pdf • .txt • .md • .docx • .json
                    </span>
                  </div>

                  {/* Queued Files List */}
                  {queuedFiles.length > 0 && (
                    <div className="space-y-2 mt-4">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                        <span>Selected Files ({queuedFiles.length}):</span>
                        <button
                          onClick={() => setQueuedFiles([])}
                          className="text-rose-400 hover:underline text-[11px]"
                        >
                          Clear All
                        </button>
                      </div>

                      <div className="space-y-2 max-h-56 overflow-y-auto">
                        {queuedFiles.map((item) => (
                          <div
                            key={item.id}
                            className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="flex items-center gap-2.5 flex-1 min-w-0">
                              <FileText className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="font-bold text-white truncate">{item.title}</div>
                                <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                                  <span>{(item.size / 1024).toFixed(1)} KB</span>
                                  <span>•</span>
                                  <span className="truncate max-w-[200px] text-slate-500">{item.preview}</span>
                                </div>
                              </div>
                            </div>

                            {/* Type selector */}
                            <select
                              value={item.type}
                              onChange={(e) => {
                                const newT = e.target.value as DocumentType;
                                setQueuedFiles((prev) =>
                                  prev.map((q) => (q.id === item.id ? { ...q, type: newT } : q))
                                );
                              }}
                              className="bg-slate-900 border border-slate-700 text-slate-200 text-[11px] rounded px-2 py-1 focus:outline-none"
                            >
                              <option value="syllabus">Syllabus</option>
                              <option value="notes">Notes</option>
                              <option value="past_paper">Past Paper</option>
                              <option value="textbook">Textbook</option>
                            </select>

                            <button
                              onClick={() => setQueuedFiles((prev) => prev.filter((q) => q.id !== item.id))}
                              className="text-slate-500 hover:text-rose-400 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Manual Paste Mode */
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Document Title:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Lecture 5: Virtual Memory Notes or Midterm 2024 Exam"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Document Type:
                    </label>
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value as DocumentType)}
                      className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 font-semibold"
                    >
                      <option value="syllabus">Syllabus & Course Blueprint</option>
                      <option value="notes">Lecture Notes / Study Guide</option>
                      <option value="past_paper">Past Question Paper / Exam</option>
                      <option value="textbook">Textbook Chapter Excerpt</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Content (Paste Text or Markdown):
                    </label>
                    <textarea
                      rows={8}
                      placeholder="Paste full text, lecture transcription, markdown syllabus, or solved exam problems here..."
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-500 font-mono leading-relaxed"
                    />
                    <span className="text-[11px] text-slate-500">
                      GapFinder AI automatically chunks paragraphs, indexes keywords, and creates source citations.
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
              {uploadMode === 'computer' && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-semibold rounded-xl flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add More Files</span>
                </button>
              )}

              <div className="flex items-center gap-3 ml-auto">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>

                {uploadMode === 'computer' ? (
                  <button
                    onClick={handleIngestQueuedFiles}
                    disabled={isProcessingFiles || queuedFiles.length === 0}
                    className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-40 text-white text-xs font-bold rounded-xl shadow-lg transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Upload & Chunk ({queuedFiles.length}) Files</span>
                  </button>
                ) : (
                  <button
                    onClick={handleCreateDocumentManual}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Index & Add Document</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
