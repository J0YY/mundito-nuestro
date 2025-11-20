"use client";
import React, { useEffect, useRef, useState } from "react";
import { useAppStore } from "@store/store";

type GeoResult = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
};

export default function SearchBar() {
  const { flyTo } = useAppStore();
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<GeoResult[]>([]);
  const [open, setOpen] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('click', onClick);
    return () => window.removeEventListener('click', onClick);
  }, []);

  useEffect(() => {
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    console.log("[SearchBar] query:", q);
    setLoading(true);
    setOpen(true);
    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    const id = setTimeout(async () => {
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&addressdetails=0&limit=6`;
        const res = await fetch(url, {
          signal: ctrl.signal,
          headers: { "Accept": "application/json" }
        });
        const data: GeoResult[] = await res.json();
        console.log("[SearchBar] results:", data);
        setResults(data);
      } catch {
        // ignore aborts/errors
        console.warn("[SearchBar] fetch aborted or failed");
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(id);
  }, [q]);

  const go = (r: GeoResult) => {
    setOpen(false);
    setQ(r.display_name);
    // zoom in strongly (~city/street level)
    const lat = parseFloat(r.lat);
    const lon = parseFloat(r.lon);
    console.log("[SearchBar] go ->", { lat, lon });
    // a touch further out
    flyTo(lat, lon, 12);
  };

  return (
    <div ref={containerRef} className="relative w-[260px] sm:w-[320px]">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => { if (results.length) setOpen(true); }}
        className="input"
        placeholder="Search places..."
        aria-label="Search places"
      />
      {loading ? <div className="absolute right-3 top-2.5 text-xs text-slate-500">…</div> : null}
      {open && results.length ? (
        <div className="absolute z-[1200] mt-2 w-full romantic-card p-1 max-h-64 overflow-auto animate-pop">
          {results.map((r) => (
            <button
              key={r.place_id}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/70 dark:hover:bg-white/10 transition hover-elevate"
              onClick={() => go(r)}
            >
              <div className="text-sm">{r.display_name}</div>
              <div className="text-xs text-slate-500">({r.lat}, {r.lon})</div>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

