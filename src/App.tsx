import { useState } from 'react';
import { RefreshCw, Settings, Check } from 'lucide-react';
import { JeelizVTO } from './components/JeelizVTO';
import { MediaPipeVTO } from './components/MediaPipeVTO';
import { LandingPage } from './components/landing/LandingPage';
import { useAppStore } from './store';
import { GLASSES_CATALOG } from './catalog/glasses';

function App() {
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { 
    selectedGlassesId, setSelectedGlassesId,
    isAdjustMode, setAdjustMode
  } = useAppStore();

  const selectedGlasses = GLASSES_CATALOG.find(g => g.id === selectedGlassesId);

  const handleStart = async () => {
    setLoading(true);
    setError(null);
    try {
      setStarted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to start AR experience');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vto-app">
      {/* Video Background & 3D Layer */}
      {started && (
        selectedGlasses?.type === 'jeeliz' ? <JeelizVTO /> : <MediaPipeVTO />
      )}

      {/* UI Layer */}
      <div className="ui-layer">
        {!started && !loading && (
          <LandingPage onStartTryOn={handleStart} />
        )}

        {loading && (
          <div className="loading-screen">
            <RefreshCw className="spinner" size={48} />
            <p>Initializing AR Engine...</p>
          </div>
        )}

        {error && (
          <div className="error-screen">
            <p className="error-msg">{error}</p>
            <button className="btn-secondary" onClick={() => window.location.reload()}>Retry</button>
          </div>
        )}

        {started && (
          <>
            <div className="top-controls">
              <button 
                className={`btn-icon ${isAdjustMode ? 'active' : ''}`} 
                onClick={() => setAdjustMode(!isAdjustMode)}
                title={isAdjustMode ? "Save Adjustment" : "Adjust Glasses"}
              >
                {isAdjustMode ? <Check size={20} /> : <Settings size={20} />}
              </button>
            </div>

            <div className="bottom-shelf">
              <div className="glasses-grid">
                {GLASSES_CATALOG.map((item) => (
                  <button 
                    key={item.id}
                    className={`glasses-item ${selectedGlassesId === item.id ? 'selected' : ''}`}
                    onClick={() => setSelectedGlassesId(item.id)}
                  >
                    <div className="swatch" style={{ backgroundColor: item.color }}></div>
                    <span className="name">{item.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
