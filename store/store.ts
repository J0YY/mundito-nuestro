"use client";
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { supabase } from '@lib/supabaseClient';
import { CATEGORY_COLORS } from '@utils/constants';
import type { Category, Contributor, Memory, NewMemoryInput } from '../types/memory';
import { isAfter, isBefore, parseISO } from 'date-fns';

type ViewMode = 'map' | 'timeline' | 'cinematic';
type MapPerspective = 'map' | 'globe';

interface FiltersState {
  contributor: 'all' | Contributor;
  categories: Set<Category>;
  year: number | 'all';
  hideSecret: boolean;
}

interface TimeRangeState {
  start: string | null; // ISO date
  end: string | null; // ISO date
}

interface AppState {
  memories: Memory[];
  loading: boolean;
  error: string | null;
  viewMode: ViewMode;
  mapPerspective: MapPerspective;
  pendingFlyTo: { lat: number; lng: number; zoom?: number } | null;
  initialCenter: { lat: number; lng: number };
  initialZoom: number;
  mapVersion: number;
  filters: FiltersState;
  timeRange: TimeRangeState;
  showTrails: boolean;
  showThoughtHeatmap: boolean;
  selectedMemoryId: string | null;
  fetchMemories: () => Promise<void>;
  subscribeToRealtime: () => void;
  addMemory: (input: NewMemoryInput) => Promise<Memory | null>;
  updateMemory: (id: string, updates: Partial<NewMemoryInput & { is_bucket_list_completed: boolean }>) => Promise<void>;
  deleteMemory: (id: string) => Promise<void>;
  setViewMode: (mode: ViewMode) => void;
  setMapPerspective: (mode: MapPerspective) => void;
  setFilters: (partial: Partial<FiltersState>) => void;
  resetFilters: () => void;
  setTimeRange: (partial: Partial<TimeRangeState>) => void;
  setShowTrails: (v: boolean) => void;
  setShowThoughtHeatmap: (v: boolean) => void;
  setSelectedMemoryId: (id: string | null) => void;
  flyTo: (lat: number, lng: number, zoom?: number) => void;
  getFilteredMemories: () => Memory[];
  getAllYears: () => number[];
}

export const useAppStore = create<AppState>()(devtools((set, get) => ({
  memories: [],
  loading: false,
  error: null,
  viewMode: 'map',
  mapPerspective: 'map',
  pendingFlyTo: null,
  initialCenter: { lat: 20, lng: 0 },
  initialZoom: 2,
  mapVersion: 0,
  filters: {
    contributor: 'all',
    categories: new Set<Category>([
      'core', 'thought', 'bucket_list', 'trip', 'milestone',
      'inside_joke', 'celebration', 'heartbreak_repair', 'anniversary', 'secret'
    ]),
    year: 'all',
    hideSecret: false
  },
  timeRange: { start: null, end: null },
  showTrails: false,
  showThoughtHeatmap: false,
  selectedMemoryId: null,
  fetchMemories: async () => {
    set({ loading: true, error: null });
    const { data, error } = await supabase
      .from('memories')
      .select('*')
      .order('date', { ascending: true })
      .order('time', { ascending: true, nullsFirst: true });
    if (error) {
      set({ error: error.message, loading: false });
      return;
    }
    const memories = (data || []).map((m) => {
      if (!m.color) {
        m.color = CATEGORY_COLORS[m.category as Category] || null;
      }
      return m as Memory;
    });
    set({ memories, loading: false });
  },
  subscribeToRealtime: () => {
    const channel = supabase
      .channel('memories-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'memories' }, (payload) => {
        const { eventType, new: newRow, old: oldRow } = payload as any;
        set((state) => {
          if (eventType === 'INSERT') {
            const next = [...state.memories, newRow as Memory];
            next.sort((a, b) => {
              const da = new Date(`${a.date} ${a.time ?? '00:00:00'}`).getTime();
              const db = new Date(`${b.date} ${b.time ?? '00:00:00'}`).getTime();
              return da - db;
            });
            return { memories: next };
          }
          if (eventType === 'UPDATE') {
            return {
              memories: state.memories.map((m) => (m.id === newRow.id ? (newRow as Memory) : m))
            };
          }
          if (eventType === 'DELETE') {
            return {
              memories: state.memories.filter((m) => m.id !== oldRow.id)
            };
          }
          return state;
        });
      })
      .subscribe();
    // Optionally store channel to unsubscribe later
  },
  addMemory: async (input) => {
    const payload = { ...input };
    if (!payload.color) {
      payload.color = CATEGORY_COLORS[payload.category];
    }
    const { data, error } = await supabase.from('memories').insert(payload).select().single();
    if (error) {
      set({ error: error.message });
      return null;
    }
    set((state) => ({ memories: [...state.memories, data as Memory] }));
    return data as Memory;
  },
  updateMemory: async (id, updates) => {
    const { error } = await supabase.from('memories').update(updates).eq('id', id);
    if (error) set({ error: error.message });
  },
  deleteMemory: async (id) => {
    const { error } = await supabase.from('memories').delete().eq('id', id);
    if (error) set({ error: error.message });
  },
  setViewMode: (mode) => set({ viewMode: mode }),
  setMapPerspective: (mode) => set({ mapPerspective: mode }),
  setFilters: (partial) => set((s) => ({ filters: { ...s.filters, ...partial } })),
  resetFilters: () => set({
    filters: {
      contributor: 'all',
      categories: new Set<Category>([
        'core', 'thought', 'bucket_list', 'trip', 'milestone',
        'inside_joke', 'celebration', 'heartbreak_repair', 'anniversary', 'secret'
      ]),
      year: 'all',
      hideSecret: false
    }
  }),
  setTimeRange: (partial) => set((s) => ({ timeRange: { ...s.timeRange, ...partial } })),
  setShowTrails: (v) => set({ showTrails: v }),
  setShowThoughtHeatmap: (v) => set({ showThoughtHeatmap: v }),
  setSelectedMemoryId: (id) => set({ selectedMemoryId: id }),
  flyTo: (lat, lng, zoom) => {
    console.log("[Store] set pendingFlyTo", { lat, lng, zoom });
    set((s) => ({
      pendingFlyTo: { lat, lng, zoom },
      initialCenter: { lat, lng },
      initialZoom: zoom ?? s.initialZoom,
      mapVersion: s.mapVersion + 1
    }));
  },
  getFilteredMemories: () => {
    const { memories, filters, timeRange } = get();
    return memories.filter((m) => {
      if (filters.hideSecret && m.category === 'secret') return false;
      if (filters.contributor !== 'all' && m.contributor !== filters.contributor) return false;
      if (!filters.categories.has(m.category)) return false;
      if (filters.year !== 'all') {
        const y = new Date(m.date).getFullYear();
        if (y !== filters.year) return false;
      }
      if (timeRange.start && isBefore(parseISO(m.date), parseISO(timeRange.start))) return false;
      if (timeRange.end && isAfter(parseISO(m.date), parseISO(timeRange.end))) return false;
      return true;
    });
  },
  getAllYears: () => {
    const years = new Set<number>();
    for (const m of get().memories) {
      const y = new Date(m.date).getFullYear();
      years.add(y);
    }
    return Array.from(years).sort();
  }
})));

