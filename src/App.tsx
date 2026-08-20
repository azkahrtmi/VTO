import { useState, useEffect, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import { VTOPage } from './components/VTOPage';
import { LandingPage } from './components/landing/LandingPage';
import { LoginModal } from './components/landing/LoginModal';
import { EyeglassesPage } from './components/eyeglasses/EyeglassesPage';
import { useAppStore } from './store';

type AppPage = 'landing' | 'eyeglasses';

const getCurrentPage = (): AppPage =>
  window.location.pathname.startsWith('/eyeglasses') ? 'eyeglasses' : 'landing';

function App() {
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState<AppPage>(getCurrentPage);
  const [loginOpen, setLoginOpen] = useState(false);

  const { loadCatalogFromOdoo } = useAppStore();

  useEffect(() => {
    loadCatalogFromOdoo();
  }, [loadCatalogFromOdoo]);

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

  const handleClose = useCallback(() => {
    setStarted(false);
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (started) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [started]);

  // Close modal on Escape key
  useEffect(() => {
    if (!started) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [started, handleClose]);

  return (
    <div className="vto-app">
      {/* Pages stay mounted and visible so backdrop-filter on the modal overlay blurs them */}
      {!loading && currentPage === 'landing' && (
        <LandingPage
          onStartTryOn={handleStart}
          onNavigateShop={() => navigateTo('eyeglasses')}
          onNavigateHome={() => navigateTo('landing')}
          onSignIn={() => setLoginOpen(true)}
        />
      )}

      {!loading && currentPage === 'eyeglasses' && (
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

      {/* VTO Full Page */}
      {started && <VTOPage onClose={handleClose} />}
    </div>
  );
}

export default App;
