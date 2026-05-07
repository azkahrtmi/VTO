import { LandingBestSellerSection } from './LandingBestSellerSection';
import { LandingDesignedSection } from './LandingDesignedSection';
import { LandingMemberExamSection } from './LandingMemberExamSection';
import { LandingPeopleSection } from './LandingPeopleSection';
import { LandingRecommendedSection } from './LandingRecommendedSection';
import { LandingStatementSection } from './LandingStatementSection';
import { LandingStoreSection } from './LandingStoreSection';
import { LandingVirtualTryOnPromoSection } from './LandingVirtualTryOnPromoSection';

export function LandingExtendedSections() {
  return (
    <>
      <LandingBestSellerSection />
      <LandingDesignedSection />
      <LandingVirtualTryOnPromoSection />
      <LandingStatementSection />
      <LandingRecommendedSection />
      <LandingStoreSection />
      <LandingPeopleSection />
      <LandingMemberExamSection />
    </>
  );
}
