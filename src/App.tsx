import { useState, useRef } from 'react';
import { Camera, RefreshCw, Eye, EyeOff, LayoutGrid } from 'lucide-react';
import { FaceTracker } from './components/FaceTracker';
import { CameraManager } from './components/CameraManager';
import { VTOOverlay } from './components/VTOOverlay';
import { useAppStore } from './store';
import { GLASSES_CATALOG } from './catalog/glasses';

function App() {
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const { 
    showDots, showGlasses, selectedGlassesId, 
    setShowDots, setShowGlasses, setSelectedGlassesId 
  } = useAppStore();

  const handleStart = async () => {
    setLoading(true);
    setError(null);
    try {
      setLoadingText('Requesting Camera...');
      const videoElement = await CameraManager.getInstance().start();
      videoRef.current = videoElement;
      
      setLoadingText('Loading AI Models...');
      const tracker = FaceTracker.getInstance();
      await tracker.initialize();
      tracker.start(videoElement);

      setStarted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to start AR experience');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vto-app">
      {/* Video Background Layer */}
      <div id="video-container" className={started ? 'active' : ''}>
        {/* The video element is managed by CameraManager but we can reference it */}
      </div>

      {/* Canvas Overlay Layer */}
      {started && videoRef.current && <VTOOverlay video={videoRef.current} />}

      {/* UI Layer */}
      <div className="ui-layer">
        {!started && !loading && (
          <div className="welcome-screen">
            <div className="glass-card">
              <h1 className="title">Virtual Try-On</h1>
              <p className="subtitle">Discover your perfect look with our AI-powered eyewear simulator.</p>
              <button className="btn-primary" onClick={handleStart}>
                <Camera size={20} />
                <span>Start Experience</span>
              </button>
            </div>
          </div>
        )}

        {loading && (
          <div className="loading-screen">
            <RefreshCw className="spinner" size={48} />
            <p>{loadingText}</p>
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
                className={`btn-icon ${showDots ? 'active' : ''}`} 
                onClick={() => setShowDots(!showDots)}
                title="Toggle Landmarks"
              >
                {showDots ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
              <button 
                className={`btn-icon ${showGlasses ? 'active' : ''}`} 
                onClick={() => setShowGlasses(!showGlasses)}
                title="Toggle Glasses"
              >
                <LayoutGrid size={20} />
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
