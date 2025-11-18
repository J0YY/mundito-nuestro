"use client";
import React, { useEffect, useState } from "react";
import { useAppStore } from "@store/store";
import AboutModal from "./AboutModal";

export default function Header() {
  const { viewMode, setViewMode, showTrails, setShowTrails, showThoughtHeatmap, setShowThoughtHeatmap } = useAppStore();
  const [aboutOpen, setAboutOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDark]);

  return (
    <header className="sticky top-0 z-20 bg-gradient-to-b from-white/80 to-white/40 dark:from-slate-900/80 dark:to-slate-900/40 backdrop-blur border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">mundito nuestro</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">A map of how Joy & Socrates loved across the world.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="segmented">
            <button className={`seg ${viewMode === 'map' ? 'active' : ''}`} onClick={() => setViewMode('map')}>Map</button>
            <button className={`seg ${viewMode === 'timeline' ? 'active' : ''}`} onClick={() => setViewMode('timeline')}>Timeline</button>
            <button className={`seg ${viewMode === 'cinematic' ? 'active' : ''}`} onClick={() => setViewMode('cinematic')}>Cinematic</button>
          </div>
          <div className="hidden md:flex items-center gap-2 ml-2">
            <label className="flex items-center gap-2 text-sm bg-white/60 dark:bg-white/10 border border-white/20 px-2 py-1 rounded-full">
              <input type="checkbox" checked={showTrails} onChange={(e) => setShowTrails(e.target.checked)} />
              Show Trails
            </label>
            <label className="flex items-center gap-2 text-sm bg-white/60 dark:bg-white/10 border border-white/20 px-2 py-1 rounded-full">
              <input type="checkbox" checked={showThoughtHeatmap} onChange={(e) => setShowThoughtHeatmap(e.target.checked)} />
              Thought Heatmap
            </label>
          </div>
          <button className="btn-soft ml-2" onClick={() => setAboutOpen(true)}>About</button>
          <button className="btn-soft" onClick={() => setIsDark((v) => !v)}>{isDark ? 'Light' : 'Dark'}</button>
        </div>
      </div>
      {aboutOpen ? <AboutModal onClose={() => setAboutOpen(false)} /> : null}
    </header>
  );
}

