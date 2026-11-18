import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, ContactShadows, useTexture } from '@react-three/drei';
import * as THREE from 'three';

// --- 3D Interactive Emblem Mesh Textured with User's Official Logo ---
function Emblem3DMesh({ isHovered, reducedMotion }) {
  const meshRef = useRef();
  const texture = useTexture('/aquashield-logo.png');

  // Configure texture quality
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;

  // Geometry: Beveled rounded tile
  const squircleGeom = React.useMemo(() => {
    const shape = new THREE.Shape();
    const w = 1.7;
    const h = 1.7;
    const r = 0.42;
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
      depth: 0.12,
      bevelEnabled: true,
      bevelSegments: 8,
      steps: 1,
      bevelSize: 0.06,
      bevelThickness: 0.06
    });
    geom.center();
    return geom;
  }, []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    if (!reducedMotion) {
      // 3D Parallax Tilt towards cursor position
      const targetRotX = -state.pointer.y * 0.45;
      const targetRotY = state.pointer.x * 0.55;
      const targetRotZ = (state.pointer.x * state.pointer.y) * 0.15;

      // Idle smooth floating rotation + cursor tracking
      meshRef.current.rotation.x = THREE.MathUtils.lerp(
        meshRef.current.rotation.x,
        targetRotX + Math.sin(state.clock.elapsedTime * 1.5) * 0.035,
        0.08
      );
      meshRef.current.rotation.y = THREE.MathUtils.lerp(
        meshRef.current.rotation.y,
        targetRotY + Math.cos(state.clock.elapsedTime * 1.2) * 0.04,
        0.08
      );
      meshRef.current.rotation.z = THREE.MathUtils.lerp(
        meshRef.current.rotation.z,
        targetRotZ,
        0.08
      );
    }

    // Smooth hover scale
    const targetScale = isHovered ? 1.08 : 1.0;
    meshRef.current.scale.lerp(
      new THREE.Vector3(targetScale, targetScale, targetScale),
      0.1
    );
  });

  return (
    <group ref={meshRef}>
      {/* 3D Tile Base with Metallic Azure Edge */}
      <mesh geometry={squircleGeom} position={[0, 0, 0]}>
        <meshPhysicalMaterial
          color="#0284C7"
          roughness={0.15}
          metalness={0.25}
          clearcoat={1.0}
          clearcoatRoughness={0.05}
          reflectivity={0.9}
        />
      </mesh>

      {/* Front Face with User's Official Logo Texture */}
      <mesh position={[0, 0, 0.125]}>
        <planeGeometry args={[1.72, 1.72]} />
        <meshBasicMaterial
          map={texture}
          transparent={true}
          toneMapped={false}
        />
      </mesh>

      {/* Crystal Glass Overcoat Layer (adds depth, specular highlights & optical sheen) */}
      <mesh position={[0, 0, 0.13]}>
        <planeGeometry args={[1.72, 1.72]} />
        <meshPhysicalMaterial
          transparent={true}
          opacity={0.35}
          roughness={0.05}
          metalness={0.05}
          clearcoat={1.0}
          clearcoatRoughness={0.03}
          reflectivity={0.95}
        />
      </mesh>
    </group>
  );
}

// Crisp Static Fallback using the Official Logo
function StaticLogoFallback({ sizeClass }) {
  return (
    <div className={`flex items-center justify-center ${sizeClass}`}>
      <div className="relative w-full h-full max-w-[280px] max-h-[280px] p-2 flex items-center justify-center">
        <img
          src="/aquashield-logo.png"
          alt="AquaShield Logo"
          className="w-full h-full object-contain rounded-3xl drop-shadow-2xl"
        />
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
    hero: 'w-64 h-64 sm:w-80 sm:h-80'
  };

  const containerSize = sizeDimensions[size] || sizeDimensions.md;

  return (
    <div className={`flex flex-col items-center justify-center select-none ${className}`}>
      <div
        className={`relative ${containerSize} transition-transform duration-300 cursor-grab active:cursor-grabbing`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Soft Ambient Cyan Glow matching the official logo */}
        <div className="absolute inset-0 bg-gradient-to-tr from-sky-500/30 via-cyan-400/25 to-blue-600/25 rounded-3xl blur-2xl pointer-events-none transform scale-95" />

        {hasWebGL ? (
          <Suspense fallback={<StaticLogoFallback sizeClass={containerSize} />}>
            <Canvas
              camera={{ position: [0, 0, 3.4], fov: 42 }}
              dpr={[1, 2]}
              gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
              style={{ width: '100%', height: '100%' }}
            >
              <ambientLight intensity={1.0} />
              <directionalLight position={[4, 6, 5]} intensity={1.8} color="#FFFFFF" />
              <directionalLight position={[-4, -3, 3]} intensity={1.0} color="#38BDF8" />
              <pointLight position={[0, 0, 2.5]} intensity={1.2} color="#E0F2FE" />

              <Float
                speed={reducedMotion ? 0 : 2.2}
                rotationIntensity={reducedMotion ? 0 : 0.25}
                floatIntensity={reducedMotion ? 0 : 0.35}
              >
                <Emblem3DMesh isHovered={isHovered} reducedMotion={reducedMotion} />
              </Float>

              <ContactShadows
                position={[0, -1.25, 0]}
                opacity={0.45}
                scale={2.6}
                blur={2.2}
                far={2.8}
                color="#0284C7"
              />
            </Canvas>
          </Suspense>
        ) : (
          <StaticLogoFallback sizeClass={containerSize} />
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
