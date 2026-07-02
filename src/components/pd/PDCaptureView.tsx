import { useEffect, useRef, useState, type MutableRefObject } from 'react';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import {
  IRIS_DIAMETER_MM,
  LEFT_EYE_CONTOUR_INDICES,
  RIGHT_EYE_CONTOUR_INDICES,
  distance,
  estimateHeadPose,
  getReliableIrisCenter,
  isIrisCenterInsideNearestEye,
  median,
  medianPoint,
  refinePupilCenterFromPixels,
  type IrisLandmarks,
  type Point,
} from '../../utils/pdGeometry';

export interface PDCaptureResult {
  /** Data URL frame yang sudah mirrored (sesuai tampilan preview). */
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  /** Skala kalibrasi dari median diameter iris (px per mm). */
  pixelsPerMm: number;
  /** Kandidat titik pupil dalam koordinat gambar mirrored. */
  pupilA: Point;
  pupilB: Point;
}

interface PDCaptureViewProps {
  onCaptured: (result: PDCaptureResult) => void;
  onCancel: () => void;
}

type Sample = {
  irisDiameterPx: number;
  pupilA: Point;
  pupilB: Point;
};

const HOLD_DURATION_MS = 3000; // Posisi bagus harus ditahan selama ini sebelum auto-capture
const HOLD_DECAY_MS = 400; // Penalti hold time per frame jelek
const MAX_TICK_DELTA_MS = 200; // Batasi lompatan waktu (mis. setelah tab hidden)
const TARGET_SAMPLES = 24; // Minimal frame bagus untuk kalibrasi median
const MIN_MANUAL_SAMPLES = 8;
const MAX_SAMPLES = 30;
const DESKTOP_DETECTION_INTERVAL_MS = 42;
const MOBILE_DETECTION_INTERVAL_MS = 80;
const MOBILE_MAX_VIDEO_WIDTH = 854;
const DESKTOP_MAX_VIDEO_WIDTH = 1280;
const MIN_IRIS_DIAMETER_PX = 9; // Wajah terlalu jauh jika iris lebih kecil dari ini

const isMobileDevice = () =>
  window.matchMedia('(pointer: coarse)').matches ||
  /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

