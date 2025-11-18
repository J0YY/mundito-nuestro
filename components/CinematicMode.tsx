"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAppStore } from "@store/store";

export default function CinematicMode() {
  const { memories, setViewMode } = useAppStore();
  const core = useMemo(() => memories.filter((m) => m.category === 'core').sort((a, b) => (
    new Date(`${a.date} ${a.time ?? '00:00:00'}`).getTime() - new Date(`${b.date} ${b.time ?? '00:00:00'}`).getTime()
  )), [memories]);
  const [idx, setIdx] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (core.length === 0) return;
    timerRef.current = setTimeout(() => setIdx((i) => (i + 1) % core.length), 6000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [idx, core.length]);

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
    <div className="fixed inset-0 z-40 bg-gradient-to-b from-slate-900/90 to-slate-950/95 text-white flex flex-col items-center justify-center p-6">
      <button className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30" onClick={() => setViewMode('map')}>Exit Cinematic</button>
      <div className="max-w-2xl w-full romantic-card p-6 bg-white/10 border-white/20 text-white">
        <div className="text-sm opacity-80 mb-1">{m.date}{m.time ? ` · ${m.time.slice(0,5)}` : ''}</div>
        <div className="text-3xl font-semibold mb-2">{m.title}</div>
        <div className="text-sm opacity-90 mb-4">By {m.contributor === 'joy' ? 'Joy' : 'Socrates'} {m.emoji ? `· ${m.emoji}` : ''}</div>
        {m.photo_url ? <img src={m.photo_url} alt="" className="rounded-xl mb-4 max-h-80 w-full object-cover" /> : null}
        <div className="text-lg leading-relaxed whitespace-pre-wrap">{m.description}</div>
        <div className="flex justify-end gap-2 mt-4">
          <button className="px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30" onClick={() => setIdx((i) => Math.max(i - 1, 0))}>Previous</button>
          <button className="px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30" onClick={() => setIdx((i) => Math.min(i + 1, core.length - 1))}>Next</button>
        </div>
      </div>
      {idx === core.length - 1 ? (
        <div className="mt-6 text-center opacity-90">
          These are our core memories so far. More to come. 💫
        </div>
      ) : null}
    </div>
  );
}

