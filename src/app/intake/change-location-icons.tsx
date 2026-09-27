import type { ReactNode } from "react";

const CHANGE_LOCATION_ICONS: Record<string, string> = {
  "Along the hairline": "/intake/hairline.png",
  "At the top": "/intake/crown.png",
  "All over": "/intake/overall.png",
};

export function ChangeLocationIcon({ option }: { option: string }): ReactNode {
  const src = CHANGE_LOCATION_ICONS[option];
  if (!src) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- preserve PNG alpha; Next Image flattens these
    <img
      src={src}
      alt=""
      width={40}
      height={40}
      className="h-9 w-9 shrink-0 object-contain sm:h-10 sm:w-10"
      draggable={false}
      aria-hidden="true"
    />
  );
}

export function hasChangeLocationIcon(option: string) {
  return option in CHANGE_LOCATION_ICONS;
}
