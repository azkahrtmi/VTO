import React, { useEffect, useRef, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { useAppStore } from '../store';
import { GLASSES_CATALOG } from '../catalog/glasses';

function GlassesModel({ url, matrix, isDetected }: { url: string, matrix: THREE.Matrix4 | null, isDetected: boolean }) {
  const { scene } = useGLTF(url);
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (scene) {
      scene.traverse((obj: any) => {
        if (obj.isMesh) {
          obj.material.side = THREE.DoubleSide;
          obj.renderOrder = 2;
        }
      });
      // Normalize model size
      const box = new THREE.Box3().setFromObject(scene);
      const size = new THREE.Vector3();
      box.getSize(size);
      
      // We want the model to be ~1 unit wide internally so the matrix scale works predictably
      const scale = 1 / (size.x || 1);
      scene.scale.set(scale, scale, scale);
      
      const center = new THREE.Vector3();
      box.getCenter(center);
      scene.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
    }
  }, [scene]);

  useFrame(() => {
    if (groupRef.current && matrix && isDetected) {
      // Apply matrix but scale down significantly to match Three.js world
      groupRef.current.matrix.copy(matrix);
      
      // Fine-tuning scale: MediaPipe matrix is large, we scale it down to face size
      const internalScale = 0.085; 
      const scaleMatrix = new THREE.Matrix4().makeScale(internalScale, internalScale, internalScale);
      groupRef.current.matrix.multiply(scaleMatrix);
      
      groupRef.current.matrixAutoUpdate = false;
    }
  });

  return (
    <group ref={groupRef} visible={isDetected}>
      <primitive object={scene} />
    </group>
  );
}

function FaceOccluder({ matrix, isDetected }: { matrix: THREE.Matrix4 | null, isDetected: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (meshRef.current && matrix && isDetected) {
      meshRef.current.matrix.copy(matrix);
      const internalScale = 0.07; // Slightly smaller than glasses
      const scaleMatrix = new THREE.Matrix4().makeScale(internalScale, internalScale, internalScale);
      meshRef.current.matrix.multiply(scaleMatrix);
      meshRef.current.matrixAutoUpdate = false;
    }
  });

  return (
    <mesh ref={meshRef} renderOrder={1} visible={isDetected}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshBasicMaterial colorWrite={false} depthWrite={true} />
    </mesh>
  );
}

export function MediaPipeVTO() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [landmarker, setLandmarker] = useState<FaceLandmarker | null>(null);
  const [faceMatrix, setFaceMatrix] = useState<THREE.Matrix4 | null>(null);
  const [isFaceDetected, setIsFaceDetected] = useState(false);
  const { selectedGlassesId } = useAppStore();

  const selectedGlasses = GLASSES_CATALOG.find(g => g.id === selectedGlassesId);

  useEffect(() => {
    async function init() {
      const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm");
      const lm = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: "/face_landmarker.task", delegate: "GPU" },
        outputFaceBlendshapes: true,
        outputFacialTransformationMatrixes: true,
        runningMode: "VIDEO",
        numFaces: 1
      });
      setLandmarker(lm);
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720, facingMode: 'user' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => videoRef.current?.play();
      }
    }
    init();
  }, []);

  useEffect(() => {
    if (!landmarker || !videoRef.current) return;
    const predict = () => {
      if (videoRef.current?.readyState === 4) {
        const results = landmarker.detectForVideo(videoRef.current, performance.now());
        if (results.facialTransformationMatrixes?.[0]) {
          const m = new THREE.Matrix4().fromArray(results.facialTransformationMatrixes[0].data);
          
          // Coordinate adjustment for Three.js + Mirroring
          const flipX = new THREE.Matrix4().makeScale(-1, 1, 1);
          setFaceMatrix(m.premultiply(flipX));
          setIsFaceDetected(true);
        } else {
          setIsFaceDetected(false);
        }
      }
      requestAnimationFrame(predict);
    };
    predict();
  }, [landmarker]);

  return (
    <div className="mediapipe-vto" style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 10 }}>
      <video ref={videoRef} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
      
      {!isFaceDetected && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', background: 'rgba(0,0,0,0.5)', zIndex: 20 }}>
          <p>Finding face...</p>
        </div>
      )}

      <Canvas style={{ position: 'absolute', inset: 0, zIndex: 2 }} camera={{ fov: 60, position: [0, 0, 5] }}>
        <Suspense fallback={null}>
          <Environment preset="warehouse" />
          <ambientLight intensity={0.5} />
          
          {selectedGlasses?.type === 'local' && (
            <>
              <FaceOccluder matrix={faceMatrix} isDetected={isFaceDetected} />
              <GlassesModel url={selectedGlasses.sku} matrix={faceMatrix} isDetected={isFaceDetected} />
            </>
          )}
        </Suspense>
      </Canvas>
    </div>
  );
}
