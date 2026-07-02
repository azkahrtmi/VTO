// @ts-nocheck
import { useEffect, useRef, useState } from "react";
import * as deepar from "deepar";
import { useAppStore } from "../store";
import { DEFAULT_NODE_MAPPING } from "../types/glasses";
import type { GlassesSize, NodeMapping } from "../types/glasses";
import { AutoPDOverlay } from "./AutoPDOverlay";

const LICENSE_KEY = import.meta.env.VITE_DEEPAR_LICENSE_KEY || "";

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

  const { selectedGlassesId, glassesCatalog } = useAppStore();
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
      <div ref={containerRef} className="deepar-container" />

      {/* UI Controls Overlay */}
      {!isLoading && !error && (
        <div className="deepar-controls-overlay">
          <div className="controls-header">
            <h4>Customization</h4>
            <button onClick={handleReset} className="reset-btn">
              Reset
            </button>
          </div>

          {(frameLensWidthMm || frameBridgeMm || frameWidthMm) && (
            <div className="control-group">
              <span className="control-label">Ukuran Frame:</span>
              <div className="frame-specs">
                {frameLensWidthMm && frameBridgeMm && (
                  <span className="spec-chip spec-chip-marking">
                    {frameLensWidthMm}&#9633;{frameBridgeMm}
                    {frameTempleMm ? `-${frameTempleMm}` : ""} mm
                  </span>
                )}
                {frameWidthMm && (
                  <span className="spec-chip">
                    Lebar total {frameWidthMm} mm
                  </span>
                )}
              </div>
            </div>
          )}

          {selectedGlasses?.sizes && selectedGlasses.sizes.length > 1 && (
            <div className="control-group">
              <span className="control-label">Pilih Ukuran:</span>
              <div className="size-buttons">
                {selectedGlasses.sizes.map((size) => (
                  <button
                    key={size.id}
                    onClick={() => handleSizeSelect(size.id)}
                    className={`size-btn ${activeSizeId === size.id ? "active" : ""}`}
                  >
                    {size.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="control-group">
            <span className="control-label">Frame Color:</span>
            <div className="color-buttons">
              <button
                onClick={() => handleFrameColor(0, 0, 0, "#000")}
                className={`color-btn ${activeFrameColor === "#000" ? "active" : ""}`}
                style={{ background: "#000" }}
              />
              <button
                onClick={() => handleFrameColor(0.8, 0.1, 0.1, "#cc1919")}
                className={`color-btn ${activeFrameColor === "#cc1919" ? "active" : ""}`}
                style={{ background: "#cc1919" }}
              />
              <button
                onClick={() => handleFrameColor(0.1, 0.3, 0.8, "#194ccc")}
                className={`color-btn ${activeFrameColor === "#194ccc" ? "active" : ""}`}
                style={{ background: "#194ccc" }}
              />
              <button
                onClick={() => handleFrameColor(0.8, 0.8, 0.8, "#ccc")}
                className={`color-btn ${activeFrameColor === "#ccc" ? "active" : ""}`}
                style={{ background: "#ccc" }}
              />
            </div>
          </div>

          <div className="control-group">
            <span className="control-label">Lens Color:</span>
            <div className="color-buttons">
              <button
                onClick={() => handleLensColor(0, 0, 0, 0.6, "rgba(0,0,0,0.6)")}
                className={`color-btn ${activeLensColor === "rgba(0,0,0,0.6)" ? "active" : ""}`}
                style={{ background: "rgba(0,0,0,0.6)" }}
              />
              <button
                onClick={() =>
                  handleLensColor(0.8, 0.8, 0.1, 0.4, "rgba(204,204,25,0.4)")
                }
                className={`color-btn ${activeLensColor === "rgba(204,204,25,0.4)" ? "active" : ""}`}
                style={{ background: "rgba(204,204,25,0.4)" }}
              />
              <button
                onClick={() =>
                  handleLensColor(0.1, 0.5, 0.8, 0.4, "rgba(25,127,204,0.4)")
                }
                className={`color-btn ${activeLensColor === "rgba(25,127,204,0.4)" ? "active" : ""}`}
                style={{ background: "rgba(25,127,204,0.4)" }}
              />
              <button
                onClick={() =>
                  handleLensColor(1, 1, 1, 0.1, "rgba(255,255,255,0.8)")
                }
                className={`color-btn ${activeLensColor === "rgba(255,255,255,0.8)" ? "active" : ""}`}
                style={{ background: "rgba(255,255,255,0.8)" }}
              >
                Clear
              </button>
            </div>
          </div>

          <div className="control-group">
            <span className="control-label">Pupillary Distance (PD)</span>
            <button
              onClick={() => setIsPDCheckerOpen(true)}
              className="pd-detect-btn"
              title="Deteksi PD menggunakan kamera"
            >
              Ukur PD dengan Kamera
            </button>
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

      {isPDCheckerOpen && (
        <AutoPDOverlay onClose={() => setIsPDCheckerOpen(false)} />
      )}

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .deepar-wrapper {
          position: absolute;
          inset: 0;
          display: flex;
          background: #000;
        }
        @media (max-width: 768px) {
          .deepar-wrapper {
            flex-direction: column;
          }
        }
        .deepar-container {
          flex: 1;
          position: relative;
          min-height: 50vh;
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
          width: 300px;
          background: #0f172a;
          padding: 24px 20px;
          color: white;
          z-index: 20;
          display: flex;
          flex-direction: column;
          gap: 16px;
          border-left: 1px solid rgba(255, 255, 255, 0.1);
          overflow-y: auto;
        }
        @media (max-width: 768px) {
          .deepar-controls-overlay {
            width: 100%;
            height: auto;
            max-height: 45vh;
            border-left: none;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
          }
        }
        .control-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .control-label {
          font-size: 0.85rem;
          color: #cbd5e1;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .color-buttons {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
        .controls-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          padding-bottom: 8px;
          margin-bottom: 4px;
        }
        .controls-header h4 {
          margin: 0;
          font-size: 0.95rem;
          color: #fff;
        }
        .reset-btn {
          background: rgba(255,255,255,0.1);
          border: none;
          color: #cbd5e1;
          font-size: 0.75rem;
          padding: 4px 10px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .reset-btn:hover {
          background: rgba(239, 68, 68, 0.2);
          color: #fca5a5;
        }
        .color-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.2);
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.65rem;
          color: black;
          font-weight: bold;
          box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }
        .color-btn.active {
          border-color: #fff;
          transform: scale(1.15);
          box-shadow: 0 0 0 2px #8b5cf6, 0 4px 10px rgba(0,0,0,0.3);
        }
        .color-btn:hover:not(.active) {
          transform: scale(1.05);
          border-color: rgba(255,255,255,0.5);
        }
        .pd-detect-btn {
          width: 100%;
          background: rgba(139, 92, 246, 0.2);
          border: 1px solid rgba(139, 92, 246, 0.4);
          color: #c4b5fd;
          padding: 10px 12px;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 6px;
        }
        .pd-detect-btn:hover {
          background: rgba(139, 92, 246, 0.3);
          border-color: rgba(139, 92, 246, 0.6);
        }
        .pd-detect-btn:active {
          transform: scale(0.98);
        }
        .size-buttons {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 6px;
        }
        .size-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #cbd5e1;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .size-btn:hover {
          border-color: rgba(139, 92, 246, 0.5);
          color: #f8fafc;
        }
        .size-btn.active {
          background: rgba(139, 92, 246, 0.25);
          border-color: #8b5cf6;
          color: #c4b5fd;
        }
        .frame-specs {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 6px;
        }
        .spec-chip {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #cbd5e1;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 0.8rem;
          font-variant-numeric: tabular-nums;
        }
        .spec-chip-marking {
          color: #f8fafc;
          font-weight: 600;
          letter-spacing: 0.5px;
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
      `,
        }}
      />
    </div>
  );
};
