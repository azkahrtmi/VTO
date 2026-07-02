import { useEffect, useRef, useState, type MutableRefObject } from "react";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

interface AutoPDOverlayProps {
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

const LEFT_EYE_CONTOUR_INDICES = [
  263, 249, 390, 373, 374, 380, 381, 382, 362, 398, 384, 385, 386, 387, 388,
  466,
];
const RIGHT_EYE_CONTOUR_INDICES = [
  33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246,
];
const IRIS_DIAMETER_MM = 11.7; // Average adult visible iris diameter.
const PD_SMOOTHING_FACTOR = 0.85;
const IRIS_SMOOTHING_FACTOR = 0.7;
const MIN_VALID_PD_MM = 45;
const MAX_VALID_PD_MM = 75;
const DESKTOP_DETECTION_INTERVAL_MS = 42;
const MOBILE_DETECTION_INTERVAL_MS = 80;
const MOBILE_MAX_VIDEO_WIDTH = 854;
const DESKTOP_MAX_VIDEO_WIDTH = 1280;

const distance = (a: Point, b: Point) =>
  Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export const AutoPDOverlay = ({ onClose }: AutoPDOverlayProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoFrameCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const pdValuesRef = useRef<number[]>([]);
  const lastIrisDiameterRef = useRef(0);
  const smoothedPDRef = useRef(62);
  const isStableRef = useRef(false);
  const isLockedRef = useRef(false);
  const lastDetectionTimeRef = useRef(0);
  const isPageVisibleRef = useRef(true);
  const isMobileDeviceRef = useRef(false);

  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [smoothedPD, setSmoothedPD] = useState<number>(62);
  const [isStable, setIsStable] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [cameraRestartKey, setCameraRestartKey] = useState(0);
  const [videoAspectRatio, setVideoAspectRatio] = useState<string | undefined>(
    undefined,
  );
  const [capturedImageUrl, setCapturedImageUrl] = useState<string | null>(
    null,
  );

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
        isMobileDeviceRef.current = isMobileDevice();
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
            minFaceDetectionConfidence: 0.65,
            minFacePresenceConfidence: 0.65,
            minTrackingConfidence: 0.7,
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

    const handleVisibilityChange = () => {
      isPageVisibleRef.current = document.visibilityState === "visible";
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      faceLandmarkerRef.current?.close();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      console.error = originalError;
    };
  }, []);

  useEffect(() => {
    if (isInitializing || !videoRef.current) return;

    const videoEl = videoRef.current;

    startCamera(videoEl, isMobileDeviceRef.current, setVideoAspectRatio).catch(
      (err: unknown) => {
        console.error("Camera access error:", err);
        setError(getErrorMessage(err, "Tidak dapat mengakses kamera"));
      },
    );

    return () => {
      stopVideoStream(videoEl);
    };
  }, [isInitializing, cameraRestartKey]);

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
        if (!isPageVisibleRef.current) {
          animationFrameRef.current = requestAnimationFrame(detectAndDraw);
          return;
        }

        const now = performance.now();
        const detectionInterval = isMobileDeviceRef.current
          ? MOBILE_DETECTION_INTERVAL_MS
          : DESKTOP_DETECTION_INTERVAL_MS;
        if (now - lastDetectionTimeRef.current < detectionInterval) {
          animationFrameRef.current = requestAnimationFrame(detectAndDraw);
          return;
        }
        lastDetectionTimeRef.current = now;

        if (isLockedRef.current) {
          animationFrameRef.current = requestAnimationFrame(detectAndDraw);
          return;
        }

        if (!videoRef.current || !canvasRef.current) {
          animationFrameRef.current = requestAnimationFrame(detectAndDraw);
          return;
        }

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

        const results = await faceLandmarkerRef.current!.detectForVideo(video, now);

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
        const eyeContours = [
          LEFT_EYE_CONTOUR_INDICES.map(toVideoPoint),
          RIGHT_EYE_CONTOUR_INDICES.map(toVideoPoint),
        ];
        const fallbackIrisCenterA = getReliableIrisCenter(irisA);
        const fallbackIrisCenterB = getReliableIrisCenter(irisB);
        const shouldRefineWithPixels = !isMobileDeviceRef.current;
        const videoFrameCtx = shouldRefineWithPixels
          ? getVideoFrameContext(videoFrameCanvasRef, video, canvas)
          : null;
        const irisCenterA = videoFrameCtx
          ? refinePupilCenterFromPixels(
              videoFrameCtx,
              fallbackIrisCenterA,
              eyeContours[0],
            )
          : fallbackIrisCenterA;
        const irisCenterB = videoFrameCtx
          ? refinePupilCenterFromPixels(
              videoFrameCtx,
              fallbackIrisCenterB,
              eyeContours[1],
            )
          : fallbackIrisCenterB;
        const hasReliablePupils =
          isIrisCenterInsideNearestEye(irisCenterA, eyeContours) &&
          isIrisCenterInsideNearestEye(irisCenterB, eyeContours);

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
        const rawPdMm = distance(irisCenterA, irisCenterB) / pixelsPerMm;
        const pdMm =
          Math.round(clamp(rawPdMm, MIN_VALID_PD_MM, MAX_VALID_PD_MM) * 10) /
          10;

        pdValuesRef.current = [...pdValuesRef.current.slice(-9), pdMm];

        let isCurrentlyStable = false;
        if (pdValuesRef.current.length >= 10) {
          const recentValues = pdValuesRef.current;
          const avg =
            recentValues.reduce((a, b) => a + b, 0) / recentValues.length;
          const variance = Math.sqrt(
            recentValues.reduce((sum, val) => sum + (val - avg) ** 2, 0) /
              recentValues.length,
          );
          isCurrentlyStable =
            variance < 1.0 && !isHeadTilted && hasReliablePupils;
        }

        const leftPupil = toDisplayPoint(irisCenterA);
        const rightPupil = toDisplayPoint(irisCenterB);
        const midX = (leftPupil.x + rightPupil.x) / 2;
        const midY = (leftPupil.y + rightPupil.y) / 2;

        // Target: titik tepat di antara kedua pupil harus berada di sini
        const target = getEyeTargetPoint(canvas);
        const alignmentTolerance = canvas.width * 0.05;
        const isAligned =
          distance({ x: midX, y: midY }, target) < alignmentTolerance;

        if (!isLockedRef.current) {
          const nowStable = isCurrentlyStable && isAligned;
          isStableRef.current = nowStable;
          setIsStable(nowStable);

          setSmoothedPD((prev) => {
            const next =
              prev * PD_SMOOTHING_FACTOR + pdMm * (1 - PD_SMOOTHING_FACTOR);
            const rounded = roundedToOneDecimal(next);
            smoothedPDRef.current = rounded;
            return rounded;
          });
        }

        drawPupil(ctx, leftPupil);
        drawPupil(ctx, rightPupil);
        drawPDLine(ctx, leftPupil, rightPupil);
        drawHeadPlacementGuide(ctx, canvas, isHeadTilted);
        if (!isLockedRef.current) {
          drawTargetCrosshair(ctx, target, isAligned);
        }

        ctx.font = "bold 28px Arial";
        ctx.fillStyle = "#22c55e";
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.fillText(`${smoothedPDRef.current} mm`, midX, midY - 10);

        ctx.font = "16px Arial";
        ctx.fillStyle = isLockedRef.current
          ? "#a78bfa"
          : isStableRef.current
            ? "#22c55e"
            : "#f97316";
        ctx.fillText(
          isLockedRef.current
            ? "Pengukuran Terkunci"
            : getMeasurementStatus(isAligned, isHeadTilted, hasReliablePupils),
          midX,
          midY + 10,
        );

        // Auto-lock: begitu titik tengah pupil tepat di target & stabil, kunci hasil
        if (!isLockedRef.current && isStableRef.current) {
          isLockedRef.current = true;
          setIsLocked(true);
          setCapturedImageUrl(captureResultImage(video, canvas));
          stopVideoStream(video);
        }
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

  const handleRetry = () => {
    pdValuesRef.current = [];
    lastIrisDiameterRef.current = 0;
    isStableRef.current = false;
    isLockedRef.current = false;
    setIsStable(false);
    setIsLocked(false);
    setCapturedImageUrl(null);
    setCameraRestartKey((current) => current + 1);
  };

  const handleDownload = () => {
    if (!capturedImageUrl) return;
    const link = document.createElement("a");
    link.href = capturedImageUrl;
    link.download = `pd-${smoothedPDRef.current}mm.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="auto-pd-overlay">
      <div className="auto-pd-container">
        <div className="auto-pd-instructions">
          <p>
            {isLocked
              ? "Pengukuran berhasil dikunci. Unduh gambar atau ukur ulang jika perlu."
              : "Posisikan titik tengah kedua mata Anda tepat di tengah target. Hasil akan otomatis terkunci saat posisi pas dan stabil."}
          </p>
        </div>

        <div
          className="auto-pd-video-wrapper"
          style={{ aspectRatio: videoAspectRatio }}
        >
          {capturedImageUrl ? (
            <img
              src={capturedImageUrl}
              className="auto-pd-captured"
              alt="Hasil pengukuran PD"
            />
          ) : (
            <>
              <video
                ref={videoRef}
                className="auto-pd-video"
                playsInline
                muted
                autoPlay
              />
              <canvas ref={canvasRef} className="auto-pd-canvas" />
            </>
          )}
        </div>

        <div className="auto-pd-info">
          <div className="auto-pd-value">
            <span className="auto-pd-number">{smoothedPD}</span>
            <span className="auto-pd-unit">mm</span>
          </div>
          <p className="auto-pd-status">
            {isLocked
              ? "Pengukuran Terkunci"
              : isStable
                ? "Pengukuran Stabil"
                : "Mengatur Pengukuran"}
          </p>
        </div>

        <div className="auto-pd-buttons">
          {isLocked ? (
            <>
              <button
                onClick={handleRetry}
                className="auto-pd-btn auto-pd-btn-cancel"
              >
                Ukur Ulang
              </button>
              <button
                onClick={handleDownload}
                className="auto-pd-btn auto-pd-btn-download"
              >
                Unduh Gambar
              </button>
              <button
                onClick={() => onClose()}
                className="auto-pd-btn auto-pd-btn-cancel"
              >
                Tutup
              </button>
            </>
          ) : (
            <button
              onClick={() => onClose()}
              className="auto-pd-btn auto-pd-btn-cancel"
            >
              Batal
            </button>
          )}
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
          background: rgba(0, 0, 0, 0.92);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          padding: 20px;
          backdrop-filter: blur(2px);
        }

        .auto-pd-container {
          display: flex;
          flex-direction: column;
          gap: 18px;
          width: min(92vw, 1040px);
          max-height: calc(100dvh - 40px);
          background: #0f172a;
          border: 1px solid rgba(124, 58, 237, 0.45);
          border-radius: 14px;
          padding: 22px;
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
          color: #d8dee9;
          font-size: 1rem;
          line-height: 1.5;
          padding: 0 8px;
        }

        .auto-pd-instructions p {
          margin: 0;
        }

        .auto-pd-video-wrapper {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 9;
          max-height: min(62vh, 560px);
          background: #000;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .auto-pd-video {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: contain;
          transform: scaleX(-1);
          z-index: 1;
        }

        .auto-pd-captured {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: contain;
          z-index: 3;
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
          gap: 10px;
          min-height: 82px;
          background: rgba(49, 46, 129, 0.42);
          border: 1px solid rgba(124, 58, 237, 0.35);
          border-radius: 12px;
          padding: 14px 20px;
        }

        .auto-pd-value {
          display: flex;
          align-items: baseline;
          gap: 6px;
        }

        .auto-pd-number {
          font-size: 2.35rem;
          font-weight: 800;
          line-height: 1;
          color: #c4b5fd;
        }

        .auto-pd-unit {
          font-size: 1.1rem;
          color: #a78bfa;
          font-weight: 600;
        }

        .auto-pd-status {
          margin: 0;
          font-size: 0.95rem;
          color: #94a3b8;
          font-weight: 700;
        }

        .auto-pd-buttons {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .auto-pd-btn {
          min-height: 48px;
          padding: 10px 28px;
          border: none;
          border-radius: 8px;
          font-size: 0.95rem;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.2s;
          width: min(100%, 220px);
        }

        .auto-pd-btn-cancel {
          background: rgba(31, 41, 55, 0.92);
          color: #d8dee9;
          border: 1px solid rgba(148, 163, 184, 0.35);
        }

        .auto-pd-btn-cancel:hover {
          background: rgba(55, 65, 81, 0.92);
          border-color: rgba(203, 213, 225, 0.45);
        }

        .auto-pd-btn-download {
          background: rgba(34, 197, 94, 0.15);
          color: #86efac;
          border: 1px solid rgba(34, 197, 94, 0.4);
        }

        .auto-pd-btn-download:hover {
          background: rgba(34, 197, 94, 0.25);
          border-color: rgba(34, 197, 94, 0.6);
          transform: translateY(-1px);
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
          .auto-pd-overlay {
            align-items: stretch;
            justify-content: stretch;
            background: rgba(0, 0, 0, 0.82);
            padding: 0;
            backdrop-filter: none;
          }

          .auto-pd-container {
            width: 100%;
            min-height: 100dvh;
            max-width: 100%;
            max-height: none;
            padding: 12px;
            gap: 10px;
            border: 0;
            border-radius: 0;
            justify-content: center;
          }

          .auto-pd-instructions {
            font-size: 0.88rem;
            line-height: 1.35;
            padding: 0 10px;
          }

          .auto-pd-video-wrapper {
            border-radius: 10px;
            max-height: min(62vh, 620px);
            margin-inline: auto;
          }

          .auto-pd-info {
            justify-content: space-between;
            min-height: 88px;
            padding: 10px 14px;
            border-radius: 10px;
          }

          .auto-pd-value {
            gap: 4px;
          }

          .auto-pd-number {
            font-size: 1.9rem;
            line-height: 1;
          }

          .auto-pd-unit {
            font-size: 0.95rem;
          }

          .auto-pd-status {
            font-size: 0.82rem;
            text-align: right;
          }

          .auto-pd-buttons {
            gap: 10px;
          }

          .auto-pd-btn {
            min-height: 48px;
            width: 100%;
            max-width: none;
            padding: 10px 16px;
            font-size: 0.9rem;
            border-radius: 10px;
          }
        }

        @media (max-width: 420px) {
          .auto-pd-container {
            padding: 10px;
          }

          .auto-pd-instructions {
            font-size: 0.82rem;
          }

          .auto-pd-info {
            align-items: center;
          }

          .auto-pd-number {
            font-size: 1.7rem;
          }

          .auto-pd-status {
            max-width: 52%;
          }
        }
      `,
        }}
      />
    </div>
  );
};

