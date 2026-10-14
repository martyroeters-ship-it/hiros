export type LicensedPhysician = {
  id: string;
  fullName: string;
  firstName: string;
  lastName: string;
  role: string;
  specialty: string;
  neighborhood: string;
  address: string;
  imageSrc: string;
  lat: number;
  lng: number;
  rating: number;
  reviewCount: number;
};

export const LICENSED_PHYSICIANS: LicensedPhysician[] = [
  {
    id: "00000000-0000-4000-a000-0000000000d0",
    fullName: "Dr. Ahmet Yılmaz",
    firstName: "Ahmet",
    lastName: "Yılmaz",
    role: "Licensed physician",
    specialty: "Dermatoloji",
    neighborhood: "Nişantaşı",
    address: "Teşvikiye Cad. No: 12",
    imageSrc: "/why_hiros_doctors.webp",
    lat: 41.0522,
    lng: 28.9945,
    rating: 4.9,
    reviewCount: 128,
  },
  {
    id: "00000000-0000-4000-a000-0000000000d2",
    fullName: "Dr. Elif Kaya",
    firstName: "Elif",
    lastName: "Kaya",
    role: "Licensed physician",
    specialty: "Dermatoloji",
    neighborhood: "Caferağa",
    address: "Moda Cad. No: 48",
    imageSrc: "/doctors/elif.jpg",
    lat: 40.9906,
    lng: 29.0292,
    rating: 4.8,
    reviewCount: 96,
  },
  {
    id: "00000000-0000-4000-a000-0000000000d4",
    fullName: "Dr. Mehmet Demir",
    firstName: "Mehmet",
    lastName: "Demir",
    role: "Licensed physician",
    specialty: "Dermatoloji",
    neighborhood: "Etiler",
    address: "Nispetiye Cad. No: 18",
    imageSrc: "/mehmet_demir.jpg",
    lat: 41.108,
    lng: 29.023,
    rating: 4.7,
    reviewCount: 84,
  },
];

/** Extra pins for the intake map. They are not assignable on a real case. */
export const TEST_PHYSICIANS: LicensedPhysician[] = [
  {
    id: "00000000-0000-4000-a000-0000000000e1",
    fullName: "Dr. Zeynep Arslan",
    firstName: "Zeynep",
    lastName: "Arslan",
    role: "Licensed physician",
    specialty: "Dermatoloji",
    neighborhood: "Moda",
    address: "Moda Cad. No: 142",
    imageSrc: "/doctors/zeynep.jpg",
    lat: 40.9816,
    lng: 29.0246,
    rating: 4.9,
    reviewCount: 74,
  },
  {
    id: "00000000-0000-4000-a000-0000000000e2",
    fullName: "Dr. Can Öztürk",
    firstName: "Can",
    lastName: "Öztürk",
    role: "Licensed physician",
    specialty: "Dermatoloji",
    neighborhood: "Beşiktaş",
    address: "Barbaros Blv. No: 56",
    imageSrc: "/doctors/can.jpg",
    lat: 41.0428,
    lng: 29.0064,
    rating: 4.8,
    reviewCount: 112,
  },
  {
    id: "00000000-0000-4000-a000-0000000000e3",
    fullName: "Dr. Selin Aydın",
    firstName: "Selin",
    lastName: "Aydın",
    role: "Licensed physician",
    specialty: "Dermatoloji",
    neighborhood: "Üsküdar",
    address: "Hakimiyeti Milliye Cad. No: 22",
    imageSrc: "/doctors/selin.jpg",
    lat: 41.0262,
    lng: 29.0168,
    rating: 4.7,
    reviewCount: 63,
  },
  {
    id: "00000000-0000-4000-a000-0000000000e4",
    fullName: "Dr. Burak Şahin",
    firstName: "Burak",
    lastName: "Şahin",
    role: "Licensed physician",
    specialty: "Dermatoloji",
    neighborhood: "Osmanbey",
    address: "Halaskargazi Cad. No: 90",
    imageSrc: "/doctors/burak.jpg",
    lat: 41.0526,
    lng: 28.9872,
    rating: 4.6,
    reviewCount: 51,
  },
  {
    id: "00000000-0000-4000-a000-0000000000e5",
    fullName: "Dr. Deniz Yıldız",
    firstName: "Deniz",
    lastName: "Yıldız",
    role: "Licensed physician",
    specialty: "Dermatoloji",
    neighborhood: "Caddebostan",
    address: "Bağdat Cad. No: 214",
    imageSrc: "/doctors/deniz.jpg",
    lat: 40.9632,
    lng: 29.0624,
    rating: 4.8,
    reviewCount: 88,
  },
  {
    id: "00000000-0000-4000-a000-0000000000e6",
    fullName: "Dr. Emre Koç",
    firstName: "Emre",
    lastName: "Koç",
    role: "Licensed physician",
    specialty: "Dermatoloji",
    neighborhood: "Karaköy",
    address: "Kemankeş Cad. No: 31",
    imageSrc: "/doctors/emre.jpg",
    lat: 41.0226,
    lng: 28.9746,
    rating: 4.5,
    reviewCount: 41,
  },
  {
    id: "00000000-0000-4000-a000-0000000000e7",
    fullName: "Dr. Ayşe Çelik",
    firstName: "Ayşe",
    lastName: "Çelik",
    role: "Licensed physician",
    specialty: "Dermatoloji",
    neighborhood: "Etiler",
    address: "Aytar Cad. No: 15",
    imageSrc: "/doctors/ayse.jpg",
    lat: 41.0812,
    lng: 29.0338,
    rating: 4.9,
    reviewCount: 137,
  },
  {
    id: "00000000-0000-4000-a000-0000000000e8",
    fullName: "Dr. Kerem Acar",
    firstName: "Kerem",
    lastName: "Acar",
    role: "Licensed physician",
    specialty: "Dermatoloji",
    neighborhood: "Fenerbahçe",
    address: "Fener Kalamış Cad. No: 64",
    imageSrc: "/doctors/kerem.jpg",
    lat: 40.9708,
    lng: 29.0362,
    rating: 4.6,
    reviewCount: 58,
  },
];

export const MAP_PHYSICIANS: LicensedPhysician[] = [...LICENSED_PHYSICIANS, ...TEST_PHYSICIANS];

export const DEFAULT_PHYSICIAN_ID = LICENSED_PHYSICIANS[0]!.id;

export function physicianById(id: string | null | undefined): LicensedPhysician {
  return MAP_PHYSICIANS.find((physician) => physician.id === id) ?? LICENSED_PHYSICIANS[0]!;
}

/** Nearest licensed physician is chosen on the map. This remains a safe fallback. */
export function assignedPhysicianForLocation(_city?: string | null): LicensedPhysician {
  return physicianById(DEFAULT_PHYSICIAN_ID);
}

export function isLicensedPhysicianId(id: string | null | undefined): id is string {
  return Boolean(id && LICENSED_PHYSICIANS.some((physician) => physician.id === id));
}
