import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { Heart } from "lucide-react";

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

export function LandingCollections() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({ startX: 0, startScrollLeft: 0 });
  const isResettingRef = useRef(false);

  const getStep = () => (window.innerWidth <= 920 ? 356 : 427);
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
              className="w-[411px] flex-none snap-start rounded-[20px] bg-[#f6f5f4] p-[6px] max-[920px]:w-[340px] max-[920px]:p-5"
              style={{
                transform:
                  currentIndex === index % collections.length
                    ? "scale(1)"
                    : "scale(0.985)",
                opacity: currentIndex === index % collections.length ? 1 : 0.96,
              }}
            >
              <div className="mb-6 flex items-start justify-between">
                <button
                  type="button"
                  aria-label={`Save ${item.model}`}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#30323b] shadow-[0_4px_18px_rgba(0,0,0,0.06)] max-[920px]:h-10 max-[920px]:w-10"
                >
                  <Heart size={16} strokeWidth={1.8} />
                </button>

                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-2 font-['Outfit','Poppins',sans-serif] text-[11px] leading-[100%] font-normal text-[#202123] shadow-[0_4px_18px_rgba(0,0,0,0.06)] max-[920px]:gap-2 max-[920px]:px-5 max-[920px]:py-3 max-[920px]:text-[16px]"
                >
                  <TryOnIcon />
                  Try on
                </button>
              </div>

              <div className="mb-6 flex h-[255px] items-center justify-center max-[920px]:mb-10 max-[920px]:h-[220px]">
                <img
                  src={item.image}
                  alt={`${item.brand} ${item.model}`}
                  className="max-h-full w-full object-contain mix-blend-multiply"
                />
              </div>

              <div className="space-y-2.5 px-[6px] pb-[6px] max-[920px]:space-y-3 max-[920px]:px-0 max-[920px]:pb-0">
                <div className="flex items-end justify-between gap-3">
                  <div className="space-y-2">
                    <h3 className="font-['Outfit','Poppins',sans-serif] text-[16px] leading-[100%] font-semibold text-[#202123] max-[920px]:text-[24px]">
                      {item.brand}
                    </h3>
                    <p className="font-['Outfit','Poppins',sans-serif] text-[16px] leading-[100%] font-normal text-[#202123] max-[920px]:text-[28px]">
                      {item.model}
                    </p>
                  </div>
                  <p className="pb-1 font-['Outfit','Poppins',sans-serif] text-[11px] leading-[100%] font-medium text-[#394250] max-[920px]:text-[16px]">
                    {item.price}
                  </p>
                </div>

                <div className="flex items-center gap-2.5 max-[920px]:gap-4">
                  {item.colors.map((color, swatchIndex) => (
                    <span
                      key={`${item.model}-${color}`}
                      className={`block h-5 w-5 rounded-full border ${swatchIndex === 0 ? "border-[#202123]" : "border-transparent"} max-[920px]:h-7 max-[920px]:w-7`}
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
