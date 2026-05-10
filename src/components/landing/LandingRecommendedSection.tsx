const recommendationCards = [
  {
    brand: "Versace",
    model: "Esme",
    price: "Rp 4.200.000",
    image: "/landing/kacamata/image copy.png",
    colors: ["#c06f3c", "#edd7d3", "#6a8a89", "#b9bbef", "#1e1b1a", "#f3f0ea"],
  },
  {
    brand: "Bonia",
    model: "Wilkie",
    price: "Rp 1.100.000",
    image: "/landing/kacamata/image.png",
    colors: [
      "#161616",
      "#5a4e3f",
      "#d4d4d4",
      "#61705a",
      "#4e2a18",
      "#6e4632",
      "#efb25f",
    ],
  },
  {
    brand: "Bonia",
    model: "Chamberlain",
    price: "Rp 4.700.000",
    image: "/landing/kacamata/Brady Sea Glass Grey.png",
    colors: ["#f4f4f4", "#5f5a46", "#3d4f77", "#4c240f", "#111111"],
  },
  {
    brand: "Gucci",
    model: "Durand",
    price: "Rp 3.900.000",
    image: "/landing/kacamata/image.png",
    colors: ["#35261d", "#eed6d1", "#9ebfd0", "#e7e9ef"],
  },
];

function TryOnIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2.40198 2.6521C2.33567 2.6521 2.27208 2.67844 2.2252 2.72532C2.17832 2.77221 2.15198 2.8358 2.15198 2.9021V4.9021C2.15198 5.10101 2.07296 5.29178 1.93231 5.43243C1.79166 5.57308 1.60089 5.6521 1.40198 5.6521C1.20307 5.6521 1.0123 5.57308 0.871647 5.43243C0.730995 5.29178 0.651978 5.10101 0.651978 4.9021V2.9021C0.651978 1.9361 1.43598 1.1521 2.40198 1.1521H4.40198C4.60089 1.1521 4.79166 1.23112 4.93231 1.37177C5.07296 1.51242 5.15198 1.70319 5.15198 1.9021C5.15198 2.10101 5.07296 2.29178 4.93231 2.43243C4.79166 2.57308 4.60089 2.6521 4.40198 2.6521H2.40198ZM13.548 2.9021C13.548 2.8358 13.5216 2.77221 13.4748 2.72532C13.4279 2.67844 13.3643 2.6521 13.298 2.6521H11.298C11.0991 2.6521 10.9083 2.57308 10.7676 2.43243C10.627 2.29178 10.548 2.10101 10.548 1.9021C10.548 1.70319 10.627 1.51242 10.7676 1.37177C10.9083 1.23112 11.0991 1.1521 11.298 1.1521H13.298C14.265 1.1521 15.048 1.9361 15.048 2.9021V4.9021C15.048 5.10101 14.969 5.29178 14.8283 5.43243C14.6877 5.57308 14.4969 5.6521 14.298 5.6521C14.0991 5.6521 13.9083 5.57308 13.7676 5.43243C13.627 5.29178 13.548 5.10101 13.548 4.9021V2.9021ZM2.40198 14.0481C2.33567 14.0481 2.27208 14.0218 2.2252 13.9749C2.17832 13.928 2.15198 13.8644 2.15198 13.7981V11.7981C2.15198 11.5992 2.07296 11.4084 1.93231 11.2678C1.79166 11.1271 1.60089 11.0481 1.40198 11.0481C1.20307 11.0481 1.0123 11.1271 0.871647 11.2678C0.730995 11.4084 0.651978 11.5992 0.651978 11.7981V13.7981C0.651978 14.7641 1.43598 15.5481 2.40198 15.5481H4.40198C4.60089 15.5481 4.79166 15.4691 4.93231 15.3284C5.07296 15.1878 5.15198 14.997 5.15198 14.7981C5.15198 14.5992 5.07296 14.4084 4.93231 14.2678C4.79166 14.1271 4.60089 14.0481 4.40198 14.0481H2.40198ZM13.298 14.0481C13.3643 14.0481 13.4279 14.0218 13.4748 13.9749C13.5216 13.928 13.548 13.8644 13.548 13.7981V11.7981C13.548 11.5992 13.627 11.4084 13.7676 11.2678C13.9083 11.1271 14.0991 11.0481 14.298 11.0481C14.4969 11.0481 14.6877 11.1271 14.8283 11.2678C14.969 11.4084 15.048 11.5992 15.048 11.7981V13.7981C15.048 14.2622 14.8636 14.7073 14.5354 15.0355C14.2072 15.3637 13.7621 15.5481 13.298 15.5481H11.298C11.0991 15.5481 10.9083 15.4691 10.7676 15.3284C10.627 15.1878 10.548 14.997 10.548 14.7981C10.548 14.5992 10.627 14.4084 10.7676 14.2678C10.9083 14.1271 11.0991 14.0481 11.298 14.0481H13.298ZM7.99998 7.2501C8.26519 7.2501 8.51955 7.14474 8.70708 6.95721C8.89462 6.76967 8.99998 6.51532 8.99998 6.2501C8.99998 5.98488 8.89462 5.73053 8.70708 5.54299C8.51955 5.35546 8.26519 5.2501 7.99998 5.2501C7.73476 5.2501 7.48041 5.35546 7.29287 5.54299C7.10533 5.73053 6.99998 5.98488 6.99998 6.2501C6.99998 6.51532 7.10533 6.76967 7.29287 6.95721C7.48041 7.14474 7.73476 7.2501 7.99998 7.2501ZM7.99998 8.7501C8.66302 8.7501 9.2989 8.48671 9.76774 8.01787C10.2366 7.54903 10.5 6.91314 10.5 6.2501C10.5 5.58706 10.2366 4.95117 9.76774 4.48233C9.2989 4.01349 8.66302 3.7501 7.99998 3.7501C7.33694 3.7501 6.70105 4.01349 6.23221 4.48233C5.76337 4.95117 5.49998 5.58706 5.49998 6.2501C5.49998 6.91314 5.76337 7.54903 6.23221 8.01787C6.70105 8.48671 7.33694 8.7501 7.99998 8.7501ZM4.24998 13.2501C4.24998 12.2555 4.64507 11.3017 5.34833 10.5984C6.05159 9.89519 7.00542 9.5001 7.99998 9.5001C8.99454 9.5001 9.94837 9.89519 10.6516 10.5984C11.3549 11.3017 11.75 12.2555 11.75 13.2501H10.25C10.25 12.6534 10.0129 12.0811 9.59097 11.6591C9.16901 11.2372 8.59671 11.0001 7.99998 11.0001C7.40324 11.0001 6.83094 11.2372 6.40899 11.6591C5.98703 12.0811 5.74998 12.6534 5.74998 13.2501H4.24998Z"
        fill="#121212"
      />
    </svg>
  );
}

