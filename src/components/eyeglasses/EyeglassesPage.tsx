import { useState } from 'react';
import { LandingFooter } from '../landing/LandingFooter';
import { LandingNavbar } from '../landing/LandingNavbar';
import { LandingTopBar } from '../landing/LandingTopBar';
import { EyeglassesProductCard } from './EyeglassesProductCard';
import { EyeglassesSidebar } from './EyeglassesSidebar';
import { EYEGLASSES_FILTER_CHIPS, EYEGLASSES_PRODUCTS } from './eyeglassesData';
import { EyeglassesToolbar } from './EyeglassesToolbar';

type EyeglassesPageProps = {
  onNavigateHome: () => void;
  onNavigateShop: () => void;
  onSignIn?: () => void;
};

export function EyeglassesPage({
  onNavigateHome,
  onNavigateShop,
  onSignIn,
}: EyeglassesPageProps) {
  const [filtersVisible, setFiltersVisible] = useState(true);

  return (
    <div className="min-h-screen bg-white font-['Outfit','Poppins',sans-serif] text-[#1d2427]">
      <LandingTopBar onNavigateHome={onNavigateHome} />
      <div className="border-y border-[#cfd5d0] bg-white">
        <LandingNavbar
          theme="solid"
          activeItem="Eyeglasses"
          onNavigateHome={onNavigateHome}
          onNavigateShop={onNavigateShop}
          onSignIn={onSignIn}
        />
      </div>

      <main className="pr-8 pl-0 py-5 max-[920px]:px-4 max-[920px]:py-5">
        <div className="mx-auto flex w-full max-w-[1440px] items-start max-[1100px]:flex-col">
          <div
            className={`shrink-0 overflow-hidden transition-[width,opacity,transform] duration-300 ease-in-out max-[1100px]:w-full ${
              filtersVisible
                ? 'h-auto w-[360px] translate-x-0 opacity-100'
                : 'pointer-events-none h-0 w-0 -translate-x-4 opacity-0'
            }`}
          >
            <EyeglassesSidebar />
          </div>

          <section
            className={`min-w-0 flex-1 pt-1 transition-[padding] duration-300 ease-in-out max-[1100px]:w-full max-[1100px]:pt-6 ${
              filtersVisible
                ? 'pl-8 pb-0 max-[1100px]:pl-0'
                : 'pl-6 pb-10 md:pl-8 md:pb-12 lg:pl-10 lg:pb-14'
            }`}
          >
            <EyeglassesToolbar
              totalItems={EYEGLASSES_PRODUCTS.length}
              filtersVisible={filtersVisible}
              onToggleFilters={() => setFiltersVisible((prev) => !prev)}
            />

            <div className="mt-5 flex flex-wrap items-center gap-3">
              {EYEGLASSES_FILTER_CHIPS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  className={`rounded-full px-4 py-2 text-[12px] font-medium ${
                    chip === 'Reset'
                      ? 'bg-[#09372C] text-white'
                      : 'border border-[#09372C] text-[#09372C]'
                  }`}
                >
                  {chip}
                </button>
              ))}
            </div>

            <div
              className={`mt-6 grid gap-x-7 gap-y-10 max-[720px]:grid-cols-1 ${
                filtersVisible
                  ? 'grid-cols-3 max-[1200px]:grid-cols-2'
                  : 'grid-cols-4 max-[1280px]:grid-cols-3 max-[960px]:grid-cols-2'
              }`}
            >
              {EYEGLASSES_PRODUCTS.map((product) => (
                <EyeglassesProductCard
                  key={`${product.brand}-${product.model}`}
                  product={product}
                />
              ))}
            </div>
          </section>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
