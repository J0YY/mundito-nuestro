"use client";
import React from "react";
import type { Memory } from "@types/memory";
import { CATEGORY_LABELS, CATEGORY_COLORS } from "@utils/constants";
import { useAppStore } from "@store/store";
import BucketListToggle from "./BucketListToggle";

export default function MemoryPopup({ memory, onEdit }: { memory: Memory, onEdit: (m: Memory) => void }) {
  const { updateMemory, deleteMemory } = useAppStore();

  const isLocked = memory.category === 'secret' && memory.secret_unlock_date !== null && new Date(memory.secret_unlock_date) > new Date();
  const contributorBadge = (
    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold shadow ${memory.contributor === 'joy' ? 'bg-rose-200 text-rose-700' : 'bg-sky-200 text-sky-700'}`}>
      {memory.contributor === 'joy' ? 'J' : 'S'}
    </span>
  );

  return (
    <div className="min-w-[260px] max-w-[320px]">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          {contributorBadge}
          <h3 className="font-semibold">{isLocked ? '🔒 Secret memory' : memory.title}</h3>
        </div>
        <span className="text-xs px-2 py-1 rounded-full" style={{ background: `${CATEGORY_COLORS[memory.category]}30`, color: '#111' }}>
          {CATEGORY_LABELS[memory.category]}
        </span>
      </div>
      <div className="text-xs text-slate-500 mb-2">
        {(memory.emoji ?? '')} {memory.date}{memory.time ? ` · ${memory.time.slice(0,5)}` : ''}{memory.mood ? ` · ${memory.mood}` : ''}
      </div>
      {isLocked ? (
        <div className="text-sm">
          Unlocks on {memory.secret_unlock_date}.
        </div>
      ) : (
        <>
          {memory.photo_url ? (
            <img src={memory.photo_url} alt={memory.title} className="rounded-xl mb-2 max-h-44 w-full object-cover shadow" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          ) : null}
          <p className="whitespace-pre-wrap text-sm">{memory.description}</p>
        </>
      )}
      <div className="mt-3 flex items-center justify-between">
        {memory.category === 'bucket_list' ? (
          <BucketListToggle
            checked={memory.is_bucket_list_completed}
            onChange={async (v) => {
              await updateMemory(memory.id, { is_bucket_list_completed: v });
            }}
          />
        ) : <div />}
        <div className="flex gap-2 text-sm">
          <button className="btn-soft" onClick={() => onEdit(memory)}>Edit</button>
          <button className="btn-soft text-rose-700 dark:text-rose-300" onClick={() => deleteMemory(memory.id)}>Delete</button>
        </div>
      </div>
    </div>
  );
}

