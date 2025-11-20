"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAppStore } from "@store/store";
import type { Memory } from "../types/memory";

const trailSize = 520;
const project = (lat: number, lng: number) => {
  const x = ((lng + 180) / 360) * trailSize;
  const y = ((90 - lat) / 180) * trailSize;
  return { x, y };
};

const CinematicTrail = ({ memories, activeIndex }: { memories: Memory[]; activeIndex: number }) => {
  const coords = useMemo(() => memories.map((m) => project(m.lat, m.lng)), [memories]);
  const path = coords.map((p) => `${p.x},${p.y}`).join(" ");
  const visible = coords.slice(0, activeIndex + 1).map((p) => `${p.x},${p.y}`).join(" ");
  const active = coords[activeIndex];

  return (
    <svg width={trailSize} height={trailSize} viewBox={`0 0 ${trailSize} ${trailSize}`} className="w-full h-full">
      <defs>
        <linearGradient id="trailGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a5b4fc" />
          <stop offset="50%" stopColor="#ff80b5" />
          <stop offset="100%" stopColor="#7cd4ff" />
        </linearGradient>
        <radialGradient id="glowField" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.15)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
        <filter id="glowBlur" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="12" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect width="100%" height="100%" fill="url(#glowField)" />
      <polyline points={path} stroke="rgba(255,255,255,0.18)" strokeWidth={4} fill="none" strokeLinecap="round" />
      <polyline points={visible} stroke="url(#trailGradient)" strokeWidth={6} fill="none" strokeLinecap="round" filter="url(#glowBlur)" />
      <circle cx={active.x} cy={active.y} r={10} fill="#fff" filter="url(#glowBlur)" />
    </svg>
  );
};

export default function CinematicMode() {
  const { memories, setViewMode } = useAppStore();
  const core = useMemo(() => memories.filter((m) => m.category === 'core').sort((a, b) => (
    new Date(`${a.date} ${a.time ?? '00:00:00'}`).getTime() - new Date(`${b.date} ${b.time ?? '00:00:00'}`).getTime()
  )), [memories]);
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (core.length === 0 || !playing) return;
    timerRef.current = setTimeout(() => setIdx((i) => (i + 1) % core.length), 5000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [idx, core.length, playing]);

  if (!core.length) {
    return (
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70">
        <div className="romantic-card p-6 text-center">
          <div className="text-2xl mb-2">No core memories yet</div>
          <button className="px-3 py-2 rounded-lg bg-white/60 dark:bg-white/10 border border-white/20" onClick={() => setViewMode('map')}>Exit</button>
        </div>
      </div>
    );
  }

  const m = core[idx];
  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-br from-[#05060b] via-[#0f1326] to-[#231041] text-white overflow-auto pointer-events-auto">
      <div className="sticky top-3 flex justify-end px-4">
        <button className="px-4 py-2 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur border border-white/20" onClick={() => setViewMode('map')}>Exit Cinematic</button>
      </div>

      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-6xl w-full grid lg:grid-cols-[540px,1fr] gap-6 items-center">
          <div className="rounded-3xl bg-gradient-to-b from-[#101732] to-[#0b1021] border border-white/10 p-6 animate-rise shadow-[0_25px_60px_-30px_rgba(0,0,0,0.8)]">
            <div className="text-xs uppercase tracking-[0.4em] text-slate-300 mb-3">Chronicle trail</div>
            <div className="relative">
              <CinematicTrail memories={core} activeIndex={idx} />
              <div className="absolute bottom-4 left-4 text-sm text-slate-300">Glowing path of {core.length} core moments.</div>
            </div>
          </div>

          <div className="rounded-3xl bg-gradient-to-b from-[#121936] to-[#0a0f1c] border border-white/10 p-6 animate-rise shadow-[0_25px_60px_-30px_rgba(0,0,0,0.8)]">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-300">Memory #{idx + 1}/{core.length}</p>
                <h2 className="text-3xl font-semibold">{m.title}</h2>
                <p className="text-sm text-slate-300">{m.date}{m.time ? ` · ${m.time.slice(0,5)}` : ''} · {m.contributor === 'joy' ? 'Joy' : 'Socrates'}</p>
              </div>
              <button className="btn-soft" onClick={() => setPlaying((p) => !p)}>{playing ? "Pause" : "Play"}</button>
            </div>
            {m.photo_url ? <img src={m.photo_url} alt="" className="rounded-2xl mb-4 max-h-72 w-full object-cover shadow-[0_15px_45px_-25px_rgba(255,255,255,0.5)]" /> : null}
            <p className="text-lg leading-relaxed whitespace-pre-wrap mb-4">{m.description}</p>

            <div className="flex gap-3">
              <button className="px-4 py-2 rounded-full bg-white/15 hover:bg-white/25 border border-white/20" onClick={() => setIdx((i) => (i - 1 + core.length) % core.length)}>Previous</button>
              <button className="px-4 py-2 rounded-full bg-white/15 hover:bg-white/25 border border-white/20" onClick={() => setIdx((i) => (i + 1) % core.length)}>Next</button>
            </div>

            <div className="mt-5">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400 mb-2">Timeline</p>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {core.map((memory, i) => (
                  <button
                    key={memory.id}
                    className={`px-3 py-2 rounded-2xl text-sm transition ${i === idx ? 'bg-white text-slate-900' : 'bg-white/10 text-white/80 hover:bg-white/20'}`}
                    onClick={() => setIdx(i)}
                  >
                    {memory.date}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

