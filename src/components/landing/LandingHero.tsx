type LandingHeroProps = {
  onStartTryOn: () => void;
};

export function LandingHero({ onStartTryOn }: LandingHeroProps) {
  return (
    <section
      className="relative min-h-[calc(100vh-112px)] bg-cover bg-no-repeat max-[920px]:min-h-[calc(100vh-88px)]"
      style={{
        backgroundImage:
          "linear-gradient(90deg, rgba(8, 13, 15, 0.42) 0%, rgba(8, 13, 15, 0.1) 34%, rgba(8, 13, 15, 0.14) 100%), url('/landing/hero.jpg')",
        backgroundPosition: "58% 39%",
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(38,183,205,0.18),transparent_22%),linear-gradient(180deg,rgba(3,84,97,0.1),rgba(3,84,97,0.02))]" />
      <div className="relative z-20 flex min-h-[calc(100vh-112px)] items-center px-[3.8rem] pb-28 pt-24 max-[920px]:min-h-[calc(100vh-88px)] max-[920px]:items-end max-[920px]:px-4 max-[920px]:pb-28 max-[920px]:pt-8">
        <div className="max-w-[25.5rem] animate-[fade-up_0.8s_ease] text-[#f7f1e8]">
          <h1 className="mb-3 w-[450px] max-w-full font-['Outfit','Poppins',sans-serif] text-[36px] leading-[100%] font-semibold tracking-[0]">
            Find premium sunglasses that fit your style
          </h1>
          <p className="max-w-[27rem] text-[1.02rem] leading-[1.45] text-[rgba(247,241,232,0.9)] min-[921px]:text-[1rem]">
            Explore original sunglasses from selected brands, now easier to try
            with Virtual Try-On and shop online.
          </p>
          <div className="mt-7 flex flex-wrap gap-4 max-[560px]:flex-col">
            <button
              className="min-h-[40px] rounded-full bg-[#084D26] px-[1.25rem] py-[0.72rem] font-['Outfit','Poppins',sans-serif] text-[14.6px] leading-[22px] font-medium tracking-[0.32px] text-[#ffffff] transition-transform duration-200 hover:-translate-y-px"
              type="button"
              onClick={onStartTryOn}
            >
              Try Virtual Try-On
            </button>
            <button
              className="min-h-[40px] rounded-full border border-[rgba(255,255,255,0.72)] bg-[rgba(255,255,255,0.04)] px-[1.25rem] py-[0.72rem] text-[0.96rem] font-medium text-[#f7f1e8] transition-transform duration-200 hover:-translate-y-px"
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
