"use client";
import React, { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { CATEGORY_COLORS } from "@utils/constants";
import type { Category, Contributor, Memory, NewMemoryInput } from "@types/memory";
import { useAppStore } from "@store/store";
import { supabase } from "@lib/supabaseClient";

const CATEGORIES: Category[] = ['core','thought','bucket_list','trip','milestone','inside_joke','celebration','heartbreak_repair','anniversary','secret'];
const MOODS = ['soft','romantic','chaotic','longing','nostalgic'] as const;

export default function MemoryForm({
  open,
  onClose,
  initialLatLng,
  editing
}: {
  open: boolean;
  onClose: () => void;
  initialLatLng: { lat: number; lng: number } | null;
  editing?: Memory | null;
}) {
  const { addMemory, updateMemory } = useAppStore();
  const [title, setTitle] = useState(editing?.title || "");
  const [description, setDescription] = useState(editing?.description || "");
  const [contributor, setContributor] = useState<Contributor>(editing?.contributor || "joy");
  const [category, setCategory] = useState<Category>(editing?.category || "core");
  const [mood, setMood] = useState<(typeof MOODS)[number] | ''>(editing?.mood || '');
  const [emoji, setEmoji] = useState(editing?.emoji || "");
  const [date, setDate] = useState(editing?.date || "");
  const [time, setTime] = useState(editing?.time?.slice(0,5) || "");
  const [secretUnlockDate, setSecretUnlockDate] = useState(editing?.secret_unlock_date || "");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lat = editing?.lat ?? initialLatLng?.lat ?? 0;
  const lng = editing?.lng ?? initialLatLng?.lng ?? 0;

  const canSubmit = title && description && date;
  const heading = editing ? "Edit Memory" : "Create Memory";

  const colorPreview = useMemo(() => CATEGORY_COLORS[category], [category]);

  if (!open) return null;

  const uploadPhotoIfNeeded = async (): Promise<string | null> => {
    if (!file) return editing?.photo_url || null;
    const path = `memory-photos/${crypto.randomUUID()}-${file.name}`;
    const { error: uploadErr } = await supabase.storage.from('memory-photos').upload(path, file, {
      cacheControl: '3600',
      upsert: false
    });
    if (uploadErr) {
      setError(uploadErr.message);
      return editing?.photo_url || null;
    }
    const { data } = supabase.storage.from('memory-photos').getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSaving(true);
    setError(null);
    try {
      const photoUrl = await uploadPhotoIfNeeded();
      if (editing) {
        await updateMemory(editing.id, {
          title,
          description,
          contributor,
          category,
          mood: mood || null,
          emoji: emoji || null,
          date,
          time: time ? `${time}:00` : null,
          photo_url: photoUrl,
          secret_unlock_date: category === 'secret' ? (secretUnlockDate || null) : null,
          color: CATEGORY_COLORS[category]
        });
      } else {
        const payload: NewMemoryInput = {
          lat,
          lng,
          title,
          description,
          contributor,
          category,
          mood: mood || null,
          emoji: emoji || null,
          date,
          time: time ? `${time}:00` : null,
          photo_url: photoUrl,
          secret_unlock_date: category === 'secret' ? (secretUnlockDate || null) : null,
          color: CATEGORY_COLORS[category],
          is_bucket_list_completed: false
        };
        await addMemory(payload);
      }
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 p-3">
      <div className="w-full max-w-lg romantic-card p-4 max-h-[85vh] overflow-auto shadow-2xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">{heading}</h3>
          <button className="text-slate-500 hover:text-slate-800" onClick={onClose}>Close</button>
        </div>
        {error ? <div className="text-sm text-rose-600 mb-2">{error}</div> : null}
        <form className="space-y-3" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1">Title</label>
              <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm mb-1">Contributor</label>
              <div className="flex gap-2">
                <label className="flex items-center gap-2 text-sm">
                  <input type="radio" name="contrib" checked={contributor === 'joy'} onChange={() => setContributor('joy')} />
                  Joy
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="radio" name="contrib" checked={contributor === 'socrates'} onChange={() => setContributor('socrates')} />
                  Socrates
                </label>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm mb-1">Description</label>
            <textarea className="textarea" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1">Category</label>
              <select className="select" value={category} onChange={(e) => setCategory(e.target.value as Category)}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1">Mood</label>
              <select className="select" value={mood} onChange={(e) => setMood(e.target.value as any)}>
                <option value="">(optional)</option>
                {MOODS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm mb-1">Emoji</label>
              <input className="input" value={emoji} onChange={(e) => setEmoji(e.target.value)} placeholder="🧸" />
            </div>
            <div>
              <label className="block text-sm mb-1">Date</label>
              <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm mb-1">Time</label>
              <input type="time" className="input" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
          </div>
          {category === 'secret' ? (
            <div>
              <label className="block text-sm mb-1">Secret unlock date (optional)</label>
              <input type="date" className="input" value={secretUnlockDate} onChange={(e) => setSecretUnlockDate(e.target.value)} />
            </div>
          ) : null}
          <div>
            <label className="block text-sm mb-1">Photo</label>
            <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ background: colorPreview }} />
              <span className="text-xs text-slate-500">Pin color by category</span>
            </div>
            <div className="flex gap-2">
              <button type="button" className="btn-soft" onClick={onClose}>Cancel</button>
              <button type="submit" disabled={!canSubmit || saving} className="btn-brand disabled:opacity-50">{editing ? 'Save Changes' : 'Save Memory'}</button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

