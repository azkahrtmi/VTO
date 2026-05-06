import { useEffect, useRef } from 'react';
import { FaceTracker } from './FaceTracker';
import { useAppStore } from '../store';
import { GLASSES_CATALOG } from '../catalog/glasses';
import { initScene } from '../vto/VTOScene';

import { loadGlasses } from '../vto/GLBLoader';
import { updateGlassesTransform } from '../vto/VTOEngine';
import { EMAVector3, EMAScalar } from '../vto/smoother';
import * as THREE from 'three';

export function VTOOverlay({ video }: { video: HTMLVideoElement | null }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const glassesRef = useRef<THREE.Group | null>(null);
  const sceneDataRef = useRef<{
    renderer: THREE.WebGLRenderer;
    camera: THREE.PerspectiveCamera;
    scene: THREE.Scene;
  } | null>(null);

  // Smoothing instances
  const posSmooth = useRef(new EMAVector3(0.25));
  const scaleSmooth = useRef(new EMAScalar(0.2));
  const rotZSmooth = useRef(new EMAScalar(0.3));
  const rotYSmooth = useRef(new EMAScalar(0.2));
  const rotXSmooth = useRef(new EMAScalar(0.2));

  const { selectedGlassesId, showGlasses, userScale } = useAppStore();

  useEffect(() => {
    if (!video || !containerRef.current) return;

    // 1. Initialize Three.js Scene
    const vw = video.videoWidth || 640;
    const vh = video.videoHeight || 480;
    const { renderer, camera, scene } = initScene(containerRef.current, vw, vh);
    sceneDataRef.current = { renderer, camera, scene };

    let rafId: number;
    let isComponentMounted = true;

    // 2. Dynamic Model Loading
    const catalogItem = GLASSES_CATALOG.find(g => g.id === selectedGlassesId);
    const modelPath = catalogItem?.modelPath || '/demo_vto_round_glasses.glb';

    loadGlasses(scene, modelPath).then(model => {
      if (!isComponentMounted) {
        scene.remove(model);
        return;
      }
      glassesRef.current = model;
      model.visible = false; 
      console.log(`3D Model loaded: ${modelPath}`);
    }).catch(err => {
      console.error("Failed to load 3D model:", err);
    });

    const render = () => {
      if (!isComponentMounted) return;
      const tracker = FaceTracker.getInstance();
      const { renderer, camera, scene } = sceneDataRef.current!;

      if (tracker.isFaceDetected && tracker.currentResult?.faceLandmarks?.[0] && glassesRef.current) {
        const landmarks = tracker.currentResult.faceLandmarks[0];
        const model = glassesRef.current;

        const vw = video.videoWidth;
        const vh = video.videoHeight;
        if (renderer.domElement.width !== vw || renderer.domElement.height !== vh) {
          renderer.setSize(vw, vh);
          camera.aspect = vw / vh;
          camera.updateProjectionMatrix();
        }

        model.visible = showGlasses;

        if (showGlasses) {
          updateGlassesTransform(model, landmarks, vw, vh, camera);

          const rawPos = model.position.clone();
          const rawScale = model.scale.x;
          const rawRotX = model.rotation.x;
          const rawRotY = model.rotation.y;
          const rawRotZ = model.rotation.z;

          model.position.copy(posSmooth.current.update(rawPos));
          model.scale.setScalar(scaleSmooth.current.update(rawScale * userScale));
          model.rotation.x = rotXSmooth.current.update(rawRotX);
          model.rotation.y = rotYSmooth.current.update(rawRotY);
          model.rotation.z = rotZSmooth.current.update(rawRotZ);
        }
      } else if (glassesRef.current) {
        glassesRef.current.visible = false;
      }

      renderer.render(scene, camera);
      rafId = requestAnimationFrame(render);
    };

    render();

    return () => {
      isComponentMounted = false;
      cancelAnimationFrame(rafId);
      if (sceneDataRef.current) {
        sceneDataRef.current.renderer.dispose();
        const canvas = document.getElementById("vto-canvas-3d");
        if (canvas) canvas.remove();
      }
      if (glassesRef.current) {
        scene.remove(glassesRef.current);
      }
    };
  }, [video, showGlasses, userScale, selectedGlassesId]);


  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 10
      }}
    />
  );
}

