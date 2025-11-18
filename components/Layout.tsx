"use client";
import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-bg min-h-screen">
      <div className="max-w-7xl mx-auto">
        {children}
      </div>
    </div>
  );
}

