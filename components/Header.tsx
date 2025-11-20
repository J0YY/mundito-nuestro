"use client";
import React, { useEffect, useState } from "react";
import { useAppStore } from "@store/store";
import AboutModal from "./AboutModal";
import SearchBar from "./SearchBar";

export default function Header() {
  const {
    viewMode,
    setViewMode,
    showTrails,
    setShowTrails,
    showThoughtHeatmap,
    setShowThoughtHeatmap,
    mapPerspective,
    setMapPerspective
  } = useAppStore();
  const [aboutOpen, setAboutOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDark]);

  return (
    <header className="sticky top-0 z-30 px-4 pt-6 pb-2 animate-rise">
      <div className="glass-panel flex flex-wrap items-center gap-4 px-6 py-4">
        <div className="flex items-center gap-3 flex-1 min-w-[200px]">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-core to-pink-400 shadow-lg flex items-center justify-center text-white text-xl font-semibold">mn</div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">mundito nuestro</h1>
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Joy &amp; Socrates atlas</p>
          </div>
        </div>

        <div className="flex-1 flex flex-wrap items-center justify-end gap-3">
          <div className="segmented shadow-none bg-white/70 order-2">
            <button className={`seg ${viewMode === 'map' ? 'active' : ''}`} onClick={() => setViewMode('map')}>Map</button>
            <button className={`seg ${viewMode === 'timeline' ? 'active' : ''}`} onClick={() => setViewMode('timeline')}>Timeline</button>
            <button className={`seg ${viewMode === 'cinematic' ? 'active' : ''}`} onClick={() => setViewMode('cinematic')}>Cinematic</button>
          </div>

          {viewMode === 'map' ? (
            <div className="segmented shadow-none bg-white/70 order-3">
              <button className={`seg ${mapPerspective === 'map' ? 'active' : ''}`} onClick={() => setMapPerspective('map')}>Surface</button>
              <button className={`seg ${mapPerspective === 'globe' ? 'active' : ''}`} onClick={() => setMapPerspective('globe')}>Globe</button>
            </div>
          ) : null}

          <div className="hidden md:flex items-center gap-2 order-3">
            <label className="glass-panel px-3 py-1 rounded-full text-xs flex items-center gap-2 bg-white/70">
              <input type="checkbox" checked={showTrails} onChange={(e) => setShowTrails(e.target.checked)} />
              Trails
            </label>
            <label className="glass-panel px-3 py-1 rounded-full text-xs flex items-center gap-2 bg-white/70">
              <input type="checkbox" checked={showThoughtHeatmap} onChange={(e) => setShowThoughtHeatmap(e.target.checked)} />
              Heatmap
            </label>
          </div>

          <button className="btn-soft order-4" onClick={() => setAboutOpen(true)}>About</button>
          <button className="btn-soft order-5" onClick={() => setIsDark((v) => !v)}>{isDark ? 'Light' : 'Dark'}</button>
        </div>
      </div>
      {/* mobile search handled inside map panel now */}
      {aboutOpen ? <AboutModal onClose={() => setAboutOpen(false)} /> : null}
    </header>
  );
}

