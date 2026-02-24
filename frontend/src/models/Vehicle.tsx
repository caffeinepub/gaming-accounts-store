import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface VehicleProps {
  type: 'sports' | 'motorcycle' | 'realistic';
  initialZ: number;
  lane: number;
  speed: number;
  color: string;
}

function SportsCar({ color }: { color: string }) {
  return (
    <group>
      {/* Body */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <boxGeometry args={[1.8, 0.5, 4.2]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Cabin */}
      <mesh position={[0, 0.75, -0.2]} castShadow>
        <boxGeometry args={[1.4, 0.5, 2.0]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Windshield */}
      <mesh position={[0, 0.75, 0.8]} rotation={[0.3, 0, 0]}>
        <boxGeometry args={[1.3, 0.45, 0.05]} />
        <meshStandardMaterial color="#88ccff" transparent opacity={0.5} metalness={0.1} roughness={0.1} />
      </mesh>
      {/* Wheels */}
      {[[-0.95, -0.1, 1.3], [0.95, -0.1, 1.3], [-0.95, -0.1, -1.3], [0.95, -0.1, -1.3]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.35, 0.35, 0.25, 12]} />
          <meshStandardMaterial color="#111111" metalness={0.3} roughness={0.8} />
        </mesh>
      ))}
      {/* Headlights */}
      <mesh position={[0.5, 0.3, 2.1]}>
        <boxGeometry args={[0.3, 0.15, 0.05]} />
        <meshStandardMaterial color="#ffffaa" emissive="#ffff88" emissiveIntensity={2} />
      </mesh>
      <mesh position={[-0.5, 0.3, 2.1]}>
        <boxGeometry args={[0.3, 0.15, 0.05]} />
        <meshStandardMaterial color="#ffffaa" emissive="#ffff88" emissiveIntensity={2} />
      </mesh>
      {/* Taillights */}
      <mesh position={[0.5, 0.3, -2.1]}>
        <boxGeometry args={[0.3, 0.15, 0.05]} />
        <meshStandardMaterial color="#ff2200" emissive="#ff2200" emissiveIntensity={3} />
      </mesh>
      <mesh position={[-0.5, 0.3, -2.1]}>
        <boxGeometry args={[0.3, 0.15, 0.05]} />
        <meshStandardMaterial color="#ff2200" emissive="#ff2200" emissiveIntensity={3} />
      </mesh>
    </group>
  );
}

function Motorcycle({ color }: { color: string }) {
  return (
    <group>
      {/* Frame */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[0.4, 0.6, 2.0]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Tank */}
      <mesh position={[0, 0.9, 0.2]} castShadow>
        <boxGeometry args={[0.35, 0.35, 0.8]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Seat */}
      <mesh position={[0, 0.95, -0.4]} castShadow>
        <boxGeometry args={[0.3, 0.15, 0.7]} />
        <meshStandardMaterial color="#222222" roughness={0.9} />
      </mesh>
      {/* Front wheel */}
      <mesh position={[0, 0.35, 1.0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.35, 0.35, 0.15, 12]} />
        <meshStandardMaterial color="#111111" metalness={0.3} roughness={0.8} />
      </mesh>
      {/* Rear wheel */}
      <mesh position={[0, 0.35, -1.0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.35, 0.35, 0.15, 12]} />
        <meshStandardMaterial color="#111111" metalness={0.3} roughness={0.8} />
      </mesh>
      {/* Headlight */}
      <mesh position={[0, 0.7, 1.05]}>
        <boxGeometry args={[0.2, 0.15, 0.05]} />
        <meshStandardMaterial color="#ffffaa" emissive="#ffff88" emissiveIntensity={2} />
      </mesh>
      {/* Exhaust */}
      <mesh position={[0.25, 0.3, -0.8]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.07, 0.8, 8]} />
        <meshStandardMaterial color="#888888" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  );
}

function RealisticCar({ color }: { color: string }) {
  return (
    <group>
      {/* Main body */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[2.0, 0.7, 4.8]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Roof */}
      <mesh position={[0, 0.95, -0.3]} castShadow>
        <boxGeometry args={[1.7, 0.55, 2.8]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.4} />
      </mesh>
      {/* Hood */}
      <mesh position={[0, 0.55, 1.5]} castShadow>
        <boxGeometry args={[1.9, 0.15, 1.5]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.2} />
      </mesh>
      {/* Trunk */}
      <mesh position={[0, 0.55, -1.8]} castShadow>
        <boxGeometry args={[1.9, 0.15, 1.0]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.2} />
      </mesh>
      {/* Wheels */}
      {[[-1.05, 0.0, 1.5], [1.05, 0.0, 1.5], [-1.05, 0.0, -1.5], [1.05, 0.0, -1.5]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.4, 0.4, 0.3, 14]} />
          <meshStandardMaterial color="#111111" metalness={0.3} roughness={0.8} />
        </mesh>
      ))}
      {/* Headlights */}
      <mesh position={[0.6, 0.45, 2.45]}>
        <boxGeometry args={[0.4, 0.2, 0.05]} />
        <meshStandardMaterial color="#ffffcc" emissive="#ffffaa" emissiveIntensity={2} />
      </mesh>
      <mesh position={[-0.6, 0.45, 2.45]}>
        <boxGeometry args={[0.4, 0.2, 0.05]} />
        <meshStandardMaterial color="#ffffcc" emissive="#ffffaa" emissiveIntensity={2} />
      </mesh>
      {/* Taillights */}
      <mesh position={[0.6, 0.45, -2.45]}>
        <boxGeometry args={[0.4, 0.2, 0.05]} />
        <meshStandardMaterial color="#ff1100" emissive="#ff1100" emissiveIntensity={3} />
      </mesh>
      <mesh position={[-0.6, 0.45, -2.45]}>
        <boxGeometry args={[0.4, 0.2, 0.05]} />
        <meshStandardMaterial color="#ff1100" emissive="#ff1100" emissiveIntensity={3} />
      </mesh>
    </group>
  );
}

export default function Vehicle({ type, initialZ, lane, speed, color }: VehicleProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_state, delta) => {
    if (!groupRef.current) return;
    groupRef.current.position.z -= speed * delta;
    if (groupRef.current.position.z < -80) {
      groupRef.current.position.z = 80;
    }
  });

  return (
    <group ref={groupRef} position={[lane, 0, initialZ]}>
      {type === 'sports' && <SportsCar color={color} />}
      {type === 'motorcycle' && <Motorcycle color={color} />}
      {type === 'realistic' && <RealisticCar color={color} />}
    </group>
  );
}
