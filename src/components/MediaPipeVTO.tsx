import React, { useEffect, useRef, useState, Suspense, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { useAppStore } from '../store';
import { GLASSES_CATALOG } from '../catalog/glasses';

// --- FINAL CALIBRATED CONSTANTS ---
const SCALE_FACTOR = 3.0;  // Balanced scale for 1.45-6.6 viewport width
const Y_OFFSET = -0.05;    // Slight nudge down to match eyes
const Z_OFFSET = 0.5;      // In front of face

function GlassesModel({ url, landmarks, viewport }: { url: string, landmarks: any[], viewport: any }) {
  const { scene } = useGLTF(url);
  const groupRef = useRef<THREE.Group>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (scene) {
      // 1. Reset and traverse
      scene.position.set(0, 0, 0);
      scene.scale.set(1, 1, 1);
      scene.rotation.set(0, 0, 0);

      scene.traverse((obj: any) => {
        if (obj.isMesh) {
          obj.material.transparent = obj.material.opacity < 1;
          obj.material.side = THREE.DoubleSide;
          obj.material.needsUpdate = true;
        }
      });

      // 2. Normalize: Pivot at center and width = 1 unit
      const box = new THREE.Box3().setFromObject(scene);
      const center = new THREE.Vector3();
      const size = new THREE.Vector3();
      box.getCenter(center);
      box.getSize(size);
      
      scene.position.sub(center);
      const scaleMult = 1 / (size.x || 1); 
      scene.scale.set(scaleMult, scaleMult, scaleMult);
      
      setIsInitialized(true);
    }
  }, [scene, url]);

  useFrame(() => {
    if (!groupRef.current || !landmarks || landmarks.length === 0 || !isInitialized) return;

    const anchor = landmarks[168]; // Nose bridge
    const leftEye = landmarks[33];
    const rightEye = landmarks[263];
    const noseTip = landmarks[1];

    // Position (Mirrored)
    const targetX = -(anchor.x - 0.5) * viewport.width;
    const targetY = -(anchor.y - 0.5) * viewport.height + Y_OFFSET;
    
    // Smooth transition without filter for now
    groupRef.current.position.x += (targetX - groupRef.current.position.x) * 0.5;
    groupRef.current.position.y += (targetY - groupRef.current.position.y) * 0.5;
    groupRef.current.position.z = -anchor.z * 10 + Z_OFFSET;

    // Scale
    const eyeDistance = Math.sqrt(
      Math.pow(rightEye.x - leftEye.x, 2) + 
      Math.pow(rightEye.y - leftEye.y, 2)
    ) * viewport.width;

    const targetScale = eyeDistance * SCALE_FACTOR; 
    groupRef.current.scale.set(targetScale, targetScale, targetScale);

    // Rotation
    const roll = Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x);
    const yaw = Math.atan2(anchor.z - noseTip.z, anchor.x - noseTip.x) + Math.PI / 2;
    groupRef.current.rotation.set(0, yaw, -roll);
  });

  return (
    <group ref={groupRef}>
      <primitive object={scene} dispose={null} />
    </group>
  );
}

export function MediaPipeVTO() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [landmarks, setLandmarks] = useState<any[]>([]);
  const { selectedGlassesId } = useAppStore();
  const [landmarker, setLandmarker] = useState<FaceLandmarker | null>(null);
  const [isFaceDetected, setIsFaceDetected] = useState(false);

  const selectedGlasses = GLASSES_CATALOG.find(g => g.id === selectedGlassesId);

  useEffect(() => {
    let active = true;
    async function initMediaPipe() {
      try {
        const filesetResolver = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        const faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath: "/face_landmarker.task",
            delegate: "GPU"
          },
          outputFaceBlendshapes: true,
          runningMode: "VIDEO",
          numFaces: 1
        });
        if (active) setLandmarker(faceLandmarker);
      } catch (e) {
        console.error("MediaPipe Error:", e);
      }
    }

    initMediaPipe();

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ 
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' } 
      }).then(stream => {
        if (videoRef.current && active) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => videoRef.current?.play();
        }
      });
    }

    return () => {
      active = false;
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (!landmarker || !videoRef.current) return;

    let animationFrameId: number;
    const predict = () => {
      if (videoRef.current && videoRef.current.readyState >= 2) {
        const results = landmarker.detectForVideo(videoRef.current, performance.now());
        if (results.faceLandmarks && results.faceLandmarks.length > 0) {
          setLandmarks(results.faceLandmarks[0]);
          if (!isFaceDetected) setIsFaceDetected(true);
        } else {
          if (isFaceDetected) setIsFaceDetected(false);
        }
      }
      animationFrameId = requestAnimationFrame(predict);
    };

    predict();
    return () => cancelAnimationFrame(animationFrameId);
  }, [landmarker, isFaceDetected]);

  return (
    <div className="mediapipe-vto" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10, background: '#000' }}>
      <video
        ref={videoRef}
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: 'scaleX(-1)',
          zIndex: 1
        }}
        playsInline
        muted
      />
      
      {(!landmarker || !isFaceDetected) && (
        <div style={{ 
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
          zIndex: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', 
          justifyContent: 'center', background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(10px)',
          color: '#fff', textAlign: 'center', padding: '2rem'
        }}>
          <div style={{ 
            width: '48px', height: '48px', border: '4px solid rgba(255,255,255,0.1)', 
            borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite',
            marginBottom: '1.5rem'
          }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
            {!landmarker ? "Loading AR Engine..." : "Looking for Face..."}
          </h3>
        </div>
      )}

      <Canvas
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 2 }}
        camera={{ fov: 35, position: [0, 0, 5] }}
      >
        <Suspense fallback={null}>
          <Environment preset="warehouse" />
          <ambientLight intensity={0.8} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          
          {selectedGlasses?.type === 'local' && isFaceDetected && (
            <SceneContent url={selectedGlasses.sku} landmarks={landmarks} />
          )}
        </Suspense>
      </Canvas>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}} />
    </div>
  );
}

function SceneContent({ url, landmarks }: { url: string, landmarks: any[] }) {
  const { viewport } = useThree();
  return <GlassesModel url={url} landmarks={landmarks} viewport={viewport} />;
}
