import { useState } from 'react';
import { RefreshCw, X, Camera } from 'lucide-react';
import { MindARVTO } from './components/MindARVTO';
import { LandingPage } from './components/landing/LandingPage';
import { useAppStore } from './store';
import { GLASSES_CATALOG } from './catalog/glasses';

function App() {
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(false);

  const { 
    selectedGlassesId, setSelectedGlassesId
  } = useAppStore();

  const handleStart = async () => {
    setLoading(true);
    try {
      setStarted(true);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    window.location.reload();
  };

  return (
    <div className="vto-app">
      {/* Landing Page (always behind) */}
      {!started && !loading && (
        <LandingPage onStartTryOn={handleStart} />
      )}

      {loading && (
        <div className="loading-screen">
          <RefreshCw className="spinner" size={48} />
          <p>Loading AR System...</p>
        </div>
      )}

      {/* VTO Modal Overlay */}
      {started && (
        <div className="vto-modal-overlay">
          <div className="vto-modal">
            {/* Modal Header */}
            <div className="vto-modal-header">
              <h3 className="vto-modal-title">Virtual Try-On</h3>
              <button className="vto-modal-close" onClick={handleClose}>
                <X size={20} />
              </button>
            </div>

            {/* Camera Feed Container */}
            <div className="vto-modal-camera">
              <MindARVTO />
            </div>

            {/* Glasses Selector */}
            <div className="vto-modal-selector">
              <div className="vto-modal-glasses-row">
                {GLASSES_CATALOG.map((item) => (
                  <button 
                    key={item.id}
                    className={`vto-glass-chip ${selectedGlassesId === item.id ? 'active' : ''}`}
                    onClick={() => setSelectedGlassesId(item.id)}
                  >
                    <div className="vto-glass-swatch" style={{ backgroundColor: item.color }}></div>
                    <span>{item.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
