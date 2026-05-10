import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const bestSellerTabs = ["Best Seller", "Shop Men", "Shop Women", "Shop Sport"];

export function LandingBestSellerSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const totalItems = 2;

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % totalItems);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + totalItems) % totalItems);
  };

  return (
    <section className="overflow-hidden bg-white px-20 py-16 max-[1200px]:px-8 max-[920px]:px-4 max-[920px]:py-10">
      <div className="flex h-[534px] w-max gap-[129px] max-[1200px]:h-auto max-[1200px]:w-full max-[1200px]:flex-col max-[1200px]:gap-10">
        <div className="flex w-[516px] shrink-0 flex-col max-[1200px]:w-full">
          <div className="mb-10 flex flex-nowrap items-center gap-6 whitespace-nowrap max-[920px]:flex-wrap">
            {bestSellerTabs.map((tab, index) => (
              <button
                key={tab}
                type="button"
                className={`rounded-full font-['Outfit','Poppins',sans-serif] text-[12px] leading-[100%] font-medium transition-all duration-300 ${
                  index === 0
                    ? "bg-[#173e24] px-4 py-[0.85rem] text-white"
                    : "px-0 py-[0.85rem] text-[#17181b]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <h2 className="max-w-[380px] font-['Outfit','Poppins',sans-serif] text-[48px] leading-[1.08] font-medium tracking-[0] text-[#1d1f23] max-[920px]:text-[40px]">
            Discover our best selling eyewear
          </h2>
          <p className="mt-7 max-w-[390px] font-['Outfit','Poppins',sans-serif] text-[16px] leading-[1.45] font-normal text-[#2f3035] max-[920px]:text-[18px]">
            Explore our most-loved eyewear, chosen for comfort, versatility, and
            effortless style. Whether you are looking for everyday essentials,
            modern statement frames, or sport-ready designs, this collection
            brings together the styles customers return to most.
          </p>

          <div className="mt-auto flex items-center justify-end gap-7 pr-[168px] pt-10 max-[1200px]:mt-10 max-[1200px]:justify-start max-[1200px]:pr-0">
            <button
              type="button"
              onClick={prevSlide}
              className={`flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-300 ${
                currentIndex === 0 
                ? "border-[#e4dfd8] text-[#d3cdc6]" 
                : "border-[#18562f] bg-[#18562f] text-white"
              }`}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={nextSlide}
              className={`flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-300 ${
                currentIndex === totalItems - 1
                ? "border-[#e4dfd8] text-[#d3cdc6]" 
                : "border-[#18562f] bg-[#18562f] text-white"
              }`}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="overflow-hidden">
          <div 
            className="flex gap-7 transition-transform duration-700 cubic-bezier(0.4, 0, 0.2, 1)"
            style={{ 
              transform: window.innerWidth < 920 
                ? `translateX(-${currentIndex * (320 + 28)}px)`
                : `translateX(-${currentIndex * (516 + 28)}px)` 
            }}
          >
            <div className="flex h-[534px] w-[516px] shrink-0 items-center justify-center overflow-hidden rounded-[14px] bg-[#f4f2ed] max-[920px]:h-[360px] max-[920px]:w-[320px]">
              <img
                src="/landing/kacamata/discover/image2.png"
                alt="Best seller eyewear"
                className="h-full w-full object-cover object-left"
              />
            </div>
            <div className="flex h-[534px] w-[516px] shrink-0 items-center justify-center overflow-hidden rounded-[14px] bg-[#f4f2ed] max-[920px]:h-[360px] max-[920px]:w-[320px]">
              <img
                src="/landing/kacamata/discover/image2.jpg"
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