const roundedToOneDecimal = (value: number) => Math.round(value * 10) / 10;

const isMobileDevice = () =>
  window.matchMedia("(pointer: coarse)").matches ||
  /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

const startCamera = async (
  videoEl: HTMLVideoElement,
  isMobile: boolean,
  onAspectRatioChange: (aspectRatio: string | undefined) => void,
) => {
  stopVideoStream(videoEl);

  const videoConstraints: MediaTrackConstraints = isMobile
    ? {
        facingMode: "user",
        width: { ideal: 720, max: MOBILE_MAX_VIDEO_WIDTH },
        height: { ideal: 960, max: 1280 },
        aspectRatio: { ideal: 0.75 },
        frameRate: {
          ideal: 15,
          max: 20,
        },
      }
    : {
        facingMode: "user",
        width: { ideal: DESKTOP_MAX_VIDEO_WIDTH, max: DESKTOP_MAX_VIDEO_WIDTH },
        height: { ideal: 720 },
        frameRate: {
          ideal: 24,
          max: 30,
        },
      };
  const stream = await navigator.mediaDevices.getUserMedia({
    video: videoConstraints,
  });

  videoEl.srcObject = stream;
  videoEl.onloadedmetadata = () => {
    if (isMobile && videoEl.videoWidth > 0 && videoEl.videoHeight > 0) {
      onAspectRatioChange(`${videoEl.videoWidth} / ${videoEl.videoHeight}`);
    } else {
      onAspectRatioChange(undefined);
    }
    void videoEl.play();
  };
};

