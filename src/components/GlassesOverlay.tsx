import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { FaceTracker } from './FaceTracker';
import { CustomGlasses } from './CustomGlasses';
import { OneEuroFilter } from '../utils/OneEuroFilter';

// ============================================================================
// 🛠️ AREA TWEAK & PENYESUAIAN MANUAL (EDIT BAGIAN INI SAJA) 🛠️
// ============================================================================
export const TWEAK_CONFIG = {
  // 0. MODE DEBUG (TAMPILKAN TITIK JANGKAR)
  // Ubah ke 'true' untuk memunculkan BOLA MERAH. Bola merah ini adalah titik
  // pelacakan AI di hidung Anda. Jika bola merah menempel sempurna di hidung,
  // berarti mesin AI sudah 100% sempurna. Anda tinggal menggeser kacamata
  // agar pas duduk di atas bola merah tersebut menggunakan setting di bawah.
  tampilkanTitikJangkar: true,

  // 1. POSISI NAIK TURUN (Y OFFSET)
  // Geser posisi kacamata relatif terhadap bola merah.
  // Semakin negatif, kacamata semakin TURUN. Semakin positif, kacamata NAIK.
  geserVertikal: -0.4,

  // 2. KEDALAMAN / MAJU MUNDUR (Z OFFSET)
  // Geser kacamata maju/mundur relatif terhadap bola merah.
  // Jika gagang kacamata menembus pipi, coba majukan (contoh: 0.2 atau 0.5).
  geserMajuMundur: 0, 

  // 3. SKALA / UKURAN KACAMATA
  // Perbesar/perkecil ukuran kacamata secara keseluruhan.
  pengaliUkuran: 0.65,

  // 4. BALIK ROTASI WAJAH (MIRROR FLIP)
  // Jika saat Anda menoleh, kacamatanya menoleh ke arah berlawanan, ubah ini.
  balikRotasiKiriKanan: true,
  
  // 5. BALIK MODEL DEPAN-BELAKANG (180 DERAJAT)
  // Jika gagang kacamata menghadap ke arah KAMERA, ubah menjadi 'true'.
  balikModelDepanBelakang: false,
};
// ============================================================================

const occlusionMaterial = new THREE.MeshBasicMaterial({
  colorWrite: false, // Invisible
  depthWrite: true,  // Menulis ke depth buffer agar bisa memblokir bagian kacamata di belakang hidung
});

export function GlassesOverlay() {
  const groupRef = useRef<THREE.Group>(null);
  
  const [visible, setVisible] = useState(false);

  const tempMatrix = new THREE.Matrix4();
  const rawQuat = new THREE.Quaternion();

  const filters = useRef({
    px: new OneEuroFilter(60, 1.0, 0.007),
    py: new OneEuroFilter(60, 1.0, 0.007),
    pz: new OneEuroFilter(60, 0.5, 0.003),
    qx: new OneEuroFilter(60, 0.5, 0.001),
    qy: new OneEuroFilter(60, 0.5, 0.001),
    qz: new OneEuroFilter(60, 0.5, 0.001),
    qw: new OneEuroFilter(60, 0.5, 0.001),
    scale: new OneEuroFilter(60, 0.3, 0.001),
  });

  useFrame((state) => {
    const tracker = FaceTracker.getInstance();
    
    if (tracker.isFaceDetected && tracker.currentResult?.faceLandmarks[0] && groupRef.current) {
      setVisible(true);
      
      const landmarks = tracker.currentResult.faceLandmarks[0];
      const noseBridge = landmarks[168];
      const leftInner = landmarks[133];
      const rightInner = landmarks[362];
      
      // MENGHITUNG TITIK TENGAH WAJAH
      const anchorX = noseBridge.x * 0.5 + leftInner.x * 0.25 + rightInner.x * 0.25;
      const anchorY = noseBridge.y * 0.5 + leftInner.y * 0.25 + rightInner.y * 0.25;

      const perspectiveViewport = state.viewport.getCurrentViewport(state.camera, new THREE.Vector3(0, 0, -10));

      // MENGHITUNG KOORDINAT 3D
      const rawX = -(anchorX - 0.5) * perspectiveViewport.width; 
      const rawY = -(anchorY - 0.5) * perspectiveViewport.height;
      const rawZ = -10; 
      
      // ROTASI WAJAH DARI AI MEDIAPIPE
      tempMatrix.copy(tracker.transformMatrix);
      rawQuat.setFromRotationMatrix(tempMatrix);
      
      if (TWEAK_CONFIG.balikRotasiKiriKanan) {
        rawQuat.y *= -1; // Membalik (Mirror) Yaw
        rawQuat.z *= -1; // Membalik (Mirror) Roll
      }

      // SKALA / UKURAN DINAMIS (MEMBESAR SAAT MAJU KE KAMERA)
      const leftEyeOuter = landmarks[33];
      const rightEyeOuter = landmarks[263];
      const dx = rightEyeOuter.x - leftEyeOuter.x;
      const dy = rightEyeOuter.y - leftEyeOuter.y;
      
      const eyeDistanceNormalized = Math.sqrt(dx*dx + dy*dy);
      const eyeDistanceViewport = eyeDistanceNormalized * perspectiveViewport.width;
      
      const rawScale = (eyeDistanceViewport / 1.2) * TWEAK_CONFIG.pengaliUkuran;

      // STABILISASI GERAKAN (ONE EURO FILTER)
      const t = performance.now() / 1000;
      
      const px = filters.current.px.filter(rawX, t);
      const py = filters.current.py.filter(rawY, t);
      const pz = filters.current.pz.filter(rawZ, t);
      
      const qx = filters.current.qx.filter(rawQuat.x, t);
      const qy = filters.current.qy.filter(rawQuat.y, t);
      const qz = filters.current.qz.filter(rawQuat.z, t);
      const qw = filters.current.qw.filter(rawQuat.w, t);
      
      const s = filters.current.scale.filter(rawScale, t);

      // Set raw tracked position (World Space)
      groupRef.current.position.set(px, py, pz);
      groupRef.current.quaternion.set(qx, qy, qz, qw).normalize();
      groupRef.current.scale.set(s, s, s);

    } else {
      setVisible(false);
    }
  });

  // Apakah model perlu diputar 180 derajat ke belakang?
  const modelRotation = TWEAK_CONFIG.balikModelDepanBelakang ? [0, Math.PI, 0] as [number, number, number] : [0, 0, 0] as [number, number, number];

  return (
    <group ref={groupRef} visible={visible} dispose={null}>
      {/* HIDUNG PALSU UNTUK EFEK 3D OCCLUSION */}
      <mesh position={[0, -0.4, -0.2]}>
        <coneGeometry args={[0.3, 1.2, 16]} />
        <primitive object={occlusionMaterial} attach="material" />
      </mesh>

      <group rotation={modelRotation}>
        {/* Local offset tweaks applied here so they rotate with the head! */}
        <group position={[0, TWEAK_CONFIG.geserVertikal, TWEAK_CONFIG.geserMajuMundur]}>
          <CustomGlasses />
        </group>
      </group>

      {/* BOLA MERAH DEBUG (Menunjukkan jangkar asli pelacakan hidung) */}
      {TWEAK_CONFIG.tampilkanTitikJangkar && (
        <mesh>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshBasicMaterial color="red" />
        </mesh>
      )}
    </group>
  );
}
