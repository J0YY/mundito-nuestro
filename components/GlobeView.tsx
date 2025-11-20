"use client";
import React, { useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Line, Stars } from "@react-three/drei";
import * as THREE from "three";
import countries from "world-countries";
import { useAppStore } from "@store/store";
import { CATEGORY_COLORS } from "@utils/constants";

const latLngToVector = (lat: number, lng: number, radius = 1) => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
};

const createArcPoints = (start: THREE.Vector3, end: THREE.Vector3) => {
  const mid = start.clone().lerp(end, 0.5).normalize().multiplyScalar(1.25);
  const curve = new THREE.CatmullRomCurve3([start, mid, end]);
  return curve.getPoints(48);
};

interface GlobePoint {
  id: string;
  position: THREE.Vector3;
  color: string;
  title: string;
}

interface GlobeArc {
  id: string;
  color: string;
  points: THREE.Vector3[];
}

const CountryLines = () => {
  const lineData = useMemo(() => {
    const lines: { id: string; points: THREE.Vector3[] }[] = [];
    countries.forEach((country) => {
      const geom = country.geometry;
      if (!geom) return;
      const processRing = (ring: number[][]) => {
        const pts = ring.map(([lng, lat]) => latLngToVector(lat, lng, 1.005));
        if (pts.length > 0) pts.push(pts[0].clone());
        lines.push({ id: `${country.cca3}-${lines.length}`, points: pts });
      };
      if (geom.type === "Polygon") {
        geom.coordinates.forEach((ring) => processRing(ring as number[][]));
      } else if (geom.type === "MultiPolygon") {
        geom.coordinates.forEach((poly) => poly.forEach((ring) => processRing(ring as number[][])));
      }
    });
    return lines;
  }, []);

  return (
    <>
      {lineData.map((line) => (
        <Line
          key={line.id}
          points={line.points}
          color="#72d2a4"
          lineWidth={0.8}
          transparent
          opacity={0.6}
        />
      ))}
    </>
  );
};

const GlobeShell = () => (
  <mesh>
    <sphereGeometry args={[1, 128, 128]} />
    <meshStandardMaterial color="#0b3a77" roughness={0.8} metalness={0.05} />
  </mesh>
);

const Atmosphere = () => (
  <mesh scale={1.03}>
    <sphereGeometry args={[1, 64, 64]} />
    <meshPhongMaterial color="#5fd9ff" transparent opacity={0.08} side={THREE.BackSide} />
  </mesh>
);

const GlobeScene = ({ points, arcs, autoRotate }: { points: GlobePoint[]; arcs: GlobeArc[]; autoRotate: boolean }) => {
  return (
    <>
      <color attach="background" args={["#050815"]} />
      <ambientLight intensity={0.7} />
      <directionalLight position={[2, 2, 1]} intensity={1.1} />
      <GlobeShell />
      <Atmosphere />
      <CountryLines />

      {points.map((point) => (
        <mesh key={point.id} position={point.position} scale={0.018}>
          <sphereGeometry args={[1, 20, 20]} />
          <meshStandardMaterial color={point.color} emissive={point.color} emissiveIntensity={0.8} />
        </mesh>
      ))}

      {arcs.map((arc) => (
        <Line key={arc.id} points={arc.points} color={arc.color} lineWidth={2} transparent opacity={0.5} />
      ))}

      <Stars radius={50} depth={20} count={2000} factor={4} saturation={0} fade speed={1} />
      <OrbitControls enableDamping dampingFactor={0.05} autoRotate={autoRotate} autoRotateSpeed={0.25} />
    </>
  );
};

export default function GlobeView() {
  const filtered = useAppStore((state) => state.getFilteredMemories());
  const [autoRotate, setAutoRotate] = useState(true);

  const { points, arcs } = useMemo(() => {
    const pts: GlobePoint[] = filtered.map((m) => ({
      id: m.id,
      title: m.title,
      position: latLngToVector(m.lat, m.lng, 1.01),
      color: CATEGORY_COLORS[m.category] ?? "#ffffff"
    }));

    const ordered = filtered
      .slice()
      .sort(
        (a, b) =>
          new Date(`${a.date} ${a.time ?? "00:00:00"}`).getTime() -
          new Date(`${b.date} ${b.time ?? "00:00:00"}`).getTime()
      );
    const arcData: GlobeArc[] = [];
    for (let i = 0; i < ordered.length - 1; i += 1) {
      const start = latLngToVector(ordered[i].lat, ordered[i].lng);
      const end = latLngToVector(ordered[i + 1].lat, ordered[i + 1].lng);
      arcData.push({
        id: `${ordered[i].id}-${ordered[i + 1].id}`,
        color: CATEGORY_COLORS[ordered[i + 1].category] ?? "#ffffff",
        points: createArcPoints(start, end)
      });
    }
    return { points: pts, arcs: arcData };
  }, [filtered]);

  return (
    <div className="relative h-[560px] lg:h-full rounded-[28px] overflow-hidden bg-gradient-to-br from-[#040612] via-[#0c1630] to-[#1b0f2f]">
      <Canvas camera={{ position: [0, 0, 2.8], fov: 45 }}>
        <GlobeScene points={points} arcs={arcs} autoRotate={autoRotate} />
      </Canvas>
      <div className="absolute top-4 left-4 glass-panel px-4 py-2 bg-white/10 border-white/20 rounded-2xl flex items-center gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-white/70">Globe</p>
          <p className="text-sm text-white/90">Memories plotted: {points.length}</p>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={autoRotate} onChange={(e) => setAutoRotate(e.target.checked)} />
          Rotate
        </label>
      </div>
    </div>
  );
}

