import { useEffect, useRef, useState, useCallback } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { distance, type Point } from '../../utils/pdGeometry';
import type { PDCaptureResult } from './PDCaptureView';

interface PDAdjustViewProps {
  capture: PDCaptureResult;
  onConfirm: (pupilA: Point, pupilB: Point) => void;
  onRetake: () => void;
}

type PointKey = 'a' | 'b';

const HIT_RADIUS_PX = 30; // Radius klik/tap di koordinat display
const LOUPE_ZOOM = 3;

export const PDAdjustView = ({ capture, onConfirm, onRetake }: PDAdjustViewProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const loupeRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const draggingRef = useRef<PointKey | null>(null);

  const [imageLoaded, setImageLoaded] = useState(false);
  const [pupilA, setPupilA] = useState<Point>(capture.pupilA);
  const [pupilB, setPupilB] = useState<Point>(capture.pupilB);
  const [activePoint, setActivePoint] = useState<PointKey>('a');

  const pdMm = distance(pupilA, pupilB) / capture.pixelsPerMm;
  const pdRounded = Math.round(pdMm * 10) / 10;

  // ── Muat gambar sekali ──
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
      setImageLoaded(true);
    };
    img.src = capture.imageUrl;
  }, [capture.imageUrl]);

  // ── Mapping pointer → koordinat gambar (canvas pakai object-fit: contain) ──
  const toImageCoords = useCallback(
    (clientX: number, clientY: number): Point | null => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      const scale = Math.min(
        rect.width / capture.imageWidth,
        rect.height / capture.imageHeight,
      );
      const offsetX = (rect.width - capture.imageWidth * scale) / 2;
      const offsetY = (rect.height - capture.imageHeight * scale) / 2;
      return {
        x: (clientX - rect.left - offsetX) / scale,
        y: (clientY - rect.top - offsetY) / scale,
      };
    },
    [capture.imageWidth, capture.imageHeight],
  );

  const displayScale = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return 1;
    const rect = canvas.getBoundingClientRect();
    return Math.min(
      rect.width / capture.imageWidth,
      rect.height / capture.imageHeight,
    );
  }, [capture.imageWidth, capture.imageHeight]);

  // ── Gambar ulang canvas utama ──
  useEffect(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img || !imageLoaded) return;

    canvas.width = capture.imageWidth;
    canvas.height = capture.imageHeight;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);

    drawMarker(ctx, pupilA, activePoint === 'a');
    drawMarker(ctx, pupilB, activePoint === 'b');

    // Garis PD
    ctx.strokeStyle = 'rgba(38, 183, 205, 0.75)';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.moveTo(pupilA.x, pupilA.y);
    ctx.lineTo(pupilB.x, pupilB.y);
    ctx.stroke();
    ctx.setLineDash([]);
  }, [imageLoaded, pupilA, pupilB, activePoint, capture.imageWidth, capture.imageHeight]);

  // ── Gambar loupe (zoom di sekitar titik aktif) ──
  useEffect(() => {
    const loupe = loupeRef.current;
    const img = imageRef.current;
    if (!loupe || !img || !imageLoaded) return;

    const size = loupe.width;
    const point = activePoint === 'a' ? pupilA : pupilB;
    const srcSize = size / LOUPE_ZOOM;

    const ctx = loupe.getContext('2d')!;
    ctx.fillStyle = '#0d1210';
    ctx.fillRect(0, 0, size, size);
    ctx.drawImage(
      img,
      point.x - srcSize / 2,
      point.y - srcSize / 2,
      srcSize,
      srcSize,
      0,
      0,
      size,
      size,
    );

    // Crosshair di tengah loupe
    ctx.strokeStyle = '#26b7cd';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(size / 2 - 12, size / 2);
    ctx.lineTo(size / 2 + 12, size / 2);
    ctx.moveTo(size / 2, size / 2 - 12);
    ctx.lineTo(size / 2, size / 2 + 12);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, 8, 0, 2 * Math.PI);
    ctx.stroke();
  }, [imageLoaded, pupilA, pupilB, activePoint]);

  // ── Pointer handlers ──
  const handlePointerDown = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const pos = toImageCoords(event.clientX, event.clientY);
    if (!pos) return;

    const scale = displayScale();
    const hitRadius = HIT_RADIUS_PX / scale;
    const distA = distance(pos, pupilA);
    const distB = distance(pos, pupilB);

    if (Math.min(distA, distB) > hitRadius) return;

    const key: PointKey = distA <= distB ? 'a' : 'b';
    draggingRef.current = key;
    setActivePoint(key);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!draggingRef.current) return;
    const pos = toImageCoords(event.clientX, event.clientY);
    if (!pos) return;

    const clamped = {
      x: Math.min(capture.imageWidth, Math.max(0, pos.x)),
      y: Math.min(capture.imageHeight, Math.max(0, pos.y)),
    };
    if (draggingRef.current === 'a') setPupilA(clamped);
    else setPupilB(clamped);
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    draggingRef.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  // ── Nudge (geser 1px per klik) ──
  const nudge = (dx: number, dy: number) => {
    const setter = activePoint === 'a' ? setPupilA : setPupilB;
    setter((prev) => ({
      x: Math.min(capture.imageWidth, Math.max(0, prev.x + dx)),
      y: Math.min(capture.imageHeight, Math.max(0, prev.y + dy)),
    }));
  };

  return (
    <div className="pdm-view">
      <div className="pdm-media">
        <canvas
          ref={canvasRef}
          className="pdm-canvas"
          style={{ touchAction: 'none', cursor: 'crosshair' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        />
        <canvas ref={loupeRef} className="pdm-loupe" width={130} height={130} />
        {!imageLoaded && (
          <div className="pdm-loading">
            <div className="pdm-spinner" />
            <p>Memuat gambar...</p>
          </div>
        )}
      </div>

      <div className="pdm-side">
        <h4 className="pdm-side-title">Koreksi titik pupil</h4>
        <p className="pdm-side-desc">
          Geser titik hingga tepat di tengah pupil (bagian tergelap mata).
          Gunakan kaca pembesar di pojok untuk presisi, atau tombol panah untuk
          geser halus.
        </p>

        <div className="pdm-readout">
          <span className="pdm-readout-number">{pdRounded.toFixed(1)}</span>
          <span className="pdm-readout-unit">mm</span>
        </div>

        <div className="pdm-point-select">
          <button
            className={`pdm-point-btn ${activePoint === 'a' ? 'active' : ''}`}
            onClick={() => setActivePoint('a')}
          >
            Titik Kiri
          </button>
          <button
            className={`pdm-point-btn ${activePoint === 'b' ? 'active' : ''}`}
            onClick={() => setActivePoint('b')}
          >
            Titik Kanan
          </button>
        </div>

        <div className="pdm-nudge">
          <button className="pdm-nudge-btn pdm-nudge-up" onClick={() => nudge(0, -1)} aria-label="Geser atas">
            <ArrowUp size={16} />
          </button>
          <button className="pdm-nudge-btn pdm-nudge-left" onClick={() => nudge(-1, 0)} aria-label="Geser kiri">
            <ArrowLeft size={16} />
          </button>
          <button className="pdm-nudge-btn pdm-nudge-down" onClick={() => nudge(0, 1)} aria-label="Geser bawah">
            <ArrowDown size={16} />
          </button>
          <button className="pdm-nudge-btn pdm-nudge-right" onClick={() => nudge(1, 0)} aria-label="Geser kanan">
            <ArrowRight size={16} />
          </button>
        </div>

        <div className="pdm-side-spacer" />

        <div className="pdm-actions">
          <button className="pdm-btn pdm-btn-primary" onClick={() => onConfirm(pupilA, pupilB)}>
            Konfirmasi Titik
          </button>
          <button className="pdm-btn pdm-btn-secondary" onClick={onRetake}>
            Ulangi Foto
          </button>
        </div>
      </div>
    </div>
  );
};

const drawMarker = (ctx: CanvasRenderingContext2D, point: Point, isActive: boolean) => {
  const color = isActive ? '#26b7cd' : '#22c55e';

  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(point.x, point.y, 14, 0, 2 * Math.PI);
  ctx.stroke();

  // Crosshair kecil, titik tengah dibiarkan terbuka agar pupil tetap terlihat
  ctx.beginPath();
  ctx.moveTo(point.x - 8, point.y);
  ctx.lineTo(point.x - 3, point.y);
  ctx.moveTo(point.x + 3, point.y);
  ctx.lineTo(point.x + 8, point.y);
  ctx.moveTo(point.x, point.y - 8);
  ctx.lineTo(point.x, point.y - 3);
  ctx.moveTo(point.x, point.y + 3);
  ctx.lineTo(point.x, point.y + 8);
  ctx.stroke();

  if (isActive) {
    ctx.strokeStyle = 'rgba(38, 183, 205, 0.35)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(point.x, point.y, 19, 0, 2 * Math.PI);
    ctx.stroke();
  }
};
