export function LandingTopBar() {
  return (
    <div className="flex w-full items-center justify-between gap-4 bg-white px-[3.8rem] py-[0.78rem] text-[#1d2427] max-[920px]:bg-[#dedad4] max-[920px]:px-3 max-[920px]:py-2">
      <img
        className="w-[138px] object-contain max-[920px]:hidden"
        src="/landing/logo.png"
        alt="Optik Tunggal"
      />
      <div className="flex items-center gap-3 max-[920px]:justify-start">
        <img
          className="h-[16px] w-[16px] object-contain min-[921px]:hidden"
          src="/landing/icon/glasses.png"
          alt=""
          aria-hidden="true"
        />
        <p className="text-[0.92rem] font-normal tracking-[0.01em] max-[920px]:text-[0.84rem]">
          Premium eyewear starting from Rp 2 million
        </p>
      </div>
    </div>
  );
}
