const peopleCards = [
  { brand: 'Bonia', model: 'York in Polished blue', handle: '@ajisaputra', accent: 'from-[#eef2f3] to-[#f6f7f8]' },
  { brand: 'Gucci', model: 'Beale in Jet Black', handle: '@khalidahnur', accent: 'from-[#070b14] to-[#2c2f39]' },
  { brand: 'Ic! berlin', model: 'Scooter in Phantom Smoke', handle: '@RKuang', accent: 'from-[#d5ecf6] to-[#f6f7ef]' },
  { brand: 'Gucci', model: 'Bodie in Crystal', handle: '@siska', accent: 'from-[#5e2d0f] to-[#d88e44]' },
];

export function LandingPeopleSection() {
  return (
    <section className="bg-white px-[6.8rem] py-16 max-[920px]:px-4 max-[920px]:py-10">
      <h2 className="mb-12 text-center font-['Outfit','Poppins',sans-serif] text-[72px] leading-[1] font-medium tracking-[-0.06em] text-[#16181d] max-[920px]:text-[44px]">
        Optik Tunggal People in the wild
      </h2>

      <div className="overflow-x-auto pb-2 scrollbar-hide">
        <div className="flex min-w-max gap-6">
          {peopleCards.map((item, index) => (
            <article
              key={`${item.brand}-${item.handle}-${index}`}
              className={`relative h-[650px] w-[480px] flex-none overflow-hidden rounded-[28px] bg-gradient-to-br ${item.accent} p-6 text-white max-[920px]:h-[520px] max-[920px]:w-[320px]`}
            >
              <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_38%,rgba(0,0,0,0.62)_100%)]" />
              <div className="relative flex h-full items-end">
                <div>
                  <h3 className="font-['Outfit','Poppins',sans-serif] text-[24px] leading-[100%] font-semibold">
                    {item.brand}
                  </h3>
                  <p className="mt-3 font-['Outfit','Poppins',sans-serif] text-[18px] leading-[1.25]">
                    {item.model}
                  </p>
                  <p className="mt-4 font-['Outfit','Poppins',sans-serif] text-[16px] leading-[100%] text-white/84">
                    {item.handle}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
