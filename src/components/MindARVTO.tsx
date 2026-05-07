import React, { useEffect, useRef } from 'react';
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
            position="0 0 0" 
            rotation="0 0 0" 
            scale="6.8 6.8 6.8"
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
