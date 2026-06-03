import { useEffect, useRef, useState } from "react";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

interface AutoPDOverlayProps {
  onPDDetected: (pdMm: number) => void;
  onClose: () => void;
}

type Point = {
  x: number;
  y: number;
};

type IrisLandmarks = {
  center: Point;
  right: Point;
  top: Point;
  left: Point;
  bottom: Point;
};

const IRIS_DIAMETER_MM = 11.7; // Average adult visible iris diameter.
const PD_SMOOTHING_FACTOR = 0.85;
const IRIS_SMOOTHING_FACTOR = 0.7;
const MIN_VALID_PD_MM = 45;
const MAX_VALID_PD_MM = 75;

const distance = (a: Point, b: Point) =>
  Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export const AutoPDOverlay = ({
  onPDDetected,
  onClose,
}: AutoPDOverlayProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const pdValuesRef = useRef<number[]>([]);
  const stableFrameCountRef = useRef(0);
  const lastIrisDiameterRef = useRef(0);
  const smoothedPDRef = useRef(62);
  const isStableRef = useRef(false);

  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [smoothedPD, setSmoothedPD] = useState<number>(62);
  const [isStable, setIsStable] = useState(false);

  useEffect(() => {
    smoothedPDRef.current = smoothedPD;
  }, [smoothedPD]);

  useEffect(() => {
    isStableRef.current = isStable;
  }, [isStable]);

  useEffect(() => {
    const originalError = console.error;
    const errorFilter = (...args: unknown[]) => {
      const message = args[0]?.toString?.() || String(args[0]);
      if (
        message.includes("E0603") ||
        message.includes("INTERNAL") ||
        message.includes("ROI width") ||
        message.includes("roi->width") ||
        message.includes("Calculator::Process()") ||
        message.includes("installHook")
      ) {
        return;
      }
      originalError(...args);
    };
    console.error = errorFilter;

    const initFaceLandmarker = async () => {
      try {
        const filesetResolver = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm",
        );

        const landmarker = await FaceLandmarker.createFromOptions(
          filesetResolver,
          {
            baseOptions: {
              modelAssetPath: "/face_landmarker.task",
            },
            runningMode: "VIDEO",
            numFaces: 1,
          },
        );

        faceLandmarkerRef.current = landmarker;
        setIsInitializing(false);
      } catch (err: unknown) {
        console.error("MediaPipe initialization error:", err);
        setError(getErrorMessage(err, "Gagal menginisialisasi MediaPipe"));
        setIsInitializing(false);
      }
    };

    initFaceLandmarker();

    return () => {
      faceLandmarkerRef.current?.close();
      console.error = originalError;
    };
  }, []);

  useEffect(() => {
    if (isInitializing || !videoRef.current) return;

    const videoEl = videoRef.current;

    const getCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });

        if (videoEl) {
          videoEl.srcObject = stream;
          videoEl.onloadedmetadata = () => {
            videoEl.play();
          };
        }
      } catch (err: unknown) {
        console.error("Camera access error:", err);
        setError(getErrorMessage(err, "Tidak dapat mengakses kamera"));
      }
    };

    getCamera();

    return () => {
      if (videoEl?.srcObject) {
        const stream = videoEl.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isInitializing]);

  useEffect(() => {
    if (
      !videoRef.current ||
      !canvasRef.current ||
      !faceLandmarkerRef.current ||
      isInitializing
    ) {
      return;
    }

    const detectAndDraw = async () => {
      try {
        const video = videoRef.current!;
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext("2d")!;

        if (
          video.readyState !== video.HAVE_ENOUGH_DATA ||
          video.videoWidth === 0 ||
          video.videoHeight === 0
        ) {
          animationFrameRef.current = requestAnimationFrame(detectAndDraw);
          return;
        }

        if (
          canvas.width !== video.videoWidth ||
          canvas.height !== video.videoHeight
        ) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }

        const results = await faceLandmarkerRef.current!.detectForVideo(
          video,
          performance.now(),
        );

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        drawHeadPlacementGuide(ctx, canvas, false);

        if (!results.faceLandmarks || results.faceLandmarks.length === 0) {
          drawCenteredText(ctx, canvas, "Wajah tidak terdeteksi", "#ef4444");
          animationFrameRef.current = requestAnimationFrame(detectAndDraw);
          return;
        }

        const landmarks = results.faceLandmarks[0];

        if (landmarks.length < 478) {
          drawCenteredText(
            ctx,
            canvas,
            "Model landmark iris belum tersedia",
            "#f97316",
          );
          animationFrameRef.current = requestAnimationFrame(detectAndDraw);
          return;
        }

        const toVideoPoint = (index: number): Point => ({
          x: landmarks[index].x * canvas.width,
          y: landmarks[index].y * canvas.height,
        });

        const toDisplayPoint = (point: Point): Point => ({
          x: canvas.width - point.x,
          y: point.y,
        });

        const irisA: IrisLandmarks = {
          center: toVideoPoint(468),
          right: toVideoPoint(469),
          top: toVideoPoint(470),
          left: toVideoPoint(471),
          bottom: toVideoPoint(472),
        };

        const irisB: IrisLandmarks = {
          center: toVideoPoint(473),
          right: toVideoPoint(474),
          top: toVideoPoint(475),
          left: toVideoPoint(476),
          bottom: toVideoPoint(477),
        };

        const noseTip = toVideoPoint(1);
        const chin = toVideoPoint(152);
        const headHeight = distance(noseTip, chin);
        const tiltRatio = Math.abs(chin.x - noseTip.x) / headHeight;
        const isHeadTilted = tiltRatio > 0.1;

        const irisDiameters = [
          distance(irisA.left, irisA.right),
          distance(irisA.top, irisA.bottom),
          distance(irisB.left, irisB.right),
          distance(irisB.top, irisB.bottom),
        ].filter((diameter) => Number.isFinite(diameter) && diameter > 2);

        if (irisDiameters.length < 2) {
          animationFrameRef.current = requestAnimationFrame(detectAndDraw);
          return;
        }

        const avgIrisDiameterPixels =
          irisDiameters.reduce((sum, value) => sum + value, 0) /
          irisDiameters.length;
        const smoothedIrisDiameter =
          lastIrisDiameterRef.current === 0
            ? avgIrisDiameterPixels
            : lastIrisDiameterRef.current * IRIS_SMOOTHING_FACTOR +
              avgIrisDiameterPixels * (1 - IRIS_SMOOTHING_FACTOR);

        lastIrisDiameterRef.current = smoothedIrisDiameter;

        const pixelsPerMm = smoothedIrisDiameter / IRIS_DIAMETER_MM;
        const rawPdMm = distance(irisA.center, irisB.center) / pixelsPerMm;
        const pdMm =
          Math.round(clamp(rawPdMm, MIN_VALID_PD_MM, MAX_VALID_PD_MM) * 10) /
          10;

        pdValuesRef.current = [...pdValuesRef.current.slice(-59), pdMm];

        let isCurrentlyStable = false;
        if (pdValuesRef.current.length >= 30) {
          const recentValues = pdValuesRef.current.slice(-30);
          const avg =
            recentValues.reduce((a, b) => a + b, 0) / recentValues.length;
          const variance = Math.sqrt(
            recentValues.reduce((sum, val) => sum + (val - avg) ** 2, 0) /
              recentValues.length,
          );
          isCurrentlyStable = variance < 1.0 && !isHeadTilted;
        }

        if (isCurrentlyStable) {
          stableFrameCountRef.current++;
          if (stableFrameCountRef.current >= 15) {
            isStableRef.current = true;
            setIsStable(true);
          }
        } else {
          stableFrameCountRef.current = 0;
          isStableRef.current = false;
          setIsStable(false);
        }

        setSmoothedPD((prev) => {
          const next =
            prev * PD_SMOOTHING_FACTOR + pdMm * (1 - PD_SMOOTHING_FACTOR);
          const rounded = roundedToOneDecimal(next);
          smoothedPDRef.current = rounded;
          return rounded;
        });

        const leftPupil = toDisplayPoint(irisA.center);
        const rightPupil = toDisplayPoint(irisB.center);
        const midX = (leftPupil.x + rightPupil.x) / 2;
        const midY = (leftPupil.y + rightPupil.y) / 2;

        drawPupil(ctx, leftPupil);
        drawPupil(ctx, rightPupil);
        drawHeadPlacementGuide(ctx, canvas, isHeadTilted);

        ctx.font = "bold 28px Arial";
        ctx.fillStyle = "#22c55e";
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.fillText(`${smoothedPDRef.current} mm`, midX, midY - 10);

        ctx.font = "16px Arial";
        ctx.fillStyle = isStableRef.current ? "#22c55e" : "#f97316";
        ctx.fillText(
          getMeasurementStatus(isStableRef.current, isHeadTilted),
          midX,
          midY + 10,
        );
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        if (
          !errorMsg.includes("INTERNAL") &&
          !errorMsg.includes("roi->width") &&
          !errorMsg.includes("roi->height")
        ) {
          console.error("Detection error:", err);
        }
      }

      animationFrameRef.current = requestAnimationFrame(detectAndDraw);
    };

    animationFrameRef.current = requestAnimationFrame(detectAndDraw);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isInitializing]);

  const handleApply = () => {
    onPDDetected(smoothedPD);
    onClose();
  };

  return (
    <div className="auto-pd-overlay">
      <div className="auto-pd-container">
        <div className="auto-pd-instructions">
          <p>
            Lihat lurus ke kamera dengan posisi tegak lurus. Tunggu sampai angka
            stabil.
          </p>
        </div>

        <div className="auto-pd-video-wrapper">
          <video
            ref={videoRef}
            className="auto-pd-video"
            playsInline
            muted
            autoPlay
          />
          <canvas ref={canvasRef} className="auto-pd-canvas" />
        </div>

        <div className="auto-pd-info">
          <div className="auto-pd-value">
            <span className="auto-pd-number">{smoothedPD}</span>
            <span className="auto-pd-unit">mm</span>
          </div>
          <p className="auto-pd-status">
            {isStable ? "Pengukuran Stabil" : "Mengatur Pengukuran"}
          </p>
        </div>

        <div className="auto-pd-buttons">
          <button
            onClick={() => onClose()}
            className="auto-pd-btn auto-pd-btn-cancel"
          >
            Batal
          </button>
          <button
            onClick={handleApply}
            className="auto-pd-btn auto-pd-btn-apply"
            disabled={!isStable}
            title={isStable ? "Terapkan PD" : "Tunggu pengukuran stabil"}
          >
            Terapkan
          </button>
        </div>

        {error && (
          <div className="auto-pd-error">
            <p>Warning: {error}</p>
          </div>
        )}

        {isInitializing && (
          <div className="auto-pd-loading">
            <div className="auto-pd-spinner" />
            <p>Memuat MediaPipe...</p>
          </div>
        )}
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .auto-pd-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          backdrop-filter: blur(2px);
        }

        .auto-pd-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
          width: min(94vw, 980px);
          max-height: 94vh;
          background: rgba(15, 23, 42, 0.95);
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          animation: auto-pd-fadeIn 0.3s ease-out;
        }

        @keyframes auto-pd-fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .auto-pd-instructions {
          text-align: center;
          color: #cbd5e1;
          font-size: 0.95rem;
          line-height: 1.5;
        }

        .auto-pd-video-wrapper {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 9;
          max-height: 68vh;
          background: #000;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .auto-pd-video {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transform: scaleX(-1);
          z-index: 1;
        }

        .auto-pd-canvas {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 2;
        }

        .auto-pd-info {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: rgba(139, 92, 246, 0.1);
          border: 1px solid rgba(139, 92, 246, 0.2);
          border-radius: 12px;
          padding: 12px 16px;
        }

        .auto-pd-value {
          display: flex;
          align-items: baseline;
          gap: 6px;
        }

        .auto-pd-number {
          font-size: 2.2rem;
          font-weight: 700;
          color: #c4b5fd;
        }

        .auto-pd-unit {
          font-size: 1.1rem;
          color: #a78bfa;
          font-weight: 600;
        }

        .auto-pd-status {
          margin: 0;
          font-size: 0.9rem;
          color: #94a3b8;
          font-weight: 500;
        }

        .auto-pd-buttons {
          display: flex;
          gap: 12px;
          justify-content: center;
        }

        .auto-pd-btn {
          padding: 10px 24px;
          border: none;
          border-radius: 8px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          flex: 1;
          max-width: 200px;
        }

        .auto-pd-btn-cancel {
          background: rgba(255, 255, 255, 0.1);
          color: #cbd5e1;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .auto-pd-btn-cancel:hover {
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 255, 255, 0.3);
        }

        .auto-pd-btn-apply {
          background: rgba(139, 92, 246, 0.6);
          color: white;
          border: 1px solid rgba(139, 92, 246, 0.8);
        }

        .auto-pd-btn-apply:hover:not(:disabled) {
          background: rgba(139, 92, 246, 0.8);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
        }

        .auto-pd-btn-apply:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .auto-pd-error {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 8px;
          padding: 12px;
          color: #fca5a5;
          text-align: center;
          font-size: 0.9rem;
        }

        .auto-pd-loading {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.5);
          gap: 12px;
          border-radius: 12px;
          z-index: 50;
        }

        .auto-pd-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(255, 255, 255, 0.2);
          border-top-color: #8b5cf6;
          border-radius: 50%;
          animation: auto-pd-spin 0.8s linear infinite;
        }

        @keyframes auto-pd-spin {
          to {
            transform: rotate(360deg);
          }
        }

        .auto-pd-loading p {
          color: #cbd5e1;
          font-size: 0.9rem;
        }

        @media (max-width: 768px) {
          .auto-pd-container {
            width: 95%;
            max-width: 100%;
            padding: 16px;
            gap: 16px;
          }

          .auto-pd-video-wrapper {
            max-height: 58vh;
          }

          .auto-pd-number {
            font-size: 2rem;
          }

          .auto-pd-btn {
            padding: 10px 20px;
            font-size: 0.9rem;
          }
        }
      `,
        }}
      />
    </div>
  );
};

const roundedToOneDecimal = (value: number) => Math.round(value * 10) / 10;

const getErrorMessage = (err: unknown, fallback: string) =>
  err instanceof Error ? err.message : fallback;

const drawCenteredText = (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  text: string,
  color: string,
) => {
  ctx.font = "20px Arial";
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);
};

const drawPupil = (ctx: CanvasRenderingContext2D, point: Point) => {
  ctx.fillStyle = "#22c55e";
  ctx.beginPath();
  ctx.arc(point.x, point.y, 6, 0, 2 * Math.PI);
  ctx.fill();
};

const drawHeadPlacementGuide = (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  isHeadTilted: boolean,
) => {
  const centerX = canvas.width / 2;
  const centerY = canvas.height * 0.48;
  const radiusX = Math.min(canvas.width * 0.18, 180);
  const radiusY = Math.min(canvas.height * 0.38, 280);

  ctx.strokeStyle = isHeadTilted
    ? "rgba(249, 115, 22, 0.4)"
    : "rgba(34, 197, 94, 0.45)";
  ctx.lineWidth = 3;
  ctx.setLineDash([10, 8]);
  ctx.beginPath();
  ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
  ctx.stroke();

  ctx.strokeStyle = isHeadTilted
    ? "rgba(249, 115, 22, 0.4)"
    : "rgba(34, 197, 94, 0.2)";
  ctx.lineWidth = 1;
  ctx.setLineDash([2, 2]);
  ctx.beginPath();
  ctx.moveTo(centerX, Math.max(0, centerY - radiusY - 24));
  ctx.lineTo(centerX, Math.min(canvas.height, centerY + radiusY + 24));
  ctx.stroke();

  ctx.fillStyle = isHeadTilted
    ? "rgba(249, 115, 22, 0.85)"
    : "rgba(34, 197, 94, 0.85)";
  ctx.font = "16px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText("Posisikan wajah di dalam oval", centerX, centerY + radiusY + 12);
  ctx.setLineDash([]);
};

const getMeasurementStatus = (isStable: boolean, isHeadTilted: boolean) => {
  if (isStable) return "Pengukuran Stabil";
  if (isHeadTilted) return "Sejajarkan Kepala";
  return "Stabilkan Pengukuran";
};
