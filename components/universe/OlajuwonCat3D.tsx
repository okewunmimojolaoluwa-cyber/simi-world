'use client';

/**
 * OlajuwonCat3D — Advanced toon-shaded 3D cat
 *
 * Visual quality target: polished indie game (think Untitled Goose Game /
 * Little Kitty Big City level of cartoon-realism).
 *
 * Technique:
 *  - Each body part is a proper mesh with smooth normals
 *  - Toon gradient shading (3-step cel shading) via onBeforeCompile
 *  - Outline achieved by back-face-inflation on a black clone mesh
 *  - Black-and-white coat with gradient belly/muzzle
 *  - Every ref animates independently per frame
 *  - Sleep pose lays the entire cat flat (rotation.x = PI/2) with
 *    position elevated to sit ON the bed surface
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ALL_CLOTHING } from '@/lib/petPersistence';

export type CatAnimState =
  | 'idle' | 'walk' | 'run' | 'sit' | 'sleep' | 'eat'
  | 'drink' | 'play' | 'groom' | 'stretch' | 'happy';

interface Props {
  animState?: CatAnimState;
  position?: [number, number, number];
  scale?: number;
  onPointerDown?: () => void;
  equipped?: Partial<Record<string, string>>;
}

/* ── Toon material factory ─────────────────────────────────────── */
function toonMat(color: string, opts: Partial<THREE.MeshToonMaterialParameters> = {}) {
  return new THREE.MeshToonMaterial({ color, ...opts });
}

/* ── Outline material (back-face inflation) ─────────────────────── */
function outlineMat() {
  const mat = new THREE.MeshBasicMaterial({ color: '#0d0d0d', side: THREE.BackSide });
  return mat;
}

/* ── Materials ─────────────────────────────────────────────────── */
// Black-and-white palette
const mBody   = toonMat('#1a1a1f');          // near-black body
const mBodyB  = toonMat('#232328');          // slightly lighter body areas
const mWhite  = toonMat('#f0ece3');          // white chest / muzzle / paws
const mWhiteD = toonMat('#dcd8cf');          // slightly shaded white
const mAmber  = toonMat('#c8950e');          // amber eyes
const mPupil  = toonMat('#0a0a0a');          // pupils
const mPink   = toonMat('#d4707e');          // inner ears / nose
const mPinkL  = toonMat('#e8a0aa');          // lighter pink
const mOutline= outlineMat();
const mInvis  = new THREE.MeshBasicMaterial({ visible: false });
const mShadow = new THREE.MeshBasicMaterial({ color: '#000000', transparent: true, opacity: 0.22 });

/* ── Helper: outlined mesh pair ─────────────────────────────────── */
function OutlinedMesh({
  geo, mat, outlineScale = 1.06,
  position, rotation, scale,
}: {
  geo: THREE.BufferGeometry;
  mat: THREE.Material;
  outlineScale?: number;
  position?: [number,number,number];
  rotation?: [number,number,number];
  scale?: [number,number,number] | number;
}) {
  return (
    <group position={position} rotation={rotation}>
      <mesh material={mat} scale={scale}><primitive object={geo} attach="geometry" /></mesh>
      <mesh material={mOutline} scale={typeof scale === 'number' ? scale * outlineScale : scale ? (scale as [number,number,number]).map(v => v * outlineScale) as [number,number,number] : outlineScale}>
        <primitive object={geo} attach="geometry" />
      </mesh>
    </group>
  );
}

