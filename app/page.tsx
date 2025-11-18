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
  const {
    viewMode,
    fetchMemories,
    subscribeToRealtime,
  } = useAppStore();

  useEffect(() => {
    fetchMemories();
    subscribeToRealtime();
  }, [fetchMemories, subscribeToRealtime]);

  return (
    <Layout>
      <Header />
      {viewMode === "cinematic" ? (
        <CinematicMode />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 p-4">
          <div className="lg:col-span-3 romantic-card p-2 md:p-3">
            <MapView />
          </div>
          <div className="lg:col-span-1 space-y-3">
            <div className="romantic-card p-3">
              <Filters />
            </div>
            <div className="romantic-card p-3">
              <TimeSlider />
            </div>
            <div className="romantic-card p-0">
              <Timeline />
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

