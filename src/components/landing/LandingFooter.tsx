const footerColumns = [
  {
    title: 'Products',
    items: [
      'Eyeglasses',
      'Sunglasses',
      'Contacts',
      'New collections',
      'Accessories',
      'Gift cards',
      'Intelligent Eyewear',
    ],
  },
  {
    title: 'Shop Online',
    items: ['Advisor', 'Virtual Try-On'],
    secondaryTitle: 'Education',
    secondaryItems: [
      'Eyeglasses lens guide',
      'Sunglasses lens guide',
      'How our glasses are made',
    ],
  },
  {
    title: 'Ways to save',
    items: [
      'Insurance',
      'Flexible spending',
      '20% off contacts',
      'Add a pair and save',
    ],
    secondaryTitle: 'Visit a store',
    secondaryItems: ['Find a location'],
  },
  {
    title: 'About us',
    items: [
      'Our story',
      'Buy a Pair, Give a Pair',
      'Customer reviews',
      'Impact',
      'Impact Foundation',
    ],
  },
];

export function LandingFooter() {
  return (
    <footer className="bg-[#f5f5f5] px-[3.8rem] pb-14 pt-12 text-[#1b1d21] max-[920px]:px-4 max-[920px]:py-10">
      <div className="grid grid-cols-[1.15fr_1.15fr_1.15fr_1fr_1.9fr] gap-10 max-[1280px]:grid-cols-4 max-[1280px]:gap-8 max-[920px]:grid-cols-2 max-[560px]:grid-cols-1">
        {footerColumns.map((column) => (
          <div key={column.title} className="space-y-7">
            <div className="space-y-5">
              <h3 className="font-['Outfit','Poppins',sans-serif] text-[16px] leading-[100%] font-semibold text-[#0d6d3d]">
                {column.title}
              </h3>
              <ul className="space-y-7">
                {column.items.map((item) => (
                  <li
                    key={item}
                    className="font-['Outfit','Poppins',sans-serif] text-[18px] leading-[100%] font-normal text-[#202226]"
                  >
                    <a href="#" className="transition-opacity duration-200 hover:opacity-80">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {column.secondaryTitle && column.secondaryItems && (
              <div className="space-y-5">
                <h3 className="font-['Outfit','Poppins',sans-serif] text-[16px] leading-[100%] font-semibold text-[#0d6d3d]">
                  {column.secondaryTitle}
                </h3>
                <ul className="space-y-7">
                  {column.secondaryItems.map((item) => (
                    <li
                      key={item}
                      className="font-['Outfit','Poppins',sans-serif] text-[18px] leading-[100%] font-normal text-[#202226]"
                    >
                      <a href="#" className="transition-opacity duration-200 hover:opacity-80">
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}

        <div className="flex min-h-full flex-col justify-between gap-10 max-[1280px]:col-span-4 max-[920px]:col-span-2 max-[560px]:col-span-1">
          <div className="space-y-10">
            <img
              className="w-[180px] object-contain"
              src="/landing/logo.png"
              alt="Optik Tunggal"
            />
            <p className="max-w-[520px] font-['Outfit','Poppins',sans-serif] text-[22px] leading-[1.75] font-normal text-[#202226]">
              Try on our full assortment of frames, get styled by a friendly
              advisor, and receive an eye exam from an expert optometrist.
            </p>
          </div>

          <p className="text-right font-['Outfit','Poppins',sans-serif] text-[14px] leading-[100%] text-[#b7b2ab] max-[1280px]:text-left">
            Copyright All Rights reserved
          </p>
        </div>
      </div>
    </footer>
  );
}
