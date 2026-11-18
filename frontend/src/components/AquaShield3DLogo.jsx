import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

// --- Procedural 3D Water Droplet with Inner Shield Emblem ---
function DropletMesh({ isHovered, reducedMotion }) {
  const meshRef = useRef();
  const shieldRef = useRef();
  const ringRef = useRef();

  // Procedural Lathe Geometry for organic teardrop / water droplet
  const dropletGeometry = useMemo(() => {
    const points = [];
    const segments = 40;
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      // y ranges from -1.1 to +1.2
      const y = -1.1 + t * 2.3;
      // Droplet profile: full spherical bottom tapering into sharp top peak
      let r = 0;
      if (t < 0.65) {
        // Bulbous rounded base
        const angle = (t / 0.65) * (Math.PI / 2);
        r = Math.sin(angle) * 0.95;
      } else {
        // Smooth cusp tapering to point
        const decay = (1 - t) / 0.35;
        r = Math.pow(decay, 1.4) * 0.95;
      }
      points.push(new THREE.Vector2(Math.max(0.001, r), y));
    }
    const geom = new THREE.LatheGeometry(points, 64);
    geom.computeVertexNormals();
    return geom;
  }, []);

  // Stylized Inner Shield Emblem geometry
  const shieldGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    // Shield outline: top flat with center crest, curved sides meeting at bottom point
    shape.moveTo(0, 0.45);
    shape.lineTo(0.35, 0.38);
    shape.quadraticCurveTo(0.38, -0.05, 0.22, -0.32);
    shape.lineTo(0, -0.55);
    shape.lineTo(-0.22, -0.32);
    shape.quadraticCurveTo(-0.38, -0.05, -0.35, 0.38);
    shape.closePath();

    const extrudeSettings = {
      depth: 0.12,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.04,
      bevelThickness: 0.04
    };

    const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geom.center();
    return geom;
  }, []);

  // Orbital Ring geometry
  const ringGeometry = useMemo(() => {
    return new THREE.TorusGeometry(1.25, 0.022, 16, 80);
  }, []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    if (!reducedMotion) {
      // Continuous 360 rotation around Y
      meshRef.current.rotation.y += delta * 0.75;

      // Mouse-follow interaction with smooth damping
      const targetRotX = state.pointer.y * 0.45;
      const targetRotZ = -state.pointer.x * 0.45;
      meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, targetRotX, 0.08);
      meshRef.current.rotation.z = THREE.MathUtils.lerp(meshRef.current.rotation.z, targetRotZ, 0.08);

      // Inner shield subtle counter-rotation for parallax depth
      if (shieldRef.current) {
        shieldRef.current.rotation.y = -meshRef.current.rotation.y * 0.5;
        shieldRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 2.0) * 0.05;
      }

      // Orbital ring rotation
      if (ringRef.current) {
        ringRef.current.rotation.z += delta * 0.4;
        ringRef.current.rotation.x = Math.PI / 3 + Math.sin(state.clock.elapsedTime * 0.8) * 0.15;
      }
    }

    // Hover scale smoothly
    const targetScale = isHovered ? 1.08 : 1.0;
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
  });

  return (
    <group ref={meshRef}>
      {/* 1. Translucent Glass-Like Water Droplet */}
      <mesh geometry={dropletGeometry}>
        <meshPhysicalMaterial
          color="#0284C7"
          roughness={0.06}
          transmission={0.92}
          thickness={1.6}
          ior={1.333} // Water IOR
          reflectivity={0.9}
          clearcoat={1.0}
          clearcoatRoughness={0.04}
          attenuationColor="#06B6D4"
          attenuationDistance={0.9}
          transparent={true}
          opacity={0.95}
        />
      </mesh>

      {/* 2. Embedded Luminous Shield Emblem (representing protection) */}
      <mesh ref={shieldRef} geometry={shieldGeometry} scale={[0.85, 0.85, 0.85]} position={[0, -0.05, 0]}>
        <meshStandardMaterial
          color="#38BDF8"
          emissive="#0284C7"
          emissiveIntensity={0.65}
          metalness={0.85}
          roughness={0.18}
        />
      </mesh>

      {/* 3. Orbiting Aqua Planetary Shield Ring */}
      <mesh ref={ringRef} geometry={ringGeometry} rotation={[Math.PI / 3, 0.2, 0]}>
        <meshStandardMaterial
          color="#06B6D4"
          emissive="#0EA5E9"
          emissiveIntensity={0.4}
          transparent={true}
          opacity={0.65}
          roughness={0.3}
        />
      </mesh>
    </group>
  );
}

