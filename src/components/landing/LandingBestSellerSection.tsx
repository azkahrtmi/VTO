import { ChevronLeft, ChevronRight } from 'lucide-react';

const bestSellerTabs = ['Best Seller', 'Shop Men', 'Shop Women', 'Shop Sport'];

export function LandingBestSellerSection() {
  return (
    <section className="bg-white px-[6.8rem] py-16 max-[920px]:px-4 max-[920px]:py-10">
      <div className="grid grid-cols-[0.95fr_1.05fr] gap-12 max-[1200px]:grid-cols-1">
        <div className="max-w-[620px]">
          <div className="mb-14 flex flex-wrap items-center gap-6">
            {bestSellerTabs.map((tab, index) => (
              <button
                key={tab}
                type="button"
                className={`rounded-full font-['Outfit','Poppins',sans-serif] text-[18px] leading-[100%] font-medium ${
                  index === 0 ? 'bg-[#232323] px-6 py-5 text-white' : 'text-[#17181b]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <h2 className="max-w-[560px] font-['Outfit','Poppins',sans-serif] text-[58px] leading-[1.08] font-medium tracking-[-0.04em] text-[#1d1f23] max-[920px]:text-[40px]">
            Discover our best selling eyewear
          </h2>
          <p className="mt-10 max-w-[620px] font-['Outfit','Poppins',sans-serif] text-[24px] leading-[1.45] font-normal text-[#2f3035] max-[920px]:text-[20px]">
            Explore our most-loved eyewear, chosen for comfort, versatility,
            and effortless style. Whether you are looking for everyday
            essentials, modern statement frames, or sport-ready designs, this
            collection brings together the styles customers return to most.
          </p>

          <div className="mt-20 flex items-center gap-8 max-[920px]:mt-10">
            <button
              type="button"
              className="flex h-14 w-14 items-center justify-center rounded-full border border-[#d6d3ce] text-[#c8c3bd]"
            >
              <ChevronLeft size={28} />
            </button>
            <button
              type="button"
              className="flex h-16 w-16 items-center justify-center rounded-full bg-[#1f1f1f] text-white"
            >
              <ChevronRight size={32} />
            </button>
          </div>
        </div>

        <div className="overflow-hidden">
          <div className="flex gap-8 overflow-x-auto pb-2 scrollbar-hide">
            <div className="h-[668px] min-w-[640px] rounded-[30px] bg-[#f6f5f4] p-10 max-[920px]:min-w-[320px]">
              <div className="flex h-full items-center justify-center rounded-[26px] border border-[#ece9e4] bg-[radial-gradient(circle_at_center,#ffffff_0%,#f5f3ef_72%)]">
                <div className="h-[220px] w-[360px] rounded-[120px] border-[18px] border-[#181a1e] border-t-[22px] border-b-[12px] shadow-[0_40px_40px_rgba(0,0,0,0.08)]" />
              </div>
            </div>
            <div className="h-[668px] min-w-[280px] rounded-[30px] bg-[linear-gradient(180deg,#f7f7f2_0%,#d6c7ae_100%)] p-8">
              <div className="flex h-full items-end justify-center rounded-[26px] bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.9),transparent_38%)]">
                <div className="mb-20 h-[160px] w-[180px] rounded-[90px] border-[14px] border-[#2f3137] border-t-[18px] border-b-[10px]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
