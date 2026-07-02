// @ts-nocheck
import { useEffect, useRef, useState } from "react";
import * as deepar from "deepar";
import { useAppStore } from "../store";
import { DEFAULT_NODE_MAPPING } from "../types/glasses";
import type { GlassesSize, NodeMapping } from "../types/glasses";
import { PDMeasure } from "./pd/PDMeasure";

const LICENSE_KEY = import.meta.env.VITE_DEEPAR_LICENSE_KEY || "";

const FRAME_COLORS = [
  { hex: '#000',    r: 0,   g: 0,   b: 0,   label: 'Hitam' },
  { hex: '#cc1919', r: 0.8, g: 0.1, b: 0.1, label: 'Merah' },
  { hex: '#194ccc', r: 0.1, g: 0.3, b: 0.8, label: 'Biru'  },
  { hex: '#ccc',    r: 0.8, g: 0.8, b: 0.8, label: 'Perak' },
] as const;

const LENS_COLORS = [
  { id: 'rgba(0,0,0,0.6)',        bg: '#111',                    r: 0,   g: 0,   b: 0,   a: 0.6, label: 'Gelap'  },
  { id: 'rgba(204,204,25,0.4)',   bg: '#cccc19',                 r: 0.8, g: 0.8, b: 0.1, a: 0.4, label: 'Kuning' },
  { id: 'rgba(25,127,204,0.4)',   bg: '#197fcc',                 r: 0.1, g: 0.5, b: 0.8, a: 0.4, label: 'Biru'   },
  { id: 'rgba(255,255,255,0.8)',  bg: 'rgba(200,220,255,0.2)',   r: 1,   g: 1,   b: 1,   a: 0.1, label: 'Bening' },
] as const;