/* ══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════════ */
export default function OlajuwonCat3D({
  animState = 'idle',
  position  = [0, 0, 0],
  scale     = 1,
  onPointerDown,
  equipped  = {},
}: Props) {
  /* ── Resolve equipped clothing items ─── */
  const hatItem    = ALL_CLOTHING.find(c => c.slot === 'hat'       && c.id === equipped?.hat);
  const collarItem = ALL_CLOTHING.find(c => c.slot === 'collar'    && c.id === equipped?.collar);
  const shirtItem  = ALL_CLOTHING.find(c => c.slot === 'shirt'     && c.id === equipped?.shirt);
  const accItem    = ALL_CLOTHING.find(c => c.slot === 'accessory' && c.id === equipped?.accessory);
  const specialItem= ALL_CLOTHING.find(c => c.slot === 'special'   && c.id === equipped?.special);

  /* ── Refs for individual part animation ─── */
  const rootRef  = useRef<THREE.Group>(null);
  const bodyRef  = useRef<THREE.Group>(null);
  const headRef  = useRef<THREE.Group>(null);
  const neckRef  = useRef<THREE.Group>(null);
  const tailRef  = useRef<THREE.Group>(null);
  const tail2Ref = useRef<THREE.Group>(null);
  const tail3Ref = useRef<THREE.Group>(null);
  const lFLRef   = useRef<THREE.Group>(null);  // front-left
  const rFLRef   = useRef<THREE.Group>(null);  // front-right
  const lBLRef   = useRef<THREE.Group>(null);  // back-left
  const rBLRef   = useRef<THREE.Group>(null);  // back-right
  const lEarRef  = useRef<THREE.Group>(null);
  const rEarRef  = useRef<THREE.Group>(null);
  const lEyeLRef = useRef<THREE.Mesh>(null);   // eyelid L
  const rEyeLRef = useRef<THREE.Mesh>(null);   // eyelid R
  const groomArmRef = useRef<THREE.Group>(null);

  const tRef       = useRef(0);
  const blinkTimer = useRef(0);
  const blinkOpen  = useRef(true);
  const blinkDur   = useRef(4.2);

  /* ── Pre-built geometries (created once) ─── */
  const geos = useMemo(() => ({
    // Body — elongated ellipsoid
    body:   new THREE.SphereGeometry(1, 24, 18),
    // Head — slightly squashed sphere
    head:   new THREE.SphereGeometry(1, 24, 18),
    // Muzzle — forward-pointing ellipsoid
    muzzle: new THREE.SphereGeometry(0.5, 16, 12),
    // Limb segment
    limb:   new THREE.CapsuleGeometry(0.5, 1, 6, 12),
    // Paw
    paw:    new THREE.SphereGeometry(0.5, 12, 8),
    // Ear cone
    ear:    new THREE.ConeGeometry(1, 1.6, 5),
    // Eye
    eye:    new THREE.SphereGeometry(0.5, 12, 8),
    // Nose
    nose:   new THREE.SphereGeometry(0.5, 8, 6),
    // Tail
    tail:   new THREE.CapsuleGeometry(0.5, 1, 5, 10),
  }), []);

  /* ── Animation loop ─── */
  useFrame((_, dt) => {
    tRef.current += dt;
    const t = tRef.current;

    if (!bodyRef.current || !headRef.current || !tailRef.current) return;
    const B = bodyRef.current;
    const H = headRef.current;
    const T = tailRef.current;

    /* ── Blink ─── */
    blinkTimer.current += dt;
    if (blinkOpen.current && blinkTimer.current > blinkDur.current) {
      blinkOpen.current = false;
      blinkTimer.current = 0;
      blinkDur.current = 2.8 + Math.random() * 3;
    } else if (!blinkOpen.current && blinkTimer.current > 0.12) {
      blinkOpen.current = true;
    }
    const blinkY = blinkOpen.current ? 1 : 0.06;
    if (lEyeLRef.current) lEyeLRef.current.scale.y = THREE.MathUtils.lerp(lEyeLRef.current.scale.y, blinkY, 0.35);
    if (rEyeLRef.current) rEyeLRef.current.scale.y = THREE.MathUtils.lerp(rEyeLRef.current.scale.y, blinkY, 0.35);

    /* ── Ear twitch ─── */
    const earTwitch = Math.sin(t * 3.5) * 0.08 * (Math.sin(t * 0.28) > 0.7 ? 1 : 0);
    if (lEarRef.current) lEarRef.current.rotation.z = -0.15 + earTwitch;
    if (rEarRef.current) rEarRef.current.rotation.z =  0.15 - earTwitch;

    /* ── Reset approach ─── */
    if (animState !== 'sit' && animState !== 'sleep') {
      B.rotation.x = THREE.MathUtils.lerp(B.rotation.x, 0, 0.06);
    }
    B.rotation.z = THREE.MathUtils.lerp(B.rotation.z, 0, 0.06);
    H.rotation.z = THREE.MathUtils.lerp(H.rotation.z, 0, 0.06);

    /* ── IDLE ─── */
    if (animState === 'idle') {
      // Breathing
      B.scale.y = 1 + Math.sin(t * 1.15) * 0.022;
      B.scale.x = 1 - Math.sin(t * 1.15) * 0.010;
      // Head gentle bob
      H.position.y = THREE.MathUtils.lerp(H.position.y, 0.62 + Math.sin(t * 0.9) * 0.010, 0.08);
      H.rotation.y = Math.sin(t * 0.35) * 0.18;  // look around
      // Tail sway
      T.rotation.z = Math.sin(t * 1.5) * 0.40;
      T.rotation.x = Math.sin(t * 0.7) * 0.18;
      if (tail2Ref.current) tail2Ref.current.rotation.z = Math.sin(t * 1.8 + 0.5) * 0.30;
      if (tail3Ref.current) tail3Ref.current.rotation.z = Math.sin(t * 2.0 + 1.0) * 0.25;
      // Legs rest
      [lFLRef, rFLRef, lBLRef, rBLRef].forEach(r => {
        if (r.current) r.current.rotation.x = THREE.MathUtils.lerp(r.current.rotation.x, 0, 0.08);
      });

    } else if (animState === 'walk') {
      const stride = Math.sin(t * 6) * 0.50;
      if (lFLRef.current) lFLRef.current.rotation.x =  stride;
      if (rFLRef.current) rFLRef.current.rotation.x = -stride;
      if (lBLRef.current) lBLRef.current.rotation.x = -stride * 0.9;
      if (rBLRef.current) rBLRef.current.rotation.x =  stride * 0.9;
      B.position.y = Math.abs(Math.sin(t * 6)) * 0.025;
      H.rotation.x = Math.sin(t * 3) * 0.045;
      T.rotation.z = Math.sin(t * 3) * 0.25 + 0.35;
      B.scale.y = 1; B.scale.x = 1;

    } else if (animState === 'run') {
      const stride = Math.sin(t * 12) * 0.70;
      if (lFLRef.current) lFLRef.current.rotation.x =  stride;
      if (rFLRef.current) rFLRef.current.rotation.x = -stride;
      if (lBLRef.current) lBLRef.current.rotation.x = -stride * 1.1;
      if (rBLRef.current) rBLRef.current.rotation.x =  stride * 1.1;
      B.rotation.x = -0.15;
      B.position.y = Math.abs(Math.sin(t * 12)) * 0.07;
      T.rotation.z = Math.sin(t * 4) * 0.35 + 0.60;

    } else if (animState === 'sit') {
      B.rotation.x = THREE.MathUtils.lerp(B.rotation.x, 0.28, 0.06);
      B.position.y = THREE.MathUtils.lerp(B.position.y, -0.10, 0.06);
      H.position.y = THREE.MathUtils.lerp(H.position.y, 0.58, 0.06);
      if (lBLRef.current) lBLRef.current.rotation.x = THREE.MathUtils.lerp(lBLRef.current.rotation.x, -0.85, 0.06);
      if (rBLRef.current) rBLRef.current.rotation.x = THREE.MathUtils.lerp(rBLRef.current.rotation.x, -0.85, 0.06);
      T.rotation.z = Math.sin(t * 1.2) * 0.22;
      B.scale.y = 1 + Math.sin(t * 1.1) * 0.016;

    } else if (animState === 'sleep') {
      // Body curls horizontally — tilt forward so cat lies flat on mattress
      B.rotation.x = THREE.MathUtils.lerp(B.rotation.x, Math.PI * 0.42, 0.05);
      // Keep body at Y=0 relative to group (group is placed on bed by CatController)
      B.position.y = THREE.MathUtils.lerp(B.position.y, 0, 0.05);
      H.position.y = THREE.MathUtils.lerp(H.position.y, 0.20, 0.05);
      H.rotation.x = THREE.MathUtils.lerp(H.rotation.x, 0.50, 0.05);
      T.rotation.z = THREE.MathUtils.lerp(T.rotation.z, 1.30, 0.05);
      T.rotation.x = THREE.MathUtils.lerp(T.rotation.x, 0.60, 0.05);
      if (tail2Ref.current) tail2Ref.current.rotation.z = THREE.MathUtils.lerp(tail2Ref.current.rotation.z, 0.9, 0.05);
      if (lFLRef.current) lFLRef.current.rotation.x = THREE.MathUtils.lerp(lFLRef.current.rotation.x, -0.55, 0.05);
      if (rFLRef.current) rFLRef.current.rotation.x = THREE.MathUtils.lerp(rFLRef.current.rotation.x, -0.55, 0.05);
      if (lBLRef.current) lBLRef.current.rotation.x = THREE.MathUtils.lerp(lBLRef.current.rotation.x, -0.90, 0.05);
      if (rBLRef.current) rBLRef.current.rotation.x = THREE.MathUtils.lerp(rBLRef.current.rotation.x, -0.90, 0.05);
      // Slow sleep breathing
      B.scale.y = 1 + Math.sin(t * 0.45) * 0.028;
      // Eyes forced closed
      if (lEyeLRef.current) lEyeLRef.current.scale.y = THREE.MathUtils.lerp(lEyeLRef.current.scale.y, 0.05, 0.05);
      if (rEyeLRef.current) rEyeLRef.current.scale.y = THREE.MathUtils.lerp(rEyeLRef.current.scale.y, 0.05, 0.05);

    } else if (animState === 'eat' || animState === 'drink') {
      H.rotation.x = 0.55 + Math.sin(t * 4.0) * 0.22;
      H.position.y = THREE.MathUtils.lerp(H.position.y, 0.48 + Math.sin(t * 4.0) * 0.09, 0.1);
      T.rotation.z = Math.sin(t * 2) * 0.28 + 0.45;
      B.rotation.x = 0.12;

    } else if (animState === 'play') {
      const jump = Math.max(0, Math.sin(t * 6)) * 0.35;
      B.position.y = jump;
      B.rotation.z = Math.sin(t * 4.5) * 0.14;
      H.rotation.x = Math.sin(t * 4.5) * 0.12;
      T.rotation.z = Math.sin(t * 7) * 0.75;
      if (lFLRef.current) lFLRef.current.rotation.x =  Math.sin(t * 6) * 0.55;
      if (rFLRef.current) rFLRef.current.rotation.x = -Math.sin(t * 6) * 0.55;

    } else if (animState === 'groom') {
      if (groomArmRef.current) groomArmRef.current.rotation.x = -1.3 + Math.sin(t * 3.2) * 0.35;
      H.rotation.z = Math.sin(t * 1.6) * 0.12;
      T.rotation.z = Math.sin(t * 1.2) * 0.22;

    } else if (animState === 'stretch') {
      const s = Math.sin(t * 0.8) * 0.5 + 0.5;
      if (lFLRef.current) lFLRef.current.rotation.x = -s * 0.90;
      if (rFLRef.current) rFLRef.current.rotation.x = -s * 0.90;
      B.rotation.x = s * 0.32;
      H.rotation.x = -s * 0.42;
      B.scale.x = 1 + s * 0.18;

    } else if (animState === 'happy') {
      B.position.y = Math.abs(Math.sin(t * 8.5)) * 0.18;
      T.rotation.z = Math.sin(t * 9) * 0.95;
      H.rotation.z = Math.sin(t * 4.5) * 0.09;
      B.rotation.z = Math.sin(t * 4.5) * 0.06;
    }
  });

  return (
    <group
      position={position as [number,number,number]}
      scale={scale}
      onPointerDown={onPointerDown}
    >
      {/* ── FLOOR SHADOW ── */}
      <mesh material={mShadow} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <circleGeometry args={[0.26, 32]} />
      </mesh>

      <group ref={bodyRef}>
        {/* ── BODY ── */}
        <mesh material={mBody} scale={[0.30, 0.24, 0.40]}>
          <primitive object={geos.body} attach="geometry" />
        </mesh>
        {/* Outline body */}
        <mesh material={mOutline} scale={[0.32, 0.258, 0.43]}>
          <primitive object={geos.body} attach="geometry" />
        </mesh>
        {/* White belly */}
        <mesh material={mWhite} position={[0, -0.04, 0.12]} scale={[0.18, 0.16, 0.16]}>
          <primitive object={geos.muzzle} attach="geometry" />
        </mesh>

        {/* ── SHIRT OVERLAY (when equipped) ── */}
        {shirtItem && (
          <mesh
            material={new THREE.MeshToonMaterial({ color: shirtItem.color || '#ffc1e0', transparent: true, opacity: 0.90 })}
            scale={[0.305, 0.245, 0.405]}
          >
            <primitive object={geos.body} attach="geometry" />
          </mesh>
        )}

        {/* ── SPECIAL OVERLAY (birthday/angel/cape) ── */}
        {specialItem && (
          <mesh
            material={new THREE.MeshToonMaterial({ color: specialItem.color || '#ff6b9d', transparent: true, opacity: 0.88 })}
            scale={[0.31, 0.25, 0.41]}
          >
            <primitive object={geos.body} attach="geometry" />
          </mesh>
        )}

        {/* ── NECK ── */}
        <group ref={neckRef} position={[0, 0.22, 0.20]}>
          <mesh material={mBodyB} scale={[0.10, 0.12, 0.10]}>
            <primitive object={geos.limb} attach="geometry" />
          </mesh>
          {/* ── COLLAR (when equipped) ── */}
          {collarItem && (
            <mesh
              material={new THREE.MeshToonMaterial({ color: collarItem.color || '#ffd700' })}
              position={[0, 0.02, 0]}
              scale={[0.13, 0.04, 0.13]}
            >
              <torusGeometry args={[1, 0.3, 8, 24]} />
            </mesh>
          )}
        </group>

        {/* ── TAIL root → segment 1 ── */}
        <group ref={tailRef} position={[0.02, 0.10, -0.40]}>
          <mesh material={mBody} scale={[0.065, 0.065, 0.20]}>
            <primitive object={geos.tail} attach="geometry" />
          </mesh>
          <mesh material={mOutline} scale={[0.072, 0.072, 0.22]}>
            <primitive object={geos.tail} attach="geometry" />
          </mesh>

          {/* Segment 2 */}
          <group ref={tail2Ref} position={[0, 0.20, 0]} rotation={[0.4, 0, 0]}>
            <mesh material={mBody} scale={[0.055, 0.055, 0.18]}>
              <primitive object={geos.tail} attach="geometry" />
            </mesh>
            <mesh material={mOutline} scale={[0.062, 0.062, 0.20]}>
              <primitive object={geos.tail} attach="geometry" />
            </mesh>

            {/* Segment 3 + white tip */}
            <group ref={tail3Ref} position={[0, 0.18, 0]} rotation={[0.4, 0, 0]}>
              <mesh material={mBodyB} scale={[0.045, 0.045, 0.16]}>
                <primitive object={geos.tail} attach="geometry" />
              </mesh>
              <mesh material={mWhite} position={[0, 0.18, 0]} scale={[0.06, 0.06, 0.06]}>
                <primitive object={geos.paw} attach="geometry" />
              </mesh>
            </group>
          </group>
        </group>

        {/* ── FRONT-LEFT LEG ── */}
        <group ref={lFLRef} position={[-0.14, -0.06, 0.20]}>
          <mesh material={mBody} position={[0, -0.12, 0]} scale={[0.07, 0.14, 0.07]}>
            <primitive object={geos.limb} attach="geometry" />
          </mesh>
          <mesh material={mWhite} position={[0, -0.24, 0.02]} scale={[0.08, 0.05, 0.10]}>
            <primitive object={geos.paw} attach="geometry" />
          </mesh>
        </group>

        {/* ── FRONT-RIGHT LEG ── */}
        <group ref={rFLRef} position={[0.14, -0.06, 0.20]}>
          <mesh material={mBody} position={[0, -0.12, 0]} scale={[0.07, 0.14, 0.07]}>
            <primitive object={geos.limb} attach="geometry" />
          </mesh>
          <mesh material={mWhite} position={[0, -0.24, 0.02]} scale={[0.08, 0.05, 0.10]}>
            <primitive object={geos.paw} attach="geometry" />
          </mesh>
        </group>

        {/* ── BACK-LEFT LEG ── */}
        <group ref={lBLRef} position={[-0.16, -0.05, -0.22]}>
          <mesh material={mBody} position={[0, -0.10, 0]} scale={[0.08, 0.14, 0.09]}>
            <primitive object={geos.limb} attach="geometry" />
          </mesh>
          <mesh material={mWhite} position={[0, -0.22, 0.03]} scale={[0.09, 0.05, 0.12]}>
            <primitive object={geos.paw} attach="geometry" />
          </mesh>
        </group>

        {/* ── BACK-RIGHT LEG ── */}
        <group ref={rBLRef} position={[0.16, -0.05, -0.22]}>
          <mesh material={mBody} position={[0, -0.10, 0]} scale={[0.08, 0.14, 0.09]}>
            <primitive object={geos.limb} attach="geometry" />
          </mesh>
          <mesh material={mWhite} position={[0, -0.22, 0.03]} scale={[0.09, 0.05, 0.12]}>
            <primitive object={geos.paw} attach="geometry" />
          </mesh>
        </group>

        {/* ── HEAD GROUP ── */}
        <group ref={headRef} position={[0, 0.28, 0.30]}>
          {/* Head */}
          <mesh material={mBody} scale={[0.22, 0.20, 0.22]}>
            <primitive object={geos.head} attach="geometry" />
          </mesh>
          <mesh material={mOutline} scale={[0.235, 0.215, 0.235]}>
            <primitive object={geos.head} attach="geometry" />
          </mesh>

          {/* ── EQUIPPED HAT ── */}
          {hatItem && (
            <group position={[0, 0.20, 0]} rotation={[-0.1, 0, 0]}>
              {hatItem.id === 'party_hat' ? (
                <mesh material={new THREE.MeshToonMaterial({ color: hatItem.color || '#ff6b9d' })} scale={[0.12, 0.22, 0.12]}>
                  <coneGeometry args={[1, 1.2, 16]} />
                </mesh>
              ) : hatItem.id === 'crown' ? (
                <group position={[0, 0.02, 0]} scale={[0.13, 0.08, 0.13]}>
                  <mesh material={new THREE.MeshToonMaterial({ color: '#ffd700' })}>
                    <cylinderGeometry args={[1, 0.85, 0.6, 6]} />
                  </mesh>
                </group>
              ) : hatItem.id === 'bow' ? (
                <group position={[0, 0.02, 0.05]} scale={[0.07, 0.07, 0.07]}>
                  <mesh material={new THREE.MeshToonMaterial({ color: hatItem.color || '#ff6b9d' })} position={[-0.7, 0, 0]} rotation={[0, 0, 0.3]}>
                    <coneGeometry args={[0.7, 1.2, 8]} />
                  </mesh>
                  <mesh material={new THREE.MeshToonMaterial({ color: hatItem.color || '#ff6b9d' })} position={[0.7, 0, 0]} rotation={[0, 0, -0.3]}>
                    <coneGeometry args={[0.7, 1.2, 8]} />
                  </mesh>
                  <mesh material={new THREE.MeshToonMaterial({ color: '#ffb3c6' })}>
                    <sphereGeometry args={[0.4, 8, 8]} />
                  </mesh>
                </group>
              ) : hatItem.id === 'top_hat' ? (
                <group position={[0, 0.04, 0]} scale={[0.14, 0.14, 0.14]}>
                  <mesh material={new THREE.MeshToonMaterial({ color: '#1a1a1a' })}>
                    <cylinderGeometry args={[0.9, 0.9, 1.1, 16]} />
                  </mesh>
                  <mesh material={new THREE.MeshToonMaterial({ color: '#1a1a1a' })} position={[0, -0.5, 0]}>
                    <cylinderGeometry args={[1.4, 1.4, 0.1, 16]} />
                  </mesh>
                  <mesh material={new THREE.MeshToonMaterial({ color: '#e03040' })} position={[0, -0.35, 0]}>
                    <cylinderGeometry args={[0.92, 0.92, 0.2, 16]} />
                  </mesh>
                </group>
              ) : hatItem.id === 'witch_hat' ? (
                <group position={[0, 0.02, 0]} scale={[0.15, 0.18, 0.15]}>
                  <mesh material={new THREE.MeshToonMaterial({ color: '#3a204e' })}>
                    <coneGeometry args={[0.9, 1.5, 16]} />
                  </mesh>
                  <mesh material={new THREE.MeshToonMaterial({ color: '#291438' })} position={[0, -0.7, 0]}>
                    <cylinderGeometry args={[1.5, 1.5, 0.08, 16]} />
                  </mesh>
                </group>
              ) : (
                /* Default cute beret / cap */
                <mesh material={new THREE.MeshToonMaterial({ color: hatItem.color || '#ff6b9d' })} scale={[0.18, 0.08, 0.18]}>
                  <sphereGeometry args={[1, 16, 12]} />
                </mesh>
              )}
            </group>
          )}

          {/* ── EQUIPPED ACCESSORY (sunglasses / earrings / bow tie) ── */}
          {accItem && accItem.id === 'sunglasses' && (
            <group position={[0, 0.05, 0.21]} scale={[0.19, 0.06, 0.05]}>
              <mesh material={new THREE.MeshToonMaterial({ color: '#111111' })}>
                <boxGeometry args={[1, 0.6, 0.2]} />
              </mesh>
            </group>
          )}

          {/* Muzzle — white */}
          <mesh material={mWhite} position={[0, -0.05, 0.16]} scale={[0.12, 0.09, 0.10]}>
            <primitive object={geos.muzzle} attach="geometry" />
          </mesh>

          {/* Cheek puffs */}
          <mesh material={mWhiteD} position={[-0.10, -0.04, 0.14]} scale={[0.09, 0.07, 0.07]}>
            <primitive object={geos.muzzle} attach="geometry" />
          </mesh>
          <mesh material={mWhiteD} position={[0.10, -0.04, 0.14]} scale={[0.09, 0.07, 0.07]}>
            <primitive object={geos.muzzle} attach="geometry" />
          </mesh>

          {/* ── LEFT EAR ── */}
          <group ref={lEarRef} position={[-0.11, 0.18, -0.04]} rotation={[0, 0, -0.20]}>
            <mesh material={mBody} scale={[0.09, 0.12, 0.05]}>
              <primitive object={geos.ear} attach="geometry" />
            </mesh>
            <mesh material={mOutline} scale={[0.10, 0.13, 0.055]}>
              <primitive object={geos.ear} attach="geometry" />
            </mesh>
            <mesh material={mPink} position={[0, 0.01, 0.015]} scale={[0.055, 0.085, 0.025]}>
              <primitive object={geos.ear} attach="geometry" />
            </mesh>
          </group>

          {/* ── RIGHT EAR ── */}
          <group ref={rEarRef} position={[0.11, 0.18, -0.04]} rotation={[0, 0, 0.20]}>
            <mesh material={mBody} scale={[0.09, 0.12, 0.05]}>
              <primitive object={geos.ear} attach="geometry" />
            </mesh>
            <mesh material={mOutline} scale={[0.10, 0.13, 0.055]}>
              <primitive object={geos.ear} attach="geometry" />
            </mesh>
            <mesh material={mPink} position={[0, 0.01, 0.015]} scale={[0.055, 0.085, 0.025]}>
              <primitive object={geos.ear} attach="geometry" />
            </mesh>
          </group>

          {/* ── LEFT EYE ── */}
          <mesh material={mAmber} position={[-0.075, 0.04, 0.18]} scale={[0.042, 0.048, 0.032]}>
            <primitive object={geos.eye} attach="geometry" />
          </mesh>
          <mesh material={mPupil} position={[-0.075, 0.04, 0.208]} scale={[0.022, 0.038, 0.018]}>
            <primitive object={geos.eye} attach="geometry" />
          </mesh>
          {/* catchlight */}
          <mesh position={[-0.062, 0.054, 0.212]} scale={[0.009, 0.009, 0.006]}>
            <primitive object={geos.eye} attach="geometry" />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          {/* eyelid */}
          <mesh ref={lEyeLRef} material={mBody} position={[-0.075, 0.04, 0.210]} scale={[0.046, 0.050, 0.020]}>
            <primitive object={geos.eye} attach="geometry" />
          </mesh>

          {/* ── RIGHT EYE ── */}
          <mesh material={mAmber} position={[0.075, 0.04, 0.18]} scale={[0.042, 0.048, 0.032]}>
            <primitive object={geos.eye} attach="geometry" />
          </mesh>
          <mesh material={mPupil} position={[0.075, 0.04, 0.208]} scale={[0.022, 0.038, 0.018]}>
            <primitive object={geos.eye} attach="geometry" />
          </mesh>
          <mesh position={[0.088, 0.054, 0.212]} scale={[0.009, 0.009, 0.006]}>
            <primitive object={geos.eye} attach="geometry" />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh ref={rEyeLRef} material={mBody} position={[0.075, 0.04, 0.210]} scale={[0.046, 0.050, 0.020]}>
            <primitive object={geos.eye} attach="geometry" />
          </mesh>

          {/* ── NOSE ── */}
          <mesh material={mPink} position={[0, -0.04, 0.215]} scale={[0.028, 0.022, 0.018]}>
            <primitive object={geos.nose} attach="geometry" />
          </mesh>

          {/* ── WHISKERS (line segments) ── */}
          {([-1, 1] as const).map(side => (
            <group key={side} position={[side * 0.02, -0.04, 0.20]}>
              {[0.018, 0, -0.018].map((oy, i) => {
                const pts = [
                  new THREE.Vector3(0, oy, 0),
                  new THREE.Vector3(side * 0.17, oy + (i - 1) * 0.008, 0.01),
                ];
                const geo = new THREE.BufferGeometry().setFromPoints(pts);
                return (
                  <lineSegments key={i} geometry={geo}>
                    <lineBasicMaterial color="#999999" linewidth={1} />
                  </lineSegments>
                );
              })}
            </group>
          ))}

          {/* ── GROOM ARM (right paw raised) ── */}
          <group ref={groomArmRef} position={[0.13, -0.01, 0.14]} rotation={[0, 0, 0.3]}>
            <mesh material={mBody} position={[0, -0.06, 0]} scale={[0.06, 0.10, 0.06]}>
              <primitive object={geos.limb} attach="geometry" />
            </mesh>
            <mesh material={mWhite} position={[0, -0.14, 0.01]} scale={[0.07, 0.04, 0.08]}>
              <primitive object={geos.paw} attach="geometry" />
            </mesh>
          </group>

        </group>{/* /headRef */}

      </group>{/* /bodyRef */}
    </group>
  );
}
