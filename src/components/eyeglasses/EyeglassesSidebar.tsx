import { ArrowUp, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import {
  EYEGLASSES_ACCORDION_SECTIONS,
  EYEGLASSES_BY_OPTIONS,
  EYEGLASSES_SHAPES,
} from './eyeglassesData';

const INITIAL_OPEN_STATE: Record<string, boolean> = {
  'Shop by': true,
  Shape: true,
  Gender: false,
  'Frame width': false,
  Color: false,
  Material: false,
  'Frame price': false,
  Prescription: false,
  Features: false,
  'Nose bridge': false,
};

export function EyeglassesSidebar() {
  const [openSections, setOpenSections] =
    useState<Record<string, boolean>>(INITIAL_OPEN_STATE);

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <aside className="w-full max-w-[360px] shrink-0 self-start border-r border-[#d7dad8] pr-8 max-[1100px]:max-w-none max-[1100px]:border-r-0 max-[1100px]:pr-0">
      <div className="py-4 pl-0 pr-0 sm:pl-0 md:pl-2 lg:pl-3 xl:pl-12">
        <nav className="mb-6 text-[12px] text-[#7b8178]" aria-label="Breadcrumb">
          <span>Home</span>
          <span className="mx-2">›</span>
          <span className="font-medium text-[#202327]">Eyeglasses</span>
        </nav>

        <div className="border-b border-[#e5e8e4] pb-6">
          <h1 className="font-['Outfit','Poppins',sans-serif] text-[21.9px] leading-[1.05] font-medium text-[#202327]">
            New Collections
          </h1>
          <p className="mt-4 max-w-[320px] text-[15px] leading-[1.75] text-[#4c525a]">
            Explore eyeglasses with prescription lenses, scratch-resistant
            finishing, and anti-reflective coating.
          </p>
          <button
            type="button"
            className="mt-3 text-[14px] font-semibold text-[#202327]"
          >
            Read more
          </button>
          <button
            type="button"
            className="mt-4 inline-flex items-center gap-2 text-[15px] font-medium text-[#09372C]"
          >
            Start with a style quiz
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="space-y-6 pt-6">
          <section className="border-b border-[#e5e8e4] pb-6">
            <button
              type="button"
              onClick={() => toggleSection('Shop by')}
              className="flex w-full items-center justify-between gap-3 text-left"
            >
              <div className="flex items-center gap-2">
                <span className="text-[17px] font-medium text-[#202327]">Shop by</span>
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[rgba(9,55,44,0.08)] px-1.5 text-[11px] font-semibold text-[#09372C]">
                  1
                </span>
              </div>
              <ChevronDown
                size={18}
                className={`transition-transform ${
                  openSections['Shop by'] ? 'rotate-180' : ''
                }`}
              />
            </button>

            {openSections['Shop by'] && (
              <div className="mt-4 rounded-[16px] border border-[#dde0dc]">
                {EYEGLASSES_BY_OPTIONS.map((option, index) => (
                  <label
                    key={option.label}
                    className={`flex cursor-pointer items-center gap-3 px-4 py-4 text-[14px] text-[#202327] ${
                      index !== EYEGLASSES_BY_OPTIONS.length - 1
                        ? 'border-b border-[#eceeeb]'
                        : ''
                    }`}
                  >
                    <span
                      className={`inline-flex h-[18px] w-[18px] items-center justify-center rounded-full border ${
                        option.selected
                          ? 'border-[#09372C]'
                          : 'border-[#6f747c]'
                      }`}
                    >
                      {option.selected && (
                        <span className="h-2.5 w-2.5 rounded-full bg-[#09372C]" />
                      )}
                    </span>
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            )}
          </section>

          <section className="border-b border-[#e5e8e4] pb-6">
            <button
              type="button"
              onClick={() => toggleSection('Shape')}
              className="flex w-full items-center justify-between gap-3 text-left"
            >
              <span className="text-[17px] font-medium text-[#202327]">Shape</span>
              <ChevronDown
                size={18}
                className={`transition-transform ${
                  openSections.Shape ? 'rotate-180' : ''
                }`}
              />
            </button>

            {openSections.Shape && (
              <div className="mt-4 grid grid-cols-2 gap-3">
                {EYEGLASSES_SHAPES.map((shape) => (
                  <button
                    key={shape.label}
                    type="button"
                    className="rounded-[14px] border border-[#dde0dc] bg-white px-3 py-4 text-center transition-colors duration-200 hover:border-[#bfc5bf]"
                  >
                    <img
                      src={shape.image}
                      alt={shape.label}
                      className="mx-auto h-9 w-full object-contain mix-blend-multiply"
                    />
                    <span className="mt-3 block text-[14px] font-medium text-[#222529]">
                      {shape.label}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </section>

          {EYEGLASSES_ACCORDION_SECTIONS.map((section) => (
            <section key={section.title} className="border-b border-[#e5e8e4] pb-5">
              <button
                type="button"
                onClick={() => toggleSection(section.title)}
                className="flex w-full items-center justify-between gap-3 text-left"
              >
                <span className="text-[17px] font-medium text-[#202327]">
                  {section.title}
                </span>
                <ChevronDown
                  size={18}
                  className={`transition-transform ${
                    openSections[section.title] ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {openSections[section.title] && (
                <div className="mt-4 rounded-[14px] border border-[#dde0dc] bg-[#fafaf9] px-4 py-3 text-[14px] text-[#66707a]">
                  Filter options for {section.title.toLowerCase()} akan ditambahkan di
                  tahap berikutnya.
                </div>
              )}
            </section>
          ))}
        </div>

        <div className="pt-20">
          <button
            type="button"
            onClick={scrollToTop}
            aria-label="Kembali ke atas"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#7f8582] text-[#202327] transition-colors duration-200 hover:bg-[#f5f5f3]"
          >
            <ArrowUp size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}
