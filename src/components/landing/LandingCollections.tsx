import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { Heart, ScanSearch } from "lucide-react";

type CollectionItem = {
  brand: string;
  model: string;
  price: string;
  image: string;
  colors: string[];
};

const collections: CollectionItem[] = [
  {
    brand: "Ic! berlin",
    model: "Brady",
    price: "Rp 1.500.000",
    image: "/landing/kacamata/Brady Sea Glass Grey.png",
    colors: ["#ece8e2", "#8aa8ba", "#111111"],
  },
  {
    brand: "Prada",
    model: "Ketty",
    price: "Rp 3.300.000",
    image: "/landing/kacamata/image.png",
    colors: ["#6a1119", "#b89669"],
  },
  {
    brand: "Ic! berlin",
    model: "Mel",
    price: "Rp 1.800.000",
    image: "/landing/kacamata/image copy.png",
    colors: ["#8a5a22", "#7f264d"],
  },
  {
    brand: "Burberry",
    model: "Elias",
    price: "Rp 2.400.000",
    image: "/landing/kacamata/Brady Sea Glass Grey.png",
    colors: ["#50604b", "#6d2b10", "#90b0bf"],
  },
];

const loopedCollections = [...collections, ...collections, ...collections];

export function LandingCollections() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({ startX: 0, startScrollLeft: 0 });
  const isResettingRef = useRef(false);

  const getStep = () => (window.innerWidth <= 920 ? 356 : 516);
  const getSetWidth = () => getStep() * collections.length;

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const resetToMiddle = () => {
      track.scrollLeft = getSetWidth();
      setCurrentIndex(0);
    };

    resetToMiddle();
    window.addEventListener("resize", resetToMiddle);
    return () => window.removeEventListener("resize", resetToMiddle);
  }, []);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!trackRef.current) return;
    setIsDragging(true);
    dragState.current = {
      startX: event.clientX,
      startScrollLeft: trackRef.current.scrollLeft,
    };
    trackRef.current.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isDragging || !trackRef.current) return;
    const delta = event.clientX - dragState.current.startX;
    trackRef.current.scrollLeft = dragState.current.startScrollLeft - delta;
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!trackRef.current) return;
    setIsDragging(false);
    trackRef.current.releasePointerCapture(event.pointerId);
  };

  const handleScroll = () => {
    if (!trackRef.current) return;
    const track = trackRef.current;
    const step = getStep();
    const setWidth = getSetWidth();

    if (!isResettingRef.current) {
      if (track.scrollLeft <= setWidth * 0.5) {
        isResettingRef.current = true;
        track.scrollLeft += setWidth;
        requestAnimationFrame(() => {
          isResettingRef.current = false;
        });
      } else if (track.scrollLeft >= setWidth * 1.5) {
        isResettingRef.current = true;
        track.scrollLeft -= setWidth;
        requestAnimationFrame(() => {
          isResettingRef.current = false;
        });
      }
    }

    const normalizedOffset =
      (((track.scrollLeft - setWidth) % setWidth) + setWidth) % setWidth;
    const nextIndex = Math.round(normalizedOffset / step) % collections.length;
    setCurrentIndex(nextIndex);
  };

  return (
    <section className="bg-white px-[6.8rem] py-16 max-[920px]:px-4 max-[920px]:py-10">
      <div className="mb-12 flex items-center justify-between gap-6 max-[720px]:flex-col max-[720px]:items-start">
        <h2 className="font-['Outfit','Poppins',sans-serif] text-[28px] leading-[100%] font-medium text-[#202123]">
          New Collections
        </h2>
        <button
          type="button"
          className="rounded-full border border-[#084D26] px-8 py-4 font-['Outfit','Poppins',sans-serif] text-[16px] leading-[100%] font-normal text-[#084D26] transition-colors duration-200 hover:bg-[#084D26] hover:text-white"
        >
          Shop New Collections
        </button>
      </div>

      <div
        ref={trackRef}
        className={`landing-collections-scroll mr-[-6.8rem] overflow-x-auto pb-2 pr-[6.8rem] select-none max-[920px]:mr-[-1rem] max-[920px]:pr-4 ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onScroll={handleScroll}
      >
        <div className="flex w-max gap-4">
          {loopedCollections.map((item, index) => (
            <article
              key={`${item.brand}-${item.model}-${index}`}
              className="w-[500px] flex-none snap-start rounded-[20px] bg-[#f6f5f4] p-5 max-[920px]:w-[340px]"
              style={{
                transform:
                  currentIndex === index % collections.length
                    ? "scale(1)"
                    : "scale(0.985)",
                opacity: currentIndex === index % collections.length ? 1 : 0.96,
              }}
            >
              <div className="mb-8 flex items-start justify-between">
                <button
                  type="button"
                  aria-label={`Save ${item.model}`}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#30323b] shadow-[0_4px_18px_rgba(0,0,0,0.06)]"
                >
                  <Heart size={20} strokeWidth={1.8} />
                </button>

                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 font-['Outfit','Poppins',sans-serif] text-[16px] leading-[100%] font-normal text-[#202123] shadow-[0_4px_18px_rgba(0,0,0,0.06)]"
                >
                  <ScanSearch size={18} strokeWidth={1.8} />
                  Try on
                </button>
              </div>

              <div className="mb-10 flex h-[330px] items-center justify-center max-[920px]:h-[220px]">
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

                <div className="flex items-center gap-4">
                  {item.colors.map((color, swatchIndex) => (
                    <span
                      key={`${item.model}-${color}`}
                      className={`block h-7 w-7 rounded-full border ${swatchIndex === 0 ? "border-[#202123]" : "border-transparent"}`}
                      style={{ background: color }}
                    />
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="mt-8 flex items-center justify-center">
        <div className="rounded-[16px] bg-[#8d8d8d] px-4 py-3 font-['Outfit','Poppins',sans-serif] text-[18px] leading-[100%] font-medium text-white">
          {currentIndex + 1}/{collections.length}
        </div>
      </div>
    </section>
  );
}
