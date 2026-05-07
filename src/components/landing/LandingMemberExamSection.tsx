import { ArrowRight } from 'lucide-react';

export function LandingMemberExamSection() {
  return (
    <section className="bg-white px-[6.8rem] py-16 max-[920px]:px-4 max-[920px]:py-10">
      <div className="grid grid-cols-2 gap-6 max-[1200px]:grid-cols-1">
        <article className="relative min-h-[520px] overflow-hidden rounded-[30px] bg-[linear-gradient(135deg,#7a7c73_0%,#b8b0a2_45%,#73645b_100%)] p-10 text-white">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-3">
              {['#8c3e2c', '#95a861', '#d9c6ba', '#77b5d9'].map((color) => (
                <span key={color} className="h-14 w-14 rounded-full border-4 border-white" style={{ background: color }} />
              ))}
            </div>
            <p className="font-['Outfit','Poppins',sans-serif] text-[24px] leading-[100%] font-medium">
              162+ Reviews
            </p>
          </div>
          <div className="absolute bottom-10 left-10 right-10">
            <div className="flex items-end justify-between gap-6">
              <h3 className="font-['Outfit','Poppins',sans-serif] text-[62px] leading-[0.98] font-medium tracking-[-0.05em] max-[920px]:text-[40px]">
                become our member
              </h3>
              <ArrowRight size={56} />
            </div>
          </div>
        </article>

        <article className="rounded-[30px] bg-[#232222] p-10 text-white">
          <span className="rounded-full bg-white px-6 py-4 font-['Outfit','Poppins',sans-serif] text-[18px] leading-[100%] font-medium text-[#1d1f23]">
            Free Eye Exam
          </span>
          <h3 className="mt-20 max-w-[660px] font-['Outfit','Poppins',sans-serif] text-[72px] leading-[0.96] font-medium tracking-[-0.06em] max-[920px]:text-[42px]">
            Precision Eye Care, Designed Around You
          </h3>
          <div className="mt-14 grid grid-cols-[0.95fr_1.05fr] items-start gap-10 max-[920px]:grid-cols-1">
            <div>
              <p className="font-['Outfit','Poppins',sans-serif] text-[30px] leading-[1.1] font-medium">
                Trusted Optical Experience
              </p>
              <button
                type="button"
                className="mt-12 rounded-full bg-white px-10 py-5 font-['Outfit','Poppins',sans-serif] text-[18px] leading-[100%] font-medium text-[#1d1f23]"
              >
                Book an Eye Exam
              </button>
            </div>
            <div>
              <div className="mb-8 h-px bg-white/58" />
              <p className="font-['Outfit','Poppins',sans-serif] text-[22px] leading-[1.5] text-white/92">
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
