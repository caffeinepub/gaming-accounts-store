import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface LoadingScreen3DProps {
  onComplete: () => void;
}

export default function LoadingScreen3D({ onComplete }: LoadingScreen3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    // Three.js scene setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x050510, 1);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050510);
    scene.fog = new THREE.FogExp2(0x050510, 0.035);

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 200);
    camera.position.set(0, 2.5, 8);
    camera.lookAt(0, 1, 0);

    // Road
    const roadGeo = new THREE.PlaneGeometry(8, 200);
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x111122, roughness: 0.9 });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.z = -90;
    scene.add(road);

    // Road markings
    for (let i = 0; i < 40; i++) {
      const markGeo = new THREE.PlaneGeometry(0.15, 2);
      const markMat = new THREE.MeshStandardMaterial({
        color: 0xffdd00,
        emissive: 0xffdd00,
        emissiveIntensity: 0.5,
      });
      const mark = new THREE.Mesh(markGeo, markMat);
      mark.rotation.x = -Math.PI / 2;
      mark.position.set(0, 0.01, -i * 5);
      scene.add(mark);
    }

    // Skyline buildings
    const buildingColors = [0x1a0a2e, 0x0d1b2a, 0x16213e, 0x0f3460];
    for (let i = 0; i < 30; i++) {
      const h = Math.random() * 20 + 5;
      const w = Math.random() * 3 + 1;
      const geo = new THREE.BoxGeometry(w, h, w);
      const mat = new THREE.MeshStandardMaterial({
        color: buildingColors[Math.floor(Math.random() * buildingColors.length)],
        roughness: 0.8,
      });
      const building = new THREE.Mesh(geo, mat);
      const side = Math.random() > 0.5 ? 1 : -1;
      building.position.set(side * (5 + Math.random() * 8), h / 2, -Math.random() * 80 - 10);
      scene.add(building);

      // Window lights
      const winGeo = new THREE.PlaneGeometry(0.3, 0.3);
      const winMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: Math.random() > 0.5 ? 0xff6600 : 0x6600ff,
        emissiveIntensity: 1,
      });
      for (let j = 0; j < 8; j++) {
        if (Math.random() > 0.4) {
          const win = new THREE.Mesh(winGeo, winMat);
          win.position.set(
            building.position.x + (Math.random() - 0.5) * (w - 0.5),
            Math.random() * h,
            building.position.z + w / 2 + 0.01
          );
          scene.add(win);
        }
      }
    }

    // Neon street lights
    const lightPositions = [-3, 3];
    for (const x of lightPositions) {
      for (let z = 0; z > -100; z -= 15) {
        const poleGeo = new THREE.CylinderGeometry(0.05, 0.05, 4);
        const poleMat = new THREE.MeshStandardMaterial({ color: 0x333344 });
        const pole = new THREE.Mesh(poleGeo, poleMat);
        pole.position.set(x, 2, z);
        scene.add(pole);

        const light = new THREE.PointLight(x < 0 ? 0xff3300 : 0x9900ff, 2, 12);
        light.position.set(x, 4.2, z);
        scene.add(light);
      }
    }

    // Ambient + directional light
    const ambient = new THREE.AmbientLight(0x111133, 1);
    scene.add(ambient);
    const dirLight = new THREE.DirectionalLight(0x4433ff, 0.5);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);

    // Vehicles
    const vehicles: THREE.Mesh[] = [];
    for (let i = 0; i < 4; i++) {
      const vGeo = new THREE.BoxGeometry(1.2, 0.6, 2.5);
      const vMat = new THREE.MeshStandardMaterial({
        color: [0xcc0000, 0x0033cc, 0x00aa44, 0xaa6600][i],
        roughness: 0.3,
        metalness: 0.7,
      });
      const v = new THREE.Mesh(vGeo, vMat);
      v.position.set((Math.random() - 0.5) * 4, 0.35, -i * 12 - 5);
      scene.add(v);
      vehicles.push(v);
    }

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Animation loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Move camera forward
      camera.position.z -= 0.04;

      // Move vehicles
      vehicles.forEach((v, i) => {
        v.position.z += 0.08 + i * 0.02;
        if (v.position.z > camera.position.z + 10) {
          v.position.z = camera.position.z - 60;
        }
      });

      renderer.render(scene, camera);
    };
    animate();

    // Progress simulation — fills over ~4.5 seconds
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 90);

    return () => {
      cancelAnimationFrame(animId);
      clearInterval(progressInterval);
      window.removeEventListener('resize', handleResize);
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    if (progress >= 100) {
      const timer = setTimeout(() => {
        setFadeOut(true);
        setTimeout(onComplete, 600);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [progress, onComplete]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{
        backgroundColor: '#050510',
        transition: 'opacity 0.6s ease',
        opacity: fadeOut ? 0 : 1,
        pointerEvents: fadeOut ? 'none' : 'auto',
      }}
    >
      {/* Three.js canvas mount point */}
      <div ref={mountRef} className="absolute inset-0" style={{ backgroundColor: '#050510' }} />

      {/* Overlay content */}
      <div className="relative z-10 flex flex-col items-center gap-6 px-8">
        <h1
          className="font-orbitron text-6xl md:text-8xl font-black brand-gradient-text"
          style={{ letterSpacing: '0.05em' }}
        >
          GAME VAULT
        </h1>
        <p
          className="font-rajdhani text-lg tracking-widest uppercase"
          style={{ color: 'oklch(0.60 0.02 260)' }}
        >
          Premium Gaming Accounts
        </p>

        {/* Progress bar */}
        <div className="w-80 mt-4">
          <div
            className="flex justify-between text-xs mb-2 font-rajdhani tracking-wider"
            style={{ color: 'oklch(0.60 0.02 260)' }}
          >
            <span>LOADING</span>
            <span>{progress}%</span>
          </div>
          <div
            className="h-1 rounded-full overflow-hidden"
            style={{ backgroundColor: 'oklch(0.18 0.02 260)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-100"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, oklch(0.60 0.25 15), oklch(0.55 0.22 300), oklch(0.70 0.22 45))',
              }}
            />
          </div>
        </div>

        <button
          onClick={() => {
            setFadeOut(true);
            setTimeout(onComplete, 600);
          }}
          className="mt-2 text-xs transition-colors font-rajdhani tracking-widest uppercase underline underline-offset-4"
          style={{ color: 'oklch(0.60 0.02 260)' }}
        >
          Skip Intro
        </button>
      </div>
    </div>
  );
}
