import { intakeCopy } from "@/i18n/intakeCopy";
import type { DoctorCopy, DoctorLocale } from "./copy";
import type { PatientCase } from "./data";

const QUESTION_LABELS_TR: Record<string, string> = {
  "Reason for visit": "Başvuru nedeni",
  "Reason for consultation": "Konsültasyon nedeni",
  "Affected areas": "Etkilenen bölgeler",
  "Reported onset": "Bildirilen başlangıç",
  "Clarity sought": "Netleştirilmek istenen",
  "Rate of progression": "İlerleme hızı",
  "Scalp symptoms": "Saç derisi belirtileri",
  "Family history of hair loss": "Ailede saç kaybı öyküsü",
  "Ongoing medical conditions": "Süren tıbbi durumlar",
  "Current medications": "Mevcut ilaçlar",
  "Medical conditions": "Tıbbi durumlar",
  "Medical condition": "Tıbbi durum",
  "Recent changes": "Son değişiklikler",
  "Previous treatments": "Önceki tedaviler",
  "Additional notes": "Ek notlar",
  "Patient note": "Hasta notu",
};

const EXTRA_VALUES_TR: Record<string, string> = {
  Patient: "Hasta",
  Submitted: "Gönderildi",
  "Requested more info": "Ek bilgi istendi",
  Approved: "Onaylandı",
  Declined: "Reddedildi",
  Green: "Yeşil",
  Orange: "Turuncu",
  Red: "Kırmızı",
  High: "Yüksek",
  Medium: "Orta",
  Low: "Düşük",
  "Not provided": "Belirtilmedi",
  "None reported": "Bildirilmedi",
  "Area not reported": "Bölge belirtilmedi",
  "Hair loss consultation": "Saç kaybı konsültasyonu",
  "Reported — see notes": "Bildirildi — notlara bakın",
  Reported: "Bildirildi",
  front: "ön",
  top: "tepe",
  side: "yan",
  front_hairline: "ön saç çizgisi",
  crown_top: "tepe",
  scalp_parting: "ayrım",
  Confidence: "Güven",
  flag: "işaret",
  flags: "işaret",
  "New intake": "Yeni başvuru",
  "Asked for a video visit": "Görüntülü görüşme istedi",
  "Scheduled video visit today": "Bugün planlı görüntülü görüşme",
  "High likelihood": "Yüksek olasılık",
  "Moderate likelihood": "Orta olasılık",
  "Low likelihood": "Düşük olasılık",
  "Routine processing": "Rutin işlem",
  "Needs physician review": "Hekim incelemesi gerekir",
  "Escalate for review": "İnceleme için yükselt",
};

const FLAG_NOTES_TR: Record<string, string> = {
  "Patchy/unusual pattern — possible alopecia areata or alternative diagnosis.":
    "Yama/olağan dışı patern — alopesi areata veya alternatif tanı olabilir.",
  "Scalp pain, sores, or infection — further evaluation may be appropriate.":
    "Saç derisinde ağrı, yara veya enfeksiyon — ileri değerlendirme uygun olabilir.",
  "Rapid-onset shedding — consider alternative diagnosis.":
    "Ani başlayan dökülme — alternatif tanı düşünülmeli.",
  "Very recent onset — consider telogen effluvium or temporary shedding vs. AGA.":
    "Çok yeni başlangıç — telogen effluvium veya geçici dökülme AGA’ya karşı değerlendirilmeli.",
  "No family history reported — less typical for androgenetic alopecia.":
    "Aile öyküsü yok — androgenetik alopesi için daha az tipik.",
  "Scalp redness/irritation — physician review advised.":
    "Saç derisi kızarıklığı/tahrişi — hekim incelemesi önerilir.",
  "Scalp itching — physician review advised.":
    "Saç derisi kaşıntısı — hekim incelemesi önerilir.",
  "Recent severe stress — possible telogen effluvium.":
    "Yakın zamanda yoğun stres — telogen effluvium olabilir.",
  "Recent illness/fever — possible telogen effluvium.":
    "Yakın zamanda hastalık/ateş — telogen effluvium olabilir.",
  "Recent weight/diet change — possible telogen effluvium.":
    "Yakın zamanda kilo/diyet değişimi — telogen effluvium olabilir.",
  "New medication or supplement — review for shedding cause.":
    "Yeni ilaç veya takviye — dökülme nedeni açısından incelenmeli.",
  "Ongoing medical concern reported — requires physician review.":
    "Süren tıbbi endişe bildirildi — hekim incelemesi gerekir.",
};

