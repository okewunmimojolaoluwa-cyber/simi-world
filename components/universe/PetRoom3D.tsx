'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface PetRoom3DProps {
  timeOfDay: string;
  lampOn?: boolean;
  onClickFloor: (point: THREE.Vector3) => void;
  onClickObject: (id: string) => void;
}

// ── Materials ─────────────────────────────────────────────────────
const M: Record<string, THREE.MeshStandardMaterial> = {
  wall:      new THREE.MeshStandardMaterial({ color: '#1e1a17', roughness: 0.9 }),
  wallT:     new THREE.MeshStandardMaterial({ color: '#2a2420', roughness: 0.85 }),
  floor:     new THREE.MeshStandardMaterial({ color: '#2a1f14', roughness: 0.7, metalness: 0.05 }),
  bed:       new THREE.MeshStandardMaterial({ color: '#16120e', roughness: 0.9 }),
  linen:     new THREE.MeshStandardMaterial({ color: '#e8e0d0', roughness: 0.95 }),
  pillow:    new THREE.MeshStandardMaterial({ color: '#f0ece4', roughness: 0.98 }),
  blanket:   new THREE.MeshStandardMaterial({ color: '#2a2030', roughness: 0.95 }),
  wood:      new THREE.MeshStandardMaterial({ color: '#3d2c1e', roughness: 0.8, metalness: 0.05 }),
  woodL:     new THREE.MeshStandardMaterial({ color: '#5a3d28', roughness: 0.75 }),
  brass:     new THREE.MeshStandardMaterial({ color: '#b08a3c', roughness: 0.3, metalness: 0.8 }),
  fabric:    new THREE.MeshStandardMaterial({ color: '#2e2828', roughness: 0.98 }),
  rug:       new THREE.MeshStandardMaterial({ color: '#4a1a14', roughness: 0.98 }),
  glass:     new THREE.MeshStandardMaterial({ color: '#8ab0c8', roughness: 0.1, transparent: true, opacity: 0.35 }),
  bowl:      new THREE.MeshStandardMaterial({ color: '#d0c8b8', roughness: 0.6, metalness: 0.1 }),
  water:     new THREE.MeshStandardMaterial({ color: '#3a6a8a', roughness: 0.1, metalness: 0.2, transparent: true, opacity: 0.7 }),
  invisible: new THREE.MeshStandardMaterial({ visible: false }),
  food:      new THREE.MeshStandardMaterial({ color: '#c87820', roughness: 0.6 }),
  basket:    new THREE.MeshStandardMaterial({ color: '#6b4a2a', roughness: 0.95 }),
  toy:       new THREE.MeshStandardMaterial({ color: '#d04020', roughness: 0.7 }),
};

function LuxuryBed({ onClickObject }: { onClickObject: (id: string) => void }) {
  return (
    <group position={[3.2, 0, -1.2]}>
      <mesh material={M.wood} position={[0, 0.25, 0]}><boxGeometry args={[2.2, 0.5, 2.8]} /></mesh>
      <mesh material={M.fabric} position={[0, 1.0, -1.3]}><boxGeometry args={[2.2, 1.6, 0.14]} /></mesh>
      <mesh material={M.linen} position={[0, 0.58, 0]}><boxGeometry args={[2.1, 0.18, 2.6]} /></mesh>
      <mesh material={M.pillow} position={[-0.5, 0.72, -0.95]}><boxGeometry args={[0.85, 0.14, 0.5]} /></mesh>
      <mesh material={M.pillow} position={[0.5, 0.72, -0.95]}><boxGeometry args={[0.85, 0.14, 0.5]} /></mesh>
      <mesh material={M.blanket} position={[0, 0.68, 0.3]}><boxGeometry args={[2.05, 0.08, 1.9]} /></mesh>
      <mesh material={M.linen} position={[0, 0.72, -0.65]}><boxGeometry args={[2.05, 0.08, 0.1]} /></mesh>
      <mesh material={M.invisible} position={[0, 0.6, 0]}
        onClick={(e) => { e.stopPropagation(); onClickObject('bed'); }}>
        <boxGeometry args={[2.2, 0.8, 2.8]} />
      </mesh>
    </group>
  );
}

