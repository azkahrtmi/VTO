import { useState } from 'react';
<<<<<<< HEAD
import { Camera, RefreshCw } from 'lucide-react';
import { MindARVTO } from './components/MindARVTO';
=======
import { RefreshCw, Settings, Check } from 'lucide-react';
import { JeelizVTO } from './components/JeelizVTO';
import { MediaPipeVTO } from './components/MediaPipeVTO';
import { LandingPage } from './components/landing/LandingPage';
>>>>>>> 79fcda1b626c3f66d9f9f589a9d6d6be4d66014a
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

  return (
    <div className="vto-app">
      {/* MindAR Scene Background */}
      {started && <MindARVTO />}

      {/* UI Layer */}
      <div className="ui-layer" style={{ zIndex: 10 }}>
        {!started && !loading && (
<<<<<<< HEAD
          <div className="welcome-screen">
            <div className="glass-card">
              <h1 className="title">Virtual Try-On PRO</h1>
              <p className="subtitle">Powered by MindAR & A-Frame for high stability.</p>
              <button className="btn-primary" onClick={handleStart}>
                <Camera size={20} />
                <span>Start Experience</span>
              </button>
            </div>
          </div>
=======
          <LandingPage onStartTryOn={handleStart} />
>>>>>>> 79fcda1b626c3f66d9f9f589a9d6d6be4d66014a
        )}

        {loading && (
          <div className="loading-screen">
            <RefreshCw className="spinner" size={48} />
            <p>Loading AR System...</p>
          </div>
        )}

        {started && (
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
            
            {/* Back button */}
            <button 
              style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.1)', border: '1px solid #fff', color: '#fff', borderRadius: '8px' }}
              onClick={() => window.location.reload()}
            >
              Back to Menu
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
