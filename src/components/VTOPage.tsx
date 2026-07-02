import { ArrowLeft } from 'lucide-react';
import { DeepARVTO } from './DeepARVTO';

interface VTOPageProps {
  onClose: () => void;
}

export const VTOPage = ({ onClose }: VTOPageProps) => (
  <div className="vto-page">
    <header className="vto-page-header">
      <img src="/landing/logo.png" alt="Optik Tunggal" className="vto-page-logo" />
      <button className="vto-page-back" onClick={onClose}>
        <ArrowLeft size={15} />
        Kembali
      </button>
    </header>
    <div className="vto-page-body">
      <DeepARVTO />
    </div>
  </div>
);
