"use client";

import Image from "next/image";
import type { LicensedPhysician } from "@/lib/physicians";
import { DEFAULT_PHYSICIAN_ID } from "@/lib/physicians";

type PhysicianPickerCopy = {
  suggested: string;
  selected: string;
};

export function PhysicianPicker({
  physicians,
  selectedId,
  onSelect,
  copy,
}: {
  physicians: LicensedPhysician[];
  selectedId: string;
  onSelect: (id: string) => void;
  copy: PhysicianPickerCopy;
}) {
  return (
    <ul className="space-y-2">
      {physicians.map((physician) => {
        const selected = physician.id === selectedId;
        const suggested = physician.id === DEFAULT_PHYSICIAN_ID;
        return (
          <li key={physician.id}>
            <button
              type="button"
              onClick={() => onSelect(physician.id)}
              className={`flex w-full items-center gap-3 rounded-[18px] px-3 py-3 text-left transition-colors ${
                selected ? "bg-[#f4f0e7] ring-1 ring-[#c77e57]/35" : "bg-[#fbfaf5] hover:bg-[#f4f0e7]"
              }`}
            >
              <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-white">
                <Image src={physician.imageSrc} alt="" fill sizes="48px" className="object-cover object-[center_18%]" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-semibold tracking-[-0.02em] text-[#2b2a28]">{physician.fullName}</span>
                <span className="mt-0.5 block text-[13px] font-medium text-black/50">{physician.specialty}</span>
                {suggested ? (
                  <span className="mt-1 block text-[12px] font-medium text-[#5f7f4f]">{copy.suggested}</span>
                ) : null}
              </span>
              {selected ? (
                <span className="text-[12px] font-semibold text-[#c77e57]">{copy.selected}</span>
              ) : null}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
