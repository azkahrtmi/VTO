// @ts-nocheck
import { useEffect, useRef, useState } from 'react';
import * as deepar from 'deepar';
import { useAppStore } from '../store';
import { GLASSES_CATALOG } from '../catalog/glasses';

const LICENSE_KEY = import.meta.env.VITE_DEEPAR_LICENSE_KEY || '';

export const DeepARVTO = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const deepARRef = useRef<any>(null);
  const initializingRef = useRef(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { selectedGlassesId } = useAppStore();
  const selectedGlasses = GLASSES_CATALOG.find(g => g.id === selectedGlassesId);

  // Initialize DeepAR
  useEffect(() => {
    if (!containerRef.current || initializingRef.current) return;
    initializingRef.current = true;

    const initDeepAR = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Find default DeepAR effect to load
        const defaultEffect = selectedGlasses?.engine === 'deepar' 
          ? selectedGlasses.deeparEffect 
          : GLASSES_CATALOG.find(g => g.engine === 'deepar')?.deeparEffect;

        const instance = await deepar.initialize({
          licenseKey: LICENSE_KEY,
          previewElement: containerRef.current!,
          effect: defaultEffect || undefined,
          additionalOptions: {
            cameraConfig: {
              facingMode: 'user', // front camera
            },
          },
        });

        deepARRef.current = instance;
        setIsLoading(false);
      } catch (err: any) {
        console.error('DeepAR initialization error:', err);
        setError(err.message || 'Gagal menginisialisasi DeepAR');
        setIsLoading(false);
        initializingRef.current = false;
      }
    };

    initDeepAR();

    return () => {
      if (deepARRef.current) {
        try {
          deepARRef.current.shutdown();
        } catch (e) {
          console.warn('DeepAR shutdown warning:', e);
        }
        deepARRef.current = null;
      }
      initializingRef.current = false;
    };
  }, []);

  // Switch effect when selected glasses changes
  useEffect(() => {
    if (!deepARRef.current || !selectedGlasses) return;

    if (selectedGlasses.engine === 'deepar' && selectedGlasses.deeparEffect) {
      const switchEffect = async () => {
        try {
          await deepARRef.current.switchEffect(selectedGlasses.deeparEffect);
        } catch (err) {
          console.error('DeepAR switchEffect error:', err);
        }
      };
      switchEffect();
    }
  }, [selectedGlassesId, selectedGlasses]);

  return (
    <div className="deepar-wrapper">
      <div ref={containerRef} className="deepar-container" />

      {isLoading && (
        <div className="deepar-loading">
          <div className="deepar-spinner" />
          <p>Memuat DeepAR...</p>
        </div>
      )}

      {error && (
        <div className="deepar-error">
          <p>⚠️ {error}</p>
          <p className="deepar-error-hint">
            Pastikan License Key DeepAR sudah diset di file .env
          </p>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .deepar-wrapper {
          position: absolute;
          inset: 0;
          overflow: hidden;
          background: #000;
        }
        .deepar-container {
          width: 100%;
          height: 100%;
          position: relative;
        }
        .deepar-container canvas,
        .deepar-container video {
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
        }
        .deepar-loading {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: rgba(0,0,0,0.7);
          color: white;
          z-index: 10;
          gap: 12px;
        }
        .deepar-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(255,255,255,0.2);
          border-top-color: #8B5CF6;
          border-radius: 50%;
          animation: deepar-spin 0.8s linear infinite;
        }
        @keyframes deepar-spin {
          to { transform: rotate(360deg); }
        }
        .deepar-error {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: rgba(0,0,0,0.85);
          color: #ef4444;
          z-index: 10;
          padding: 24px;
          text-align: center;
        }
        .deepar-error-hint {
          color: #9ca3af;
          font-size: 0.85em;
          margin-top: 8px;
        }
      `}} />
    </div>
  );
};