export const DeepARVTO = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const deepARRef = useRef<any>(null);
  const initializingRef = useRef(false);
  const prevGlassesIdRef = useRef<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Customization States
  const [activeFrameColor, setActiveFrameColor] = useState<string | null>(null);
  const [activeLensColor, setActiveLensColor] = useState<string | null>(null);
  const [activeSizeId, setActiveSizeId] = useState<string | null>(null);
  const [isPDCheckerOpen, setIsPDCheckerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'frame' | 'size' | 'lens'>('frame');

  const { selectedGlassesId, setSelectedGlassesId, glassesCatalog, pdResultMm } = useAppStore();
  const selectedGlasses = glassesCatalog.find(
    (g) => g.id === selectedGlassesId,
  );

  // Pilih varian ukuran aktif (jika model punya beberapa ukuran)
  const getSizeVariant = (
    glasses?: typeof selectedGlasses,
    sizeId?: string | null,
  ): GlassesSize | undefined => {
    if (!glasses?.sizes || glasses.sizes.length === 0) return undefined;
    return glasses.sizes.find((s) => s.id === sizeId) || glasses.sizes[0];
  };

  const activeSizeVariant = getSizeVariant(selectedGlasses, activeSizeId);

  // Resolve node mapping: varian ukuran > model > default
  const nodeMapping: NodeMapping =
    activeSizeVariant?.nodeMapping ||
    selectedGlasses?.nodeMapping ||
    DEFAULT_NODE_MAPPING;

  // Spesifikasi ukuran fisik frame: varian ukuran > model
  const frameLensWidthMm =
    activeSizeVariant?.lensWidthMm ?? selectedGlasses?.lensWidthMm;
  const frameBridgeMm =
    activeSizeVariant?.bridgeMm ?? selectedGlasses?.bridgeMm;
  const frameTempleMm =
    activeSizeVariant?.templeMm ?? selectedGlasses?.templeMm;
  const frameWidthMm =
    activeSizeVariant?.frameWidthMm ?? selectedGlasses?.frameWidthMm;

  // Initialize DeepAR
  useEffect(() => {
    if (!containerRef.current || initializingRef.current) return;
    initializingRef.current = true;

    const initDeepAR = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Find default DeepAR effect to load
        const defaultEffect = selectedGlasses?.deeparEffect
          ? selectedGlasses.deeparEffect
          : glassesCatalog.find((g) => g.deeparEffect)?.deeparEffect;

        const instance = await deepar.initialize({
          licenseKey: LICENSE_KEY,
          previewElement: containerRef.current!,
          additionalOptions: {
            cameraConfig: {
              facingMode: "user", // front camera
            },
            numberOfFaces: 4, // Enable multiple face tracking (max 4 faces)
          },
        });

        deepARRef.current = instance;
        setIsLoading(false);
      } catch (err: any) {
        console.error("DeepAR initialization error:", err);
        setError(err.message || "Gagal menginisialisasi DeepAR");
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
          console.warn("DeepAR shutdown warning:", e);
        }
        deepARRef.current = null;
      }
      initializingRef.current = false;
    };
  }, []);

  // Switch effect when selected glasses (or its size variant) changes
  useEffect(() => {
    if (!deepARRef.current || !selectedGlasses) return;

    // Saat ganti model, reset ke ukuran pertama yang tersedia
    let sizeId = activeSizeId;
    if (prevGlassesIdRef.current !== selectedGlassesId) {
      sizeId = selectedGlasses.sizes?.[0]?.id ?? null;
      setActiveSizeId(sizeId);
      prevGlassesIdRef.current = selectedGlassesId;
    }

    const sizeVariant = getSizeVariant(selectedGlasses, sizeId);
    const effect = sizeVariant?.deeparEffect || selectedGlasses.deeparEffect;
    const mapping =
      sizeVariant?.nodeMapping || selectedGlasses.nodeMapping || DEFAULT_NODE_MAPPING;

    if (!effect) return;

    const switchEffect = async () => {
      try {
        // Load the effect for up to 4 faces
        const promises = [];
        for (let i = 0; i < 4; i++) {
          promises.push(
            deepARRef.current.switchEffect(effect, {
              slot: `glasses_face_${i}`,
              face: i,
            }),
          );
        }
        await Promise.all(promises);

        // Tampilkan frame pada ukuran asli (sesuai baseScale model)
        await applyBaseScale(mapping);

        // Reset customization when switching glasses/size
        setActiveFrameColor(null);
        setActiveLensColor(null);
      } catch (err) {
        console.error("DeepAR switchEffect error:", err);
      }
    };
    switchEffect();
  }, [selectedGlassesId, selectedGlasses, activeSizeId]);

  // Handlers for DeepAR Control
  const handleFrameColor = async (
    r: number,
    g: number,
    b: number,
    hex: string,
  ) => {
    setActiveFrameColor(hex);
    if (!deepARRef.current) return;
    try {
      await deepARRef.current.changeParameterVector(
        nodeMapping.frame,
        "MeshRenderer",
        "u_color",
        r,
        g,
        b,
        1.0,
      );
      await deepARRef.current.changeParameterVector(
        nodeMapping.frame,
        "MeshRenderer",
        "u_baseColorFactor",
        r,
        g,
        b,
        1.0,
      );
      await deepARRef.current.changeParameterVector(
        nodeMapping.frame,
        "MeshRenderer",
        "u_diffuseColor",
        r,
        g,
        b,
        1.0,
      );
    } catch (e) {
      console.error(
        `Error changing frame color (node: ${nodeMapping.frame})`,
        e,
      );
    }
  };

  const handleLensColor = async (
    r: number,
    g: number,
    b: number,
    a: number,
    id: string,
  ) => {
    setActiveLensColor(id);
    if (!deepARRef.current) return;
    try {
      await deepARRef.current.changeParameterVector(
        nodeMapping.lensInner,
        "MeshRenderer",
        "u_color",
        r,
        g,
        b,
        a,
      );
      await deepARRef.current.changeParameterVector(
        nodeMapping.lensInner,
        "MeshRenderer",
        "u_baseColorFactor",
        r,
        g,
        b,
        a,
      );
      await deepARRef.current.changeParameterVector(
        nodeMapping.lensInner,
        "MeshRenderer",
        "u_diffuseColor",
        r,
        g,
        b,
        a,
      );
      // Only call lensOuter if it's a different node (some models use same mesh for both)
      if (nodeMapping.lensOuter !== nodeMapping.lensInner) {
        await deepARRef.current.changeParameterVector(
          nodeMapping.lensOuter,
          "MeshRenderer",
          "u_color",
          r,
          g,
          b,
          a,
        );
        await deepARRef.current.changeParameterVector(
          nodeMapping.lensOuter,
          "MeshRenderer",
          "u_baseColorFactor",
          r,
          g,
          b,
          a,
        );
        await deepARRef.current.changeParameterVector(
          nodeMapping.lensOuter,
          "MeshRenderer",
          "u_diffuseColor",
          r,
          g,
          b,
          a,
        );
      }
    } catch (e) {
      console.error(
        `Error changing lens color (nodes: ${nodeMapping.lensInner}, ${nodeMapping.lensOuter})`,
        e,
      );
    }
  };

  // Terapkan ukuran asli frame (sesuai baseScale model), tanpa adjustment PD
  const applyBaseScale = async (mapping: NodeMapping) => {
    if (!deepARRef.current) return;
    const baseScale = mapping.baseScale || 1.0;
    try {
      await deepARRef.current.changeParameterVector(
        mapping.rootNode,
        "",
        "scale",
        baseScale,
        baseScale,
        baseScale,
        0,
      );
    } catch (e) {
      console.error(`Error setting base scale (node: ${mapping.rootNode})`, e);
    }
  };

  const handleSizeSelect = (sizeId: string) => {
    if (sizeId === activeSizeId) return;
    setActiveSizeId(sizeId);
  };

  const handleReset = async () => {
    const effect = activeSizeVariant?.deeparEffect || selectedGlasses?.deeparEffect;
    if (!deepARRef.current || !effect) return;
    try {
      // Switch to the same effect to reset all parameters to default
      await deepARRef.current.switchEffect(effect);
      await applyBaseScale(nodeMapping);
      setActiveFrameColor(null);
      setActiveLensColor(null);
    } catch (e) {
      console.error("Error resetting effect", e);
    }
  };

  return (
    <div className="deepar-wrapper">
      {/* Camera Feed */}
      <div className="deepar-camera-area">
        <div ref={containerRef} className="deepar-container" />

        {isLoading && (
          <div className="deepar-loading">
            <div className="deepar-spinner" />
            <p>Memuat kamera...</p>
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
      </div>

      {/* Controls Panel */}
      {!isLoading && !error && (
        <div className="deepar-panel">
          {/* Glasses Selector */}
          <div className="panel-glasses">
            <p className="panel-label">Model Kacamata</p>
            <div className="glasses-chips">
              {glassesCatalog.map((item) => (
                <button
                  key={item.id}
                  className={`glasses-chip ${selectedGlassesId === item.id ? 'active' : ''}`}
                  onClick={() => setSelectedGlassesId(item.id)}
                >
                  <span className="glasses-chip-dot" style={{ background: item.color }} />
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          {/* Frame Specs */}
          {(frameLensWidthMm || frameWidthMm) && (
            <div className="panel-specs">
              {frameLensWidthMm && frameBridgeMm && (
                <span className="spec-badge spec-badge--primary">
                  {frameLensWidthMm}&#9633;{frameBridgeMm}
                  {frameTempleMm ? `-${frameTempleMm}` : ''} mm
                </span>
              )}
              {frameWidthMm && (
                <span className="spec-badge">Lebar {frameWidthMm} mm</span>
              )}
            </div>
          )}

          <div className="panel-divider" />

          {/* Mobile Tabs */}
          <div className="panel-tabs">
            <button
              className={`panel-tab ${activeTab === 'frame' ? 'active' : ''}`}
              onClick={() => setActiveTab('frame')}
            >Warna Frame</button>
            {selectedGlasses?.sizes && selectedGlasses.sizes.length > 1 && (
              <button
                className={`panel-tab ${activeTab === 'size' ? 'active' : ''}`}
                onClick={() => setActiveTab('size')}
              >Ukuran</button>
            )}
            <button
              className={`panel-tab ${activeTab === 'lens' ? 'active' : ''}`}
              onClick={() => setActiveTab('lens')}
            >Warna Lensa</button>
          </div>

          {/* Frame Color */}
          <div className={`panel-section panel-section--tab ${activeTab === 'frame' ? 'tab-active' : ''}`}>
            <p className="panel-label">Warna Frame</p>
            <div className="swatch-row">
              {FRAME_COLORS.map(({ hex, r, g, b, label }) => (
                <button
                  key={hex}
                  className={`swatch ${activeFrameColor === hex ? 'active' : ''}`}
                  style={{ background: hex }}
                  title={label}
                  onClick={() => handleFrameColor(r, g, b, hex)}
                />
              ))}
            </div>
          </div>

          {/* Size */}
          {selectedGlasses?.sizes && selectedGlasses.sizes.length > 1 && (
            <div className={`panel-section panel-section--tab ${activeTab === 'size' ? 'tab-active' : ''}`}>
              <p className="panel-label">Ukuran</p>
              <div className="size-row">
                {selectedGlasses.sizes.map((size) => (
                  <button
                    key={size.id}
                    className={`size-btn ${activeSizeId === size.id ? 'active' : ''}`}
                    onClick={() => handleSizeSelect(size.id)}
                  >
                    {size.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Lens Color */}
          <div className={`panel-section panel-section--tab ${activeTab === 'lens' ? 'tab-active' : ''}`}>
            <p className="panel-label">Warna Lensa</p>
            <div className="swatch-row">
              {LENS_COLORS.map(({ id, bg, r, g, b, a, label }) => (
                <button
                  key={id}
                  className={`swatch ${activeLensColor === id ? 'active' : ''}`}
                  style={{ background: bg }}
                  title={label}
                  onClick={() => handleLensColor(r, g, b, a, id)}
                />
              ))}
            </div>
          </div>

          <div className="panel-divider" />

          {/* Actions */}
          <div className="panel-actions">
            {pdResultMm !== null && (
              <p className="pd-saved">
                PD tersimpan: <strong>{pdResultMm.toFixed(1)} mm</strong>
                <span className="pd-saved-note"> (estimasi)</span>
              </p>
            )}
            <button className="pd-btn" onClick={() => setIsPDCheckerOpen(true)}>
              {pdResultMm !== null ? 'Ukur Ulang PD' : 'Ukur PD dengan Kamera'}
            </button>
            <button className="reset-btn-action" onClick={handleReset}>
              Reset
            </button>
          </div>
        </div>
      )}

      {isPDCheckerOpen && (
        <PDMeasure onClose={() => setIsPDCheckerOpen(false)} />
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        /* ── Wrapper ── */
        .deepar-wrapper {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: row;
          background: #0d1210;
          color: #f7f1e8;
        }

        /* ── Camera area ── */
        .deepar-camera-area {
          flex: 1;
          position: relative;
          min-width: 0;
          min-height: 0;
          background: #0d1210;
          overflow: hidden;
        }
        .deepar-container {
          position: absolute;
          inset: 0;
        }
        .deepar-container canvas,
        .deepar-container video {
          position: absolute !important;
          top: 0 !important; left: 0 !important;
          width: 100% !important; height: 100% !important;
          object-fit: cover !important;
        }

        /* ── Panel ── */
        .deepar-panel {
          width: 360px;
          flex-shrink: 0;
          background: #1d2427;
          border-left: 1px solid rgba(255,255,255,0.05);
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          overflow-x: hidden;
          scrollbar-width: thin;
          scrollbar-color: rgba(247,241,232,0.08) transparent;
        }

        /* ── Glasses selector ── */
        .panel-glasses { padding: 20px 20px 14px; }
        .panel-label {
          margin: 0 0 10px;
          font-size: 0.68rem;
          color: rgba(247,241,232,0.35);
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.09em;
        }
        .glasses-chips {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .glasses-chip {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 14px;
          border-radius: 10px;
          border: 1px solid rgba(247,241,232,0.07);
          background: rgba(247,241,232,0.02);
          color: rgba(247,241,232,0.4);
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
          text-align: left;
          width: 100%;
        }
        .glasses-chip:hover {
          background: rgba(247,241,232,0.06);
          color: rgba(247,241,232,0.75);
          border-color: rgba(247,241,232,0.12);
        }
        .glasses-chip.active {
          background: rgba(8,77,38,0.2);
          border-color: rgba(8,77,38,0.55);
          color: #a3d9b5;
        }
        .glasses-chip-dot {
          width: 20px; height: 20px;
          border-radius: 50%;
          border: 2px solid rgba(247,241,232,0.15);
          flex-shrink: 0;
        }

        /* ── Frame specs ── */
        .panel-specs {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          padding: 0 20px 14px;
        }
        .spec-badge {
          background: rgba(247,241,232,0.04);
          border: 1px solid rgba(247,241,232,0.08);
          color: rgba(247,241,232,0.35);
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 0.73rem;
          font-variant-numeric: tabular-nums;
        }
        .spec-badge--primary { color: rgba(247,241,232,0.65); font-weight: 600; }

        /* ── Divider ── */
        .panel-divider {
          height: 1px;
          background: rgba(247,241,232,0.05);
          flex-shrink: 0;
        }

        /* ── Mobile tabs (hidden on desktop) ── */
        .panel-tabs { display: none; }
        .panel-tab {
          flex: 1;
          padding: 11px 4px;
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          color: rgba(247,241,232,0.3);
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s;
        }
        .panel-tab.active {
          color: #a3d9b5;
          border-bottom-color: #084D26;
        }

        /* ── Sections ── */
        .panel-section { padding: 18px 20px 14px; }
        .panel-section--tab { display: flex; flex-direction: column; }

        /* ── Color swatches ── */
        .swatch-row {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 10px;
        }
        .swatch {
          width: 38px; height: 38px;
          border-radius: 50%;
          border: 2.5px solid rgba(247,241,232,0.12);
          cursor: pointer;
          transition: all 0.15s;
          box-shadow: 0 2px 6px rgba(0,0,0,0.35);
        }
        .swatch:hover { transform: scale(1.12); border-color: rgba(247,241,232,0.3); }
        .swatch.active {
          border-color: #f7f1e8;
          transform: scale(1.12);
          box-shadow: 0 0 0 2.5px #26b7cd, 0 4px 12px rgba(0,0,0,0.4);
        }

        /* ── Size buttons ── */
        .size-row {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 10px;
        }
        .size-btn {
          background: rgba(247,241,232,0.04);
          border: 1px solid rgba(247,241,232,0.1);
          color: rgba(247,241,232,0.4);
          padding: 8px 20px;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s;
        }
        .size-btn:hover { border-color: rgba(38,183,205,0.4); color: #f7f1e8; }
        .size-btn.active {
          background: rgba(8,77,38,0.2);
          border-color: #084D26;
          color: #a3d9b5;
        }

        /* ── Action buttons ── */
        .panel-actions {
          padding: 16px 20px 24px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: auto;
        }
        .pd-saved {
          margin: 0;
          width: 100%;
          padding: 8px 12px;
          border-radius: 9px;
          background: rgba(38,183,205,0.08);
          border: 1px solid rgba(38,183,205,0.25);
          color: #7dd7e8;
          font-size: 0.78rem;
          text-align: center;
        }
        .pd-saved-note { color: rgba(125,215,232,0.55); font-size: 0.7rem; }
        .pd-btn {
          width: 100%;
          background: #084D26;
          border: 1px solid rgba(8,77,38,0.6);
          color: #f7f1e8;
          padding: 11px 12px;
          border-radius: 10px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .pd-btn:hover { background: #0a5c2e; box-shadow: 0 4px 14px rgba(8,77,38,0.4); }
        .pd-btn:active { transform: scale(0.98); }
        .reset-btn-action {
          width: 100%;
          background: rgba(247,241,232,0.03);
          border: 1px solid rgba(247,241,232,0.08);
          color: rgba(247,241,232,0.3);
          padding: 9px 12px;
          border-radius: 10px;
          font-size: 0.78rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        .reset-btn-action:hover {
          background: rgba(247,241,232,0.06);
          border-color: rgba(247,241,232,0.15);
          color: rgba(247,241,232,0.6);
        }

        /* ── Loading / Error ── */
        .deepar-loading {
          position: absolute; inset: 0;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          background: rgba(13,18,16,0.8);
          color: #f7f1e8; z-index: 10; gap: 12px;
        }
        .deepar-spinner {
          width: 40px; height: 40px;
          border: 3px solid rgba(247,241,232,0.12);
          border-top-color: #26b7cd;
          border-radius: 50%;
          animation: deepar-spin 0.8s linear infinite;
        }
        @keyframes deepar-spin { to { transform: rotate(360deg); } }
        .deepar-error {
          position: absolute; inset: 0;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          background: rgba(13,18,16,0.9);
          color: #ef4444; z-index: 10;
          padding: 24px; text-align: center;
        }
        .deepar-error-hint { color: rgba(247,241,232,0.4); font-size: 0.85em; margin-top: 8px; }

        /* ── Mobile ── */
        @media (max-width: 768px) {
          .deepar-wrapper { flex-direction: column; }
          .deepar-camera-area { height: 56vw; min-height: 260px; max-height: 55vh; flex: none; }
          .deepar-panel {
            width: 100%; flex: 1;
            border-left: none;
            border-top: 1px solid rgba(247,241,232,0.06);
          }
          .panel-glasses { padding: 12px 16px 10px; }
          .glasses-chips {
            flex-direction: row;
            overflow-x: auto; flex-wrap: nowrap;
            padding-bottom: 4px; scrollbar-width: none;
          }
          .glasses-chips::-webkit-scrollbar { display: none; }
          .glasses-chip { flex-shrink: 0; padding: 7px 12px; font-size: 0.78rem; }
          .panel-specs { padding: 0 16px 10px; }
          .panel-tabs { display: flex; border-bottom: 1px solid rgba(247,241,232,0.06); }
          .panel-section--tab { display: none; }
          .panel-section--tab.tab-active { display: flex; }
          .panel-section { padding: 14px 16px 12px; }
          .panel-actions {
            padding: 12px 16px 20px;
            flex-direction: row; flex-wrap: wrap; gap: 8px;
          }
          .pd-saved { flex-basis: 100%; }
          .pd-btn { flex: 1; }
          .reset-btn-action { flex: 0 0 auto; width: auto; padding: 9px 16px; }
        }
      ` }} />
    </div>
  );
};
