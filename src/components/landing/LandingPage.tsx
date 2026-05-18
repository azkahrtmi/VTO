import { LandingCollections } from './LandingCollections';
import { LandingDiscover } from './LandingDiscover';
import { LandingExtendedSections } from './LandingExtendedSections';
import { LandingFooter } from './LandingFooter';
import { LandingHero } from './LandingHero';
import { LandingHighlights } from './LandingHighlights';
import { LandingNavbar } from './LandingNavbar';
import { LandingTopBar } from './LandingTopBar';

type LandingPageProps = {
  onStartTryOn: () => void;
  onNavigateShop?: () => void;
  onNavigateHome?: () => void;
  onSignIn?: () => void;
};

export function LandingPage({
  onStartTryOn,
  onNavigateShop,
  onNavigateHome,
  onSignIn,
}: LandingPageProps) {
  return (
    <div className="min-h-screen bg-white">
      <div className="overflow-hidden bg-white">
        <LandingTopBar onNavigateHome={onNavigateHome} />
        <div className="relative">
          <LandingNavbar
            onNavigateHome={onNavigateHome}
            onNavigateShop={onNavigateShop}
            onSignIn={onSignIn}
          />
          <LandingHero onStartTryOn={onStartTryOn} onNavigateShop={onNavigateShop} />
          <LandingHighlights />
        </div>
        <LandingCollections />
        <LandingExtendedSections />
        <LandingDiscover onNavigateShop={onNavigateShop} />
        <LandingFooter />
      </div>
    </div>
  );
}
