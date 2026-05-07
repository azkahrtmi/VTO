import { useEffect, useRef, useState } from 'react';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { useAppStore } from '../store';
import { GLASSES_CATALOG } from '../catalog/glasses';

declare global {
  interface Window {
    MINDAR: any;
    THREE: any;
  }
}

export function MindARVTO() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { selectedGlassesId } = useAppStore();
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const mindarThreeRef = useRef<any>(null);

  const selectedGlasses = GLASSES_CATALOG.find(g => g.id === selectedGlassesId);

  useEffect(() => {
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

    return () => {
      active = false;
      if (checkInterval) clearTimeout(checkInterval);
      if (mindarThreeRef.current) {
        mindarThreeRef.current.stop();
        const renderer = mindarThreeRef.current.renderer;
        if (renderer) {
          renderer.setAnimationLoop(null);
          renderer.dispose();
        }
      }
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [selectedGlassesId]);

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 10 }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      
      {status === 'loading' && (
        <div style={{ 
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', 
          alignItems: 'center', justifyContent: 'center', background: 'rgba(15, 23, 42, 0.9)',
          color: '#fff', zIndex: 20, backdropFilter: 'blur(10px)'
        }}>
          <div style={{ 
            width: '40px', height: '40px', border: '4px solid rgba(255,255,255,0.1)', 
            borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' 
          }} />
          <h3 style={{ marginTop: '1.5rem', fontSize: '1.2rem' }}>Initializing AR Experience</h3>
          <p style={{ marginTop: '0.5rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
            Downloading face tracking modules...
          </p>
        </div>
      )}

      {status === 'error' && (
        <div style={{ 
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', 
          alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.9)',
          color: '#ff4444', zIndex: 30 
        }}>
          <p>Failed to load AR Engine.</p>
          <button onClick={() => window.location.reload()} style={{ marginTop: '1rem', padding: '10px 20px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px' }}>
            Retry
          </button>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .mindar-ui-overlay { display: none !important; }
        .mindar-ui-loading { display: none !important; }
        video { object-fit: cover !important; }
      `}} />
    </div>
  );
}
