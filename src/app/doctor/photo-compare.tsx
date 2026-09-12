"use client";

import { useState } from "react";

export type ComparePhoto = { label: string; src: string };

export function PhotoCompare({
  photos,
  size = "sm",
}: {
  photos: ComparePhoto[];
  size?: "sm" | "xs";
}) {
  const [open, setOpen] = useState<number | null>(null);
  const [compare, setCompare] = useState<number | null>(null);
  const [picking, setPicking] = useState(false);

  if (photos.length === 0) {
    return <p className="text-[12.5px] text-black/45">No photos on file.</p>;
  }

  const box = size === "xs" ? "h-10 w-10" : "h-12 w-12";

  const close = () => {
    setOpen(null);
    setCompare(null);
    setPicking(false);
  };

  return (
    <>
      <div className="flex flex-wrap gap-1.5">
        {photos.map((photo, index) => (
          <button
            key={photo.src}
            type="button"
            onClick={() => {
              setOpen(index);
              setCompare(null);
              setPicking(false);
            }}
            className="overflow-hidden rounded-[6px] ring-1 ring-black/8 hover:ring-[#2f5f4f]/40"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo.src} alt={photo.label} className={`${box} object-cover`} />
          </button>
        ))}
      </div>

      {open !== null ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={close}>
          <div
            className="w-full max-w-[420px] rounded-[14px] bg-white p-3 shadow-[0_16px_40px_rgba(0,0,0,0.22)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-[12.5px] font-semibold text-[#1f241b]">
                {compare !== null ? "Side by side" : photos[open]?.label || "Photo"}
              </p>
              <div className="flex items-center gap-1.5">
                {photos.length > 1 && compare === null ? (
                  <button
                    type="button"
                    onClick={() => setPicking(true)}
                    className="rounded-full border border-black/10 px-2.5 py-1 text-[11.5px] font-semibold text-[#2b2a28] hover:bg-black/[0.03]"
                  >
                    {picking ? "Pick a photo" : "Compare"}
                  </button>
                ) : null}
                {compare !== null ? (
                  <button
                    type="button"
                    onClick={() => {
                      setCompare(null);
                      setPicking(false);
                    }}
                    className="rounded-full border border-black/10 px-2.5 py-1 text-[11.5px] font-semibold text-[#2b2a28] hover:bg-black/[0.03]"
                  >
                    Single
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={close}
                  className="rounded-full px-2 py-1 text-[12px] font-semibold text-black/45 hover:text-[#1f241b]"
                >
                  Close
                </button>
              </div>
            </div>

            {picking ? (
              <div className="flex flex-wrap gap-1.5">
                {photos.map((photo, index) =>
                  index === open ? null : (
                    <button
                      key={photo.src}
                      type="button"
                      onClick={() => {
                        setCompare(index);
                        setPicking(false);
                      }}
                      className="overflow-hidden rounded-[6px] ring-1 ring-black/10 hover:ring-[#2f5f4f]"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={photo.src} alt={photo.label} className="h-12 w-12 object-cover" />
                    </button>
                  ),
                )}
              </div>
            ) : compare !== null ? (
              <div className="grid grid-cols-2 gap-2">
                <figure>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photos[open].src} alt={photos[open].label} className="h-40 w-full rounded-[8px] object-cover" />
                  <figcaption className="mt-1 truncate text-center text-[11px] text-black/45">{photos[open].label}</figcaption>
                </figure>
                <figure>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photos[compare].src} alt={photos[compare].label} className="h-40 w-full rounded-[8px] object-cover" />
                  <figcaption className="mt-1 truncate text-center text-[11px] text-black/45">{photos[compare].label}</figcaption>
                </figure>
              </div>
            ) : (
              <figure>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photos[open].src} alt={photos[open].label} className="max-h-[320px] w-full rounded-[8px] object-contain" />
                <figcaption className="mt-1 text-center text-[11px] text-black/45">
                  {open + 1} / {photos.length}
                </figcaption>
              </figure>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
