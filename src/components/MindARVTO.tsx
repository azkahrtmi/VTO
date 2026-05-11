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

  // FINAL FIX FOR HIGH DPI SCALING ISSUES (125%, 150%, etc)
  // A-Frame has a known bug where it multiplies canvas dimensions by window.devicePixelRatio
  // during its internal resize event. This breaks MindAR's projection matrix.
  // We fix this by intercepting the renderer's setPixelRatio method and forcing it to 1.
  useEffect(() => {
    const applyDPRFix = () => {
      if (sceneRef.current && sceneRef.current.renderer) {
        const renderer = sceneRef.current.renderer;
        
        // Only patch it once
        if (!renderer._isDprPatched) {
          const originalSetPixelRatio = renderer.setPixelRatio.bind(renderer);
          
          // Override the method to ALWAYS use 1, ignoring OS scaling
          renderer.setPixelRatio = function(ratio: number) {
            originalSetPixelRatio(1);
          };
          
          renderer._isDprPatched = true;
          
          // Force apply right now
          renderer.setPixelRatio(1);
          if (sceneRef.current.resize) sceneRef.current.resize();
        }
      }
    };

    // Apply fix repeatedly for the first few seconds to ensure it catches A-Frame's late init
    applyDPRFix();
    const interval = setInterval(applyDPRFix, 200);
    setTimeout(() => clearInterval(interval), 2000);

    // Also trigger MindAR resize on window resize
    const handleResize = () => {
      setTimeout(() => {
        if (sceneRef.current && sceneRef.current.systems) {
          const faceSystem = sceneRef.current.systems['mindar-face-system'];
          if (faceSystem && typeof faceSystem.resize === 'function') {
            faceSystem.resize();
          }
        }
      }, 300);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
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
        mindar-face="uiScanning: #scanning-overlay; uiError: yes; uiLoading: yes; filterMinCF: 0.1; filterBeta: 10; mirror: false" 
        embedded 
        color-space="sRGB" 
        renderer="colorManagement: true, physicallyCorrectLights, antialias: true, precision: high, devicePixelRatio: 1" 
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
              position={window.innerWidth < 768 ? "0.03 -0.04 0.02" : "0 -0.4 0.05"}  
              rotation="0 0 0" 
              scale="6 6 6" 
            ></a-gltf-model>
          </a-entity>
        )}
      </a-scene>

      <div id="scanning-overlay" style={{ display: 'none' }}></div>

      <style dangerouslySetInnerHTML={{ __html: `
        .mindar-container {
          position: absolute;
          inset: 0;
          overflow: hidden;
        }
        .mindar-container video, .mindar-container canvas { 
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          height: 100% !important;
          z-index: 1 !important; 
          margin: 0 !important;
          object-fit: cover !important;
        }
        .mindar-container .a-canvas {
          z-index: 2 !important;
        }
        .a-enter-vr { display: none !important; }
      `}} />
    </div>
  );
};
