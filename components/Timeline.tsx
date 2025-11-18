"use client";
import React from "react";
import { useAppStore } from "@store/store";
import { CATEGORY_LABELS, CATEGORY_COLORS } from "@utils/constants";

export default function Timeline() {
  const { getFilteredMemories, setSelectedMemoryId, setViewMode } = useAppStore();
  const memories = getFilteredMemories().slice().sort((a, b) => {
    const da = new Date(`${a.date} ${a.time ?? '00:00:00'}`).getTime();
    const db = new Date(`${b.date} ${b.time ?? '00:00:00'}`).getTime();
    return da - db;
  });

  if (!memories.length) {
    return (
      <div className="p-6 text-center text-slate-500">
        No moments here yet.
      </div>
    );
  }

  return (
    <div className="max-h-[60vh] overflow-auto divide-y divide-white/10">
      {memories.map((m) => (
        <button
          key={m.id}
          className="w-full text-left p-3 hover:bg-white/60 dark:hover:bg-white/10 transition"
          onClick={() => {
            setSelectedMemoryId(m.id);
            setViewMode('map');
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold ${m.contributor === 'joy' ? 'bg-rose-200 text-rose-700' : 'bg-sky-200 text-sky-700'}`}>{m.contributor === 'joy' ? 'J' : 'S'}</span>
              <div className="font-medium">{m.title}</div>
            </div>
            <span className="text-xs px-2 py-1 rounded-full" style={{ background: `${CATEGORY_COLORS[m.category]}30`, color: '#111' }}>
              {CATEGORY_LABELS[m.category]}{m.category === 'bucket_list' && m.is_bucket_list_completed ? ' · Completed' : ''}
            </span>
          </div>
          <div className="text-xs text-slate-500">{m.date}{m.time ? ` · ${m.time.slice(0,5)}` : ''}</div>
          <div className="text-sm line-clamp-2 mt-1">{m.description.slice(0, 100)}{m.description.length > 100 ? '…' : ''}</div>
          {m.photo_url ? <img src={m.photo_url} alt="" className="mt-2 h-24 w-full object-cover rounded-lg" /> : null}
        </button>
      ))}
    </div>
  );
}

