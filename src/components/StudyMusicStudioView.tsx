import React, { useState, useRef, useEffect } from 'react';
import { 
  Headphones, 
  Play, 
  Pause, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  RefreshCw, 
  Radio, 
  Waves, 
  Music, 
  Sliders, 
  Check, 
  BrainCircuit, 
  Flame, 
  Zap, 
  Clock,
  RotateCcw
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const StudyMusicStudioView: React.FC = () => {
  const { activeCourse, setIsGeneratingAI } = useApp();

  const [isPlaying, setIsPlaying] = useState(false);
  const [activePreset, setActivePreset] = useState<string>('binaural_alpha');
  const [customPrompt, setCustomPrompt] = useState(
    'A calming lo-fi ambient study beat with soft acoustic guitar, warm tape saturation, and gentle rain in the background for exam revision.'
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioSource, setAudioSource] = useState<'lyria' | 'procedural'>('procedural');
  const [statusMessage, setStatusMessage] = useState('Alpha Waves 14Hz • Memory Retention');
  const [volume, setVolume] = useState(0.6);

  // Audio refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const gainNodeRef = useRef<GainNode | null>(null);

  const presets = [
    {
      id: 'binaural_alpha',
      title: 'Alpha Waves 14Hz Binaural Beat',
      category: 'Memory & Retention',
      tag: 'Cognitive Science',
      desc: 'Synchronizes brainwaves to 14Hz (Alpha state), scientifically shown to improve long-term memory encoding while studying complex diagrams.',
      prompt: 'A calming ambient synth soundscape with steady 14Hz alpha waves and deep resonant drone for university study.',
    },
    {
      id: 'lofi_ambient',
      title: 'Lo-Fi Revision Atmosphere',
      category: 'Relaxed Focus',
      tag: 'Chillhop Beats',
      desc: 'Warm analog vinyl crackle, gentle Rhodes electric piano chords, and a steady 72 BPM downtempo groove to prevent study burnout.',
      prompt: 'A 30-second smooth lo-fi study beat with mellow rhodes chords, subtle vinyl noise, and relaxed chillhop drums.',
    },
    {
      id: 'deep_work',
      title: 'Deep Work Cosmic Drone',
      category: 'Noise Blocking',
      tag: 'Ambient Drone',
      desc: 'Low-frequency meditative pads and harmonic overtones that neutralize library chatter and outside room noise.',
      prompt: 'Warm cinematic ambient drone with cello undertones and ethereal pads for deep concentration.',
    },
    {
      id: 'theta_creative',
      title: 'Theta Waves 6Hz Problem-Solving',
      category: 'Complex Analysis',
      tag: 'Binaural',
      desc: 'Deep 6Hz Theta frequency differential for untangling intricate algorithms, math proofs, and biochemical reaction pathways.',
      prompt: 'Minimalist ambient drone with 6Hz theta pulse and soft marimba accents.',
    },
    {
      id: 'exam_sprint',
      title: 'Exam Sprint Rhythm',
      category: 'High Energy',
      tag: 'Uptempo Ambient',
      desc: 'Gentle driving electronic arpeggios that stimulate alertness and fast diagnostic question solving before deadlines.',
      prompt: 'Uptempo ambient arpeggiated electronic track with driving muted percussion and uplifting synth pads.',
    },
  ];

  // Stop procedural Web Audio
  const stopProceduralAudio = () => {
    oscillatorsRef.current.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch (e) {
        // already stopped
      }
    });
    oscillatorsRef.current = [];
  };

  // Start procedural Web Audio synthesis
  const startProceduralAudio = (presetId: string) => {
    stopProceduralAudio();

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContextClass();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(volume * 0.18, ctx.currentTime);
      masterGain.connect(ctx.destination);
      gainNodeRef.current = masterGain;

      if (presetId === 'binaural_alpha') {
        // Binaural beat: 214 Hz in Left, 200 Hz in Right = 14 Hz delta
        const merger = ctx.createChannelMerger(2);
        merger.connect(masterGain);

        const oscL = ctx.createOscillator();
        oscL.type = 'sine';
        oscL.frequency.setValueAtTime(214, ctx.currentTime);
        const gainL = ctx.createGain();
        gainL.gain.value = 0.5;
        oscL.connect(gainL);
        gainL.connect(merger, 0, 0);

        const oscR = ctx.createOscillator();
        oscR.type = 'sine';
        oscR.frequency.setValueAtTime(200, ctx.currentTime);
        const gainR = ctx.createGain();
        gainR.gain.value = 0.5;
        oscR.connect(gainR);
        gainR.connect(merger, 0, 1);

        oscL.start();
        oscR.start();
        oscillatorsRef.current = [oscL, oscR];
      } else if (presetId === 'theta_creative') {
        // 6Hz theta beat: 156Hz and 150Hz
        const merger = ctx.createChannelMerger(2);
        merger.connect(masterGain);

        const oscL = ctx.createOscillator();
        oscL.type = 'sine';
        oscL.frequency.setValueAtTime(156, ctx.currentTime);
        const gainL = ctx.createGain();
        gainL.gain.value = 0.5;
        oscL.connect(gainL);
        gainL.connect(merger, 0, 0);

        const oscR = ctx.createOscillator();
        oscR.type = 'sine';
        oscR.frequency.setValueAtTime(150, ctx.currentTime);
        const gainR = ctx.createGain();
        gainR.gain.value = 0.5;
        oscR.connect(gainR);
        gainR.connect(merger, 0, 1);

        oscL.start();
        oscR.start();
        oscillatorsRef.current = [oscL, oscR];
      } else {
        // Ambient chord drone: Frequencies
        const freqs = presetId === 'lofi_ambient' 
          ? [130.81, 196.0, 246.94, 329.63] 
          : presetId === 'exam_sprint' 
          ? [146.83, 220.0, 293.66, 440.0] 
          : [110.0, 164.81, 220.0, 277.18];

        const oscs = freqs.map((f, i) => {
          const osc = ctx.createOscillator();
          osc.type = i % 2 === 0 ? 'sine' : 'triangle';
          osc.frequency.setValueAtTime(f, ctx.currentTime);

          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(550, ctx.currentTime);

          const gain = ctx.createGain();
          gain.gain.setValueAtTime(0.25 / freqs.length, ctx.currentTime);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(masterGain);
          osc.start();
          return osc;
        });
        oscillatorsRef.current = oscs;
      }

      setAudioSource('procedural');
      setIsPlaying(true);
      const sel = presets.find((p) => p.id === presetId);
      setStatusMessage(`${sel?.title || 'Study Audio'} • Active`);
    } catch (err) {
      console.error('Web Audio error:', err);
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
      }
      stopProceduralAudio();
      setIsPlaying(false);
    } else {
      if (audioRef.current && audioRef.current.src && audioSource === 'lyria') {
        audioRef.current.play();
        setIsPlaying(true);
      } else {
        startProceduralAudio(activePreset);
      }
    }
  };

  const handleGenerateLyria = async (promptToUse?: string) => {
    const finalPrompt = promptToUse || customPrompt;
    setIsGenerating(true);
    setIsGeneratingAI(true);
    setStatusMessage('Connecting to Lyria AI model for 30s track generation...');

    try {
      const res = await fetch('/api/music/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: finalPrompt,
          preset: activePreset,
        }),
      });

      const data = await res.json();
      if (data.audioBase64) {
        const audioUrl = `data:${data.mimeType || 'audio/wav'};base64,${data.audioBase64}`;
        if (!audioRef.current) {
          audioRef.current = new Audio();
        }
        audioRef.current.src = audioUrl;
        audioRef.current.volume = volume;
        audioRef.current.loop = true;
        stopProceduralAudio();
        audioRef.current.play();
        setAudioSource('lyria');
        setIsPlaying(true);
        setStatusMessage('Lyria AI Composed Track • Playing Live');
      } else {
        startProceduralAudio(activePreset);
        setStatusMessage('Active: Procedural Focus Audio Synthesizer');
      }
    } catch (err) {
      console.warn('Lyria AI generation error, using procedural synthesis:', err);
      startProceduralAudio(activePreset);
      setStatusMessage('Active: Procedural Focus Audio Synthesizer');
    } finally {
      setIsGenerating(false);
      setIsGeneratingAI(false);
    }
  };

  const handleSelectPreset = (presetId: string) => {
    setActivePreset(presetId);
    const sel = presets.find((p) => p.id === presetId);
    if (sel) {
      setCustomPrompt(sel.prompt);
    }
    if (isPlaying) {
      startProceduralAudio(presetId);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (audioRef.current) {
      audioRef.current.volume = newVol;
    }
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(newVol * 0.18, audioCtxRef.current.currentTime);
    }
  };

  useEffect(() => {
    return () => {
      stopProceduralAudio();
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* Studio Header Card */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950/60 to-purple-950/50 border border-slate-800 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1.5">
                  <Headphones className="w-3.5 h-3.5" />
                  <span>Lyria AI & Cognitive Soundscape Studio</span>
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Syllabus: {activeCourse.code}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Study Focus Music & Binaural Audio
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
                Auditory focus aids help block distractions and induce alpha wave states (14Hz) during intense revision sessions. Powered by Gemini Lyria AI and procedural Web Audio synthesis.
              </p>
            </div>

            {/* Master Play / Pause Widget */}
            <div className="bg-slate-950/90 border border-slate-800 p-4 rounded-2xl flex items-center gap-4">
              <button
                onClick={togglePlay}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition shadow-2xl flex-shrink-0 cursor-pointer ${
                  isPlaying
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white ring-4 ring-emerald-400/30'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/40'
                }`}
              >
                {isPlaying ? <Pause className="w-6 h-6 fill-white" /> : <Play className="w-6 h-6 fill-white ml-1" />}
              </button>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-white text-sm">
                    {isPlaying ? 'Now Playing' : 'Study Audio Paused'}
                  </span>
                  {isPlaying && (
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-3 bg-emerald-400 rounded-full animate-bounce" />
                      <span className="w-1.5 h-4 bg-emerald-400 rounded-full animate-bounce delay-75" />
                      <span className="w-1.5 h-2 bg-emerald-400 rounded-full animate-bounce delay-150" />
                    </span>
                  )}
                </div>
                <div className="text-xs text-indigo-300 font-medium mt-0.5">
                  {statusMessage}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Volume2 className="w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volume}
                    onChange={(e) => handleVolumeChange(Number(e.target.value))}
                    className="w-24 accent-indigo-500 h-1 bg-slate-800 rounded cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-400 font-mono">
                    {Math.round(volume * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Preset Selector Grid */}
          <div className="mt-6">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 block flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-indigo-400" />
              Focus Presets & Cognitive Frequencies:
            </span>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {presets.map((preset) => {
                const isSelected = activePreset === preset.id;
                return (
                  <div
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset.id)}
                    className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500 text-white ring-1 ring-indigo-500'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700">
                          {preset.tag}
                        </span>
                        {isSelected && isPlaying && (
                          <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            Live
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-white mt-1">
                        {preset.title}
                      </h4>

                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        {preset.desc}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="text-[10px] text-indigo-300 font-mono">
                        {preset.category}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectPreset(preset.id);
                          if (!isPlaying) togglePlay();
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                          isSelected && isPlaying
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : 'bg-indigo-600 text-white'
                        }`}
                      >
                        {isSelected && isPlaying ? 'Pause' : 'Play Preset'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Lyria AI Prompt Generator Section */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-xl space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Lyria AI Music Generation
              </span>
              <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-800">
                lyria-3-clip-preview
              </span>
            </div>
            <h3 className="text-lg font-bold text-white">
              Compose Custom Study Soundtrack with Lyria AI
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-2xl">
              Describe the musical mood, instruments, tempo, and background atmosphere you want. Gemini Lyria will compose and stream an original study audio track.
            </p>
          </div>
        </div>

        {/* Prompt Input Box */}
        <div className="space-y-3">
          <textarea
            rows={3}
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Describe the study music you want Lyria AI to generate..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500 font-sans leading-relaxed"
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-semibold">Quick Prompts:</span>
              <button
                type="button"
                onClick={() =>
                  setCustomPrompt(
                    'Chillhop lo-fi study beat with mellow electric piano, subtle vinyl noise, and relaxed chillhop drums.'
                  )
                }
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700"
              >
                Lo-Fi Chillhop
              </button>
              <button
                type="button"
                onClick={() =>
                  setCustomPrompt(
                    'Ambient synth soundscape with steady 14Hz alpha waves and deep resonant drone for university study.'
                  )
                }
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700"
              >
                Alpha Waves
              </button>
            </div>

            <button
              onClick={() => handleGenerateLyria()}
              disabled={isGenerating}
              className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Composing with Lyria AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Track (Lyria AI)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
