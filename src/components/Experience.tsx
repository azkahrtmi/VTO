import { useEffect, useState, Suspense } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Environment, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { CameraManager } from './CameraManager';
import { GlassesOverlay } from './GlassesOverlay';

function VideoBackground() {
  const { camera } = useThree();
  const viewport = useThree((state) => state.viewport.getCurrentViewport(camera, new THREE.Vector3(0, 0, -10)));
  const [videoTex, setVideoTex] = useState<THREE.VideoTexture | null>(null);

  useEffect(() => {
    const video = CameraManager.getInstance().videoElement;
    if (video) {
      const tex = new THREE.VideoTexture(video);
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.format = THREE.RGBAFormat;
      tex.colorSpace = THREE.SRGBColorSpace;
      
      // Mirror the video texture horizontally
      tex.wrapS = THREE.RepeatWrapping;
      tex.repeat.x = -1;
      
      setVideoTex(tex);
    }
  }, []);

  if (!videoTex) return null;

  return (
    <mesh position={[0, 0, -10]}>
      <planeGeometry args={[viewport.width, viewport.height]} />
      <meshBasicMaterial map={videoTex} depthTest={false} depthWrite={false} />
    </mesh>
  );
}

export function Experience() {
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'absolute', inset: 0 }}>
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 0]} fov={45} />
        <ambientLight intensity={1.5} />
        <directionalLight position={[10, 10, 10]} intensity={1} />
        <Environment preset="city" />
        
        <VideoBackground />
        
        <Suspense fallback={null}>
          <GlassesOverlay />
        </Suspense>
      </Canvas>
    </div>
  );
}
