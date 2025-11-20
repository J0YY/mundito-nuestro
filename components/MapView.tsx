"use client";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip, Polyline, useMap, useMapEvents } from "react-leaflet";
import L, { LeafletMouseEvent } from "leaflet";
import type { Memory } from "../types/memory";
import { CATEGORY_COLORS } from "@utils/constants";
import { useAppStore } from "@store/store";
import MemoryForm from "./MemoryForm";
import MemoryPopup from "./MemoryPopup";
import SearchBar from "./SearchBar";

function HeatmapLayer({ points }: { points: Array<[number, number, number?]> }) {
  const map = useMap();
  const layerRef = useRef<L.Layer | null>(null);
  useEffect(() => {
    if (layerRef.current) {
      map.removeLayer(layerRef.current);
      layerRef.current = null;
    }
    (async () => {
      if (!points.length) return;
      // dynamically load the plugin on the client
      try {
        await import('leaflet.heat');
      } catch {
        // some environments require the explicit dist file path
        await import('leaflet.heat/dist/leaflet-heat.js');
      }
      const heat = (L as any).heatLayer(points, { radius: 20, blur: 15, maxZoom: 7, gradient: { 0.2: '#7cd4ff', 0.5: '#60a5fa', 0.8: '#3b82f6' } }) as L.Layer;
      heat.addTo(map);
      layerRef.current = heat;
    })();
    return () => {
      if (layerRef.current) map.removeLayer(layerRef.current);
    };
  }, [map, points]);
  return null;
}

function InteractionLayer({ onContextMenu }: { onContextMenu: (e: L.LeafletMouseEvent) => void }) {
  const map = useMapEvents({
    contextmenu(e) {
      onContextMenu(e);
    }
  });
  useEffect(() => {
    const container = map.getContainer();
    const prevent = (ev: Event) => ev.preventDefault();
    container.addEventListener('contextmenu', prevent);
    return () => container.removeEventListener('contextmenu', prevent);
  }, [map]);
  return null;
}

function MapClickHandler({ onClick }: { onClick: (e: L.LeafletMouseEvent) => void }) {
  useMapEvents({
    click(e) {
      onClick(e);
    }
  });
  return null;
}

function FlyToController() {
  const map = useMap();
  const pending = useAppStore((s) => s.pendingFlyTo);
  useEffect(() => {
    if (!pending) return;
    console.log("[FlyToController] pendingFlyTo received", pending);
    const { lat, lng, zoom } = pending;
    // Ensure size is correct before moving
    map.invalidateSize(true);
    // Use setView with animation; keep it single-shot to avoid conflicts
    map.setView([lat, lng], zoom ?? 16, { animate: true });
    console.log("[FlyToController] setView called", { center: [lat, lng], zoom });
    map.once('moveend', () => {
      console.log("[FlyToController] moveend center", map.getCenter(), "zoom", map.getZoom());
      // Safety: ensure final zoom and a tiny nudge to force re-render if needed
      if (map.getZoom() < (zoom ?? 16)) {
        map.setZoom(zoom ?? 16, { animate: false });
      }
      map.panBy([1, 1], { animate: false });
      map.panBy([-1, -1], { animate: false });
    });
    const pulse = L.circleMarker([lat, lng], {
      radius: 10,
      color: '#ff80b5',
      fillColor: '#ff80b5',
      fillOpacity: 0.7
    }).addTo(map);
    setTimeout(() => { try { map.removeLayer(pulse); } catch {} }, 2500);
    // clear pending
    // @ts-ignore
    useAppStore.setState({ pendingFlyTo: null });
  }, [pending, map]);
  return null;
}

function MapDebug() {
  const map = useMap();
  const [info, setInfo] = React.useState<{ lat: number; lng: number; z: number }>({ lat: 0, lng: 0, z: 0 });
  useEffect(() => {
    const update = () => {
      const c = map.getCenter();
      setInfo({ lat: Number(c.lat.toFixed(5)), lng: Number(c.lng.toFixed(5)), z: map.getZoom() });
    };
    update();
    map.on('move', update);
    map.on('zoom', update);
    return () => {
      map.off('move', update);
      map.off('zoom', update);
    };
  }, [map]);
  return (
    <div className="absolute left-2 bottom-2 text-[11px] px-2 py-1 rounded bg-black/40 text-white pointer-events-none">
      {info.lat}, {info.lng} · z{info.z}
    </div>
  );
}

