// @ts-nocheck
import { useEffect, useRef } from 'react';
import { useAppStore } from '../store';
import { GLASSES_CATALOG } from '../catalog/glasses';
import './smooth-follow.js'; // Import custom smooth-tracking logic

export const MindARVTO = () => {
  const sceneRef = useRef<any>(null);
  const { selectedGlassesId } = useAppStore();
  const selectedGlasses = GLASSES_CATALOG.find(g => g.id === selectedGlassesId);
  const modelSrc = selectedGlasses?.sku;

  // Cleanup: stop MindAR on unmount
  useEffect(() => {
    const sceneEl = sceneRef.current;
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

  // Aggressively fix MindAR video z-index which defaults to -2
  useEffect(() => {
    const fixVideoInterval = setInterval(() => {
      const video = document.querySelector('video');
      if (video) {
        video.style.setProperty('z-index', '1', 'important');
      }
      const canvas = document.querySelector('.a-canvas') as HTMLElement;
      if (canvas) {
        canvas.style.setProperty('z-index', '2', 'important');
      }
    }, 500);

    return () => clearInterval(fixVideoInterval);
  }, []);

  return (
    <div className="mindar-container">
      <a-scene 
        ref={sceneRef} 
        mindar-face="uiScanning: #scanning-overlay; uiError: yes; uiLoading: yes; filterMinCF: 0.1; filterBeta: 10" 
        embedded 
        color-space="sRGB" 
        renderer="colorManagement: true, physicallyCorrectLights" 
        vr-mode-ui="enabled: false" 
        device-orientation-permission-ui="enabled: false"
      >
        <a-assets>
          <a-asset-item id="headModel" src="https://cdn.jsdelivr.net/gh/hiukim/mind-ar-js@1.2.2/examples/face-tracking/assets/sparkar/headOccluder.glb"></a-asset-item>
        </a-assets>

        <a-camera position="0 0 0" look-controls="enabled: false"></a-camera>

        {/* --- HEAD OCCLUDER --- */}
        <a-entity mindar-face-target="anchorIndex: 168">
          <a-gltf-model 
            mindar-face-occluder 
            src="#headModel" 
            position="0 -0.35 0.15"
            rotation="0 0 0" 
            scale="0.08 0.08 0.1"
          ></a-gltf-model>
        </a-entity>

        {/* --- INVISIBLE ANCHOR & SMOOTH FOLLOW KACAMATA --- */}
        <a-entity id="face-anchor" mindar-face-target="anchorIndex: 168" visible="false"></a-entity>
        
        {selectedGlasses && (
          <a-entity smooth-follow="target: #face-anchor; positionDeadZone: 0.0003; rotationDeadZone: 0.002; minAlpha: 0.05; maxAlpha: 0.8; velocityThreshold: 0.03">
            <a-gltf-model 
              key={modelSrc}
              src={modelSrc}
              position="0 0 -0.1"  
              rotation="0 0 0" 
              scale="6 6 6" 
            ></a-gltf-model>
          </a-entity>
        )}
      </a-scene>

      <div id="scanning-overlay" style={{ display: 'none' }}></div>

      <style dangerouslySetInnerHTML={{ __html: `
        .mindar-container video, .mindar-container canvas { 
          z-index: 1 !important; 
        }
        .mindar-container .a-canvas {
          z-index: 2 !important;
        }
      `}} />
    </div>
  );
};
