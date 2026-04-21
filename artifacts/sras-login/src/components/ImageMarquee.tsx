import { useEffect, useRef } from "react";

export interface MarqueeImage {
  src: string;
  alt: string;
}

export default function ImageMarquee({ images }: { images: MarqueeImage[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return;

    let raf = 0;
    const update = () => {
      const rect = container.getBoundingClientRect();
      const center = rect.left + rect.width / 2;
      const half = rect.width / 2 || 1;
      const items = track.querySelectorAll<HTMLElement>("[data-marquee-item]");
      items.forEach((el) => {
        const r = el.getBoundingClientRect();
        const itemCenter = r.left + r.width / 2;
        const t = Math.min(Math.abs(itemCenter - center) / half, 1);
        const scale = 1.12 - 0.27 * t;
        const opacity = 1 - 0.45 * t;
        el.style.transform = `scale(${scale.toFixed(3)})`;
        el.style.opacity = opacity.toFixed(3);
      });
      raf = requestAnimationFrame(update);
    };
    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, []);

  const items = [...images, ...images];
  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-2xl bg-white shadow-sm border border-orange-50 py-7"
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-white to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-white to-transparent" />
      <div
        ref={trackRef}
        className="flex w-max gap-5 animate-marquee-x px-4 items-center"
      >
        {items.map((img, i) => (
          <div
            key={i}
            data-marquee-item
            className="shrink-0 overflow-hidden rounded-xl shadow-md ring-1 ring-orange-50 will-change-transform origin-center"
            style={{ transition: "opacity 0.3s ease" }}
          >
            <img
              src={img.src}
              alt={img.alt}
              loading="lazy"
              draggable={false}
              className="h-40 w-64 sm:h-48 sm:w-80 object-cover block"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
