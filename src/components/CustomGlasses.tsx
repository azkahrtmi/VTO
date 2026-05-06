import { useMemo } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';

export const CustomGlasses = () => {
  const { scene } = useGLTF('/glasses_converted.glb');
  
  const { scale, position } = useMemo(() => {
    if (!scene) {
      return {
        scale: [1, 1, 1] as [number, number, number],
        position: [0, 0, 0] as [number, number, number],
      };
    }
    
    // Hitung kotak pembatas (bounding box) dari model 3D
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);
    
    // Kita standarisasi lebar kacamata di ruang 3D menjadi 2.8 unit
    // Ini agar model apapun (yang diexport besar/kecil) ukurannya seragam
    const targetWidth = 2.8;
    const s = size.x > 0 ? targetWidth / size.x : 1;
    
    // Tweak Dasar Model:
    // Jika posisi default kacamata terasa "nyangkut" terlalu ke belakang atau ke depan 
    // dari asalnya (karena asal pembuat model GLB berbeda-beda), 
    // Anda bisa mengubah "-box.max.z" menjadi "-box.min.z" atau "-center.z".
    return {
      scale: [s, s, s] as [number, number, number],
      position: [-center.x, -center.y, -box.max.z] as [number, number, number]
    };
  }, [scene]);

  return (
    <group>
      <group scale={scale}>
        <primitive object={scene} position={position} />
      </group>
    </group>
  );
};
