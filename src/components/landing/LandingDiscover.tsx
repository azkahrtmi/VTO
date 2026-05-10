export function LandingDiscover() {
  return (
    <section className="bg-white px-[8rem] pb-16 pt-10 max-[920px]:px-4 max-[920px]:pb-12 max-[920px]:pt-8">
      <div className="relative overflow-hidden rounded-[18px] bg-[#0d63ab]">
        <img
          src="/landing/discover.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover object-[center_65%]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,89,162,0.58)_0%,rgba(10,89,162,0.22)_36%,rgba(10,89,162,0.08)_100%)]" />
        <div className="relative z-10 flex min-h-[214px] items-center px-7 py-8 max-[920px]:min-h-[240px] max-[920px]:px-5">
          <div className="max-w-[620px]">
            <h2 className="font-['Outfit','Poppins',sans-serif] text-[24px] leading-[1.25] font-semibold text-white max-[920px]:text-[20px]">
              Discover premium sunglasses from trusted brands, selected for
              comfort, protection, and effortless everyday style.
            </h2>
            <button
              type="button"
              className="mt-5 rounded-full bg-[#084D26] px-5 py-3 font-['Outfit','Poppins',sans-serif] text-[17px] leading-[130%] font-extrabold tracking-[-0.01em] text-white transition-transform duration-200 hover:-translate-y-px"
            >
              Shop Sunglasses
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
