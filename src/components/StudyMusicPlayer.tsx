import React, { useState, useRef, useEffect } from 'react';
import { 
  Music, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  RefreshCw, 
  Headphones, 
  Radio, 
  Sliders, 
  Check, 
  X,
  Zap
} from 'lucide-react';

export const StudyMusicPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activePreset, setActivePreset] = useState<string>('binaural_alpha');
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioSourceType, setAudioSourceType] = useState<'lyria' | 'procedural'>('procedural');
  const [statusMessage, setStatusMessage] = useState('Alpha Waves 14Hz • Focus Enhancer');
  const [volume, setVolume] = useState(0.5);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const gainNodeRef = useRef<GainNode | null>(null);

  const presets = [
    {
      id: 'binaural_alpha',
      name: 'Alpha Waves (14Hz)',
      desc: 'Binaural beat for peak memory encoding & exam focus',
      prompt: 'A calming ambient synth soundscape with steady 14Hz alpha waves and deep resonant drone for university study.',
    },
    {
      id: 'lofi_ambient',
      name: 'Lo-Fi Study Beats',
      desc: 'Warm vinyl crackle, mellow electric piano, and gentle downtempo hip-hop rhythm',
      prompt: 'A 30-second smooth lo-fi study beat with mellow rhodes chords, subtle vinyl noise, and relaxed chillhop drums.',
    },
    {
      id: 'deep_work',
      name: 'Deep Work Drone',
      desc: 'Continuous meditative warm frequencies to block distractions',
      prompt: 'Warm cinematic ambient drone with cello undertones and ethereal pads for deep concentration.',
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
      masterGain.gain.setValueAtTime(volume * 0.15, ctx.currentTime);
      masterGain.connect(ctx.destination);
      gainNodeRef.current = masterGain;

      if (presetId === 'binaural_alpha') {
        // Binaural beat: 214 Hz in Left ear, 200 Hz in Right ear = 14 Hz difference
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
      } else {
        // Ambient chord drone: Frequencies A2, E3, A3, C#4
        const freqs = presetId === 'lofi_ambient' ? [130.81, 196.0, 246.94, 329.63] : [110.0, 164.81, 220.0, 277.18];
        const oscs = freqs.map((f, i) => {
          const osc = ctx.createOscillator();
          osc.type = i % 2 === 0 ? 'sine' : 'triangle';
          osc.frequency.setValueAtTime(f, ctx.currentTime);

          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(600, ctx.currentTime);

          const gain = ctx.createGain();
          gain.gain.setValueAtTime(0.2 / freqs.length, ctx.currentTime);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(masterGain);
          osc.start();
          return osc;
        });
        oscillatorsRef.current = oscs;
      }

      setAudioSourceType('procedural');
      setIsPlaying(true);
    } catch (err) {
      console.error('Web Audio error:', err);
    }
  };

  // Toggle playback
  const togglePlay = () => {
    if (isPlaying) {
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
      }
      stopProceduralAudio();
      setIsPlaying(false);
    } else {
      if (audioRef.current && audioRef.current.src && audioSourceType === 'lyria') {
        audioRef.current.play();
        setIsPlaying(true);
      } else {
        startProceduralAudio(activePreset);
      }
    }
  };

  // Generate track via Lyria AI model
  const handleGenerateLyria = async (presetId: string) => {
    const selected = presets.find((p) => p.id === presetId) || presets[0];
    setIsGenerating(true);
    setStatusMessage(`Generating revision track with Lyria AI (${selected.name})...`);

    try {
      const res = await fetch('/api/music/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: selected.prompt,
          preset: selected.id,
        }),
      });

      const data = await res.json();
      if (data.audioBase64) {
        // Lyria generated audio clip received
        const audioUrl = `data:${data.mimeType || 'audio/wav'};base64,${data.audioBase64}`;
        if (!audioRef.current) {
          audioRef.current = new Audio();
        }
        audioRef.current.src = audioUrl;
        audioRef.current.volume = volume;
        audioRef.current.loop = true;
        stopProceduralAudio();
        audioRef.current.play();
        setAudioSourceType('lyria');
        setIsPlaying(true);
        setStatusMessage(`Lyria AI 30s Track Playing: ${selected.name}`);
      } else {
        // Fallback to procedural synthesis
        startProceduralAudio(selected.id);
        setStatusMessage(`Active: ${selected.name} (Procedural Focus Audio)`);
      }
    } catch (err) {
      console.warn('Lyria AI call error, running procedural focus audio:', err);
      startProceduralAudio(selected.id);
      setStatusMessage(`Active: ${selected.name} (Procedural Focus Audio)`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectPreset = (presetId: string) => {
    setActivePreset(presetId);
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
      gainNodeRef.current.gain.setValueAtTime(newVol * 0.15, audioCtxRef.current.currentTime);
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
    <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 p-4 sm:p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Player info & controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={togglePlay}
          className={`w-11 h-11 rounded-xl flex items-center justify-center transition shadow-lg flex-shrink-0 cursor-pointer ${
            isPlaying
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white ring-2 ring-emerald-400'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white'
          }`}
          title={isPlaying ? 'Pause Study Audio' : 'Play Focus Audio'}
        >
          {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
        </button>

        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-white text-xs sm:text-sm flex items-center gap-1.5">
              <Headphones className="w-4 h-4 text-indigo-400" />
              <span>Study Focus Audio & Beats</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {audioSourceType === 'lyria' ? 'Lyria AI Engine' : '14Hz Binaural Synth'}
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-0.5 font-medium">
            {statusMessage}
          </p>
        </div>
      </div>

      {/* Preset selector pills */}
      <div className="flex flex-wrap items-center gap-2">
        {presets.map((p) => {
          const isSelected = activePreset === p.id;
          return (
            <button
              key={p.id}
              onClick={() => handleSelectPreset(p.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow'
                  : 'bg-slate-950/80 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              <span>{p.name}</span>
            </button>
          );
        })}

        {/* Generate with Lyria AI button */}
        <button
          onClick={() => handleGenerateLyria(activePreset)}
          disabled={isGenerating}
          className="px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Generating with Lyria AI...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate via Lyria AI</span>
            </>
          )}
        </button>

        {/* Volume slider */}
        <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800 ml-1">
          {volume === 0 ? (
            <VolumeX className="w-3.5 h-3.5 text-slate-500" />
          ) : (
            <Volume2 className="w-3.5 h-3.5 text-slate-400" />
          )}
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => handleVolumeChange(Number(e.target.value))}
            className="w-16 accent-indigo-500 h-1 bg-slate-800 rounded cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