export function LandingRecommendedSection() {
  return (
    <section className="bg-white px-[6.8rem] py-14 max-[920px]:px-4 max-[920px]:py-10">

      <div className="mb-10 flex items-center justify-between gap-6 max-[720px]:flex-col max-[720px]:items-start">
        <h2 className="font-['Outfit','Poppins',sans-serif] text-[58px] leading-[1.02] font-medium tracking-[-0.04em] text-[#1d1f23] max-[920px]:text-[38px]">
          Recommended for Progressive Lenses
        </h2>
        <button
          type="button"
          className="rounded-full border border-[#084D26] px-8 py-4 font-['Outfit','Poppins',sans-serif] text-[16px] leading-[100%] font-normal text-[#084D26]"
        >
          Shop all
        </button>
      </div>

      <div className="overflow-x-auto pb-2 scrollbar-hide">
        <div className="flex min-w-max gap-4">
          {recommendationCards.map((item, index) => (
            <article
              key={`${item.brand}-${item.model}-${index}`}
              className="w-[500px] flex-none rounded-[20px] bg-[#f6f5f4] p-5 max-[920px]:w-[340px]"
            >
              <div className="mb-8 flex items-start justify-between">
                <button
                  type="button"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#30323b] shadow-[0_4px_18px_rgba(0,0,0,0.06)]"
                >
                  <span className="text-lg">♡</span>
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 font-['Outfit','Poppins',sans-serif] text-[16px] leading-[100%] font-normal text-[#202123] shadow-[0_4px_18px_rgba(0,0,0,0.06)] [&>span]:hidden"
                >
                  <span className="text-lg">⌘</span>
                  <TryOnIcon />
                  Try on
                </button>
              </div>

              <div className="mb-10 flex h-[330px] items-center justify-center rounded-[18px] bg-[radial-gradient(circle_at_center,#ffffff_0%,#f5f4f1_70%)] px-5 max-[920px]:h-[220px]">
                <img
                  src={item.image}
                  alt={`${item.brand} ${item.model}`}
                  className="max-h-full w-full object-contain mix-blend-multiply"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-end justify-between gap-3">
                  <div className="space-y-3">
                    <h3 className="font-['Outfit','Poppins',sans-serif] text-[24px] leading-[100%] font-semibold text-[#202123]">
                      {item.brand}
                    </h3>
                    <p className="font-['Outfit','Poppins',sans-serif] text-[28px] leading-[100%] font-normal text-[#202123]">
                      {item.model}
                    </p>
                  </div>
                  <p className="pb-1 font-['Outfit','Poppins',sans-serif] text-[16px] leading-[100%] font-medium text-[#394250]">
                    {item.price}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {item.colors.map((color) => (
                    <span
                      key={`${item.model}-${color}`}
                      className="block h-7 w-7 rounded-full border border-white shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
                      style={{ background: color }}
                    />
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
