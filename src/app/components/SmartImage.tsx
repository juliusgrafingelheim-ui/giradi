import { useState, useEffect } from "react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

type ObjectFit = "contain" | "cover";

/**
 * Loads the image onto a tiny offscreen canvas and samples corner/edge pixels.
 * If most sampled points are white or transparent → product cutout → contain.
 * Otherwise → scene / lifestyle photo → cover.
 */
function detectImageType(src: string): Promise<ObjectFit> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const size = 64;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve("cover");
          return;
        }
        ctx.drawImage(img, 0, 0, size, size);

        const m = 2;
        const samplePoints = [
          [m, m],
          [size - m, m],
          [m, size - m],
          [size - m, size - m],
          [size / 2, m],
          [size / 2, size - m],
          [m, size / 2],
          [size - m, size / 2],
        ];

        let lightCount = 0;
        for (const [x, y] of samplePoints) {
          const pixel = ctx.getImageData(
            Math.floor(x),
            Math.floor(y),
            1,
            1
          ).data;
          const [r, g, b, a] = pixel;
          const isTransparent = a < 30;
          const isLight = r > 230 && g > 230 && b > 230 && a > 200;
          if (isTransparent || isLight) {
            lightCount++;
          }
        }

        resolve(lightCount >= 6 ? "contain" : "cover");
      } catch {
        resolve("cover");
      }
    };
    img.onerror = () => resolve("cover");
    img.src = src;
  });
}

// Cache results so we don't re-detect on every render
const fitCache = new Map<string, ObjectFit>();

interface SmartImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** Extra classes applied only when object-contain is active */
  containClassName?: string;
}

export function SmartImage({
  src,
  alt,
  className = "",
  containClassName = "p-4 bg-[#F5F3EE]",
  ...rest
}: SmartImageProps) {
  const [fit, setFit] = useState<ObjectFit | null>(
    src && fitCache.has(src) ? fitCache.get(src)! : null
  );

  useEffect(() => {
    if (!src) return;
    if (fitCache.has(src)) {
      setFit(fitCache.get(src)!);
      return;
    }
    let cancelled = false;
    detectImageType(src).then((result) => {
      fitCache.set(src, result);
      if (!cancelled) setFit(result);
    });
    return () => {
      cancelled = true;
    };
  }, [src]);

  const fitClasses =
    fit === "contain"
      ? `object-contain ${containClassName}`
      : "object-cover";

  return (
    <ImageWithFallback
      src={src}
      alt={alt}
      className={`${className} ${fit ? fitClasses : "object-cover"}`}
      style={{ opacity: fit ? 1 : 0.01, transition: "opacity 0.3s ease" }}
      {...rest}
    />
  );
}