const stopVideoStream = (videoEl: HTMLVideoElement) => {
  if (!videoEl.srcObject) return;

  const stream = videoEl.srcObject as MediaStream;
  stream.getTracks().forEach((track) => track.stop());
  videoEl.srcObject = null;
};

const getVideoFrameContext = (
  frameCanvasRef: MutableRefObject<HTMLCanvasElement | null>,
  video: HTMLVideoElement,
  overlayCanvas: HTMLCanvasElement,
) => {
  if (!frameCanvasRef.current) {
    frameCanvasRef.current = document.createElement("canvas");
  }

  const frameCanvas = frameCanvasRef.current;
  if (
    frameCanvas.width !== overlayCanvas.width ||
    frameCanvas.height !== overlayCanvas.height
  ) {
    frameCanvas.width = overlayCanvas.width;
    frameCanvas.height = overlayCanvas.height;
  }

  const frameCtx = frameCanvas.getContext("2d", { willReadFrequently: true })!;
  frameCtx.drawImage(video, 0, 0, frameCanvas.width, frameCanvas.height);
  return frameCtx;
};

/** Gabungkan frame video (mirrored) + overlay canvas menjadi satu gambar hasil. */
const captureResultImage = (
  video: HTMLVideoElement,
  overlayCanvas: HTMLCanvasElement,
): string => {
  const captureCanvas = document.createElement("canvas");
  captureCanvas.width = overlayCanvas.width;
  captureCanvas.height = overlayCanvas.height;
  const ctx = captureCanvas.getContext("2d")!;

  // Video ditampilkan mirrored (CSS scaleX(-1)), gambar hasil mengikuti tampilan tsb
  ctx.save();
  ctx.translate(captureCanvas.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(video, 0, 0, captureCanvas.width, captureCanvas.height);
  ctx.restore();

  ctx.drawImage(overlayCanvas, 0, 0);

  return captureCanvas.toDataURL("image/png");
};

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

const getReliableIrisCenter = (iris: IrisLandmarks): Point => {
  const edgeCenter = averagePoints([iris.right, iris.top, iris.left, iris.bottom]);
  const irisRadius = Math.max(
    distance(iris.left, iris.right),
    distance(iris.top, iris.bottom),
  );

  return distance(iris.center, edgeCenter) <= irisRadius * 0.35
    ? iris.center
    : edgeCenter;
};

const refinePupilCenterFromPixels = (
  frameCtx: CanvasRenderingContext2D,
  estimate: Point,
  eyeContour: Point[],
): Point => {
  const bounds = getBounds(eyeContour);
  const eyeWidth = Math.max(1, bounds.maxX - bounds.minX);
  const eyeHeight = Math.max(1, bounds.maxY - bounds.minY);
  const marginX = eyeWidth * 0.16;
  const marginY = Math.max(eyeHeight * 0.35, 4);
  const startX = Math.max(0, Math.floor(bounds.minX - marginX));
  const startY = Math.max(0, Math.floor(bounds.minY - marginY));
  const endX = Math.min(
    frameCtx.canvas.width,
    Math.ceil(bounds.maxX + marginX),
  );
  const endY = Math.min(
    frameCtx.canvas.height,
    Math.ceil(bounds.maxY + marginY),
  );
  const width = endX - startX;
  const height = endY - startY;

  if (width < 8 || height < 6) return estimate;

  const imageData = frameCtx.getImageData(startX, startY, width, height);
  const luminances: number[] = [];
  for (let i = 0; i < imageData.data.length; i += 4) {
    const red = imageData.data[i];
    const green = imageData.data[i + 1];
    const blue = imageData.data[i + 2];
    luminances.push(red * 0.299 + green * 0.587 + blue * 0.114);
  }

  const sorted = [...luminances].sort((a, b) => a - b);
  const darkCutoff = sorted[Math.floor(sorted.length * 0.18)] ?? 75;
  const threshold = clamp(darkCutoff + 18, 28, 95);
  const eyeCenter = averagePoints(eyeContour);
  const radiusX = Math.max(eyeWidth * 0.42, 8);
  const radiusY = Math.max(eyeHeight * 0.9, 6);
  let weightedX = 0;
  let weightedY = 0;
  let totalWeight = 0;
  let darkPixelCount = 0;

  for (let index = 0; index < luminances.length; index++) {
    const luminance = luminances[index];
    if (luminance > threshold) continue;

    const x = startX + (index % width);
    const y = startY + Math.floor(index / width);
    const normalizedX = (x - eyeCenter.x) / radiusX;
    const normalizedY = (y - eyeCenter.y) / radiusY;
    const isInsideEyeSearchArea = normalizedX ** 2 + normalizedY ** 2 <= 1;
    if (!isInsideEyeSearchArea) continue;

    const distanceFromEstimate = distance({ x, y }, estimate);
    if (distanceFromEstimate > eyeWidth * 0.34) continue;

    const weight = (threshold - luminance + 1) ** 1.4;
    weightedX += x * weight;
    weightedY += y * weight;
    totalWeight += weight;
    darkPixelCount++;
  }

  if (darkPixelCount < Math.max(6, eyeWidth * 0.08) || totalWeight === 0) {
    return estimate;
  }

  const refined = {
    x: weightedX / totalWeight,
    y: weightedY / totalWeight,
  };

  return distance(refined, estimate) <= eyeWidth * 0.28 ? refined : estimate;
};

const averagePoints = (points: Point[]): Point => {
  const total = points.reduce(
    (sum, point) => ({
      x: sum.x + point.x,
      y: sum.y + point.y,
    }),
    { x: 0, y: 0 },
  );

  return {
    x: total.x / points.length,
    y: total.y / points.length,
  };
};

const isIrisCenterInsideNearestEye = (
  irisCenter: Point,
  eyeContours: Point[][],
) => {
  const nearestEye = eyeContours.reduce((nearest, contour) => {
    const contourCenter = averagePoints(contour);
    const contourDistance = distance(irisCenter, contourCenter);
    return contourDistance < nearest.distance
      ? { contour, distance: contourDistance }
      : nearest;
  }, { contour: eyeContours[0], distance: Number.POSITIVE_INFINITY });

  const bounds = getBounds(nearestEye.contour);
  const eyeWidth = Math.max(1, bounds.maxX - bounds.minX);
  const eyeHeight = Math.max(1, bounds.maxY - bounds.minY);
  const centerY = (bounds.minY + bounds.maxY) / 2;
  const horizontalMargin = eyeWidth * 0.08;
  const verticalMargin = eyeHeight * 0.2;

  return (
    irisCenter.x >= bounds.minX - horizontalMargin &&
    irisCenter.x <= bounds.maxX + horizontalMargin &&
    irisCenter.y >= bounds.minY - verticalMargin &&
    irisCenter.y <= centerY + eyeHeight * 0.45
  );
};

const getBounds = (points: Point[]) =>
  points.reduce(
    (bounds, point) => ({
      minX: Math.min(bounds.minX, point.x),
      maxX: Math.max(bounds.maxX, point.x),
      minY: Math.min(bounds.minY, point.y),
      maxY: Math.max(bounds.maxY, point.y),
    }),
    {
      minX: Number.POSITIVE_INFINITY,
      maxX: Number.NEGATIVE_INFINITY,
      minY: Number.POSITIVE_INFINITY,
      maxY: Number.NEGATIVE_INFINITY,
    },
  );

const drawPupil = (ctx: CanvasRenderingContext2D, point: Point) => {
  ctx.fillStyle = "#22c55e";
  ctx.strokeStyle = "rgba(34, 197, 94, 0.9)";
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.arc(point.x, point.y, 14, 0, 2 * Math.PI);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(point.x, point.y, 6, 0, 2 * Math.PI);
  ctx.fill();
};

const drawPDLine = (
  ctx: CanvasRenderingContext2D,
  leftPupil: Point,
  rightPupil: Point,
) => {
  ctx.strokeStyle = "rgba(34, 197, 94, 0.72)";
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 6]);
  ctx.beginPath();
  ctx.moveTo(leftPupil.x, leftPupil.y);
  ctx.lineTo(rightPupil.x, rightPupil.y);
  ctx.stroke();
  ctx.setLineDash([]);
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
    ? "rgba(249, 115, 22, 0.35)"
    : "rgba(34, 197, 94, 0.32)";
  ctx.lineWidth = 2;
  ctx.setLineDash([10, 8]);
  ctx.beginPath();
  ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
  ctx.stroke();

  ctx.strokeStyle = isHeadTilted
    ? "rgba(249, 115, 22, 0.28)"
    : "rgba(34, 197, 94, 0.16)";
  ctx.lineWidth = 1;
  ctx.setLineDash([2, 2]);
  ctx.beginPath();
  ctx.moveTo(centerX, Math.max(0, centerY - radiusY - 24));
  ctx.lineTo(centerX, Math.min(canvas.height, centerY + radiusY + 24));
  ctx.stroke();
  ctx.setLineDash([]);
};