// Fallback SVG if WebGL fails or crashes
function StaticSvgFallback({ sizeClass }) {
  return (
    <div className={`flex items-center justify-center ${sizeClass}`}>
      <div className="relative w-28 h-28 rounded-full bg-gradient-to-tr from-sky-500/20 via-cyan-400/20 to-blue-600/30 flex items-center justify-center p-4 border border-sky-200/50 shadow-inner">
        <svg viewBox="0 0 100 120" className="w-20 h-20 drop-shadow-md text-sky-600">
          <path
            d="M50 5 C50 5 15 55 15 80 A35 35 0 0 0 85 80 C85 55 50 5 50 5 Z"
            fill="url(#waterGrad)"
            stroke="#0284c7"
            strokeWidth="2"
          />
          {/* Inner Shield */}
          <path
            d="M50 45 L65 52 C65 72 50 82 50 82 C50 82 35 72 35 52 Z"
            fill="#38bdf8"
            opacity="0.85"
          />
          <defs>
            <linearGradient id="waterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="50%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#0369a1" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}

export default function AquaShield3DLogo({
  size = 'md', // 'sm', 'md', 'lg', 'hero'
  showBrand = false,
  className = ''
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [hasWebGL, setHasWebGL] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // Check WebGL availability
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) setHasWebGL(false);
    } catch (e) {
      setHasWebGL(false);
    }

    // Check user preference for reduced motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    const handler = (e) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const sizeDimensions = {
    sm: 'w-24 h-24',
    md: 'w-36 h-36 sm:w-44 sm:h-44',
    lg: 'w-52 h-52 sm:w-64 sm:h-64',
    hero: 'w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96'
  };

  const containerSize = sizeDimensions[size] || sizeDimensions.md;

  return (
    <div className={`flex flex-col items-center justify-center select-none ${className}`}>
      <div
        className={`relative ${containerSize} transition-transform duration-300 cursor-grab active:cursor-grabbing`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-sky-400/20 via-cyan-400/15 to-transparent rounded-full blur-2xl pointer-events-none transform -translate-y-2 scale-90" />

        {hasWebGL ? (
          <Canvas
            camera={{ position: [0, 0.2, 3.6], fov: 42 }}
            dpr={[1, 2]} // Performance clamp
            gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
            style={{ width: '100%', height: '100%' }}
          >
            {/* Realistic Lighting Setup */}
            <ambientLight intensity={0.8} />
            <directionalLight position={[5, 8, 5]} intensity={1.6} color="#FFFFFF" />
            <directionalLight position={[-5, -2, -3]} intensity={0.9} color="#06B6D4" />
            <pointLight position={[0, -1.5, 2]} intensity={1.2} color="#0284C7" />

            {/* Floating Physics Group */}
            <Float
              speed={reducedMotion ? 0 : 2}
              rotationIntensity={reducedMotion ? 0 : 0.3}
              floatIntensity={reducedMotion ? 0 : 0.5}
            >
              <DropletMesh isHovered={isHovered} reducedMotion={reducedMotion} />
            </Float>

            {/* Soft Contact Shadow beneath the droplet */}
            <ContactShadows
              position={[0, -1.35, 0]}
              opacity={0.35}
              scale={2.8}
              blur={2.0}
              far={3}
              color="#0369A1"
            />
          </Canvas>
        ) : (
          <StaticSvgFallback sizeClass={containerSize} />
        )}
      </div>

      {/* Brand Name & Subtitle (Optional Flag) */}
      {showBrand && (
        <div className="text-center mt-3 space-y-1">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center justify-center gap-1.5">
            Aqua<span className="text-sky-600">Shield</span>
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-slate-500 tracking-wide uppercase">
            AI-Powered Water Crisis Intelligence
          </p>
        </div>
      )}
    </div>
  );
}
