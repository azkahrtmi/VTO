import { useEffect, useRef } from "react";
import { useDraggableScroll } from "../../utils/useDraggableScroll";

const peopleCards = [
  {
    brand: "Bonia",
    model: "York in Polished blue",
    handle: "@jenifer",
    image: "/landing/people/1b5ab9d7343ff1ebe8898b51b4176d0b18676f3b.jpg",
    position: "object-[center_28%]",
  },
  {
    brand: "Gucci",
    model: "Beale in Jet Black",
    handle: "@ayung",
    image: "/landing/people/3bd0f6c0f593e73cb81bfa10580fa46d0962f89f.jpg",
    position: "object-[center_26%]",
  },
  {
    brand: "Ic! berlin",
    model: "Scooter in Phantom Smoke",
    handle: "@RKuang",
    image: "/landing/people/47f1e464bab4c3684a71349bce87528194c8a571.jpg",
    position: "object-[center_22%]",
  },
  {
    brand: "Gucci",
    model: "Bodie in Crystal",
    handle: "@siska",
    image: "/landing/people/af035a15ffd05a08a59c73ebc50cc6f0ae3e1db3%20(1).jpg",
    position: "object-[center_24%]",
  },
];

const loopedPeople = [...peopleCards, ...peopleCards, ...peopleCards];

export function LandingPeopleSection() {
  const { ref, ...dragEvents } = useDraggableScroll();
  const isResettingRef = useRef(false);

  const getStep = () => (window.innerWidth <= 920 ? 336 : 408);
  const getSetWidth = () => getStep() * peopleCards.length;

  useEffect(() => {
    const track = ref.current;
    if (!track) return;

    const resetToMiddle = () => {
      track.scrollLeft = getSetWidth();
    };

    resetToMiddle();
    window.addEventListener("resize", resetToMiddle);
    return () => window.removeEventListener("resize", resetToMiddle);
  }, []);

  const handleScroll = () => {
    const track = ref.current;
    if (!track) return;
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
  };

  return (
    <section className="bg-white px-[4.2rem] py-14 max-[920px]:px-4 max-[920px]:py-10">
      <h2 className="mx-auto mb-6 max-w-[667px] text-center font-['Outfit','Poppins',sans-serif] text-[48px] leading-[36px] font-medium tracking-[-0.3px] text-[#16181d] max-[920px]:text-[32px] max-[920px]:leading-[1.08] max-[920px]:tracking-[0]">
        Optik Tunggal People in the wild
      </h2>

      <div
        ref={ref}
        {...dragEvents}
        onScroll={handleScroll}
        className="-mr-[4.2rem] overflow-x-auto pb-2 pr-[4.2rem] scrollbar-hide max-[920px]:-mr-0 max-[920px]:pr-0 cursor-grab active:cursor-grabbing select-none"
      >
        <div className="flex min-w-max gap-4">
          {loopedPeople.map((item, index) => (
            <article
              key={`${item.brand}-${item.handle}-${index}`}
              className="relative h-[522px] w-[392px] flex-none overflow-hidden rounded-[18px] bg-[#d9dde2] p-5 text-white max-[920px]:h-[420px] max-[920px]:w-[320px]"
            >
              <img
                src={item.image}
                alt={`${item.brand} ${item.model}`}
                className={`absolute inset-0 h-full w-full object-cover ${item.position}`}
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_38%,rgba(0,0,0,0.06)_58%,rgba(0,0,0,0.64)_100%)]" />
              <div className="relative flex h-full items-end">
                <div>
                  <h3 className="font-['Outfit','Poppins',sans-serif] text-[18px] leading-[1] font-semibold">
                    {item.brand}
                  </h3>
                  <p className="mt-2 font-['Outfit','Poppins',sans-serif] text-[14px] leading-[1.2]">
                    {item.model}
                  </p>
                  <p className="mt-2 font-['Outfit','Poppins',sans-serif] text-[12px] leading-[1] text-white/84">
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
