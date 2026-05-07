import { LandingCollections } from './LandingCollections';
import { LandingDiscover } from './LandingDiscover';
import { LandingFooter } from './LandingFooter';
import { LandingHero } from './LandingHero';
import { LandingHighlights } from './LandingHighlights';
import { LandingNavbar } from './LandingNavbar';
import { LandingTopBar } from './LandingTopBar';

type LandingPageProps = {
  onStartTryOn: () => void;
};

export function LandingPage({ onStartTryOn }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-white">
      <div className="overflow-hidden bg-white">
        <LandingTopBar />
        <div className="relative">
          <LandingNavbar />
          <LandingHero onStartTryOn={onStartTryOn} />
          <LandingHighlights />
        </div>
        <LandingCollections />
        <LandingDiscover />
        <LandingFooter />
      </div>
    </div>
  );
}