/** Titik target: posisi tepat di tengah-tengah kedua pupil seharusnya berada. */
const getEyeTargetPoint = (canvas: HTMLCanvasElement): Point => {
  const centerX = canvas.width / 2;
  const centerY = canvas.height * 0.48;
  const radiusY = Math.min(canvas.height * 0.38, 280);
  return { x: centerX, y: centerY - radiusY * 0.35 };
};

const drawTargetCrosshair = (
  ctx: CanvasRenderingContext2D,
  point: Point,
  isAligned: boolean,
) => {
  const size = 14;
  ctx.strokeStyle = isAligned ? "#22c55e" : "rgba(255, 255, 255, 0.6)";
  ctx.lineWidth = 2;
  ctx.setLineDash([]);

  ctx.beginPath();
  ctx.moveTo(point.x - size, point.y);
  ctx.lineTo(point.x + size, point.y);
  ctx.moveTo(point.x, point.y - size);
  ctx.lineTo(point.x, point.y + size);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(point.x, point.y, size * 1.4, 0, 2 * Math.PI);
  ctx.stroke();
};

const getMeasurementStatus = (
  isAligned: boolean,
  isHeadTilted: boolean,
  hasReliablePupils: boolean,
) => {
  if (isHeadTilted) return "Sejajarkan Kepala";
  if (!hasReliablePupils) return "Arahkan Pupil ke Kamera";
  if (!isAligned) return "Posisikan Mata di Tengah Target";
  return "Tahan Posisi...";
};
