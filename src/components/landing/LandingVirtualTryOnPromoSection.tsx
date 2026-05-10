export function LandingVirtualTryOnPromoSection() {
  return (
    <section className="bg-white px-[6.8rem] py-16 max-[920px]:px-4 max-[920px]:py-10">
      <div className="grid grid-cols-[0.95fr_1.05fr] items-center gap-10 max-[1200px]:grid-cols-1">
        <div className="aspect-[0.9] overflow-hidden rounded-[28px]">
          <img
            src="/landing/tryframe.png"
            alt="Try frames virtually"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="max-w-[720px]">
          <h2 className="font-['Outfit','Poppins',sans-serif] text-[62px] leading-[1.02] font-medium tracking-[-0.05em] text-[#1d1f23] max-[920px]:text-[42px]">
            Try frames on virtually, anytime
          </h2>
          <p className="mt-8 font-['Outfit','Poppins',sans-serif] text-[22px] leading-[1.55] text-[#22252b] max-[920px]:text-[18px]">
            See how different frames look on you directly from your phone and
            explore styles with more confidence before you shop.
          </p>
          <button
            type="button"
            className="mt-10 rounded-full bg-[#084D26] px-8 py-5 font-['Outfit','Poppins',sans-serif] text-[18px] leading-[100%] font-medium text-white"
          >
            Try Virtual Try-On
          </button>
        </div>
      </div>
    </section>
  );
}
