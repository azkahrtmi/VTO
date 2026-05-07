export function LandingStoreSection() {
  return (
    <section className="bg-white px-[6.8rem] py-16 max-[920px]:px-4 max-[920px]:py-10">
      <div className="grid grid-cols-[0.95fr_1.05fr] items-center gap-14 max-[1200px]:grid-cols-1">
        <div className="max-w-[700px]">
          <p className="font-['Outfit','Poppins',sans-serif] text-[24px] leading-[100%] font-medium text-[#0d6d3d]">
            Find a Store Near You
          </p>
          <h2 className="mt-8 font-['Outfit','Poppins',sans-serif] text-[72px] leading-[0.98] font-medium tracking-[-0.06em] text-[#16181d] max-[920px]:text-[44px]">
            Visit a nearby store
          </h2>
          <p className="mt-8 max-w-[720px] font-['Outfit','Poppins',sans-serif] text-[22px] leading-[1.6] text-[#22252b] max-[920px]:text-[18px]">
            Try on our full assortment of frames, get styled by a friendly
            advisor, and receive an eye exam from an expert optometrist.
          </p>
          <button
            type="button"
            className="mt-10 rounded-full bg-[#1f1f1f] px-8 py-5 font-['Outfit','Poppins',sans-serif] text-[18px] leading-[100%] font-medium text-white"
          >
            Find your store
          </button>
        </div>

        <div className="aspect-[1.2] overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,#1d2134_0%,#5d6e88_42%,#a7b2be_100%)]" />
      </div>
    </section>
  );
}
