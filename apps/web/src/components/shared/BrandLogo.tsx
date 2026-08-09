import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  alt?: string;
};

export function BrandLogo({ className, alt = "MrOS" }: BrandLogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- brand mark is a static public asset
    <img
      src="/logo.png"
      alt={alt}
      className={cn("object-contain", className)}
      draggable={false}
    />
  );
}
