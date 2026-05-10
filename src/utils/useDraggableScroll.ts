import { useRef, useState, useCallback } from "react";

export function useDraggableScroll() {
  const ref = useRef<HTMLDivElement>(null);
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    setIsDown(true);
    ref.current.classList.add("active");
    setStartX(e.pageX - ref.current.offsetLeft);
    setScrollLeft(ref.current.scrollLeft);
  }, []);

  const onMouseLeave = useCallback(() => {
    setIsDown(false);
    if (ref.current) {
      ref.current.classList.remove("active");
    }
  }, []);

  const onMouseUp = useCallback(() => {
    setIsDown(false);
    if (ref.current) {
      ref.current.classList.remove("active");
    }
  }, []);

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDown || !ref.current) return;
      e.preventDefault();
      const x = e.pageX - ref.current.offsetLeft;
      const walk = (x - startX) * 2; // scroll-speed
      ref.current.scrollLeft = scrollLeft - walk;
    },
    [isDown, scrollLeft, startX]
  );

  return {
    ref,
    onMouseDown,
    onMouseLeave,
    onMouseUp,
    onMouseMove,
  };
}