export const PDCaptureView = ({ onCaptured, onCancel }: PDCaptureViewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoFrameCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const samplesRef = useRef<Sample[]>([]);
  const holdMsRef = useRef(0);
  const lastTickRef = useRef(0);
  const lastDetectionTimeRef = useRef(0);
  const isPageVisibleRef = useRef(true);
  const isMobileDeviceRef = useRef(false);
  const isCapturingRef = useRef(false);

  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videoAspectRatio, setVideoAspectRatio] = useState<string | undefined>(undefined);

  // Checklist readiness (boolean state — React bail-out jika nilai sama)
  const [faceDetected, setFaceDetected] = useState(false);
  const [poseOk, setPoseOk] = useState(false);
  const [pupilsOk, setPupilsOk] = useState(false);
  const [distanceOk, setDistanceOk] = useState(false);
  const [progress, setProgress] = useState(0); // 0..1, dibulatkan per 5%

  // ── Init MediaPipe ──
  useEffect(() => {
    const originalError = console.error;
    console.error = (...args: unknown[]) => {
      const message = args[0]?.toString?.() || String(args[0]);
      if (
        message.includes('E0603') ||
        message.includes('INTERNAL') ||
        message.includes('ROI width') ||
        message.includes('roi->width') ||
        message.includes('Calculator::Process()') ||
        message.includes('installHook')
      ) {
        return;
      }
      originalError(...args);
    };

    const init = async () => {
      try {
        isMobileDeviceRef.current = isMobileDevice();
        const filesetResolver = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm',
        );
        const landmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: { modelAssetPath: '/face_landmarker.task' },
          runningMode: 'VIDEO',
          numFaces: 1,
          minFaceDetectionConfidence: 0.65,
          minFacePresenceConfidence: 0.65,
          minTrackingConfidence: 0.7,
        });
        faceLandmarkerRef.current = landmarker;
        setIsInitializing(false);
      } catch (err: unknown) {
        console.error('MediaPipe initialization error:', err);
        setError(err instanceof Error ? err.message : 'Gagal menginisialisasi MediaPipe');
        setIsInitializing(false);
      }
    };
    init();

    const handleVisibilityChange = () => {
      isPageVisibleRef.current = document.visibilityState === 'visible';
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      faceLandmarkerRef.current?.close();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      console.error = originalError;
    };
  }, []);

  // ── Kamera ──
  useEffect(() => {
    if (isInitializing || !videoRef.current) return;
    const videoEl = videoRef.current;

    startCamera(videoEl, isMobileDeviceRef.current, setVideoAspectRatio).catch(
      (err: unknown) => {
        console.error('Camera access error:', err);
        setError(err instanceof Error ? err.message : 'Tidak dapat mengakses kamera');
      },
    );

    return () => {
      stopVideoStream(videoEl);
    };
  }, [isInitializing]);

  // ── Deteksi per frame ──
  useEffect(() => {
    if (isInitializing || !videoRef.current || !canvasRef.current || !faceLandmarkerRef.current) {
      return;
    }

    const doCapture = (video: HTMLVideoElement) => {
      if (isCapturingRef.current) return;
      isCapturingRef.current = true;
      onCaptured(buildCaptureResult(video, samplesRef.current));
    };

    const detectAndDraw = async () => {
      try {
        if (!isPageVisibleRef.current || isCapturingRef.current) {
          animationFrameRef.current = requestAnimationFrame(detectAndDraw);
          return;
        }

        const now = performance.now();
        const interval = isMobileDeviceRef.current
          ? MOBILE_DETECTION_INTERVAL_MS
          : DESKTOP_DETECTION_INTERVAL_MS;
        if (now - lastDetectionTimeRef.current < interval) {
          animationFrameRef.current = requestAnimationFrame(detectAndDraw);
          return;
        }
        lastDetectionTimeRef.current = now;
        const tickDelta =
          lastTickRef.current === 0
            ? 0
            : Math.min(MAX_TICK_DELTA_MS, now - lastTickRef.current);
        lastTickRef.current = now;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) {
          animationFrameRef.current = requestAnimationFrame(detectAndDraw);
          return;
        }

        if (
          video.readyState !== video.HAVE_ENOUGH_DATA ||
          video.videoWidth === 0 ||
          video.videoHeight === 0
        ) {
          animationFrameRef.current = requestAnimationFrame(detectAndDraw);
          return;
        }

        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }

        const ctx = canvas.getContext('2d')!;
        const results = await faceLandmarkerRef.current!.detectForVideo(video, now);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawFaceGuide(ctx, canvas);

        const dropSamples = () => {
          samplesRef.current = samplesRef.current.slice(0, Math.max(0, samplesRef.current.length - 2));
          holdMsRef.current = Math.max(0, holdMsRef.current - HOLD_DECAY_MS);
          setProgress(roundProgress(holdMsRef.current / HOLD_DURATION_MS));
        };

        if (!results.faceLandmarks || results.faceLandmarks.length === 0) {
          setFaceDetected(false);
          setPoseOk(false);
          setPupilsOk(false);
          setDistanceOk(false);
          dropSamples();
          animationFrameRef.current = requestAnimationFrame(detectAndDraw);
          return;
        }

        const landmarks = results.faceLandmarks[0];
        if (landmarks.length < 478) {
          setFaceDetected(false);
          dropSamples();
          animationFrameRef.current = requestAnimationFrame(detectAndDraw);
          return;
        }
        setFaceDetected(true);

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

        const fallbackA = getReliableIrisCenter(irisA);
        const fallbackB = getReliableIrisCenter(irisB);
        const shouldRefine = !isMobileDeviceRef.current;
        const frameCtx = shouldRefine
          ? getVideoFrameContext(videoFrameCanvasRef, video, canvas)
          : null;
        const pupilA = frameCtx
          ? refinePupilCenterFromPixels(frameCtx, fallbackA, eyeContours[0])
          : fallbackA;
        const pupilB = frameCtx
          ? refinePupilCenterFromPixels(frameCtx, fallbackB, eyeContours[1])
          : fallbackB;

        const hasReliablePupils =
          isIrisCenterInsideNearestEye(pupilA, eyeContours) &&
          isIrisCenterInsideNearestEye(pupilB, eyeContours);
        setPupilsOk(hasReliablePupils);

        // Head pose: roll dari garis pupil, yaw dari asimetri hidung-pipi
        const pose = estimateHeadPose(
          pupilA,
          pupilB,
          toVideoPoint(1),
          toVideoPoint(234),
          toVideoPoint(454),
        );
        const isPoseOk = pose.isRollOk && pose.isYawOk;
        setPoseOk(isPoseOk);

        const irisDiameters = [
          distance(irisA.left, irisA.right),
          distance(irisA.top, irisA.bottom),
          distance(irisB.left, irisB.right),
          distance(irisB.top, irisB.bottom),
        ].filter((d) => Number.isFinite(d) && d > 2);

        const avgIrisDiameter =
          irisDiameters.length >= 2
            ? irisDiameters.reduce((s, v) => s + v, 0) / irisDiameters.length
            : 0;
        const isDistanceOk = avgIrisDiameter >= MIN_IRIS_DIAMETER_PX;
        setDistanceOk(isDistanceOk);

        // Wajah harus cukup di tengah frame
        const mid = averageOf(pupilA, pupilB);
        const isCentered =
          Math.abs(mid.x - canvas.width / 2) < canvas.width * 0.16 &&
          Math.abs(mid.y - canvas.height * 0.45) < canvas.height * 0.22;

        const isGoodFrame =
          hasReliablePupils && isPoseOk && isDistanceOk && isCentered && irisDiameters.length >= 2;

        if (isGoodFrame) {
          samplesRef.current = [
            ...samplesRef.current.slice(-(MAX_SAMPLES - 1)),
            { irisDiameterPx: avgIrisDiameter, pupilA, pupilB },
          ];
          holdMsRef.current = Math.min(
            HOLD_DURATION_MS,
            holdMsRef.current + tickDelta,
          );
          setProgress(roundProgress(holdMsRef.current / HOLD_DURATION_MS));
        } else {
          dropSamples();
        }

        // Gambar overlay pupil (koordinat display = mirrored)
        const dispA = toDisplayPoint(pupilA);
        const dispB = toDisplayPoint(pupilB);
        drawPupilMarker(ctx, dispA, isGoodFrame);
        drawPupilMarker(ctx, dispB, isGoodFrame);
        drawConnector(ctx, dispA, dispB, isGoodFrame);

        // Auto-capture: posisi bagus ditahan 3 detik + kalibrasi cukup + iris stabil
        if (
          holdMsRef.current >= HOLD_DURATION_MS &&
          samplesRef.current.length >= TARGET_SAMPLES
        ) {
          const diams = samplesRef.current.map((s) => s.irisDiameterPx);
          const avg = diams.reduce((s, v) => s + v, 0) / diams.length;
          const stdev = Math.sqrt(
            diams.reduce((s, v) => s + (v - avg) ** 2, 0) / diams.length,
          );
          if (stdev / avg < 0.045) {
            doCapture(video);
            return;
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (!msg.includes('INTERNAL') && !msg.includes('roi->width') && !msg.includes('roi->height')) {
          console.error('Detection error:', err);
        }
      }

      animationFrameRef.current = requestAnimationFrame(detectAndDraw);
    };

    animationFrameRef.current = requestAnimationFrame(detectAndDraw);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isInitializing, onCaptured]);

  const handleManualCapture = () => {
    const video = videoRef.current;
    if (!video || samplesRef.current.length < MIN_MANUAL_SAMPLES) return;
    if (isCapturingRef.current) return;
    isCapturingRef.current = true;
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    onCaptured(buildCaptureResult(video, samplesRef.current));
  };

  const remainingSeconds = Math.max(
    1,
    Math.ceil(((1 - progress) * HOLD_DURATION_MS) / 1000),
  );
  const statusText = !faceDetected
    ? 'Wajah tidak terdeteksi'
    : !poseOk
      ? 'Luruskan kepala, hadap kamera'
      : !distanceOk
        ? 'Dekatkan wajah ke kamera'
        : !pupilsOk
          ? 'Arahkan pandangan ke kamera'
          : progress >= 1
            ? 'Menstabilkan pengukuran...'
            : `Tahan posisi... ${remainingSeconds} dtk`;

  // ~0.25 dari 3 dtk hold ≈ cukup frame untuk kalibrasi manual minimum
  const canManualCapture = progress >= 0.25;

  return (
    <div className="pdm-view">
      <div className="pdm-media" style={{ aspectRatio: videoAspectRatio }}>
        <video ref={videoRef} className="pdm-video" playsInline muted autoPlay />
        <canvas ref={canvasRef} className="pdm-canvas" />
        {!isInitializing && !error && (
          <div
            className="pdm-media-status"
            style={{ color: faceDetected && poseOk && pupilsOk && distanceOk ? '#a3d9b5' : '#fbbf88' }}
          >
            {statusText}
          </div>
        )}
        {isInitializing && (
          <div className="pdm-loading">
            <div className="pdm-spinner" />
            <p>Memuat deteksi wajah...</p>
          </div>
        )}
      </div>

      <div className="pdm-side">
        <h4 className="pdm-side-title">Posisikan wajah Anda</h4>
        <p className="pdm-side-desc">
          Hadap lurus ke kamera dengan pencahayaan cukup. Foto akan diambil
          otomatis saat posisi stabil.
        </p>

        <div className="pdm-checklist">
          <div className={`pdm-check ${faceDetected ? 'ok' : ''}`}>
            <span className="pdm-check-dot" /> Wajah terdeteksi
          </div>
          <div className={`pdm-check ${poseOk ? 'ok' : ''}`}>
            <span className="pdm-check-dot" /> Kepala lurus &amp; menghadap kamera
          </div>
          <div className={`pdm-check ${distanceOk ? 'ok' : ''}`}>
            <span className="pdm-check-dot" /> Jarak ke kamera pas
          </div>
          <div className={`pdm-check ${pupilsOk ? 'ok' : ''}`}>
            <span className="pdm-check-dot" /> Pupil terlihat jelas
          </div>
        </div>

        <div>
          <div className="pdm-progress">
            <div
              className="pdm-progress-fill"
              style={{ width: `${Math.min(100, Math.round(progress * 100))}%` }}
            />
          </div>
          <p className="pdm-progress-label">
            {progress >= 1
              ? 'Menunggu stabil untuk capture otomatis'
              : 'Tahan posisi bagus selama 3 detik'}
          </p>
        </div>

        {error && <p className="pdm-error">{error}</p>}

        <div className="pdm-side-spacer" />

        <div className="pdm-actions">
          <button
            className="pdm-btn pdm-btn-primary"
            onClick={handleManualCapture}
            disabled={!canManualCapture || !!error}
          >
            Ambil Foto Sekarang
          </button>
          <button className="pdm-btn pdm-btn-secondary" onClick={onCancel}>
            Batal
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Helpers ──

/** Bangun hasil capture: frame mirrored + kalibrasi median + kandidat pupil. */
const buildCaptureResult = (
  video: HTMLVideoElement,
  samples: Sample[],
): PDCaptureResult => {
  const medianIris = median(samples.map((s) => s.irisDiameterPx));
  const recent = samples.slice(-12);
  const pupilA = medianPoint(recent.map((s) => s.pupilA));
  const pupilB = medianPoint(recent.map((s) => s.pupilB));

  const w = video.videoWidth;
  const h = video.videoHeight;
  const captureCanvas = document.createElement('canvas');
  captureCanvas.width = w;
  captureCanvas.height = h;
  const ctx = captureCanvas.getContext('2d')!;
  // Simpan frame mirrored agar konsisten dengan preview yang dilihat user
  ctx.translate(w, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(video, 0, 0, w, h);

  stopVideoStream(video);

  return {
    imageUrl: captureCanvas.toDataURL('image/jpeg', 0.92),
    imageWidth: w,
    imageHeight: h,
    pixelsPerMm: medianIris / IRIS_DIAMETER_MM,
    // Mirror koordinat pupil ke ruang gambar mirrored
    pupilA: { x: w - pupilA.x, y: pupilA.y },
    pupilB: { x: w - pupilB.x, y: pupilB.y },
  };
};

const roundProgress = (value: number) => Math.round(Math.min(1, value) * 20) / 20;

const averageOf = (a: Point, b: Point): Point => ({
  x: (a.x + b.x) / 2,
  y: (a.y + b.y) / 2,
});

const startCamera = async (
  videoEl: HTMLVideoElement,
  isMobile: boolean,
  onAspectRatioChange: (aspectRatio: string | undefined) => void,
) => {
  stopVideoStream(videoEl);

  const videoConstraints: MediaTrackConstraints = isMobile
    ? {
        facingMode: 'user',
        width: { ideal: 720, max: MOBILE_MAX_VIDEO_WIDTH },
        height: { ideal: 960, max: 1280 },
        aspectRatio: { ideal: 0.75 },
        frameRate: { ideal: 15, max: 20 },
      }
    : {
        facingMode: 'user',
        width: { ideal: DESKTOP_MAX_VIDEO_WIDTH, max: DESKTOP_MAX_VIDEO_WIDTH },
        height: { ideal: 720 },
        frameRate: { ideal: 24, max: 30 },
      };

  const stream = await navigator.mediaDevices.getUserMedia({ video: videoConstraints });

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
    frameCanvasRef.current = document.createElement('canvas');
  }
  const frameCanvas = frameCanvasRef.current;
  if (
    frameCanvas.width !== overlayCanvas.width ||
    frameCanvas.height !== overlayCanvas.height
  ) {
    frameCanvas.width = overlayCanvas.width;
    frameCanvas.height = overlayCanvas.height;
  }
  const frameCtx = frameCanvas.getContext('2d', { willReadFrequently: true })!;
  frameCtx.drawImage(video, 0, 0, frameCanvas.width, frameCanvas.height);
  return frameCtx;
};

const drawFaceGuide = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
  const centerX = canvas.width / 2;
  const centerY = canvas.height * 0.46;
  const radiusX = Math.min(canvas.width * 0.2, 190);
  const radiusY = Math.min(canvas.height * 0.36, 270);

  ctx.strokeStyle = 'rgba(247, 241, 232, 0.28)';
  ctx.lineWidth = 2;
  ctx.setLineDash([10, 8]);
  ctx.beginPath();
  ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.setLineDash([]);
};

const drawPupilMarker = (ctx: CanvasRenderingContext2D, point: Point, good: boolean) => {
  const color = good ? '#22c55e' : '#f97316';
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.arc(point.x, point.y, 12, 0, 2 * Math.PI);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
  ctx.fill();
};

const drawConnector = (
  ctx: CanvasRenderingContext2D,
  a: Point,
  b: Point,
  good: boolean,
) => {
  ctx.strokeStyle = good ? 'rgba(34, 197, 94, 0.6)' : 'rgba(249, 115, 22, 0.5)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([7, 5]);
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
  ctx.setLineDash([]);
};
