const peopleCards = [
  {
    brand: 'Bonia',
    model: 'York in Polished blue',
    handle: '@ajisaputra',
    image: '/landing/people/1b5ab9d7343ff1ebe8898b51b4176d0b18676f3b.jpg',
    position: 'object-[center_28%]',
  },
  {
    brand: 'Gucci',
    model: 'Beale in Jet Black',
    handle: '@khalidahnur',
    image: '/landing/people/3bd0f6c0f593e73cb81bfa10580fa46d0962f89f.jpg',
    position: 'object-[center_26%]',
  },
  {
    brand: 'Ic! berlin',
    model: 'Scooter in Phantom Smoke',
    handle: '@RKuang',
    image: '/landing/people/47f1e464bab4c3684a71349bce87528194c8a571.jpg',
    position: 'object-[center_22%]',
  },
  {
    brand: 'Gucci',
    model: 'Bodie in Crystal',
    handle: '@siska',
    image: '/landing/people/af035a15ffd05a08a59c73ebc50cc6f0ae3e1db3%20(1).jpg',
    position: 'object-[center_24%]',
  },
];

export function LandingPeopleSection() {
  return (
    <section className="bg-white px-[6.8rem] py-16 max-[920px]:px-4 max-[920px]:py-10">
      <h2 className="mb-12 text-center font-['Outfit','Poppins',sans-serif] text-[72px] leading-[1] font-medium tracking-[-0.06em] text-[#16181d] max-[920px]:text-[44px]">
        Optik Tunggal People in the wild
      </h2>

      <div className="-mr-[7rem] overflow-x-auto pb-2 pr-[7rem] scrollbar-hide max-[920px]:-mr-0 max-[920px]:pr-0">
        <div className="flex min-w-max gap-7">
          {peopleCards.map((item, index) => (
            <article
              key={`${item.brand}-${item.handle}-${index}`}
              className="relative h-[652px] w-[486px] flex-none overflow-hidden rounded-[28px] bg-[#d9dde2] p-6 text-white max-[920px]:h-[520px] max-[920px]:w-[320px]"
            >
              <img
                src={item.image}
                alt={`${item.brand} ${item.model}`}
                className={`absolute inset-0 h-full w-full object-cover ${item.position}`}
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_34%,rgba(0,0,0,0.08)_52%,rgba(0,0,0,0.68)_100%)]" />
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
