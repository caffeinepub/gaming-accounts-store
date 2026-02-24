import { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { Sky, Stars } from '@react-three/drei';
import * as THREE from 'three';
import Vehicle from '../models/Vehicle';

interface LoadingScreen3DProps {
  onComplete: () => void;
}

function Road() {
  const texture = useLoader(THREE.TextureLoader, '/assets/generated/road-texture.dim_1024x1024.png');
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 20);

  const roadRef = useRef<THREE.Mesh>(null);
  useFrame((_state, delta) => {
    if (roadRef.current) {
      texture.offset.y -= delta * 0.5;
    }
  });

  return (
    <group>
      {/* Main road */}
      <mesh ref={roadRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[14, 200]} />
        <meshStandardMaterial map={texture} />
      </mesh>
      {/* Road shoulders */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-8, -0.02, 0]}>
        <planeGeometry args={[4, 200]} />
        <meshStandardMaterial color="#3a3a3a" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[8, -0.02, 0]}>
        <planeGeometry args={[4, 200]} />
        <meshStandardMaterial color="#3a3a3a" />
      </mesh>
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, 0]}>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>
      {/* Lane markings */}
      {Array.from({ length: 20 }).map((_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -50 + i * 10]}>
          <planeGeometry args={[0.2, 4]} />
          <meshStandardMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={0.5} />
        </mesh>
      ))}
    </group>
  );
}

function NYCSkyline() {
  const texture = useLoader(THREE.TextureLoader, '/assets/generated/nyc-sunset-skyline.dim_2048x512.png');

  return (
    <mesh position={[0, 15, -90]}>
      <planeGeometry args={[200, 50]} />
      <meshBasicMaterial map={texture} transparent side={THREE.FrontSide} />
    </mesh>
  );
}

function SunsetAtmosphere() {
  return (
    <>
      {/* Ambient warm light */}
      <ambientLight intensity={0.4} color="#ff8844" />
      {/* Sun directional light */}
      <directionalLight
        position={[0, 10, -50]}
        intensity={2.5}
        color="#ff6622"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      {/* Fill light */}
      <pointLight position={[0, 5, 10]} intensity={1.0} color="#ff4400" />
      {/* Neon street lights */}
      <pointLight position={[-5, 3, 0]} intensity={0.8} color="#00ffff" />
      <pointLight position={[5, 3, -20]} intensity={0.8} color="#ff00ff" />
    </>
  );
}

function CameraRig() {
  const t = useRef(0);
  useFrame((_state, delta) => {
    t.current += delta;
    _state.camera.position.x = Math.sin(t.current * 0.1) * 1.5;
    _state.camera.position.y = 3 + Math.sin(t.current * 0.05) * 0.3;
    _state.camera.position.z = 12;
    _state.camera.lookAt(0, 1, -20);
  });
  return null;
}

function SceneContent() {
  return (
    <>
      <CameraRig />
      <SunsetAtmosphere />
      <Sky
        distance={450000}
        sunPosition={[0, 0.05, -1]}
        inclination={0.49}
        azimuth={0.25}
        turbidity={8}
        rayleigh={3}
        mieCoefficient={0.005}
        mieDirectionalG={0.8}
      />
      <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
      <Suspense fallback={null}>
        <NYCSkyline />
        <Road />
      </Suspense>
      {/* Sports cars */}
      <Vehicle type="sports" initialZ={-10} lane={-3.5} speed={18} color="#ff4400" />
      <Vehicle type="sports" initialZ={20} lane={3.5} speed={22} color="#0088ff" />
      {/* Motorcycles */}
      <Vehicle type="motorcycle" initialZ={5} lane={-1.5} speed={28} color="#ff6600" />
      <Vehicle type="motorcycle" initialZ={35} lane={1.5} speed={25} color="#00ffcc" />
      {/* Realistic cars */}
      <Vehicle type="realistic" initialZ={-30} lane={-3.5} speed={14} color="#cccccc" />
      <Vehicle type="realistic" initialZ={15} lane={3.5} speed={16} color="#222244" />
      <Vehicle type="realistic" initialZ={50} lane={0} speed={12} color="#884400" />
    </>
  );
}

export default function LoadingScreen3D({ onComplete }: LoadingScreen3DProps) {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          return 100;
        }
        return p + 2;
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress >= 100) {
      const timer = setTimeout(() => {
        setFadeOut(true);
        setTimeout(onComplete, 800);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [progress, onComplete]);

  const handleSkip = () => {
    setFadeOut(true);
    setTimeout(onComplete, 800);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden"
      style={{
        opacity: fadeOut ? 0 : 1,
        transition: 'opacity 0.8s ease-in-out',
        background: '#0a0a1a',
      }}
    >
      <Canvas
        shadows
        camera={{ position: [0, 3, 12], fov: 60 }}
        style={{ width: '100%', height: '100%' }}
        gl={{ antialias: true, alpha: false }}
      >
        <SceneContent />
      </Canvas>

      {/* Overlay UI */}
      <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-between p-8">
        {/* Title area */}
        <div className="flex flex-col items-center mt-8">
          <h1
            className="brand-gradient-text font-gaming text-5xl font-black tracking-widest uppercase"
            style={{ filter: 'drop-shadow(0 0 20px rgba(255, 100, 0, 0.6))' }}
          >
            Game Vault
          </h1>
          <p
            className="mt-2 text-sm tracking-[0.4em] uppercase"
            style={{ color: 'oklch(0.75 0.18 195)', fontFamily: 'Orbitron, monospace' }}
          >
            Premium Gaming Accounts
          </p>
        </div>

        {/* Bottom progress */}
        <div className="w-full max-w-md flex flex-col items-center gap-4 mb-4">
          <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <div
              className="h-full rounded-full transition-all duration-100"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #ff2020, #9b30ff, #ff8c00)',
                boxShadow: '0 0 10px rgba(255, 100, 0, 0.8)',
              }}
            />
          </div>
          <div className="flex items-center justify-between w-full">
            <span
              className="text-xs tracking-widest uppercase"
              style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Orbitron, monospace' }}
            >
              {progress < 100 ? 'Loading...' : 'Ready'}
            </span>
            <span
              className="text-xs font-bold"
              style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'Orbitron, monospace' }}
            >
              {progress}%
            </span>
          </div>
          <button
            className="pointer-events-auto text-xs tracking-widest uppercase px-6 py-2 rounded border transition-all duration-200 hover:bg-white/10"
            style={{
              color: 'rgba(255,255,255,0.4)',
              borderColor: 'rgba(255,255,255,0.15)',
              fontFamily: 'Orbitron, monospace',
            }}
            onClick={handleSkip}
          >
            Skip Intro
          </button>
        </div>
      </div>
    </div>
  );
}