function lookup(value: string): string | undefined {
  const option = intakeCopy.tr.option(value);
  if (option !== value) return option;
  return QUESTION_LABELS_TR[value] ?? EXTRA_VALUES_TR[value] ?? FLAG_NOTES_TR[value];
}

export function localizeDoctorText(language: DoctorLocale, value: string | null | undefined, fallback?: string): string {
  const raw = value?.trim();
  if (!raw) {
    if (!fallback) return "";
    return language === "tr" ? lookup(fallback) ?? fallback : fallback;
  }
  if (language !== "tr") return raw;

  const exact = lookup(raw);
  if (exact) return exact;

  const flagged = raw.match(/^(.*) flagged: "([^"]+)" — (.*)$/);
  if (flagged) {
    const label = localizeDoctorText("tr", flagged[1]);
    const rest =
      flagged[3].includes("possible alternative diagnosis")
        ? "olası alternatif tanı, hekim incelemesi gerekir."
        : "hekim incelemesi gerekir.";
    return `${label} işaretlendi: "${flagged[2]}" — ${rest}`;
  }

  const colon = raw.indexOf(": ");
  if (colon > 0 && colon < 60) {
    return `${localizeDoctorText("tr", raw.slice(0, colon))}: ${localizeDoctorText("tr", raw.slice(colon + 2))}`;
  }

  if (raw.includes(", ")) {
    return raw
      .split(", ")
      .map((part) => localizeDoctorText("tr", part))
      .join(", ");
  }

  return raw;
}

export function localizeList(language: DoctorLocale, values: string[] | undefined, empty: string): string {
  if (!values?.length) return empty;
  return values.map((value) => localizeDoctorText(language, value)).join(", ");
}

export function localizedIntakeSummary(caseItem: PatientCase, copy: DoctorCopy, language: DoctorLocale): string {
  const onset = localizeDoctorText(language, caseItem.reportedOnset);
  const parts: string[] = [];
  const lower = caseItem.reportedOnset.toLowerCase();
  if (lower.includes("less than 3")) parts.push(copy.caseDetail.summaryVeryRecent(onset));
  else if (lower.includes("3") || lower.includes("6")) parts.push(copy.caseDetail.summaryRecent(onset));
  else parts.push(copy.caseDetail.summaryProgressive(onset));

  if (!caseItem.medicalConditions?.length) parts.push(copy.caseDetail.summaryNoConditions);
  else parts.push(copy.caseDetail.summaryConditions(localizeList(language, caseItem.medicalConditions, "")));

  if (!caseItem.currentMedications?.length) parts.push(copy.caseDetail.summaryNoMeds);
  else parts.push(copy.caseDetail.summaryMeds);

  const redFlags = caseItem.findings.filter((f) => f.level === "red").length;
  const orangeFlags = caseItem.findings.filter((f) => f.level === "orange").length;
  if (redFlags > 0) parts.push(copy.caseDetail.summaryImmediate);
  else if (caseItem.agaScore >= 15) parts.push(copy.caseDetail.summaryAga);
  else if (caseItem.agaScore >= 10) parts.push(copy.caseDetail.summarySomeAga);
  else parts.push(copy.caseDetail.summaryEvaluate);

  const totalFlags = redFlags + orangeFlags;
  if (totalFlags === 0) parts.push(copy.caseDetail.summaryNoFlags);
  else if (totalFlags === 1) parts.push(copy.caseDetail.summaryOneFlag);
  else parts.push(copy.caseDetail.summaryFlags(totalFlags));

  return parts.join(" ");
}
