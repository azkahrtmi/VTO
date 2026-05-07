import { useEffect, useRef } from 'react';

import { useAppStore } from '../store';
import { GLASSES_CATALOG } from '../catalog/glasses';
// @ts-ignore
import { JEELIZVTOWIDGET } from '../vendor/JeelizVTOWidget.module.js';


export function JeelizVTO() {
  const refPlaceHolder = useRef<HTMLDivElement>(null);
  const refCanvas = useRef<HTMLCanvasElement>(null);
  const isReady = useRef(false);
  const { selectedGlassesId, isAdjustMode } = useAppStore();

  useEffect(() => {
    if (!refPlaceHolder.current || !refCanvas.current) return;

    // Check for zero size before starting
    const { width, height } = refPlaceHolder.current.getBoundingClientRect();
    if (width === 0 || height === 0) {
      // Retry in 100ms if layout isn't ready
      const timer = setTimeout(() => {
        window.location.reload(); // Hard refresh to ensure layout and WebGL context
      }, 100);
      return () => clearTimeout(timer);
    }

    JEELIZVTOWIDGET.start({
      placeHolder: refPlaceHolder.current,
      canvas: refCanvas.current,
      callbacks: {
        LOADING_START: () => console.log('Jeeliz Loading Start'),
        LOADING_END: () => console.log('Jeeliz Loading End'),
        ADJUST_START: () => console.log('Jeeliz Adjust Start'),
        ADJUST_END: () => console.log('Jeeliz Adjust End'),
      },
      sku: 'empty', 
      // Do not provide searchImageMask to try and disable it
      searchImageColor: 0x000000, 
      searchImageRotationSpeed: 0,
      callbackReady: () => {
        console.log('JEELIZVTOWIDGET is ready');
        isReady.current = true;
        
        // Load initial model after a short delay to ensure stability
        setTimeout(() => {
          const item = GLASSES_CATALOG.find(g => g.id === selectedGlassesId);
          if (item && item.sku !== 'empty') {
            JEELIZVTOWIDGET.load(item.sku);
          }
        }, 500);
      },
      onError: (errorLabel: string) => {
        console.error('Jeeliz Error:', errorLabel);
      }
    });


    return () => {
      isReady.current = false;
      try {
        // Disable resize sensor before destroying
        JEELIZVTOWIDGET.toggle_resizeSensor(false);
        JEELIZVTOWIDGET.destroy();
      } catch (e) {
        console.warn('Jeeliz Destroy Error:', e);
      }
    };
  }, []);

  // Handle model switching
  useEffect(() => {
    if (!isReady.current) return;
    const item = GLASSES_CATALOG.find(g => g.id === selectedGlassesId);
    if (item) {
      JEELIZVTOWIDGET.load(item.sku);
    }
  }, [selectedGlassesId]);

  // Handle Adjust Mode
  const wasAdjustMode = useRef(false);
  useEffect(() => {
    if (!isReady.current) return;
    try {
      if (isAdjustMode) {
        JEELIZVTOWIDGET.enter_adjustMode();
        wasAdjustMode.current = true;
      } else if (wasAdjustMode.current) {
        JEELIZVTOWIDGET.exit_adjustMode();
        wasAdjustMode.current = false;
      }
    } catch (e) {
      console.warn('Jeeliz Adjust Mode Error:', e);
    }
  }, [isAdjustMode]);




  return (
    <div 
      ref={refPlaceHolder} 
      className="JeelizVTOWidget"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 10
      }}
    >
      <canvas 
        ref={refCanvas} 
        className="JeelizVTOWidgetCanvas"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
      />
    </div>
  );
}
