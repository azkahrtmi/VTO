const highlights = [
  'Original Brands',
  'Free Shipping',
  'Free 30 Day returns',
  'Store Pickup',
];

export function LandingHighlights() {
  return (
    <div className="absolute inset-x-0 bottom-0 z-30 grid grid-cols-4 gap-4 bg-gradient-to-b from-transparent to-[rgba(0,0,0,0.22)] px-[3.8rem] py-5 text-[#f7f1e8] max-[920px]:relative max-[920px]:grid-cols-2 max-[920px]:bg-[#113541] max-[920px]:px-4 max-[560px]:grid-cols-1 max-[560px]:gap-[0.65rem] max-[560px]:text-left">
      {highlights.map((item) => (
        <div key={item} className="animate-[fade-up_0.9s_ease] text-center text-[0.95rem] font-normal max-[560px]:text-left">
          {item}
        </div>
      ))}
    </div>
  );
}
