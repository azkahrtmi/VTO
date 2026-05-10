const highlights = [
  'Original Brands',
  'Free Shipping',
  'Free 30 Day returns',
  'Store Pickup',
];

export function LandingHighlights() {
  return (
    <div className="absolute inset-x-0 bottom-0 z-30 grid grid-cols-4 gap-4 bg-gradient-to-t from-black/40 to-transparent px-[3.8rem] py-6 text-[#f7f1e8] max-[920px]:hidden">
      {highlights.map((item) => (
        <div key={item} className="animate-[fade-up_0.9s_ease] text-center text-[0.95rem] font-medium opacity-90">
          {item}
        </div>
      ))}
    </div>
  );
}