export default function MapView() {
  const {
    getFilteredMemories,
    showTrails,
    showThoughtHeatmap,
    selectedMemoryId,
    setSelectedMemoryId,
    pendingFlyTo,
    initialCenter,
    initialZoom,
    mapVersion
  } = useAppStore();
  const memories = getFilteredMemories();
  const [formOpen, setFormOpen] = useState(false);
  const [initialLatLng, setInitialLatLng] = useState<{ lat: number; lng: number } | null>(null);
  const [editing, setEditing] = useState<Memory | null>(null);
  const markerRefs = useRef<Map<string, L.CircleMarker>>(new Map());
  const [showHint, setShowHint] = useState(true);
  const [isDraggingHeart, setIsDraggingHeart] = useState(false);
  const [dragClient, setDragClient] = useState<{ x: number; y: number } | null>(null);

  const handleMapClick = useCallback((e: LeafletMouseEvent) => {
    setEditing(null);
    setInitialLatLng({ lat: e.latlng.lat, lng: e.latlng.lng });
    setFormOpen(true);
  }, []);

  const thoughtPoints = useMemo(() => memories.filter((m) => m.category === 'thought').map((m) => [m.lat, m.lng, 0.5] as [number, number, number]), [memories]);
  const trails = useMemo(() => {
    if (!showTrails) return [];
    const s = memories.slice().sort((a, b) => new Date(`${a.date} ${a.time ?? '00:00:00'}`).getTime() - new Date(`${b.date} ${b.time ?? '00:00:00'}`).getTime());
    return s.map((m) => [m.lat, m.lng]) as [number, number][];
  }, [memories, showTrails]);

  const mapRef = useRef<L.Map | null>(null);
  useEffect(() => {
    if (!selectedMemoryId || !mapRef.current) return;
    const m = memories.find((x) => x.id === selectedMemoryId);
    if (m) {
      console.log("[MapView] selectedMemoryId flyTo", m);
      mapRef.current.flyTo([m.lat, m.lng], 8, { duration: 1.2 });
      // open the popup for the target marker after a short delay
      setTimeout(() => {
        const marker = markerRefs.current.get(m.id);
        if (marker) {
          marker.openPopup();
        }
        setSelectedMemoryId(null);
      }, 800);
    }
  }, [selectedMemoryId, memories, setSelectedMemoryId]);

  // NOTE: flyTo is handled by <FlyToController /> to ensure it runs within Leaflet context

  return (
    <div className="relative h-full min-h-[560px]">
      <MapContainer
        key={mapVersion}
        ref={mapRef}
        className="map-frame w-full h-full animate-rise"
        center={[initialCenter.lat, initialCenter.lng]}
        zoom={initialZoom}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Context menu and map interactions */}
        <InteractionLayer
          onContextMenu={(e) => {
            setEditing(null);
            setInitialLatLng({ lat: e.latlng.lat, lng: e.latlng.lng });
            setFormOpen(true);
          }}
        />
        <MapClickHandler onClick={handleMapClick} />
        <FlyToController />
        <MapDebug />

        {showThoughtHeatmap ? <HeatmapLayer points={thoughtPoints} /> : null}

        {memories.map((m) => {
          const isSecretLocked = m.category === 'secret' && m.secret_unlock_date && new Date(m.secret_unlock_date) > new Date();
          const color = CATEGORY_COLORS[m.category] || m.color || '#888';
          const fillColor = m.category === 'bucket_list'
            ? (m.is_bucket_list_completed ? '#22c55e' : color)
            : color;
          const opacity = showThoughtHeatmap && m.category === 'thought' ? 0.25 : 0.9;
          return (
            <CircleMarker
              key={m.id}
              ref={(instance) => {
                if (instance) {
                  markerRefs.current.set(m.id, instance);
                } else {
                  markerRefs.current.delete(m.id);
                }
              }}
              center={[m.lat, m.lng]}
              pathOptions={{ color: fillColor, fillColor, fillOpacity: 0.7 }}
              radius={8}
              opacity={opacity}
            >
              <Tooltip direction="top" offset={[0, -8]}>
                {isSecretLocked ? '🔒 Secret memory' : `${m.title}`} · {m.date} · {m.contributor === 'joy' ? 'Joy' : 'Socrates'}
              </Tooltip>
              <Popup maxWidth={320}>
                <MemoryPopup
                  memory={m}
                  onEdit={(memory) => {
                    setEditing(memory);
                    setInitialLatLng({ lat: memory.lat, lng: memory.lng });
                    setFormOpen(true);
                  }}
                />
              </Popup>
            </CircleMarker>
          );
        })}

        {showTrails && trails.length > 1 ? (
          <Polyline positions={trails} pathOptions={{ color: '#94a3b8', opacity: 0.5, weight: 3 }} />
        ) : null}
      </MapContainer>

      {/* Overlayed Search on the map */}
      <div className="absolute right-3 top-3 z-[1100] w-[260px] sm:w-[320px] animate-pop">
        <div className="rounded-2xl border border-white/60 bg-white/70 shadow-[0_10px_35px_-20px_rgba(255,128,181,0.9)]">
          <SearchBar />
        </div>
      </div>

      {showHint ? (
        <div className="absolute left-16 top-3 bg-white/90 dark:bg-slate-900/90 border border-white/30 rounded-xl px-3 py-2 text-sm shadow-soft">
          Tap the map to add a memory.
          <button className="ml-2 text-slate-500 hover:text-slate-700" onClick={() => setShowHint(false)}>Dismiss</button>
        </div>
      ) : null}

      <div
        className="absolute bottom-4 right-4 z-[1001] rounded-full w-14 h-14 flex items-center justify-center bg-gradient-to-br from-core to-pink-500 text-white text-2xl shadow-[0_10px_30px_-10px_rgba(255,128,181,0.8)] cursor-grab active:cursor-grabbing select-none pointer-events-auto animate-float hover-elevate"
        onPointerDown={(e) => {
          e.preventDefault();
          setIsDraggingHeart(true);
          setDragClient({ x: e.clientX, y: e.clientY });
          mapRef.current?.dragging.disable();
          const onMove = (ev: PointerEvent) => {
            setDragClient({ x: ev.clientX, y: ev.clientY });
          };
          const onUp = (ev: PointerEvent) => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
            setIsDraggingHeart(false);
            mapRef.current?.dragging.enable();
            const map = mapRef.current;
            if (!map) return;
            const container = map.getContainer();
            const rect = container.getBoundingClientRect();
            const x = ev.clientX - rect.left;
            const y = ev.clientY - rect.top;
            if (x >= 0 && y >= 0 && x <= rect.width && y <= rect.height) {
              const latlng = map.containerPointToLatLng(L.point(x, y));
              setEditing(null);
              setInitialLatLng({ lat: latlng.lat, lng: latlng.lng });
              setFormOpen(true);
            }
          };
          window.addEventListener('pointermove', onMove);
          window.addEventListener('pointerup', onUp);
        }}
        onClick={() => {
          // tap: place at center
          const center = mapRef.current?.getCenter();
          if (center) {
            setEditing(null);
            setInitialLatLng({ lat: center.lat, lng: center.lng });
            setFormOpen(true);
          }
        }}
        title="Drag onto the map to add a memory"
        aria-label="Drag to add memory"
      >
        ❤️
      </div>

      {isDraggingHeart && dragClient ? (
        <div
          className="fixed pointer-events-none z-[1002]"
          style={{ left: dragClient.x - 16, top: dragClient.y - 16 }}
        >
          <div className="w-8 h-8 rounded-full bg-core/90 text-white text-xl flex items-center justify-center shadow-lg">❤️</div>
        </div>
      ) : null}

      <MemoryForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        initialLatLng={initialLatLng}
        editing={editing}
      />
    </div>
  );
}