function BedsideLamp({ position, isOn, onClickObject }: { position: [number,number,number]; isOn: boolean; onClickObject: (id: string) => void }) {
  const lampMat = isOn
    ? new THREE.MeshStandardMaterial({ color: '#fff0b0', emissive: new THREE.Color('#ffa840'), emissiveIntensity: 1.8, roughness: 0.4 })
    : M.fabric;
  return (
    <group position={position}>
      <mesh material={M.wood} position={[0, 0.28, 0]}><boxGeometry args={[0.55, 0.55, 0.55]} /></mesh>
      <mesh material={M.woodL} position={[0, 0.56, 0]}><boxGeometry args={[0.58, 0.04, 0.58]} /></mesh>
      <mesh material={M.brass} position={[0, 0.65, 0]}><cylinderGeometry args={[0.06, 0.09, 0.1, 12]} /></mesh>
      <mesh material={M.brass} position={[0, 0.88, 0]}><cylinderGeometry args={[0.015, 0.015, 0.5, 8]} /></mesh>
      <mesh material={lampMat} position={[0, 1.08, 0]}><coneGeometry args={[0.18, 0.22, 16, 1, true]} /></mesh>
      {/* Clickable invisible hit-box for lamp */}
      <mesh material={M.invisible} position={[0, 0.9, 0]}
        onClick={(e) => { e.stopPropagation(); onClickObject('lamp'); }}>
        <cylinderGeometry args={[0.35, 0.35, 1.1, 12]} />
      </mesh>
    </group>
  );
}

function Wardrobe({ onClickObject }: { onClickObject: (id: string) => void }) {
  return (
    <group position={[-3.8, 1.1, -1.8]}>
      <mesh material={M.wood}><boxGeometry args={[1.8, 2.2, 0.6]} /></mesh>
      <mesh material={M.woodL} position={[-0.46, 0, 0.31]}><boxGeometry args={[0.86, 2.14, 0.04]} /></mesh>
      <mesh material={M.woodL} position={[0.46, 0, 0.31]}><boxGeometry args={[0.86, 2.14, 0.04]} /></mesh>
      <mesh material={M.brass} position={[-0.04, 0, 0.35]}><cylinderGeometry args={[0.015, 0.015, 0.14, 8]} /></mesh>
      <mesh material={M.brass} position={[0.04, 0, 0.35]}><cylinderGeometry args={[0.015, 0.015, 0.14, 8]} /></mesh>
      <mesh material={M.invisible} position={[0, 0, 0.35]}
        onClick={(e) => { e.stopPropagation(); onClickObject('wardrobe'); }}>
        <boxGeometry args={[1.8, 2.2, 0.1]} />
      </mesh>
    </group>
  );
}

function FoodStation({ onClickObject }: { onClickObject: (id: string) => void }) {
  return (
    <group position={[-2.5, 0, 2.5]}>
      <mesh material={M.fabric} position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.9, 0.5]} />
      </mesh>
      <group position={[-0.2, 0, 0]}>
        <mesh material={M.bowl} position={[0, 0.04, 0]}><cylinderGeometry args={[0.1, 0.07, 0.08, 16]} /></mesh>
        <mesh material={M.food} position={[0, 0.06, 0]}><cylinderGeometry args={[0.08, 0.08, 0.02, 16]} /></mesh>
        <mesh material={M.invisible} position={[0, 0.04, 0]}
          onClick={(e) => { e.stopPropagation(); onClickObject('food'); }}>
          <cylinderGeometry args={[0.15, 0.15, 0.15, 16]} />
        </mesh>
      </group>
      <group position={[0.2, 0, 0]}>
        <mesh material={M.bowl} position={[0, 0.04, 0]}><cylinderGeometry args={[0.1, 0.07, 0.08, 16]} /></mesh>
        <mesh material={M.water} position={[0, 0.065, 0]}><cylinderGeometry args={[0.088, 0.088, 0.01, 16]} /></mesh>
        <mesh material={M.invisible} position={[0, 0.04, 0]}
          onClick={(e) => { e.stopPropagation(); onClickObject('water'); }}>
          <cylinderGeometry args={[0.15, 0.15, 0.15, 16]} />
        </mesh>
      </group>
    </group>
  );
}

