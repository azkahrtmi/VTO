import { ArrowRight } from "lucide-react";

export function LandingMemberExamSection() {
  return (
    <section className="bg-white px-[6.8rem] py-16 max-[920px]:px-4 max-[920px]:py-10">
      <div className="grid grid-cols-2 gap-6 max-[1200px]:grid-cols-1">
        <article className="relative min-h-[501px] overflow-hidden rounded-[24px] bg-[#6d665d] p-10 text-white">
          <img
            src="/landing/ourmember.jpg"
            alt="Become our member"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,8,8,0.16)_0%,rgba(10,10,10,0.1)_34%,rgba(12,12,12,0.44)_100%)]" />
          <div className="relative z-10 flex items-center gap-3">
            <div className="flex -space-x-3">
              {["#8c3e2c", "#95a861", "#d9c6ba", "#77b5d9"].map((color) => (
                <span key={color} className="h-14 w-14 rounded-full border-4 border-white" style={{ background: color }} />
              ))}
            </div>
            <p className="font-['Outfit','Poppins',sans-serif] text-[14px] leading-[1] font-semibold tracking-[-0.02em]">
              162+ Reviews
            </p>
          </div>
          <div className="absolute bottom-10 left-10 right-10 z-10">
            <div className="flex items-end justify-between gap-6">
              <h3 className="font-['Outfit','Poppins',sans-serif] text-[48px] leading-[52px] font-semibold tracking-[0] max-[920px]:text-[38px] max-[920px]:leading-[42px]">
                become our member
              </h3>
              <ArrowRight size={42} strokeWidth={2.2} />
            </div>
          </div>
        </article>

        <article className="rounded-[30px] bg-[#232222] p-10 text-white">
          <span className="inline-flex rounded-full bg-[#0b6a36] px-4 py-2 font-['Outfit','Poppins',sans-serif] text-[10px] leading-[1] font-semibold tracking-[-0.01em] text-white">
            Free Eye Exam
          </span>
          <h3 className="mt-14 max-w-[585px] font-['Outfit','Poppins',sans-serif] text-[48px] leading-[52px] font-semibold tracking-[0] max-[920px]:mt-10 max-[920px]:text-[40px] max-[920px]:leading-[44px]">
            Precision Eye Care, Designed Around You
          </h3>
          <div className="mt-12 grid grid-cols-[240px_1fr] items-center gap-6 max-[920px]:grid-cols-1">
            <p className="font-['Outfit','Poppins',sans-serif] text-[20px] leading-[28px] font-medium text-white">
              Trusted Optical Experience
            </p>
            <div className="h-px w-full bg-white/35" />
          </div>
          <div className="mt-10 grid grid-cols-[0.95fr_1.05fr] items-start gap-8 max-[920px]:grid-cols-1">
            <div>
              <button
                type="button"
                className="rounded-full bg-[#0b6a36] px-8 py-4 font-['Outfit','Poppins',sans-serif] text-[13px] leading-[1] font-medium text-white"
              >
                Book an Eye Exam
              </button>
            </div>
            <div>
              <p className="max-w-[238px] font-['Outfit','Poppins',sans-serif] text-[14px] leading-[1.45] text-white/88 max-[920px]:max-w-none">
                From eye assessment to eyewear selection, enjoy a more accurate
                and comfortable experience
              </p>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
