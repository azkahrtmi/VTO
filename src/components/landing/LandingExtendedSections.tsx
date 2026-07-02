import { LandingBestSellerSection } from './LandingBestSellerSection';
import { LandingDesignedSection } from './LandingDesignedSection';
import { LandingMemberExamSection } from './LandingMemberExamSection';
import { LandingPeopleSection } from './LandingPeopleSection';
import { LandingRecommendedSection } from './LandingRecommendedSection';
import { LandingStatementSection } from './LandingStatementSection';
import { LandingStoreSection } from './LandingStoreSection';
import { LandingVirtualTryOnPromoSection } from './LandingVirtualTryOnPromoSection';
import { Reveal } from './Reveal';

export function LandingExtendedSections() {
  return (
    <>
      <Reveal><LandingBestSellerSection /></Reveal>
      <Reveal><LandingDesignedSection /></Reveal>
      <Reveal><LandingVirtualTryOnPromoSection /></Reveal>
      <Reveal><LandingStatementSection /></Reveal>
      <Reveal><LandingRecommendedSection /></Reveal>
      <Reveal><LandingStoreSection /></Reveal>
      <Reveal><LandingPeopleSection /></Reveal>
      <Reveal><LandingMemberExamSection /></Reveal>
    </>
  );
}
