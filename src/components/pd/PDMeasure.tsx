import { useState } from 'react';
import { X } from 'lucide-react';
import { PDCaptureView, type PDCaptureResult } from './PDCaptureView';
import { PDAdjustView } from './PDAdjustView';
import { PDResultView } from './PDResultView';
import type { Point } from '../../utils/pdGeometry';

interface PDMeasureProps {
  onClose: () => void;
}

type Step = 'capture' | 'adjust' | 'result';

const STEPS: { id: Step; label: string }[] = [
  { id: 'capture', label: 'Posisikan Wajah' },
  { id: 'adjust', label: 'Koreksi Titik' },
  { id: 'result', label: 'Hasil' },
];

export const PDMeasure = ({ onClose }: PDMeasureProps) => {
  const [step, setStep] = useState<Step>('capture');
  const [capture, setCapture] = useState<PDCaptureResult | null>(null);
  const [finalPupils, setFinalPupils] = useState<{ a: Point; b: Point } | null>(null);

  const handleCaptured = (result: PDCaptureResult) => {
    setCapture(result);
    setStep('adjust');
  };

  const handleAdjusted = (pupilA: Point, pupilB: Point) => {
    setFinalPupils({ a: pupilA, b: pupilB });
    setStep('result');
  };

  const handleRestart = () => {
    setCapture(null);
    setFinalPupils(null);
    setStep('capture');
  };

  const stepIndex = STEPS.findIndex((s) => s.id === step);

  return (
    <div className="pdm-overlay">
      <div className="pdm-card">
        {/* Header */}
        <div className="pdm-header">
          <h3 className="pdm-title">Ukur Pupillary Distance</h3>
          <div className="pdm-steps">
            {STEPS.map((s, i) => (
              <div key={s.id} className={`pdm-step ${i === stepIndex ? 'active' : ''} ${i < stepIndex ? 'done' : ''}`}>
                <span className="pdm-step-num">{i + 1}</span>
                <span className="pdm-step-label">{s.label}</span>
              </div>
            ))}
          </div>
          <button className="pdm-close" onClick={onClose} aria-label="Tutup">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="pdm-body">
          {step === 'capture' && (
            <PDCaptureView onCaptured={handleCaptured} onCancel={onClose} />
          )}
          {step === 'adjust' && capture && (
            <PDAdjustView
              capture={capture}
              onConfirm={handleAdjusted}
              onRetake={handleRestart}
            />
          )}
          {step === 'result' && capture && finalPupils && (
            <PDResultView
              capture={capture}
              pupilA={finalPupils.a}
              pupilB={finalPupils.b}
              onRestart={handleRestart}
              onDone={onClose}
            />
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        /* ── Overlay & card ── */
        .pdm-overlay {
          position: fixed;
          inset: 0;
          z-index: 1100;
          background: rgba(13, 18, 16, 0.88);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          animation: pdm-fade-in 0.25s ease both;
        }
        @keyframes pdm-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .pdm-card {
          width: min(96vw, 1060px);
          max-height: calc(100dvh - 40px);
          background: #1d2427;
          border: 1px solid rgba(247,241,232,0.08);
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 24px 70px rgba(0,0,0,0.55);
          animation: pdm-card-in 0.3s cubic-bezier(0.22, 1, 0.36, 1) both;
          color: #f7f1e8;
        }
        @keyframes pdm-card-in {
          from { opacity: 0; transform: scale(0.97) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }

        /* ── Header ── */
        .pdm-header {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 14px 20px;
          background: rgba(247,241,232,0.02);
          border-bottom: 1px solid rgba(247,241,232,0.06);
          flex-shrink: 0;
        }
        .pdm-title {
          margin: 0;
          font-size: 0.95rem;
          font-weight: 600;
          white-space: nowrap;
        }
        .pdm-steps {
          display: flex;
          gap: 4px;
          flex: 1;
          justify-content: center;
          min-width: 0;
        }
        .pdm-step {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 5px 12px;
          border-radius: 999px;
          font-size: 0.74rem;
          color: rgba(247,241,232,0.3);
          transition: all 0.25s;
        }
        .pdm-step.active {
          background: rgba(8,77,38,0.28);
          color: #a3d9b5;
        }
        .pdm-step.done { color: rgba(163,217,181,0.55); }
        .pdm-step-num {
          width: 19px; height: 19px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.68rem;
          font-weight: 700;
          background: rgba(247,241,232,0.07);
          flex-shrink: 0;
        }
        .pdm-step.active .pdm-step-num { background: #084D26; color: #fff; }
        .pdm-step.done .pdm-step-num { background: rgba(8,77,38,0.45); color: #a3d9b5; }
        .pdm-close {
          width: 34px; height: 34px;
          border-radius: 9px;
          background: rgba(247,241,232,0.05);
          border: 1px solid rgba(247,241,232,0.1);
          color: rgba(247,241,232,0.5);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          flex-shrink: 0;
        }
        .pdm-close:hover { color: #f7f1e8; background: rgba(247,241,232,0.1); }

        /* ── Body: 2 kolom desktop ── */
        .pdm-body {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
        }
        .pdm-view {
          display: grid;
          grid-template-columns: minmax(0, 1.6fr) minmax(280px, 1fr);
          gap: 0;
          height: 100%;
        }
        .pdm-media {
          position: relative;
          background: #0d1210;
          min-height: 380px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .pdm-side {
          padding: 22px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          border-left: 1px solid rgba(247,241,232,0.06);
          min-width: 0;
        }
        .pdm-side-title {
          margin: 0;
          font-size: 0.95rem;
          font-weight: 600;
          color: #f7f1e8;
        }
        .pdm-side-desc {
          margin: 0;
          font-size: 0.82rem;
          line-height: 1.55;
          color: rgba(247,241,232,0.55);
        }
        .pdm-side-spacer { flex: 1; }

        /* ── Checklist (capture) ── */
        .pdm-checklist {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }
        .pdm-check {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          border-radius: 9px;
          background: rgba(247,241,232,0.03);
          border: 1px solid rgba(247,241,232,0.06);
          font-size: 0.8rem;
          color: rgba(247,241,232,0.4);
          transition: all 0.2s;
        }
        .pdm-check.ok {
          background: rgba(8,77,38,0.14);
          border-color: rgba(8,77,38,0.4);
          color: #a3d9b5;
        }
        .pdm-check-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: rgba(247,241,232,0.2);
          flex-shrink: 0;
          transition: background 0.2s;
        }
        .pdm-check.ok .pdm-check-dot { background: #22c55e; }

        /* ── Progress ── */
        .pdm-progress {
          height: 6px;
          border-radius: 3px;
          background: rgba(247,241,232,0.07);
          overflow: hidden;
        }
        .pdm-progress-fill {
          height: 100%;
          border-radius: 3px;
          background: linear-gradient(90deg, #084D26, #26b7cd);
          transition: width 0.2s ease;
        }
        .pdm-progress-label {
          font-size: 0.72rem;
          color: rgba(247,241,232,0.4);
          margin: 4px 0 0;
        }

        /* ── PD live readout ── */
        .pdm-readout {
          display: flex;
          align-items: baseline;
          justify-content: center;
          gap: 8px;
          padding: 14px;
          border-radius: 12px;
          background: rgba(8,77,38,0.14);
          border: 1px solid rgba(8,77,38,0.4);
        }
        .pdm-readout-number {
          font-size: 2.2rem;
          font-weight: 800;
          line-height: 1;
          color: #a3d9b5;
          font-variant-numeric: tabular-nums;
        }
        .pdm-readout-unit {
          font-size: 1rem;
          font-weight: 600;
          color: rgba(163,217,181,0.7);
        }

        /* ── Buttons ── */
        .pdm-actions {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .pdm-btn {
          width: 100%;
          min-height: 44px;
          padding: 10px 16px;
          border-radius: 10px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid transparent;
        }
        .pdm-btn:disabled { opacity: 0.45; cursor: not-allowed; }
        .pdm-btn-primary {
          background: #084D26;
          color: #f7f1e8;
          border-color: rgba(8,77,38,0.6);
        }
        .pdm-btn-primary:hover:not(:disabled) {
          background: #0a5c2e;
          box-shadow: 0 4px 14px rgba(8,77,38,0.4);
        }
        .pdm-btn-secondary {
          background: rgba(247,241,232,0.04);
          color: rgba(247,241,232,0.6);
          border-color: rgba(247,241,232,0.12);
        }
        .pdm-btn-secondary:hover:not(:disabled) {
          color: #f7f1e8;
          border-color: rgba(247,241,232,0.25);
        }

        /* ── Disclaimer ── */
        .pdm-disclaimer {
          padding: 10px 14px;
          border-radius: 10px;
          background: rgba(249,115,22,0.07);
          border: 1px solid rgba(249,115,22,0.22);
          font-size: 0.74rem;
          line-height: 1.5;
          color: rgba(251,191,136,0.85);
        }

        /* ── Media contents ── */
        .pdm-video, .pdm-canvas, .pdm-still {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        .pdm-video { transform: scaleX(-1); }
        .pdm-canvas { z-index: 2; }
        .pdm-media-status {
          position: absolute;
          bottom: 12px;
          left: 50%;
          transform: translateX(-50%);
          padding: 6px 16px;
          border-radius: 999px;
          background: rgba(13,18,16,0.82);
          border: 1px solid rgba(247,241,232,0.12);
          font-size: 0.78rem;
          font-weight: 600;
          white-space: nowrap;
          z-index: 3;
        }
        .pdm-loading {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          background: rgba(13,18,16,0.75);
          z-index: 5;
        }
        .pdm-spinner {
          width: 38px; height: 38px;
          border: 3px solid rgba(247,241,232,0.12);
          border-top-color: #26b7cd;
          border-radius: 50%;
          animation: pdm-spin 0.8s linear infinite;
        }
        @keyframes pdm-spin { to { transform: rotate(360deg); } }
        .pdm-loading p { margin: 0; font-size: 0.82rem; color: rgba(247,241,232,0.6); }
        .pdm-error {
          margin: 0;
          padding: 12px 16px;
          border-radius: 10px;
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.3);
          color: #fca5a5;
          font-size: 0.8rem;
          text-align: center;
        }

        /* ── Loupe (magnifier) ── */
        .pdm-loupe {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 130px;
          height: 130px;
          border-radius: 12px;
          border: 2px solid rgba(38,183,205,0.6);
          background: #0d1210;
          z-index: 4;
          overflow: hidden;
          box-shadow: 0 6px 20px rgba(0,0,0,0.5);
        }

        /* ── Nudge controls ── */
        .pdm-point-select {
          display: flex;
          gap: 6px;
        }
        .pdm-point-btn {
          flex: 1;
          padding: 8px 10px;
          border-radius: 9px;
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          background: rgba(247,241,232,0.04);
          border: 1px solid rgba(247,241,232,0.1);
          color: rgba(247,241,232,0.45);
          transition: all 0.15s;
        }
        .pdm-point-btn.active {
          background: rgba(38,183,205,0.14);
          border-color: rgba(38,183,205,0.5);
          color: #7dd7e8;
        }
        .pdm-nudge {
          display: grid;
          grid-template-columns: repeat(3, 44px);
          grid-template-rows: repeat(2, 40px);
          gap: 5px;
          justify-content: center;
        }
        .pdm-nudge-btn {
          border-radius: 9px;
          background: rgba(247,241,232,0.05);
          border: 1px solid rgba(247,241,232,0.1);
          color: rgba(247,241,232,0.7);
          font-size: 1rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.12s;
          user-select: none;
        }
        .pdm-nudge-btn:hover { background: rgba(247,241,232,0.1); }
        .pdm-nudge-btn:active { transform: scale(0.94); background: rgba(38,183,205,0.18); }
        .pdm-nudge-up    { grid-column: 2; grid-row: 1; }
        .pdm-nudge-left  { grid-column: 1; grid-row: 2; }
        .pdm-nudge-down  { grid-column: 2; grid-row: 2; }
        .pdm-nudge-right { grid-column: 3; grid-row: 2; }

        /* ── Result ── */
        .pdm-result-number {
          font-size: 3.4rem;
          font-weight: 800;
          line-height: 1;
          color: #a3d9b5;
          font-variant-numeric: tabular-nums;
          text-align: center;
        }
        .pdm-result-unit { font-size: 1.4rem; color: rgba(163,217,181,0.6); }
        .pdm-result-meta {
          margin: 0;
          text-align: center;
          font-size: 0.76rem;
          color: rgba(247,241,232,0.4);
        }
        .pdm-result-warning {
          margin: 0;
          padding: 8px 12px;
          border-radius: 9px;
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.25);
          color: #fca5a5;
          font-size: 0.76rem;
          text-align: center;
        }

        /* ── Mobile ── */
        @media (max-width: 820px) {
          .pdm-overlay { padding: 0; align-items: stretch; }
          .pdm-card {
            width: 100%;
            max-height: none;
            height: 100dvh;
            border-radius: 0;
            border: 0;
          }
          .pdm-header {
            padding: 10px 14px;
            gap: 10px;
            flex-wrap: wrap;
          }
          .pdm-title { font-size: 0.85rem; }
          .pdm-steps { order: 3; width: 100%; justify-content: space-between; }
          .pdm-step { padding: 4px 8px; }
          .pdm-step-label { font-size: 0.68rem; }
          .pdm-view {
            grid-template-columns: 1fr;
            grid-template-rows: auto 1fr;
          }
          .pdm-media {
            min-height: 0;
            height: 52vh;
            max-height: 58vh;
          }
          .pdm-side {
            border-left: 0;
            border-top: 1px solid rgba(247,241,232,0.06);
            padding: 16px;
            gap: 12px;
          }
          .pdm-side-spacer { display: none; }
          .pdm-readout-number { font-size: 1.8rem; }
          .pdm-result-number { font-size: 2.6rem; }
          .pdm-loupe { width: 104px; height: 104px; }
        }
      ` }} />
    </div>
  );
};
