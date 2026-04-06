import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Float } from "@react-three/drei";
import { useMemo, useRef } from "react";

const severityPalette = {
  Minor: "#22c55e",
  Medium: "#facc15",
  Severe: "#ef4444"
};

const CarModel = ({ accident }) => {
  const group = useRef(null);
  const wheelMaterial = useMemo(() => ({ color: "#0f172a" }), []);
  const glowColor = severityPalette[accident?.severity_label ?? "Minor"];
  const tiltX = ((accident?.tilt_angle ?? 0) * Math.PI) / 180 / 4;
  const impactPulse = Math.min((accident?.acceleration ?? 1) / 4, 1.2);

  useFrame((state) => {
    if (!group.current) {
      return;
    }

    group.current.rotation.z = Math.sin(state.clock.elapsedTime * 4) * 0.02 * impactPulse;
    group.current.rotation.x += (tiltX - group.current.rotation.x) * 0.06;
    group.current.position.y = Math.sin(state.clock.elapsedTime * 3) * 0.04 * impactPulse;
  });

  return (
    <Float speed={2} rotationIntensity={0.15} floatIntensity={0.3}>
      <group ref={group}>
        <mesh position={[0, 0.15, 0]}>
          <boxGeometry args={[2.8, 0.55, 1.3]} />
          <meshStandardMaterial color="#38bdf8" metalness={0.4} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.6, 0]}>
          <boxGeometry args={[1.3, 0.5, 1.1]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.15} roughness={0.25} />
        </mesh>
        {[
          [-0.95, -0.15, 0.78],
          [0.95, -0.15, 0.78],
          [-0.95, -0.15, -0.78],
          [0.95, -0.15, -0.78]
        ].map((position, index) => (
          <mesh key={index} position={position} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.26, 0.26, 0.36, 24]} />
            <meshStandardMaterial {...wheelMaterial} />
          </mesh>
        ))}
        <mesh position={[0, 0.22, 0]}>
          <torusGeometry args={[1.6, 0.05, 16, 64]} />
          <meshStandardMaterial color={glowColor} emissive={glowColor} emissiveIntensity={2.2} />
        </mesh>
      </group>
    </Float>
  );
};

const Accident3DViewer = ({ accident }) => (
  <div className="rounded-[28px] border border-white/10 bg-panel/80 p-5 shadow-glow">
    <div className="mb-4">
      <p className="text-sm uppercase tracking-[0.2em] text-slate-400">3D Visualization</p>
      <h3 className="mt-2 font-display text-2xl text-white">Accident dynamics viewer</h3>
      <p className="mt-2 text-sm text-slate-300">
        The car model tilts and pulses based on the latest crash severity and impact intensity.
      </p>
    </div>
    <div className="h-[340px] overflow-hidden rounded-[24px] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.22),_transparent_35%),linear-gradient(160deg,_#020617,_#0f172a)]">
      <Canvas camera={{ position: [4.8, 2.8, 4.8], fov: 45 }}>
        <ambientLight intensity={1.2} />
        <directionalLight position={[5, 5, 5]} intensity={2.2} />
        <pointLight position={[0, 1.5, 0]} intensity={18} color={severityPalette[accident?.severity_label ?? "Minor"]} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
          <circleGeometry args={[6, 48]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        <CarModel accident={accident} />
        <OrbitControls enablePan={false} minDistance={4} maxDistance={8} />
      </Canvas>
    </div>
  </div>
);

export default Accident3DViewer;
