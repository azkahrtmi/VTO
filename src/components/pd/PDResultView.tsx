import { useEffect, useRef, useState } from 'react';
import { Download } from 'lucide-react';
import { useAppStore } from '../../store';
import {
  MAX_VALID_PD_MM,
  MIN_VALID_PD_MM,
  distance,
  type Point,
} from '../../utils/pdGeometry';
import type { PDCaptureResult } from './PDCaptureView';

interface PDResultViewProps {
  capture: PDCaptureResult;
  pupilA: Point;
  pupilB: Point;
  onRestart: () => void;
  onDone: () => void;
}

export const PDResultView = ({
  capture,
  pupilA,
  pupilB,
  onRestart,
  onDone,
}: PDResultViewProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [annotatedUrl, setAnnotatedUrl] = useState<string | null>(null);
  const setPDResult = useAppStore((s) => s.setPDResult);

  const pdMm = Math.round((distance(pupilA, pupilB) / capture.pixelsPerMm) * 10) / 10;
  const isOutOfRange = pdMm < MIN_VALID_PD_MM || pdMm > MAX_VALID_PD_MM;

  // Simpan hasil ke store + localStorage saat sampai di step hasil
  useEffect(() => {
    if (!isOutOfRange) {
      setPDResult(pdMm);
    }
  }, [pdMm, isOutOfRange, setPDResult]);

  // Render gambar hasil beranotasi
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = capture.imageWidth;
      canvas.height = capture.imageHeight;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);

      const color = '#22c55e';
      for (const point of [pupilA, pupilB]) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(point.x, point.y, 12, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3.5, 0, 2 * Math.PI);
        ctx.fill();
      }

      ctx.strokeStyle = 'rgba(34, 197, 94, 0.7)';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.moveTo(pupilA.x, pupilA.y);
      ctx.lineTo(pupilB.x, pupilB.y);
      ctx.stroke();
      ctx.setLineDash([]);

      const midX = (pupilA.x + pupilB.x) / 2;
      const midY = (pupilA.y + pupilB.y) / 2;
      ctx.font = 'bold 26px Arial';
      ctx.fillStyle = color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(`PD ${pdMm.toFixed(1)} mm`, midX, midY - 14);

      setAnnotatedUrl(canvas.toDataURL('image/png'));
    };
    img.src = capture.imageUrl;
  }, [capture, pupilA, pupilB, pdMm]);

  const handleDownload = () => {
    if (!annotatedUrl) return;
    const link = document.createElement('a');
    link.href = annotatedUrl;
    link.download = `pd-${pdMm.toFixed(1)}mm.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="pdm-view">
      <div className="pdm-media">
        <canvas ref={canvasRef} className="pdm-still" />
      </div>

      <div className="pdm-side">
        <h4 className="pdm-side-title">Hasil pengukuran</h4>

        <div>
          <p className="pdm-result-number">
            {pdMm.toFixed(1)}
            <span className="pdm-result-unit"> mm</span>
          </p>
          <p className="pdm-result-meta">Binocular Pupillary Distance (estimasi)</p>
        </div>

        {isOutOfRange && (
          <p className="pdm-result-warning">
            Hasil di luar rentang wajar ({MIN_VALID_PD_MM}–{MAX_VALID_PD_MM} mm)
            dan tidak disimpan. Coba ukur ulang dengan pencahayaan lebih baik.
          </p>
        )}

        <div className="pdm-disclaimer">
          Hasil ini adalah <strong>estimasi</strong> berbasis kamera dan bukan
          pengganti pengukuran profesional. Untuk pembelian lensa resep,
          konsultasikan PD Anda dengan optician.
        </div>

        <div className="pdm-side-spacer" />

        <div className="pdm-actions">
          <button className="pdm-btn pdm-btn-primary" onClick={onDone}>
            {isOutOfRange ? 'Tutup' : 'Simpan & Selesai'}
          </button>
          <button className="pdm-btn pdm-btn-secondary" onClick={handleDownload} disabled={!annotatedUrl}>
            <Download size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 6 }} />
            Unduh Gambar
          </button>
          <button className="pdm-btn pdm-btn-secondary" onClick={onRestart}>
            Ukur Ulang
          </button>
        </div>
      </div>
    </div>
  );
};
