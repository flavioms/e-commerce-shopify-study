"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ProductMediaItem =
  | { kind: "image"; id: string; url: string; alt: string | null }
  | {
      kind: "video";
      id: string;
      alt: string | null;
      previewUrl: string | null;
      sources: { url: string; mimeType: string }[];
    }
  | { kind: "external-video"; id: string; alt: string | null; embedUrl: string };

export interface ProductMediaCarouselProps {
  items: ProductMediaItem[];
  fallbackAlt: string;
}

function MediaSlide({ item, fallbackAlt, priority }: { item: ProductMediaItem; fallbackAlt: string; priority: boolean }) {
  const alt = item.alt ?? fallbackAlt;

  if (item.kind === "video") {
    return (
      <video
        controls
        playsInline
        poster={item.previewUrl ?? undefined}
        className="size-full object-cover"
      >
        {item.sources.map((source) => (
          <source key={source.url} src={source.url} type={source.mimeType} />
        ))}
      </video>
    );
  }

  if (item.kind === "external-video") {
    return (
      <iframe
        src={item.embedUrl}
        title={alt}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="size-full border-0"
      />
    );
  }

  return (
    <Image
      src={item.url}
      alt={alt}
      width={800}
      height={800}
      priority={priority}
      className="size-full object-cover"
    />
  );
}

export function ProductMediaCarousel({ items, fallbackAlt }: ProductMediaCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const scrollToIndex = useCallback((index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const clamped = (index + items.length) % items.length;
    track.scrollTo({ left: clamped * track.clientWidth, behavior: "smooth" });
  }, [items.length]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let frame: number;
    const handleScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (!track.clientWidth) return;
        setActiveIndex(Math.round(track.scrollLeft / track.clientWidth));
      });
    };

    track.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      track.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  if (items.length === 0) {
    return (
      <div className="aspect-square w-full overflow-hidden rounded-xl bg-muted ring-1 ring-foreground/10">
        <Image
          src="/file.svg"
          alt={fallbackAlt}
          width={800}
          height={800}
          className="size-full object-contain p-16"
        />
      </div>
    );
  }

  if (items.length === 1) {
    return (
      <div className="aspect-square w-full overflow-hidden rounded-xl bg-muted ring-1 ring-foreground/10">
        <MediaSlide item={items[0]} fallbackAlt={fallbackAlt} priority />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="group/carousel relative">
        <div
          ref={trackRef}
          className="flex aspect-square w-full snap-x snap-mandatory overflow-x-auto scroll-smooth rounded-xl bg-muted ring-1 ring-foreground/10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {items.map((item, index) => (
            <div key={item.id} className="w-full shrink-0 snap-start">
              <MediaSlide item={item} fallbackAlt={fallbackAlt} priority={index === 0} />
            </div>
          ))}
        </div>

        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Previous item"
          onClick={() => scrollToIndex(activeIndex - 1)}
          className="absolute top-1/2 left-3 -translate-y-1/2 bg-background/80 opacity-0 backdrop-blur transition-opacity group-hover/carousel:opacity-100 focus-visible:opacity-100"
        >
          <ChevronLeft />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Next item"
          onClick={() => scrollToIndex(activeIndex + 1)}
          className="absolute top-1/2 right-3 -translate-y-1/2 bg-background/80 opacity-0 backdrop-blur transition-opacity group-hover/carousel:opacity-100 focus-visible:opacity-100"
        >
          <ChevronRight />
        </Button>
      </div>

      <div className="flex items-center justify-center gap-2">
        {items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            aria-label={`Go to item ${index + 1}`}
            aria-current={index === activeIndex}
            onClick={() => scrollToIndex(index)}
            className={cn(
              "size-2 rounded-full transition-colors",
              index === activeIndex ? "bg-foreground" : "bg-foreground/20 hover:bg-foreground/40"
            )}
          />
        ))}
      </div>
    </div>
  );
}
