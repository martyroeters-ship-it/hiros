import { MAP_PHYSICIANS, type LicensedPhysician } from "./physicians";

export type LatLng = { lat: number; lng: number };

/** Points where the map labels each district, so the blue dot sits on that name. */
export const ISTANBUL_DISTRICT_POINTS: Record<string, LatLng> = {
  Adalar: { lat: 40.87417, lng: 29.12933 },
  Arnavutköy: { lat: 41.18447, lng: 28.74124 },
  Ataşehir: { lat: 40.99294, lng: 29.11352 },
  Avcılar: { lat: 40.97994, lng: 28.72167 },
  Bağcılar: { lat: 41.03455, lng: 28.85676 },
  Bahçelievler: { lat: 41.00305, lng: 28.86577 },
  Bakırköy: { lat: 40.97826, lng: 28.87445 },
  Başakşehir: { lat: 41.10758, lng: 28.79507 },
  Bayrampaşa: { lat: 41.03455, lng: 28.91184 },
  Beşiktaş: { lat: 41.04285, lng: 29.00753 },
  Beykoz: { lat: 41.1343, lng: 29.09204 },
  Beylikdüzü: { lat: 41.00381, lng: 28.63729 },
  Beyoğlu: { lat: 41.02842, lng: 28.97368 },
  Büyükçekmece: { lat: 41.02165, lng: 28.57976 },
  Çatalca: { lat: 41.14368, lng: 28.46052 },
  Çekmeköy: { lat: 41.03516, lng: 29.17391 },
  Esenler: { lat: 41.03762, lng: 28.88245 },
  Esenyurt: { lat: 41.03429, lng: 28.68011 },
  Eyüpsultan: { lat: 41.04784, lng: 28.93274 },
  Fatih: { lat: 41.01928, lng: 28.94793 },
  Gaziosmanpaşa: { lat: 41.05783, lng: 28.91225 },
  Güngören: { lat: 41.02528, lng: 28.87265 },
  Kadıköy: { lat: 40.9913, lng: 29.02456 },
  Kağıthane: { lat: 41.07965, lng: 28.97312 },
  Kartal: { lat: 40.8885, lng: 29.18589 },
  Küçükçekmece: { lat: 40.99187, lng: 28.7712 },
  Maltepe: { lat: 40.92475, lng: 29.13108 },
  Pendik: { lat: 40.87687, lng: 29.23497 },
  Sancaktepe: { lat: 40.99052, lng: 29.22886 },
  Sarıyer: { lat: 41.16858, lng: 29.05726 },
  Silivri: { lat: 41.07425, lng: 28.24817 },
  Sultanbeyli: { lat: 40.96702, lng: 29.26713 },
  Sultangazi: { lat: 41.10433, lng: 28.86144 },
  Şile: { lat: 41.17441, lng: 29.61252 },
  Şişli: { lat: 41.06379, lng: 28.98316 },
  Tuzla: { lat: 40.81617, lng: 29.30342 },
  Ümraniye: { lat: 41.02564, lng: 29.0963 },
  Üsküdar: { lat: 41.02655, lng: 29.01513 },
  Zeytinburnu: { lat: 40.98987, lng: 28.90375 },
};

const ISTANBUL_CENTER: LatLng = { lat: 41.015, lng: 28.979 };

export function districtPoint(district: string | null | undefined): LatLng {
  if (!district) return ISTANBUL_CENTER;
  return ISTANBUL_DISTRICT_POINTS[district] ?? ISTANBUL_CENTER;
}

function haversineKm(from: LatLng, to: LatLng) {
  const earthKm = 6371;
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(to.lat - from.lat);
  const dLng = toRad(to.lng - from.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(from.lat)) * Math.cos(toRad(to.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * earthKm * Math.asin(Math.sqrt(a));
}

export type PhysicianDistance = {
  physician: LicensedPhysician;
  km: number;
};

export function physiciansNearDistrict(district: string | null | undefined): PhysicianDistance[] {
  const origin = districtPoint(district);
  return MAP_PHYSICIANS.map((physician) => ({
    physician,
    km: haversineKm(origin, physician),
  })).sort((left, right) => left.km - right.km);
}

export type MapLandmark = {
  name: string;
  nameEn: string;
  lat: number;
  lng: number;
  kind: "museum" | "bridge" | "ferry" | "landmark" | "palace" | "park";
};

/** A few recognizable places so the map reads as a neighbourhood, not only doctor pins. */
export const ISTANBUL_LANDMARKS: MapLandmark[] = [
  { name: "Galata Kulesi", nameEn: "Galata Tower", lat: 41.0256, lng: 28.9744, kind: "landmark" },
  { name: "Galata Köprüsü", nameEn: "Galata Bridge", lat: 41.0199, lng: 28.973, kind: "bridge" },
  { name: "Kız Kulesi", nameEn: "Maiden's Tower", lat: 41.0211, lng: 29.0041, kind: "landmark" },
  { name: "Dolmabahçe Sarayı", nameEn: "Dolmabahçe Palace", lat: 41.0391, lng: 28.9984, kind: "palace" },
  { name: "Pera Müzesi", nameEn: "Pera Museum", lat: 41.0316, lng: 28.9752, kind: "museum" },
  { name: "Çiçek Pasajı", nameEn: "Çiçek Pasajı", lat: 41.0338, lng: 28.9776, kind: "landmark" },
  { name: "Taksim", nameEn: "Taksim", lat: 41.0369, lng: 28.985, kind: "landmark" },
  { name: "Ortaköy", nameEn: "Ortaköy", lat: 41.0475, lng: 29.027, kind: "landmark" },
  { name: "Beşiktaş İskelesi", nameEn: "Beşiktaş Pier", lat: 41.0413, lng: 29.0068, kind: "ferry" },
  { name: "Nişantaşı", nameEn: "Nişantaşı", lat: 41.0522, lng: 28.9948, kind: "landmark" },
  { name: "Etiler", nameEn: "Etiler", lat: 41.0815, lng: 29.0335, kind: "landmark" },
  { name: "Kadıköy İskelesi", nameEn: "Kadıköy Pier", lat: 40.9928, lng: 29.0232, kind: "ferry" },
  { name: "Moda Sahili", nameEn: "Moda Coast", lat: 40.979, lng: 29.0235, kind: "park" },
  { name: "Bağdat Caddesi", nameEn: "Bağdat Avenue", lat: 40.963, lng: 29.0635, kind: "landmark" },
  { name: "Üsküdar İskelesi", nameEn: "Üsküdar Pier", lat: 41.0267, lng: 29.0155, kind: "ferry" },
  { name: "Sultanahmet", nameEn: "Sultanahmet", lat: 41.0054, lng: 28.9768, kind: "landmark" },
  { name: "Kapalıçarşı", nameEn: "Grand Bazaar", lat: 41.0106, lng: 28.9681, kind: "landmark" },
  { name: "Pierre Loti", nameEn: "Pierre Loti", lat: 41.054, lng: 28.9335, kind: "park" },
];

export function formatDistanceKm(km: number, locale: "tr" | "en") {
  if (km < 1) {
    const meters = Math.max(50, Math.round(km * 1000 / 10) * 10);
    return `${meters} m`;
  }
  const digits = km < 10 ? 1 : 0;
  const rounded = km.toFixed(digits);
  const text = locale === "tr" ? rounded.replace(".", ",") : rounded;
  return `${text} km`;
}
