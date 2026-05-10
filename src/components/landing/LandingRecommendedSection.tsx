const recommendationCards = [
  {
    brand: 'Versace',
    model: 'Esme',
    price: 'Rp 4.200.000',
    image: '/landing/kacamata/image copy.png',
    colors: ['#c06f3c', '#edd7d3', '#6a8a89', '#b9bbef', '#1e1b1a', '#f3f0ea'],
  },
  {
    brand: 'Bonia',
    model: 'Wilkie',
    price: 'Rp 1.100.000',
    image: '/landing/kacamata/image.png',
    colors: ['#161616', '#5a4e3f', '#d4d4d4', '#61705a', '#4e2a18', '#6e4632', '#efb25f'],
  },
  {
    brand: 'Bonia',
    model: 'Chamberlain',
    price: 'Rp 4.700.000',
    image: '/landing/kacamata/Brady Sea Glass Grey.png',
    colors: ['#f4f4f4', '#5f5a46', '#3d4f77', '#4c240f', '#111111'],
  },
  {
    brand: 'Gucci',
    model: 'Durand',
    price: 'Rp 3.900.000',
    image: '/landing/kacamata/image.png',
    colors: ['#35261d', '#eed6d1', '#9ebfd0', '#e7e9ef'],
  },
];

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
                  className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 font-['Outfit','Poppins',sans-serif] text-[16px] leading-[100%] font-normal text-[#202123] shadow-[0_4px_18px_rgba(0,0,0,0.06)]"
                >
                  <span className="text-lg">⌘</span>
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
