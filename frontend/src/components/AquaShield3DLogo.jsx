import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

// --- 3D Squircle Tile with Volumetric Glossy Droplet (Matching Reference Image) ---
function AquaShieldEmblemMesh({ isHovered, reducedMotion }) {
  const groupRef = useRef();
  const dropletRef = useRef();
  const shieldDetailRef = useRef();

  // 1. Premium Rounded Squircle Tile Geometry (Matching reference icon tile)
  const squircleGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const w = 1.65;
    const h = 1.65;
    const r = 0.42; // Smooth rounded corner radius
    const hw = w / 2;
    const hh = h / 2;

    shape.moveTo(-hw + r, -hh);
    shape.lineTo(hw - r, -hh);
    shape.quadraticCurveTo(hw, -hh, hw, -hh + r);
    shape.lineTo(hw, hh - r);
    shape.quadraticCurveTo(hw, hh, hw - r, hh);
    shape.lineTo(-hw + r, hh);
    shape.quadraticCurveTo(-hw, hh, -hw, hh - r);
    shape.lineTo(-hw, -hh + r);
    shape.quadraticCurveTo(-hw, -hh, -hw + r, -hh);

    const geom = new THREE.ExtrudeGeometry(shape, {
      depth: 0.16,
      bevelEnabled: true,
      bevelSegments: 8,
      steps: 1,
      bevelSize: 0.07,
      bevelThickness: 0.07
    });
    geom.center();
    return geom;
  }, []);

  // 2. Pure 3D Volumetric Water Droplet Geometry (Centered on the tile)
  const dropletGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    // Droplet profile matching reference image
    shape.moveTo(0, 0.44);
    shape.bezierCurveTo(0.12, 0.22, 0.38, -0.06, 0.38, -0.22);
    shape.bezierCurveTo(0.38, -0.46, 0.22, -0.52, 0, -0.52);
    shape.bezierCurveTo(-0.22, -0.52, -0.38, -0.46, -0.38, -0.22);
    shape.bezierCurveTo(-0.38, -0.06, -0.12, 0.22, 0, 0.44);

    const geom = new THREE.ExtrudeGeometry(shape, {
      depth: 0.14,
      bevelEnabled: true,
      bevelSegments: 10,
      steps: 1,
      bevelSize: 0.08,
      bevelThickness: 0.12
    });
    geom.center();
    return geom;
  }, []);

  // 3. Subtle Inner Shield Highlight detail (Protection symbol)
  const shieldGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0.18);
    shape.lineTo(0.14, 0.13);
    shape.quadraticCurveTo(0.15, -0.04, 0.09, -0.14);
    shape.lineTo(0, -0.24);
    shape.lineTo(-0.09, -0.14);
    shape.quadraticCurveTo(-0.15, -0.04, -0.14, 0.13);
    shape.closePath();

    const geom = new THREE.ExtrudeGeometry(shape, {
      depth: 0.04,
      bevelEnabled: true,
      bevelSegments: 3,
      steps: 1,
      bevelSize: 0.02,
      bevelThickness: 0.02
    });
    geom.center();
    return geom;
  }, []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    if (!reducedMotion) {
      // 3D Parallax Tilt towards cursor
      const targetRotX = -state.pointer.y * 0.45;
      const targetRotY = state.pointer.x * 0.55;
      const targetRotZ = (state.pointer.x * state.pointer.y) * 0.2;

      // Idle smooth breathing rotation + pointer tracking
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        targetRotX + Math.sin(state.clock.elapsedTime * 1.5) * 0.04,
        0.08
      );
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        targetRotY + Math.cos(state.clock.elapsedTime * 1.2) * 0.05,
        0.08
      );
      groupRef.current.rotation.z = THREE.MathUtils.lerp(
        groupRef.current.rotation.z,
        targetRotZ,
        0.08
      );

      // Droplet subtle independent floating parallax
      if (dropletRef.current) {
        dropletRef.current.position.z = 0.18 + Math.sin(state.clock.elapsedTime * 2.2) * 0.025;
      }
    }

    // Hover scale smoothly
    const targetScale = isHovered ? 1.09 : 1.0;
    groupRef.current.scale.lerp(
      new THREE.Vector3(targetScale, targetScale, targetScale),
      0.1
    );
  });

  return (
    <group ref={groupRef}>
      {/* 1. Vibrant Ocean/Cyan Squircle Tile */}
      <mesh geometry={squircleGeometry} position={[0, 0, 0]}>
        <meshPhysicalMaterial
          color="#0284C7"
          emissive="#0369A1"
          emissiveIntensity={0.25}
          roughness={0.16}
          metalness={0.12}
          clearcoat={1.0}
          clearcoatRoughness={0.06}
          reflectivity={0.9}
        />
      </mesh>

      {/* 2. Top-face Sheen / Cyan Gradient Overlay */}
      <mesh position={[0, 0, 0.14]}>
        <planeGeometry args={[1.5, 1.5]} />
        <meshStandardMaterial
          color="#38BDF8"
          emissive="#06B6D4"
          emissiveIntensity={0.2}
          transparent={true}
          opacity={0.35}
          roughness={0.2}
        />
      </mesh>

      {/* 3. Luminous Glossy White 3D Water Droplet (Centerpiece) */}
      <mesh
        ref={dropletRef}
        geometry={dropletGeometry}
        position={[0, -0.02, 0.18]}
      >
        <meshPhysicalMaterial
          color="#FFFFFF"
          emissive="#E0F2FE"
          emissiveIntensity={0.35}
          roughness={0.04}
          metalness={0.04}
          clearcoat={1.0}
          clearcoatRoughness={0.03}
          reflectivity={1.0}
          transmission={0.3} // Liquid crystal reflection
          thickness={0.8}
          ior={1.333}
        />
      </mesh>

      {/* 4. Subtle Embossed Shield Detail (Protection Identity) */}
      <mesh
        ref={shieldDetailRef}
        geometry={shieldGeometry}
        position={[0, -0.05, 0.32]}
        scale={[0.75, 0.75, 0.75]}
      >
        <meshStandardMaterial
          color="#0284C7"
          emissive="#38BDF8"
          emissiveIntensity={0.4}
          metalness={0.8}
          roughness={0.2}
          transparent={true}
          opacity={0.85}
        />
      </mesh>
    </group>
  );
}

