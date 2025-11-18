"use client";
import React from "react";

export default function BucketListToggle({ checked, onChange }: { checked: boolean, onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      We did this!
      {checked ? <span className="ml-1">✨</span> : null}
    </label>
  );
}

