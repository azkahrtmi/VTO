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

  // Customization States
  const [size, setSize] = useState<'Medium' | 'Large'>('Medium');
  const [pdScale, setPdScale] = useState(1.0);

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
          // Reset customization when switching glasses
          setSize('Medium');
          setPdScale(1.0);
        } catch (err) {
          console.error('DeepAR switchEffect error:', err);
        }
      };
      switchEffect();
    }
  }, [selectedGlassesId, selectedGlasses]);

  // Handlers for DeepAR Control
  const handleFrameColor = async (r: number, g: number, b: number) => {
    if (!deepARRef.current) return;
    try {
      await deepARRef.current.changeParameterVector('Plastic', 'MeshRenderer', 'u_color', r, g, b, 1.0);
    } catch (e) {
      console.error('Error changing frame color', e);
    }
  };

  const handleLensColor = async (r: number, g: number, b: number, a: number) => {
    if (!deepARRef.current) return;
    try {
      await deepARRef.current.changeParameterVector('LensesMultiply', 'MeshRenderer', 'u_color', r, g, b, a);
      await deepARRef.current.changeParameterVector('LensesAdd', 'MeshRenderer', 'u_color', r, g, b, a);
    } catch (e) {
      console.error('Error changing lens color', e);
    }
  };

  const updateScale = async (currentSize: 'Medium' | 'Large', currentPd: number) => {
    if (!deepARRef.current) return;
    const baseScale = currentSize === 'Large' ? 1.1 : 1.0;
    try {
      // Scale X depends on PD, while Y and Z remain proportional to the base size
      await deepARRef.current.changeParameterVector('RayBanLow', '', 'scale', baseScale * currentPd, baseScale, baseScale, 0);
    } catch (e) {
      console.error('Error changing node scale', e);
    }
  };

  const handleSizeChange = (newSize: 'Medium' | 'Large') => {
    setSize(newSize);
    updateScale(newSize, pdScale);
  };

  const handlePdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPd = parseFloat(e.target.value);
    setPdScale(newPd);
    updateScale(size, newPd);
  };

  return (
    <div className="deepar-wrapper">
      <div ref={containerRef} className="deepar-container" />

      {/* UI Controls Overlay */}
      {!isLoading && !error && (
        <div className="deepar-controls-overlay">
          
          <div className="control-group">
            <span className="control-label">Frame Color:</span>
            <div className="color-buttons">
              <button onClick={() => handleFrameColor(0, 0, 0)} className="color-btn" style={{ background: '#000' }} />
              <button onClick={() => handleFrameColor(0.8, 0.1, 0.1)} className="color-btn" style={{ background: '#cc1919' }} />
              <button onClick={() => handleFrameColor(0.1, 0.3, 0.8)} className="color-btn" style={{ background: '#194ccc' }} />
              <button onClick={() => handleFrameColor(0.8, 0.8, 0.8)} className="color-btn" style={{ background: '#ccc' }} />
            </div>
          </div>

          <div className="control-group">
            <span className="control-label">Lens Color:</span>
            <div className="color-buttons">
              <button onClick={() => handleLensColor(0, 0, 0, 0.6)} className="color-btn" style={{ background: 'rgba(0,0,0,0.6)' }} />
              <button onClick={() => handleLensColor(0.8, 0.8, 0.1, 0.4)} className="color-btn" style={{ background: 'rgba(204,204,25,0.4)' }} />
              <button onClick={() => handleLensColor(0.1, 0.5, 0.8, 0.4)} className="color-btn" style={{ background: 'rgba(25,127,204,0.4)' }} />
              <button onClick={() => handleLensColor(1, 1, 1, 0.1)} className="color-btn" style={{ background: 'rgba(255,255,255,0.8)' }}>Clear</button>
            </div>
          </div>

          <div className="control-group">
            <span className="control-label">Size:</span>
            <div className="radio-group">
              <label>
                <input 
                  type="radio" 
                  checked={size === 'Medium'} 
                  onChange={() => handleSizeChange('Medium')} 
                /> Medium
              </label>
              <label>
                <input 
                  type="radio" 
                  checked={size === 'Large'} 
                  onChange={() => handleSizeChange('Large')} 
                /> Large
              </label>
            </div>
          </div>

          <div className="control-group">
            <span className="control-label">PD (Pupillary Distance): {pdScale.toFixed(2)}x</span>
            <input 
              type="range" 
              min="0.8" 
              max="1.2" 
              step="0.05" 
              value={pdScale} 
              onChange={handlePdChange}
              className="pd-slider"
            />
          </div>

        </div>
      )}

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
        
        /* UI Controls Customization */
        .deepar-controls-overlay {
          position: absolute;
          top: 20px;
          right: 20px;
          background: rgba(15, 23, 42, 0.85);
          backdrop-filter: blur(8px);
          padding: 16px;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          z-index: 20;
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 280px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        }
        .control-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .control-label {
          font-size: 0.85rem;
          color: #cbd5e1;
          font-weight: 500;
        }
        .color-buttons {
          display: flex;
          gap: 8px;
        }
        .color-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.8);
          cursor: pointer;
          transition: transform 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.6rem;
          color: black;
          font-weight: bold;
        }
        .color-btn:hover {
          transform: scale(1.1);
        }
        .radio-group {
          display: flex;
          gap: 16px;
          font-size: 0.9rem;
        }
        .radio-group label {
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
        }
        .pd-slider {
          width: 100%;
          accent-color: #8b5cf6;
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
