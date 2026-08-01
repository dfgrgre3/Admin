"use client";

import React from "react";
import Image from "next/image";

interface LazyImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  placeholder?: "blur" | "empty";
  blurDataURL?: string;
  priority?: boolean;
  quality?: number;
}

export function LazyImage({
  src,
  alt,
  width = 400,
  height = 400,
  className = "",
  placeholder = "empty",
  blurDataURL,
  priority = false,
  quality = 75,
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [isInView, setIsInView] = React.useState(priority);
  const imgRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (priority) {
      return;
    }

    if (typeof IntersectionObserver === "undefined") {
      const fallback = window.setTimeout(() => setIsInView(true), 0);
      return () => window.clearTimeout(fallback);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "200px",
        threshold: 0.01,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      style={{ width, height }}
    >
      {isInView && (
        <>
          {!isLoaded && !priority && (
            <div className="absolute inset-0 animate-pulse bg-muted/30" />
          )}
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            quality={quality}
            priority={priority}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            placeholder={placeholder}
            blurDataURL={blurDataURL}
            onLoad={() => setIsLoaded(true)}
            className={`transition-opacity duration-300 ${
              isLoaded ? "opacity-100" : "opacity-0"
            }`}
          />
        </>
      )}
      {!isInView && !priority && (
        <div className="absolute inset-0 bg-muted/20" />
      )}
    </div>
  );
}