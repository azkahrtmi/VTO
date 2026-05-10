type LandingHeroProps = {
  onStartTryOn: () => void;
};

export function LandingHero({ onStartTryOn }: LandingHeroProps) {
  return (
    <section
      className="relative min-h-[calc(100vh-112px)] bg-cover bg-no-repeat max-[920px]:min-h-[520px] max-[920px]:max-h-[70vh]"
      style={{
        backgroundImage:
          "linear-gradient(90deg, rgba(8, 13, 15, 0.42) 0%, rgba(8, 13, 15, 0.1) 34%, rgba(8, 13, 15, 0.14) 100%), url('/landing/hero.jpg')",
        backgroundPosition: "58% 39%",
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(38,183,205,0.18),transparent_22%),linear-gradient(180deg,rgba(3,84,97,0.1),rgba(3,84,97,0.02))]" />
      <div className="relative z-20 flex min-h-[calc(100vh-112px)] items-center px-[3.8rem] pb-28 pt-24 max-[920px]:min-h-[calc(100vh-88px)] max-[920px]:items-center max-[920px]:px-6 max-[920px]:pb-20 max-[920px]:pt-10 max-[920px]:text-center">
        <div className="max-w-[25.5rem] animate-[fade-up_0.8s_ease] text-[#f7f1e8] max-[920px]:mx-auto">
          <h1 className="mb-4 w-[450px] max-w-full font-['Outfit','Poppins',sans-serif] text-[36px] leading-[1.1] font-semibold tracking-tight max-[920px]:text-[28px] max-[920px]:w-full">
            Find premium sunglasses that fit your style
          </h1>
          <p className="max-w-[27rem] text-[1rem] leading-[1.5] text-[rgba(247,241,232,0.9)] max-[920px]:text-[0.92rem] max-[920px]:mx-auto">
            Explore original sunglasses from selected brands, now easier to try
            with Virtual Try-On and shop online.
          </p>
          <div className="mt-8 flex flex-wrap gap-4 max-[920px]:justify-center max-[560px]:flex-col max-[560px]:gap-3">
            <button
              className="min-h-[44px] rounded-full bg-[#084D26] px-8 py-2.5 font-['Outfit','Poppins',sans-serif] text-[15px] font-medium tracking-wide text-white transition-all duration-200 hover:bg-[#0a5c2e] hover:shadow-lg active:scale-95"
              type="button"
              onClick={onStartTryOn}
            >
              Try Virtual Try-On
            </button>
            <button
              className="min-h-[44px] rounded-full border border-[rgba(255,255,255,0.4)] bg-[rgba(255,255,255,0.1)] px-8 py-2.5 text-[15px] font-medium text-white backdrop-blur-sm transition-all duration-200 hover:bg-white/20 active:scale-95"
              type="button"
            >
              Shop Sunglasses
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
