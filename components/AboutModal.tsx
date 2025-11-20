"use client";
import React from "react";
import { createPortal } from "react-dom";

export default function AboutModal({ onClose }: { onClose: () => void }) {
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade">
      <div className="w-full max-w-lg romantic-card p-5 shadow-2xl animate-pop">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">About mundito nuestro</h3>
          <button className="text-slate-500 hover:text-slate-800" onClick={onClose}>Close</button>
        </div>
        <div className="space-y-3 text-sm leading-relaxed">
          <p>A shared map to pin the moments of Joy & Socrates across the world — core memories, thoughts, bucket list places, anniversaries, inside jokes, and more.</p>
          <p>Built with love using Next.js, Tailwind, React Leaflet, Supabase, and Zustand. Data is stored in Supabase with realtime updates.</p>
          <p>Tip: Click anywhere on the map to add a memory. Use the filters, timeline, and cinematic mode to relive your story.</p>
          <p className="opacity-75">These are your memories — may they keep expanding. 💫</p>
        </div>
      </div>
    </div>
  , document.body);
}

