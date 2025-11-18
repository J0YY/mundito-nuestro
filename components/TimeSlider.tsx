"use client";
import React, { useMemo } from "react";
import { useAppStore } from "@store/store";

export default function TimeSlider() {
  const { memories, timeRange, setTimeRange } = useAppStore();

  const { minDate, maxDate } = useMemo(() => {
    if (!memories.length) return { minDate: '', maxDate: '' };
    const dates = memories.map((m) => m.date).sort();
    return { minDate: dates[0], maxDate: dates[dates.length - 1] };
  }, [memories]);

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">Time range</div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <div className="text-xs text-slate-500 mb-1">Start</div>
          <input type="date" className="input" min={minDate} max={maxDate} value={timeRange.start ?? ''} onChange={(e) => setTimeRange({ start: e.target.value || null })} />
        </div>
        <div>
          <div className="text-xs text-slate-500 mb-1">End</div>
          <input type="date" className="input" min={minDate} max={maxDate} value={timeRange.end ?? ''} onChange={(e) => setTimeRange({ end: e.target.value || null })} />
        </div>
      </div>
      <div className="flex justify-end">
        <button className="btn-soft" onClick={() => setTimeRange({ start: null, end: null })}>Clear</button>
      </div>
    </div>
  );
}