// Crisp Vector SVG Fallback (Matching reference image)
function StaticSvgFallback({ sizeClass }) {
  return (
    <div className={`flex items-center justify-center ${sizeClass}`}>
      <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-gradient-to-tr from-sky-600 via-sky-500 to-cyan-400 p-6 flex items-center justify-center shadow-xl shadow-sky-500/30 border border-sky-300/40">
        <svg viewBox="0 0 100 120" className="w-16 h-16 drop-shadow-lg text-white">
          <path
            d="M50 8 C50 8 18 56 18 80 A32 32 0 0 0 82 80 C82 56 50 8 50 8 Z"
            fill="#FFFFFF"
          />
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
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) setHasWebGL(false);
    } catch (e) {
      setHasWebGL(false);
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    const handler = (e) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const sizeDimensions = {
    sm: 'w-24 h-24',
    md: 'w-36 h-36 sm:w-44 sm:h-44',
    lg: 'w-52 h-52 sm:w-60 sm:h-60',
    hero: 'w-64 h-64 sm:w-76 sm:h-76'
  };

  const containerSize = sizeDimensions[size] || sizeDimensions.md;

  return (
    <div className={`flex flex-col items-center justify-center select-none ${className}`}>
      <div
        className={`relative ${containerSize} transition-transform duration-300 cursor-grab active:cursor-grabbing`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Soft Ambient Cyan Glow matching reference image */}
        <div className="absolute inset-0 bg-gradient-to-tr from-sky-500/25 via-cyan-400/20 to-blue-600/20 rounded-3xl blur-2xl pointer-events-none transform scale-95" />

        {hasWebGL ? (
          <Canvas
            camera={{ position: [0, 0, 3.4], fov: 42 }}
            dpr={[1, 2]}
            gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
            style={{ width: '100%', height: '100%' }}
          >
            {/* Cinematic Lighting Setup for glossy liquid highlights */}
            <ambientLight intensity={0.9} />
            <directionalLight position={[4, 6, 5]} intensity={1.8} color="#FFFFFF" />
            <directionalLight position={[-4, -3, 3]} intensity={1.0} color="#38BDF8" />
            <pointLight position={[0, 0, 2.5]} intensity={1.2} color="#E0F2FE" />

            <Float
              speed={reducedMotion ? 0 : 2.2}
              rotationIntensity={reducedMotion ? 0 : 0.25}
              floatIntensity={reducedMotion ? 0 : 0.4}
            >
              <AquaShieldEmblemMesh isHovered={isHovered} reducedMotion={reducedMotion} />
            </Float>

            {/* Soft Ambient Contact Shadow beneath the tile */}
            <ContactShadows
              position={[0, -1.25, 0]}
              opacity={0.45}
              scale={2.6}
              blur={2.2}
              far={2.8}
              color="#0284C7"
            />
          </Canvas>
        ) : (
          <StaticSvgFallback sizeClass={containerSize} />
        )}
      </div>

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
