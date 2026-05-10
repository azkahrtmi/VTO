export function LandingTopBar() {
  return (
    <div className="flex w-full items-center justify-between gap-4 bg-white px-[3.8rem] py-[0.78rem] text-[#1d2427] max-[920px]:bg-[#f8f5f1] max-[920px]:px-4 max-[920px]:py-2.5">
      <img
        className="w-[138px] object-contain max-[920px]:w-[90px]"
        src="/landing/logo.png"
        alt="Optik Tunggal"
      />
      <div className="flex items-center gap-2 max-[920px]:justify-end">
        <img
          className="h-[14px] w-[14px] object-contain min-[921px]:hidden"
          src="/landing/icon/glasses.png"
          alt=""
          aria-hidden="true"
        />
        <p className="text-[0.92rem] font-medium tracking-[0.01em] max-[920px]:text-[0.75rem] max-[920px]:leading-tight">
          Premium eyewear starting from Rp 2 million
        </p>
      </div>
    </div>
  );
}
