import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const designItems = [
  {
    id: "vision-care",
    tag: "Vision Care",
    tagBg: "bg-[#0f5a34]",
    tagText: "text-white",
    title: "Free Eye Exam",
    description: "Get your eyes checked at no extra cost with professional care designed to help you find the right prescription and everyday visual comfort.",
    image: "/landing/visioncare.jpg",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 8C11 8 6.73 11.11 5 15.5C6.73 19.89 11 23 16 23C21 23 25.27 19.89 27 15.5C25.27 11.11 21 8 16 8ZM16 20.5C13.24 20.5 11 18.26 11 15.5C11 12.74 13.24 10.5 16 10.5C18.76 10.5 21 12.74 21 15.5C21 18.26 18.76 20.5 16 20.5ZM16 12.5C14.34 12.5 13 13.84 13 15.5C13 17.16 14.34 18.5 16 18.5C17.66 18.5 19 17.16 19 15.5C19 13.84 17.66 12.5 16 12.5Z" fill="currentColor"/>
      </svg>
    )
  },
  {
    id: "technology",
    tag: "Technology",
    tagBg: "bg-[#0f5a34]",
    tagText: "text-white",
    title: "Advanced Technology",
    description: "Experience the latest in eyecare technology for precise measurements and comprehensive eye health assessments.",
    image: "/landing/tech.png",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22 10V14H20V10H12V14H10V10C10 8.9 10.9 8 12 8H20C21.1 8 22 8.9 22 10ZM16 16C13.8 16 12 17.8 12 20C12 22.2 13.8 24 16 24C18.2 24 20 22.2 20 20C20 17.8 18.2 16 16 16ZM26 14V22C26 23.1 25.1 24 24 24H22V22H24V14H8V22H10V24H8C6.9 24 6 23.1 6 22V14C6 12.9 6.9 12 8 12H24C25.1 12 26 12.9 26 14Z" fill="currentColor"/>
      </svg>
    )
  },
  {
    id: "store-pickup",
    tag: "Store Pickup",
    tagBg: "bg-[#0f5a34]",
    tagText: "text-white",
    title: "Shopping Experience",
    description: "Enjoy a seamless shopping experience with easy online ordering and convenient pickup at your nearest Optik Tunggal store.",
    image: "/landing/storepickup.jpg",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M24 10V22C24 23.1 23.1 24 22 24H10C8.9 24 8 23.1 8 22V10M6 8H26L25 10H7L6 8ZM14 14H18M14 18H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    )
  }
];

export function LandingDesignedSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % designItems.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + designItems.length) % designItems.length);
  };

  const mainItem = designItems[activeIndex];
  const sideItem1 = designItems[(activeIndex + 1) % designItems.length];
  const sideItem2 = designItems[(activeIndex + 2) % designItems.length];

  return (
    <section className="bg-white px-[6.8rem] py-8 max-[920px]:px-4 max-[920px]:py-8">
      <h2 className="mb-10 font-['Outfit','Poppins',sans-serif] text-[56px] leading-[1.02] font-medium tracking-[-0.05em] text-[#1d1f23] max-[920px]:text-[42px]">
        Designed for the Way You See
      </h2>

      <div className="grid grid-cols-[1.45fr_1fr] gap-8 max-[1280px]:grid-cols-1">
        {/* Main Large Box */}
        <article className="grid min-h-[470px] grid-cols-[1.08fr_0.92fr] gap-6 rounded-[30px] bg-[#232222] p-10 text-white max-[920px]:grid-cols-1 max-[920px]:p-6 max-[920px]:min-h-0">
          <div className="relative overflow-hidden rounded-[22px] aspect-[4/3] max-[920px]:aspect-square">
            <img
              src={mainItem.image}
              alt={mainItem.tag}
              className="absolute inset-0 h-full w-full object-cover object-center transition-all duration-500"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(22,22,22,0.08)_0%,rgba(22,22,22,0.16)_100%)]" />
            <span className={`absolute left-5 top-5 rounded-full ${mainItem.tagBg} px-5 py-3 font-['Outfit','Poppins',sans-serif] text-[16px] leading-[100%] font-medium ${mainItem.tagText}`}>
              {mainItem.tag}
            </span>
          </div>

          <div className="flex flex-col justify-between py-2">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-[#1f1f1f]">
              {mainItem.icon}
            </div>
            <div className="mt-6">
              <h3 className="font-['Outfit','Poppins',sans-serif] text-[44px] leading-[0.98] font-medium tracking-[-0.04em] max-[920px]:text-[32px]">
                {mainItem.title}
              </h3>
              <p className="mt-4 max-w-[320px] font-['Outfit','Poppins',sans-serif] text-[16px] leading-[1.55] text-white/92 max-[920px]:text-[14px]">
                {mainItem.description}
              </p>
            </div>
          </div>
        </article>

        <div className="grid grid-rows-[1fr_auto] gap-8 max-[1280px]:grid-rows-1">
          {/* Side Small Boxes - Hidden on Mobile */}
          <div className="grid grid-cols-[251px_251px] gap-5 max-w-[522px] max-[1280px]:max-w-none max-[1280px]:grid-cols-2 max-[720px]:hidden">
            {[sideItem1, sideItem2].map((item) => (
              <article 
                key={item.id} 
                className="relative h-[292px] overflow-hidden rounded-[24px] p-5 text-white transition-all duration-500 cursor-pointer hover:opacity-90"
                onClick={() => setActiveIndex(designItems.indexOf(item))}
              >
                <img
                  src={item.image}
                  alt={item.tag}
                  className="absolute inset-0 h-full w-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,25,84,0.15)_0%,rgba(12,25,84,0.28)_100%)]" />
                <span className={`absolute left-5 top-5 rounded-full ${item.tagBg} px-4 py-2.5 font-['Outfit','Poppins',sans-serif] text-[11px] leading-[1] font-medium ${item.tagText}`}>
                  {item.tag}
                </span>
                <div className="relative flex h-full items-end">
                  <h3 className="max-w-[155px] font-['Outfit','Poppins',sans-serif] text-[18px] leading-[1.18] font-medium">
                    {item.title}
                  </h3>
                </div>
              </article>
            ))}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-8 px-2 pt-1 max-[1280px]:justify-start max-[920px]:justify-center">
            <button
              type="button"
              onClick={handlePrev}
              className="flex h-[52px] w-[52px] items-center justify-center rounded-full border border-[#d6d3ce] text-[#1d1f23] transition-colors hover:bg-gray-50"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#18562f] text-white transition-colors hover:bg-[#144726]"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
