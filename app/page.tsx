"use client";
import React, { useEffect } from "react";
import Header from "@components/Header";
import Layout from "@components/Layout";
import dynamic from "next/dynamic";
import Filters from "@components/Filters";
import Timeline from "@components/Timeline";
import TimeSlider from "@components/TimeSlider";
import CinematicMode from "@components/CinematicMode";
import { useAppStore } from "@store/store";

export default function HomePage() {
  const MapView = dynamic(() => import("@components/MapView"), { ssr: false });
  const GlobeView = dynamic(() => import("@components/GlobeView"), { ssr: false });
  const {
    viewMode,
    fetchMemories,
    subscribeToRealtime,
    memories,
    mapPerspective
  } = useAppStore();

  useEffect(() => {
    fetchMemories();
    subscribeToRealtime();
  }, [fetchMemories, subscribeToRealtime]);

  const coreCount = memories.filter((m) => m.category === "core").length;
  const bucket = memories.filter((m) => m.category === "bucket_list");
  const bucketComplete = bucket.filter((m) => m.is_bucket_list_completed).length;
  const recent = memories[memories.length - 1];

  return (
    <Layout>
      <Header />
      <div className="px-4 pb-8 space-y-5">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="stat-card animate-rise">
            <span className="stat-label">Memories logged</span>
            <span className="stat-value">{memories.length || "—"}</span>
            <p className="text-sm text-slate-500 dark:text-slate-300">Across {new Set(memories.map((m) => m.category)).size || 0} categories</p>
          </div>
          <div className="stat-card animate-rise">
            <span className="stat-label">Core memories</span>
            <span className="stat-value">{coreCount || "—"}</span>
            <p className="text-sm text-slate-500 dark:text-slate-300">These anchor moments guide the cinematic mode.</p>
          </div>
          <div className="stat-card animate-rise">
            <span className="stat-label">Bucket list</span>
            <span className="stat-value">
              {bucketComplete}/{bucket.length || "—"}
            </span>
            <p className="text-sm text-slate-500 dark:text-slate-300">Completed together so far.</p>
          </div>
        </div>

        {recent ? (
          <div className="glass-panel p-5 flex items-center justify-between gap-4 animate-rise">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Latest drop</p>
              <h3 className="text-xl font-semibold">{recent.title}</h3>
              <p className="text-sm text-slate-500">{recent.date} · {recent.category.replace("_", " ")}</p>
            </div>
            <button className="btn-brand" onClick={() => window?.scrollTo({ top: 0, behavior: "smooth" })}>Relive</button>
          </div>
        ) : null}

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,3fr)_360px] gap-4 mt-6 lg:min-h-[720px] items-stretch">
          <div className="glass-panel p-0 overflow-hidden lg:h-full">
            {mapPerspective === 'globe' ? <GlobeView /> : <MapView />}
          </div>
          <div className="flex flex-col gap-4 lg:h-full">
            <div className="glass-panel p-4 hover-elevate flex-1 overflow-auto">
              <Filters />
            </div>
            <div className="glass-panel p-4 hover-elevate">
              <TimeSlider />
            </div>
            <div className="glass-panel p-0 overflow-hidden hover-elevate flex-[1.1]">
              <Timeline />
            </div>
          </div>
        </div>

        {viewMode === "cinematic" ? <CinematicMode /> : null}
      </div>
    </Layout>
  );
}