function ToyBasket({ onClickObject }: { onClickObject: (id: string) => void }) {
  return (
    <group position={[2.2, 0, 2.6]}>
      <mesh material={M.basket} position={[0, 0.15, 0]}><cylinderGeometry args={[0.22, 0.18, 0.3, 16, 1, true]} /></mesh>
      <mesh material={new THREE.MeshStandardMaterial({ color: '#5a3c1e', roughness: 0.95 })} position={[0, 0.01, 0]}><cylinderGeometry args={[0.18, 0.18, 0.02, 16]} /></mesh>
      <mesh material={M.toy} position={[0.05, 0.32, 0.02]} rotation={[0.3, 0.2, 0]}><sphereGeometry args={[0.09, 10, 8]} /></mesh>
      <mesh material={M.invisible} position={[0, 0.2, 0]}
        onClick={(e) => { e.stopPropagation(); onClickObject('toys'); }}>
        <cylinderGeometry args={[0.3, 0.3, 0.5, 16]} />
      </mesh>
    </group>
  );
}

function Window({ timeOfDay }: { timeOfDay: string }) {
  const skyCol = { morning: '#a0c8e8', afternoon: '#6ab0e0', evening: '#c06030', night: '#0a0c14' }[timeOfDay] || '#0a0c14';
  const isNight = timeOfDay === 'night' || timeOfDay === 'evening';
  return (
    <group position={[0, 1.6, -4.45]}>
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[2.0, 2.2]} />
        <meshBasicMaterial color={skyCol} />
      </mesh>
      {isNight && (
        <group position={[0, -0.6, 0.01]}>
          {[[-0.7, 0.6], [-0.4, 0.9], [-0.1, 0.7], [0.2, 1.0], [0.5, 0.75], [0.8, 0.85]].map(([x, h], i) => (
            <mesh key={i} position={[x, (h as number) / 2, 0]}>
              <planeGeometry args={[0.28, h as number]} />
              <meshBasicMaterial color="#080810" />
            </mesh>
          ))}
          {Array.from({ length: 24 }).map((_, i) => (
            <mesh key={`w${i}`} position={[-0.85 + (i % 8) * 0.22, -0.3 + Math.floor(i / 8) * 0.25, 0.02]}>
              <planeGeometry args={[0.025, 0.02]} />
              <meshBasicMaterial color="#f0d060" />
            </mesh>
          ))}
        </group>
      )}
      <mesh material={M.glass} position={[0, 0, 0.02]}><planeGeometry args={[2.0, 2.2]} /></mesh>
      <mesh material={M.wood} position={[0, 1.1, 0.07]}><boxGeometry args={[2.2, 0.06, 0.14]} /></mesh>
      <mesh material={M.wood} position={[0, -1.1, 0.07]}><boxGeometry args={[2.2, 0.06, 0.14]} /></mesh>
      <mesh material={M.wood} position={[-1.07, 0, 0.07]}><boxGeometry args={[0.06, 2.2, 0.14]} /></mesh>
      <mesh material={M.wood} position={[1.07, 0, 0.07]}><boxGeometry args={[0.06, 2.2, 0.14]} /></mesh>
      <mesh material={M.wood} position={[0, 0, 0.07]}><boxGeometry args={[2.2, 0.045, 0.12]} /></mesh>
      <mesh material={M.wood} position={[0, 0, 0.07]}><boxGeometry args={[0.045, 2.2, 0.12]} /></mesh>
      <mesh material={M.fabric} position={[-1.3, 0, 0.2]}><boxGeometry args={[0.35, 2.5, 0.06]} /></mesh>
      <mesh material={M.fabric} position={[1.3, 0, 0.2]}><boxGeometry args={[0.35, 2.5, 0.06]} /></mesh>
    </group>
  );
}

