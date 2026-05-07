import { ChevronLeft, ChevronRight } from 'lucide-react';

export function LandingDesignedSection() {
  return (
    <section className="bg-white px-[6.8rem] py-8 max-[920px]:px-4 max-[920px]:py-8">
      <h2 className="mb-12 font-['Outfit','Poppins',sans-serif] text-[62px] leading-[1.02] font-medium tracking-[-0.05em] text-[#1d1f23] max-[920px]:text-[42px]">
        Designed for the Way You See
      </h2>

      <div className="grid grid-cols-[1.45fr_1fr] gap-8 max-[1280px]:grid-cols-1">
        <article className="grid min-h-[530px] grid-cols-[1.1fr_0.9fr] gap-8 rounded-[30px] bg-[#232222] p-10 text-white max-[920px]:grid-cols-1">
          <div className="relative overflow-hidden rounded-[24px] bg-[linear-gradient(180deg,#d9d9d9_0%,#bdbdbd_100%)]">
            <span className="absolute left-6 top-5 rounded-full bg-white px-6 py-4 font-['Outfit','Poppins',sans-serif] text-[18px] leading-[100%] font-medium text-[#1d1f23]">
              Vision Care
            </span>
            <div className="flex h-full items-center justify-center p-10">
              <div className="grid h-[260px] w-[260px] place-items-center rounded-full border-[18px] border-[#ebebeb] shadow-[0_20px_40px_rgba(0,0,0,0.16)]">
                <div className="grid h-[170px] w-[170px] place-items-center rounded-full border-[12px] border-[#dcdcdc]">
                  <div className="h-20 w-20 rounded-full border-[8px] border-[#c7c7c7]" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-[#1f1f1f]">
              <span className="text-2xl">⚙</span>
            </div>
            <div>
              <h3 className="font-['Outfit','Poppins',sans-serif] text-[52px] leading-[0.98] font-medium tracking-[-0.04em]">
                Free Eye Exam
              </h3>
              <p className="mt-5 max-w-[320px] font-['Outfit','Poppins',sans-serif] text-[18px] leading-[1.55] text-white/92">
                Get your eyes checked at no extra cost with professional care
                designed to help you find the right prescription and everyday
                visual comfort.
              </p>
            </div>
          </div>
        </article>

        <div className="grid grid-rows-[1fr_auto] gap-8">
          <div className="grid grid-cols-2 gap-6 max-[720px]:grid-cols-1">
            <article className="relative min-h-[360px] overflow-hidden rounded-[30px] bg-[linear-gradient(180deg,#4c5ab8_0%,#2f4a9a_100%)] p-7 text-white">
              <span className="absolute left-7 top-7 rounded-full bg-white px-6 py-4 font-['Outfit','Poppins',sans-serif] text-[18px] leading-[100%] font-medium text-[#1d1f23]">
                Technology
              </span>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_80%,rgba(61,159,255,0.48),transparent_24%)]" />
              <div className="relative flex h-full items-end">
                <h3 className="max-w-[220px] font-['Outfit','Poppins',sans-serif] text-[28px] leading-[1.18] font-medium">
                  Advanced Vision Technology
                </h3>
              </div>
            </article>

            <article className="relative min-h-[360px] overflow-hidden rounded-[30px] bg-[linear-gradient(180deg,#75685d_0%,#d2b99b_55%,#8f795f_100%)] p-7 text-white">
              <span className="absolute left-7 top-7 rounded-full bg-white px-6 py-4 font-['Outfit','Poppins',sans-serif] text-[18px] leading-[100%] font-medium text-[#1d1f23]">
                Store Pickup
              </span>
              <div className="relative flex h-full items-end">
                <h3 className="max-w-[220px] font-['Outfit','Poppins',sans-serif] text-[28px] leading-[1.18] font-medium">
                  Shopping Experience
                </h3>
              </div>
            </article>
          </div>

          <div className="flex items-center gap-8 px-4 max-[720px]:justify-center">
            <button
              type="button"
              className="flex h-14 w-14 items-center justify-center rounded-full border border-[#d6d3ce] text-[#c8c3bd]"
            >
              <ChevronLeft size={28} />
            </button>
            <button
              type="button"
              className="flex h-16 w-16 items-center justify-center rounded-full bg-[#1f1f1f] text-white"
            >
              <ChevronRight size={32} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
