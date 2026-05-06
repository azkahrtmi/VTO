import { useState } from 'react';
import { Camera } from 'lucide-react';
import { Experience } from './components/Experience';
import { FaceTracker } from './components/FaceTracker';
import { CameraManager } from './components/CameraManager';

function App() {
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleStart = async () => {
    setLoading(true);
    setError(null);
    try {
      setLoadingText('Requesting Camera...');
      const videoElement = await CameraManager.getInstance().start();
      
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
    <>
      {started && <Experience />}

      <div className="ui-layer" style={{ pointerEvents: started ? 'none' : 'auto' }}>
        <div className="top-bar">
          {/* Logo omitted to match reference, or can be kept small */}
        </div>

        {/* UI sidebar dihapus agar fokus pada model GLB sesuai permintaan */}

        {!started && !loading && (
          <div className="glass" style={{ padding: '40px', textAlign: 'center', maxWidth: '400px' }}>
            <h1 style={{ marginBottom: '16px', fontSize: '28px', fontWeight: 800 }}>Try on Eyewear</h1>
            <p style={{ marginBottom: '32px', color: '#a1a1aa' }}>
              Experience real-time 3D virtual try-on powered by AI face tracking.
            </p>
            <button className="btn-primary" onClick={handleStart}>
              <Camera size={24} />
              Start Experience
            </button>
            {error && (
              <div style={{ marginTop: '24px', color: '#ef4444', fontSize: '14px', background: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '8px' }}>
                {error}
              </div>
            )}
          </div>
        )}

        {loading && (
          <div className="glass loading-container">
            <div className="spinner"></div>
            <div style={{ fontWeight: 600 }}>{loadingText}</div>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