export default function PetRoom3D({ timeOfDay, lampOn = false, onClickFloor, onClickObject }: PetRoom3DProps) {
  const isNight = timeOfDay === 'night' || timeOfDay === 'evening';
  const effectiveLamp = lampOn;

  return (
    <group>
      {/* Floor — clickable */}
      <mesh material={M.floor} rotation={[-Math.PI / 2, 0, 0]}
        onClick={(e) => { e.stopPropagation(); onClickFloor(e.point); }}>
        <planeGeometry args={[10, 10]} />
      </mesh>

      {/* Walls */}
      <mesh material={M.wall} position={[0, 2.2, -4.5]}><boxGeometry args={[10, 4.4, 0.15]} /></mesh>
      <mesh material={M.wall} position={[-4.5, 2.2, 0]}><boxGeometry args={[0.15, 4.4, 10]} /></mesh>
      <mesh material={M.wall} position={[4.5, 2.2, 0]}><boxGeometry args={[0.15, 4.4, 10]} /></mesh>
      <mesh material={M.wall} position={[0, 4.4, 0]}><boxGeometry args={[10, 0.15, 10]} /></mesh>
      {/* Wainscoting */}
      <mesh material={M.woodL} position={[0, 0.2, -4.42]}><boxGeometry args={[10, 0.4, 0.06]} /></mesh>
      <mesh material={M.woodL} position={[-4.42, 0.2, 0]}><boxGeometry args={[0.06, 0.4, 10]} /></mesh>
      <mesh material={M.woodL} position={[4.42, 0.2, 0]}><boxGeometry args={[0.06, 0.4, 10]} /></mesh>

      {/* Rug */}
      <mesh material={M.rug} position={[0, 0.005, 0.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4, 3.5]} />
      </mesh>

      <Window timeOfDay={timeOfDay} />
      <LuxuryBed onClickObject={onClickObject} />
      <BedsideLamp position={[1.9, 0, -1.2]} isOn={effectiveLamp} onClickObject={onClickObject} />
      <BedsideLamp position={[4.4, 0, -1.2]} isOn={effectiveLamp} onClickObject={onClickObject} />
      <Wardrobe onClickObject={onClickObject} />
      <FoodStation onClickObject={onClickObject} />
      <ToyBasket onClickObject={onClickObject} />

      {/* Floor lamp */}
      <group position={[-3.5, 0, 1]}>
        <mesh material={M.brass} position={[0, 0.06, 0]}><cylinderGeometry args={[0.15, 0.18, 0.12, 16]} /></mesh>
        <mesh material={M.brass} position={[0, 1.0, 0]}><cylinderGeometry args={[0.025, 0.025, 1.9, 8]} /></mesh>
        <mesh material={effectiveLamp ? new THREE.MeshStandardMaterial({ color: '#fff0b0', emissive: new THREE.Color('#ffa840'), emissiveIntensity: 1.8 }) : M.fabric} position={[0, 1.85, 0]}>
          <coneGeometry args={[0.3, 0.4, 20, 1, true]} />
        </mesh>
        {/* Clickable hit-box for floor lamp */}
        <mesh material={M.invisible} position={[0, 1.4, 0]}
          onClick={(e) => { e.stopPropagation(); onClickObject('lamp'); }}>
          <cylinderGeometry args={[0.5, 0.5, 2.0, 12]} />
        </mesh>
      </group>

      {/* Dresser with mirror */}
      <group position={[-3.8, 0, 1.8]}>
        <mesh material={M.wood} position={[0, 0.45, 0]}><boxGeometry args={[1.4, 0.9, 0.55]} /></mesh>
        <mesh material={M.woodL} position={[0, 1.35, -0.18]}><boxGeometry args={[1.1, 0.9, 0.03]} /></mesh>
        <mesh material={M.brass} position={[0, 1.35, -0.15]}><boxGeometry args={[1.14, 0.94, 0.02]} /></mesh>
      </group>

      {/* Shelf */}
      <group position={[-4.3, 2.0, -3]}>
        <mesh material={M.wood}><boxGeometry args={[1.2, 0.06, 0.28]} /></mesh>
        {[[-0.4, '#8b1a1a'], [-0.25, '#1a4a8b'], [-0.1, '#2a6a2a'], [0.05, '#8b6a1a'], [0.2, '#6a1a6a']].map(([x, c], i) => (
          <mesh key={i} material={new THREE.MeshStandardMaterial({ color: c as string, roughness: 0.9 })} position={[x as number, 0.1, 0]}>
            <boxGeometry args={[0.06, 0.18, 0.22]} />
          </mesh>
        ))}
      </group>

      {/* Plant */}
      <group position={[-3.5, 0, -3.5]}>
        <mesh material={new THREE.MeshStandardMaterial({ color: '#5a3820', roughness: 0.95 })} position={[0, 0.18, 0]}>
          <cylinderGeometry args={[0.12, 0.1, 0.35, 12]} />
        </mesh>
        {[[0, 0.6, 0], [-0.15, 0.55, 0.1], [0.12, 0.58, -0.08]].map(([px, py, pz], i) => (
          <mesh key={i} material={new THREE.MeshStandardMaterial({ color: '#2a5a1a', roughness: 0.9 })} position={[px, py, pz]}>
            <sphereGeometry args={[0.1 + i * 0.02, 6, 5]} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
