"use client";
import React from "react";
import { CATEGORY_LABELS } from "@utils/constants";
import type { Category } from "@types/memory";
import { useAppStore } from "@store/store";

const CATEGORIES: Category[] = ['core','thought','bucket_list','trip','milestone','inside_joke','celebration','heartbreak_repair','anniversary','secret'];

export default function Filters() {
  const { filters, setFilters, resetFilters, getAllYears } = useAppStore();
  const years = getAllYears();

  return (
    <div className="space-y-4">
      <div>
        <div className="text-sm font-medium mb-2">Contributor</div>
        <div className="segmented">
          {(['all','joy','socrates'] as const).map((c) => (
            <button
              key={c}
              className={`seg ${filters.contributor === c ? 'active' : ''}`}
              onClick={() => setFilters({ contributor: c })}
            >
              {c === 'all' ? 'All' : (c === 'joy' ? 'Joy' : 'Socrates')}
            </button>
          ))}
        </div>
      </div>
      <div>
        <div className="text-sm font-medium mb-2">Categories</div>
        <div className="grid grid-cols-2 gap-2">
          {CATEGORIES.map((c) => {
            const checked = filters.categories.has(c);
            return (
              <label key={c} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => {
                    const next = new Set(filters.categories);
                    if (e.target.checked) next.add(c);
                    else next.delete(c);
                    setFilters({ categories: next });
                  }}
                />
                <span className="romantic-tag">{CATEGORY_LABELS[c]}</span>
              </label>
            );
          })}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={filters.hideSecret} onChange={(e) => setFilters({ hideSecret: e.target.checked })} />
          Hide secret pins
        </label>
        <div>
          <div className="text-sm mb-1">Year</div>
          <select
            value={filters.year}
            onChange={(e) => setFilters({ year: e.target.value === 'all' ? 'all' : Number(e.target.value) })}
            className="select"
          >
            <option value="all">All years</option>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>
      <div className="flex justify-end">
        <button className="btn-soft" onClick={resetFilters}>Clear filters</button>
      </div>
    </div>
  );
}

