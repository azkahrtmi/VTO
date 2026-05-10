import { ChevronLeft, ChevronRight } from 'lucide-react';

const bestSellerTabs = ['Best Seller', 'Shop Men', 'Shop Women', 'Shop Sport'];

export function LandingBestSellerSection() {
  return (
    <section className="bg-white px-[6.8rem] py-16 max-[920px]:px-4 max-[920px]:py-10">
      <div className="grid grid-cols-[420px_minmax(0,1fr)] items-start gap-12 max-[1200px]:grid-cols-1">
        <div className="pt-1">
          <div className="mb-10 flex flex-nowrap items-center gap-6 whitespace-nowrap max-[920px]:flex-wrap">
            {bestSellerTabs.map((tab, index) => (
              <button
                key={tab}
                type="button"
                className={`rounded-full font-['Outfit','Poppins',sans-serif] text-[12px] leading-[100%] font-medium ${
                  index === 0 ? 'bg-[#173e24] px-4 py-[0.85rem] text-white' : 'px-0 py-[0.85rem] text-[#17181b]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <h2 className="max-w-[380px] font-['Outfit','Poppins',sans-serif] text-[48px] leading-[1.08] font-medium tracking-[-0.055em] text-[#1d1f23] max-[920px]:text-[40px]">
            Discover our best selling eyewear
          </h2>
          <p className="mt-7 max-w-[390px] font-['Outfit','Poppins',sans-serif] text-[16px] leading-[1.45] font-normal text-[#2f3035] max-[920px]:text-[18px]">
            Explore our most-loved eyewear, chosen for comfort, versatility,
            and effortless style. Whether you are looking for everyday
            essentials, modern statement frames, or sport-ready designs, this
            collection brings together the styles customers return to most.
          </p>

          <div className="mt-24 flex items-center justify-end gap-7 pr-8 max-[1200px]:mt-10 max-[1200px]:justify-start max-[1200px]:pr-0">
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e4dfd8] text-[#d3cdc6]"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#18562f] text-white"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="overflow-hidden">
          <div className="flex gap-7">
            <div className="flex h-[540px] min-w-[580px] items-center justify-center rounded-[26px] bg-[#f7f6f4] px-10 py-8 max-[920px]:h-[360px] max-[920px]:min-w-[320px]">
              <img
                src="/landing/kacamata/discover/image.png"
                alt="Best seller eyewear"
                className="h-full w-full object-contain mix-blend-multiply"
              />
            </div>
            <div className="flex h-[540px] min-w-[210px] items-center justify-center overflow-hidden rounded-[26px] bg-[#f4f2ed] px-0 py-6 max-[920px]:h-[360px] max-[920px]:min-w-[170px]">
              <img
                src="/landing/kacamata/discover/image2.png"
                alt="Best seller sport eyewear"
                className="h-full w-full object-cover object-left"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
