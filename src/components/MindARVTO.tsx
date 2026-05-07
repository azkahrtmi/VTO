<<<<<<< HEAD
import React, { useEffect, useRef } from 'react';
=======
import { useEffect, useRef, useState } from 'react';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
>>>>>>> 79fcda1b626c3f66d9f9f589a9d6d6be4d66014a
import { useAppStore } from '../store';
import { GLASSES_CATALOG } from '../catalog/glasses';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'a-scene': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { [key: string]: any };
      'a-assets': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { [key: string]: any };
      'a-asset-item': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { [key: string]: any };
      'a-camera': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { [key: string]: any };
      'a-entity': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { [key: string]: any };
      'a-gltf-model': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { [key: string]: any };
    }
  }
}

export const MindARVTO = () => {
  const sceneRef = useRef<any>(null);
  const { selectedGlassesId } = useAppStore();
  const selectedGlasses = GLASSES_CATALOG.find(g => g.id === selectedGlassesId);
  const modelSrc = selectedGlasses?.sku || '/demo_vto_round_glasses.glb';

  useEffect(() => {
<<<<<<< HEAD
    const sceneEl = sceneRef.current;
=======
    let active = true;
    let checkInterval: any;

    const startAR = async () => {
      // 1. Check if MINDAR is loaded
      if (!window.MINDAR || !window.MINDAR.FACE) {
        console.log("MindAR: Waiting for library to load...");
        checkInterval = setTimeout(startAR, 500); // Retry in 500ms
        return;
      }

      if (!containerRef.current || !selectedGlasses) return;

      try {
        // 2. Initialize MindAR Face
        const mindarThree = new window.MINDAR.FACE.MindARThree({
          container: containerRef.current!
        });
        const { renderer, scene, camera } = mindarThree;
        mindarThreeRef.current = mindarThree;

        // 3. Add Lighting
        const anchor = mindarThree.addAnchor(168); // Nose bridge anchor
        const light = new window.THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
        scene.add(light);
        const dirLight = new window.THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(5, 5, 5);
        scene.add(dirLight);

        // 4. Load Model
        const loader = new GLTFLoader();
        loader.load(selectedGlasses.sku, (gltf: { scene: any }) => {
          if (!active) return;
          const model = gltf.scene;

          // Normalize model size for AR
          const box = new window.THREE.Box3().setFromObject(model);
          const size = new window.THREE.Vector3();
          box.getSize(size);
          const scaleMult = 1 / (size.x || 1); 
          model.scale.set(scaleMult * 0.6, scaleMult * 0.6, scaleMult * 0.6); 
          
          const center = new window.THREE.Vector3();
          box.getCenter(center);
          model.position.set(-center.x * model.scale.x, -center.y * model.scale.y, -center.z * model.scale.z);

          anchor.group.add(model);
          setStatus('ready');
        });

        // 5. Start Engine
        await mindarThree.start();
        renderer.setAnimationLoop(() => {
          renderer.render(scene, camera);
        });
      } catch (err) {
        console.error("MindAR: Error during start:", err);
        if (active) setStatus('error');
      }
    };

    startAR();

>>>>>>> 79fcda1b626c3f66d9f9f589a9d6d6be4d66014a
    return () => {
      if (sceneEl && sceneEl.systems) {
        const arSystem = sceneEl.systems['mindar-face-system'];
        if (arSystem && typeof arSystem.stop === 'function') {
          try {
            arSystem.stop();
          } catch (e) {
            console.warn("MindAR stop warning:", e);
          }
        }
      }
    };
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1, overflow: 'hidden', background: '#000' }}>
      <a-scene 
        ref={sceneRef} 
        mindar-face="uiScanning: #scanning-overlay; uiError: yes; uiLoading: yes" 
        embedded 
        color-space="sRGB" 
        renderer="colorManagement: true, physicallyCorrectLights" 
        vr-mode-ui="enabled: false" 
        device-orientation-permission-ui="enabled: false"
      >
        <a-assets>
          <a-asset-item id="headModel" src="https://cdn.jsdelivr.net/gh/hiukim/mind-ar-js@1.2.2/examples/face-tracking/assets/sparkar/headOccluder.glb"></a-asset-item>
        </a-assets>

        <a-camera active="false" position="0 0 0" look-controls="enabled: false"></a-camera>

        {/* --- HEAD OCCLUDER (Topeng Gaib) --- */}
        <a-entity mindar-face-target="anchorIndex: 168">
          <a-gltf-model 
            mindar-face-occluder 
            src="#headModel" 
            position="0 -0.3 -0.1" 
            rotation="0 0 0" 
            scale="0.08 0.08 0.08"
          ></a-gltf-model>
        </a-entity>

        {/* --- KACAMATA --- */}
        <a-entity mindar-face-target="anchorIndex: 168">
          <a-gltf-model 
            key={modelSrc}
            src={modelSrc}
            position="0 -0.02 0.05" 
            rotation="10 0 0" 
            scale="0.007 0.007 0.007"
          ></a-gltf-model>
        </a-entity>
      </a-scene>

      <div id="scanning-overlay" style={{ display: 'none' }}></div>

      <style dangerouslySetInnerHTML={{ __html: `
        .mindar-ui-overlay { display: none !important; }
        video { pointer-events: none; }
      `}} />
    </div>
  );
};
