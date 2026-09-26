export type LicensedPhysician = {
  id: string;
  fullName: string;
  firstName: string;
  lastName: string;
  role: string;
  specialty: string;
  imageSrc: string;
};

export const LICENSED_PHYSICIANS: LicensedPhysician[] = [
  {
    id: "00000000-0000-4000-a000-0000000000d0",
    fullName: "Dr. Ahmet Yılmaz",
    firstName: "Ahmet",
    lastName: "Yılmaz",
    role: "Licensed physician",
    specialty: "Dermatoloji",
    imageSrc: "/why_hiros_doctors.webp",
  },
  {
    id: "00000000-0000-4000-a000-0000000000d2",
    fullName: "Dr. Elif Kaya",
    firstName: "Elif",
    lastName: "Kaya",
    role: "Licensed physician",
    specialty: "Dermatoloji",
    imageSrc: "/hiros_intake_doctor.webp",
  },
  {
    id: "00000000-0000-4000-a000-0000000000d4",
    fullName: "Dr. Mehmet Demir",
    firstName: "Mehmet",
    lastName: "Demir",
    role: "Licensed physician",
    specialty: "Dermatoloji",
    imageSrc: "/mehmet_demir.jpg",
  },
];

export const DEFAULT_PHYSICIAN_ID = LICENSED_PHYSICIANS[0]!.id;

export function physicianById(id: string | null | undefined): LicensedPhysician {
  return LICENSED_PHYSICIANS.find((physician) => physician.id === id) ?? LICENSED_PHYSICIANS[0]!;
}

/** Location still assigns a default. Patients can change to another licensed physician. */
export function assignedPhysicianForLocation(_city?: string | null): LicensedPhysician {
  return physicianById(DEFAULT_PHYSICIAN_ID);
}

export function isLicensedPhysicianId(id: string | null | undefined): id is string {
  return Boolean(id && LICENSED_PHYSICIANS.some((physician) => physician.id === id));
}
