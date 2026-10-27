import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  MessageSquare, 
  Send, 
  Sparkles, 
  BookOpen, 
  ShieldCheck, 
  Lightbulb, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw,
  HelpCircle,
  Copy,
  Check
} from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  citationsUsed?: Array<{ docTitle: string; section: string; excerpt: string }>;
}

export const AssistantView: React.FC = () => {
  const { activeCourse, isGeneratingAI, setIsGeneratingAI } = useApp();

  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-init',
      sender: 'assistant',
      text: `Hello! I am your **GapFinder AI Topic Tutor** for **${activeCourse.title}**.

I am strictly constrained to only answer using your uploaded course syllabus, lecture notes, and past exam papers. Every response includes direct verifiable citations to prevent hallucinations.

How can I help clarify your diagnostic weak areas today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const quickPrompts = [
    `Why is Effective Access Time (EAT) on a TLB miss in 2-level paging 3 memory accesses?`,
    `Explain why LRU does not suffer from Belady's Anomaly according to my notes.`,
    `What is the difference between an Unsafe State and a Deadlocked State in Banker's Algorithm?`,
    `What are the 3 mandatory conditions for Critical Section correctness?`,
  ];

  const handleSendMessage = async (queryToSend?: string) => {
    const text = queryToSend || inputQuery;
    if (!text.trim() || loading) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);
    setIsGeneratingAI(true);

    try {
      // Gather relevant chunks from active course
      const allChunks = activeCourse.documents.flatMap((d) => d.chunks);
      
      const res = await fetch('/api/assistant/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: text.trim(),
          contextChunks: allChunks.slice(0, 6),
          courseTitle: activeCourse.title,
        }),
      });

      const data = await res.json();

      const assistantMsg: Message = {
        id: `msg-resp-${Date.now()}`,
        sender: 'assistant',
        text: data.answer || 'I could not find a definitive answer in your uploaded notes.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citationsUsed: data.citationsUsed || [],
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Error asking assistant:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-err-${Date.now()}`,
          sender: 'assistant',
          text: 'Encountered an issue retrieving citations. Please try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
      setIsGeneratingAI(false);
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
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Strictly Grounded RAG Assistant</span>
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {activeCourse.title}
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Explain-This-Topic Tutor
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Unlike generic chatbots that guess, this assistant answers exclusively using your uploaded syllabus, notes, and past exams. Every claim is cited to its source paragraph.
            </p>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl text-xs text-slate-400">
            <span className="font-semibold text-emerald-400 flex items-center gap-1 mb-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Zero Hallucination Constraint
            </span>
            Grounding depth: {activeCourse.documents.length} verified documents
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden flex flex-col min-h-[500px]">
        {/* Messages Stream */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6 max-h-[600px]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-2 mb-1 text-[11px] text-slate-500 font-mono">
                <span>{msg.sender === 'user' ? 'You (Student)' : 'GapFinder RAG Tutor'}</span>
                <span>•</span>
                <span>{msg.timestamp}</span>
              </div>

              <div
                className={`p-4 rounded-2xl max-w-2xl text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none space-y-3'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>

                {/* Grounding Citations Drawer */}
                {msg.citationsUsed && msg.citationsUsed.length > 0 && (
                  <div className="pt-3 border-t border-slate-800/80 space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Source Proof Citations:</span>
                    </span>
                    <div className="space-y-1.5">
                      {msg.citationsUsed.map((c, i) => (
                        <div
                          key={i}
                          className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-xs"
                        >
                          <div className="font-semibold text-indigo-300 font-mono">
                            {c.docTitle} — § {c.section}
                          </div>
                          <p className="text-slate-400 italic mt-1 text-[11px]">
                            "{c.excerpt}"
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold p-4 bg-slate-950/60 rounded-xl border border-slate-800 max-w-md">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Scanning uploaded lecture notes and past exams for citations...</span>
            </div>
          )}
        </div>

        {/* Quick Prompts Bar */}
        <div className="p-3 bg-slate-950/90 border-t border-slate-800 overflow-x-auto flex items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap pl-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            Quick Gaps:
          </span>
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 px-3 py-1.5 rounded-lg whitespace-nowrap transition cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Query Input Bar */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center gap-3">
          <input
            type="text"
            placeholder="Ask anything grounded in your syllabus, lecture notes, or past papers..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputQuery.trim() || loading}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
          >
            <span>Ask</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
