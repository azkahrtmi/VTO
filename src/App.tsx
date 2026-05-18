import { useEffect, useState } from 'react';
import { RefreshCw, X } from 'lucide-react';
import { MindARVTO } from './components/MindARVTO';
import { LandingPage } from './components/landing/LandingPage';
import { LoginModal } from './components/landing/LoginModal';
import { EyeglassesPage } from './components/eyeglasses/EyeglassesPage';
import { useAppStore } from './store';
import { GLASSES_CATALOG } from './catalog/glasses';

type AppPage = 'landing' | 'eyeglasses';

const getCurrentPage = (): AppPage =>
  window.location.pathname.startsWith('/eyeglasses') ? 'eyeglasses' : 'landing';

function App() {
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState<AppPage>(getCurrentPage);
  const [loginOpen, setLoginOpen] = useState(false);

  const { 
    selectedGlassesId, setSelectedGlassesId
  } = useAppStore();

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPage(getCurrentPage());
      setStarted(false);
      setLoading(false);
      setLoginOpen(false);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (page: AppPage) => {
    const nextPath = page === 'eyeglasses' ? '/eyeglasses' : '/';
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, '', nextPath);
    }

    window.scrollTo({ top: 0, behavior: 'auto' });
    setCurrentPage(page);
    setStarted(false);
    setLoading(false);
  };

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
      {!started && !loading && currentPage === 'landing' && (
        <LandingPage
          onStartTryOn={handleStart}
          onNavigateShop={() => navigateTo('eyeglasses')}
          onNavigateHome={() => navigateTo('landing')}
          onSignIn={() => setLoginOpen(true)}
        />
      )}

      {!started && !loading && currentPage === 'eyeglasses' && (
        <EyeglassesPage
          onNavigateHome={() => navigateTo('landing')}
          onNavigateShop={() => navigateTo('eyeglasses')}
          onSignIn={() => setLoginOpen(true)}
        />
      )}

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />

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
