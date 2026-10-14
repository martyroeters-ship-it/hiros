"use client";

import { useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useHydratedLocale } from "@/i18n/LanguageProvider";
import { districtPoint, formatDistanceKm, ISTANBUL_LANDMARKS, physiciansNearDistrict, type MapLandmark } from "@/lib/istanbulGeo";

type MatchMap = {
  remove: () => void;
  resize: () => void;
  jumpTo: (options: { center: [number, number]; zoom: number }) => void;
  easeTo: (options: { center: [number, number]; zoom: number; duration: number }) => void;
  triggerRepaint: () => void;
  getZoom: () => number;
  getCenter: () => { lat: number; lng: number };
  getBounds: () => { contains: (lngLat: [number, number]) => boolean };
  on: (type: string, listener: () => void) => void;
  off: (type: string, listener: () => void) => void;
};

const POI_MIN_ZOOM = 13.8;
const DOCTOR_OVERVIEW_ZOOM = 13.2;
const POI_VISIBLE_LIMIT = 4;

type DoctorMatchCopy = {
  title: string;
  back: string;
  you: string;
  reviews: string;
  nearest: string;
  selected: string;
  continueWith: string;
};

export function DoctorMatchScreen({
  district,
  selectedId,
  onSelect,
  onBack,
  onContinue,
  copy,
}: {
  district: string;
  selectedId: string;
  onSelect: (id: string) => void;
  onBack: () => void;
  onContinue: () => void;
  copy: DoctorMatchCopy;
}) {
  const locale = useHydratedLocale();
  const mapNodeRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MatchMap | null>(null);
  const pinNodesRef = useRef<Map<string, HTMLButtonElement>>(new Map());
  const selectedIdRef = useRef(selectedId);
  const onSelectRef = useRef(onSelect);
  const localeRef = useRef(locale);
  const focusRef = useRef<(id: string) => void>(() => {});
  const layoutPinsRef = useRef<() => void>(() => {});
  selectedIdRef.current = selectedId;
  onSelectRef.current = onSelect;
  localeRef.current = locale;
  const ranked = useMemo(() => physiciansNearDistrict(district), [district]);
  const origin = useMemo(() => districtPoint(district), [district]);

  useEffect(() => {
    const nearest = ranked[0]?.physician.id;
    if (nearest) onSelect(nearest);
    // Select the nearest physician once per neighbourhood.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [district]);

  useEffect(() => {
    const node = mapNodeRef.current;
    if (!node) return;

    let cancelled = false;
    const markers: { remove: () => void }[] = [];
    let observer: ResizeObserver | null = null;

    const start = async () => {
      const maplibregl = await import("maplibre-gl");
      maplibregl.setWorkerUrl("/maplibre-gl-worker.js");
      await import("maplibre-gl/dist/maplibre-gl.css");
      if (cancelled || !mapNodeRef.current) return;

      const map = new maplibregl.Map({
        container: mapNodeRef.current,
        style: "https://tiles.openfreemap.org/styles/bright",
        center: [origin.lng, origin.lat],
        zoom: 13,
        pixelRatio: Math.min(2, window.devicePixelRatio || 1),
      });
      mapRef.current = map;
      map.on("error", (event) => {
        const message = event.error instanceof Error ? event.error.message : String(event.error ?? "");
        mapNodeRef.current?.setAttribute("data-map-error", message.slice(0, 200));
      });

      const userEl = document.createElement("div");
      userEl.className = "doctor-map-user";
      userEl.title = copy.you;
      const userMarker = new maplibregl.Marker({ element: userEl, anchor: "center" })
        .setLngLat([origin.lng, origin.lat])
        .addTo(map);
      userEl.style.zIndex = "5";
      markers.push(userMarker);

      pinNodesRef.current = new Map();
      for (const entry of ranked) {
        const { physician } = entry;
        const pin = document.createElement("button");
        pin.type = "button";
        pin.className = `doctor-map-pin${physician.id === selectedIdRef.current ? " is-selected" : ""}`;
        pin.textContent = physician.fullName;
        pin.dataset.rating = String(physician.rating);
        pin.dataset.lat = String(physician.lat);
        pin.dataset.lng = String(physician.lng);
        pin.addEventListener("click", () => focusRef.current(physician.id));
        pinNodesRef.current.set(physician.id, pin);
        pin.style.zIndex = physician.id === selectedIdRef.current ? "40" : "20";
        const marker = new maplibregl.Marker({ element: pin, anchor: "center" })
          .setLngLat([physician.lng, physician.lat])
          .addTo(map);
        markers.push(marker);
      }

      const layoutDoctorPins = () => {
        const pins = [...pinNodesRef.current.entries()];
        const zoom = map.getZoom();
        const overview = zoom < DOCTOR_OVERVIEW_ZOOM;
        pins.forEach(([, pin]) => {
          pin.style.marginTop = "0px";
          pin.style.display = "";
        });

        if (overview) {
          const bounds = map.getBounds();
          const limit = zoom < 11.2 ? 3 : zoom < 12.2 ? 4 : 5;
          const inView = pins.filter(([, pin]) => bounds.contains([Number(pin.dataset.lng), Number(pin.dataset.lat)]));
          const sorted = [...inView].sort(([, pinA], [, pinB]) => Number(pinB.dataset.rating) - Number(pinA.dataset.rating));
          const visible = new Set<string>();
          for (const [id] of sorted) {
            if (visible.size >= limit) break;
            visible.add(id);
          }
          if (selectedIdRef.current) visible.add(selectedIdRef.current);
          pins.forEach(([id, pin]) => {
            const selected = id === selectedIdRef.current;
            pin.style.display = visible.has(id) ? "" : "none";
            pin.style.zIndex = selected ? "40" : String(12 + Math.round(Number(pin.dataset.rating) * 4));
          });
          return;
        }

        const placed: { top: number; bottom: number; left: number; right: number }[] = [];
        const ordered = [...pins].sort(([idA], [idB]) => {
          if (idA === selectedIdRef.current) return -1;
          if (idB === selectedIdRef.current) return 1;
          return 0;
        });
        for (const [, pin] of ordered) {
          let guard = 0;
          let rect = pin.getBoundingClientRect();
          while (guard < 8) {
            const hit = placed.find(
              (other) =>
                rect.left < other.right - 4 &&
                rect.right > other.left + 4 &&
                rect.top < other.bottom - 2 &&
                rect.bottom > other.top + 2,
            );
            if (!hit) break;
            const shift = Math.ceil(hit.bottom - rect.top + 6);
            const current = Number.parseFloat(pin.style.marginTop) || 0;
            pin.style.marginTop = `${current + shift}px`;
            rect = pin.getBoundingClientRect();
            guard += 1;
          }
          placed.push({ top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right });
        }
      };
      layoutPinsRef.current = layoutDoctorPins;

      const poiMarkers: { node: HTMLElement; lat: number; lng: number }[] = [];
      for (const place of ISTANBUL_LANDMARKS) {
        const poi = document.createElement("div");
        poi.className = `doctor-map-poi is-${place.kind}`;
        poi.innerHTML = `<span class="doctor-map-poi-icon" aria-hidden="true">${landmarkIcon(place.kind)}</span><span class="doctor-map-poi-label">${localeRef.current === "tr" ? place.name : place.nameEn}</span>`;
        const marker = new maplibregl.Marker({ element: poi, anchor: "center" })
          .setLngLat([place.lng, place.lat])
          .addTo(map);
        poi.style.zIndex = "1";
        poi.style.display = "none";
        poiMarkers.push({ node: poi, lat: place.lat, lng: place.lng });
        markers.push(marker);
      }

      const syncLandmarkVisibility = () => {
        const zoom = map.getZoom();
        if (zoom < POI_MIN_ZOOM) {
          poiMarkers.forEach(({ node }) => {
            node.style.display = "none";
          });
          return;
        }
        const bounds = map.getBounds();
        const center = map.getCenter();
        const nearby = poiMarkers
          .filter((place) => bounds.contains([place.lng, place.lat]))
          .map((place) => ({
            place,
            score: (place.lat - center.lat) ** 2 + (place.lng - center.lng) ** 2,
          }))
          .sort((left, right) => left.score - right.score)
          .slice(0, POI_VISIBLE_LIMIT)
          .map((entry) => entry.place.node);
        const visible = new Set(nearby);
        poiMarkers.forEach(({ node }) => {
          node.style.display = visible.has(node) ? "" : "none";
        });
      };
      const syncMarkers = () => {
        syncLandmarkVisibility();
        layoutDoctorPins();
      };
      map.on("zoom", syncMarkers);
      map.on("move", syncMarkers);
      map.on("moveend", syncMarkers);

      map.once("load", () => {
        if (cancelled) return;
        map.resize();
        const farthestKm = ranked.reduce((max, entry) => (entry.km <= 3.5 ? Math.max(max, entry.km) : max), 0.8);
        const zoom = Math.min(14.2, Math.max(12.4, 14.5 - farthestKm * 0.72));
        map.jumpTo({ center: [origin.lng, origin.lat], zoom });
        syncMarkers();
        map.triggerRepaint();
      });
      observer = new ResizeObserver(() => {
        if (!cancelled) map.resize();
      });
      observer.observe(mapNodeRef.current);
    };

    void start();

    return () => {
      cancelled = true;
      observer?.disconnect();
      markers.forEach((marker) => marker.remove());
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // Recreate the map when the neighbourhood changes. Selection styling is updated separately.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [district]);

  const focusPhysician = (id: string) => {
    onSelect(id);
    const physician = ranked.find((entry) => entry.physician.id === id)?.physician;
    if (!physician) return;
    mapRef.current?.easeTo({
      center: [physician.lng, physician.lat],
      zoom: 14,
      duration: 700,
    });
  };
  focusRef.current = focusPhysician;

  useEffect(() => {
    pinNodesRef.current.forEach((pin, id) => {
      const selected = id === selectedId;
      pin.classList.toggle("is-selected", selected);
      pin.style.zIndex = selected ? "40" : "20";
    });
    layoutPinsRef.current();
  }, [selectedId]);

  const ratingText = (rating: number) =>
    locale === "tr" ? rating.toFixed(1).replace(".", ",") : rating.toFixed(1);

  const popup = (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 p-3 sm:p-6">
      <div className="doctor-match-shell flex h-[min(760px,calc(100dvh-24px))] w-full max-w-[1120px] flex-col bg-white shadow-[0_24px_80px_rgba(0,0,0,0.28)] sm:h-[min(760px,calc(100dvh-48px))] lg:flex-row">
      <aside className="order-2 flex min-h-0 w-full flex-1 flex-col bg-white lg:order-1 lg:w-[420px] lg:flex-none lg:border-r lg:border-black/10">
        <div className="flex items-center justify-between gap-4 px-5 pb-3 pt-5 sm:px-6">
          <div className="min-w-0">
            <h2 className="font-title text-[26px] font-medium leading-none tracking-[-0.04em] text-[#1f241b] sm:text-[30px]">
              {copy.title}
            </h2>
            <p className="mt-2 text-[14px] font-medium text-black/50">
              {ranked.length} · {district}
            </p>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-black/10 px-3 py-2 text-[14px] font-medium text-black/70"
          >
            {copy.back}
          </button>
        </div>

        <ul className="min-h-0 flex-1 overflow-y-auto border-t border-black/[0.06]">
          {ranked.map((entry, index) => {
            const selected = entry.physician.id === selectedId;
            return (
              <li key={entry.physician.id} className="border-b border-black/[0.06]">
                <button
                  type="button"
                  onClick={() => focusPhysician(entry.physician.id)}
                  aria-pressed={selected}
                  className={`flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors sm:px-5 ${
                    selected ? "bg-[#f3f0e8] shadow-[inset_4px_0_0_#11110f]" : "bg-white hover:bg-[#fafaf8]"
                  }`}
                >
                  <span className={`relative mt-0.5 h-11 w-11 shrink-0 overflow-hidden rounded-full bg-[#eceae4] ${selected ? "ring-2 ring-[#11110f] ring-offset-2" : ""}`}>
                    <Image
                      src={entry.physician.imageSrc}
                      alt=""
                      fill
                      sizes="44px"
                      className="object-cover object-[center_18%]"
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[15px] font-semibold tracking-[-0.02em] text-[#1f241b]">
                        {entry.physician.fullName}
                      </span>
                      {index === 0 ? (
                        <span className="rounded-full border border-black/10 bg-white px-2 py-0.5 text-[11px] font-semibold text-[#11110f]">
                          {copy.nearest}
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-1 block truncate text-[13px] font-medium text-[#1f241b]/80">
                      {entry.physician.neighborhood}
                      <span className="text-black/35"> · </span>
                      <span className="text-black/50">{entry.physician.address}</span>
                    </span>
                    <span className="mt-1 block text-[12px] font-medium text-black/45">{entry.physician.specialty}</span>
                    <span className="mt-1 flex items-center gap-1.5 text-[12px] font-medium text-[#1f241b]">
                      <span className="text-[#222]" aria-hidden="true">★</span>
                      <span>{ratingText(entry.physician.rating)}</span>
                      <span className="text-black/45">
                        ({entry.physician.reviewCount} {copy.reviews})
                      </span>
                    </span>
                  </span>
                  <span className="shrink-0 pt-0.5 text-[14px] font-semibold tracking-[-0.02em] text-[#1f241b]">
                    {formatDistanceKm(entry.km, locale)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="border-t border-black/[0.06] px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={onContinue}
            className="w-full rounded-full bg-[#11110f] px-5 py-3.5 text-[15px] font-semibold text-white"
          >
            {copy.continueWith}
          </button>
        </div>
      </aside>

      <div className="doctor-match-map relative order-1 h-[46%] min-h-[240px] w-full min-w-0 lg:order-2 lg:h-full lg:min-h-0 lg:flex-1">
        <div ref={mapNodeRef} className="absolute inset-0" />
      </div>
      </div>
    </div>
  );

  return createPortal(popup, document.body);
}

function landmarkIcon(kind: MapLandmark["kind"]) {
  const common = "fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"";
  if (kind === "museum") {
    return `<svg viewBox="0 0 24 24" ${common}><path d="M4 10h16M6 10v7M10 10v7M14 10v7M18 10v7M4 17h16M12 4l8 6H4l8-6Z"/></svg>`;
  }
  if (kind === "bridge") {
    return `<svg viewBox="0 0 24 24" ${common}><path d="M3 16h18M4 16V9M20 16V9M4 12c2.2-3 5-3 8 0 3-3 5.8-3 8 0"/></svg>`;
  }
  if (kind === "ferry") {
    return `<svg viewBox="0 0 24 24" ${common}><path d="M4 15h16l-1.5 4h-13L4 15Z"/><path d="M7 15V9h6l3 3v3"/></svg>`;
  }
  if (kind === "palace") {
    return `<svg viewBox="0 0 24 24" ${common}><path d="M4 20h16M6 20V10M10 20V10M14 20V10M18 20V10M4 10h16M8 10V7M12 10V5M16 10V7"/></svg>`;
  }
  if (kind === "park") {
    return `<svg viewBox="0 0 24 24" ${common}><path d="M12 21V11"/><path d="M12 13c-3 0-5-2-5-4.5S9 5 12 8c3-3 5-1.5 5 .5S15 13 12 13Z"/></svg>`;
  }
  return `<svg viewBox="0 0 24 24" ${common}><path d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10Z"/><circle cx="12" cy="11" r="1.6" fill="currentColor" stroke="none"/></svg>`;
}
