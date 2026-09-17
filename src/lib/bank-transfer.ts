/** Paste the receiving account here. Testers send ₺750 and you match it by name. */
const ACCOUNT = {
  accountName: "Martijn Roeters",
  bankName: "",
  iban: "TR11 0001 5001 5800 7342 9816 12",
};

export const bankTransfer = {
  accountName: (process.env.NEXT_PUBLIC_PAY_ACCOUNT_NAME || ACCOUNT.accountName).trim() || "Martijn Roeters",
  bankName: (process.env.NEXT_PUBLIC_PAY_BANK || ACCOUNT.bankName).trim(),
  iban: (process.env.NEXT_PUBLIC_PAY_IBAN || ACCOUNT.iban).replace(/\s/g, "").toUpperCase(),
  amountTry: 750,
};

export function formatIban(iban: string): string {
  return iban.replace(/(.{4})/g, "$1 ").trim();
}

function emv(id: string, value: string): string {
  return `${id}${String(value.length).padStart(2, "0")}${value}`;
}

function crc16(data: string): string {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i += 1) {
    crc ^= data.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function qrSafe(value: string, max: number): string {
  return value
    .normalize("NFKD")
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

/** BKM TR QR (EMV) so bank apps open a 750 TL transfer, not a browser tab. */
export function paymentQrPayload(reference = ""): string {
  const iban = bankTransfer.iban;
  if (!iban) return "";
  const name = qrSafe(bankTransfer.accountName, 25) || "Hiros";
  const purpose = qrSafe(reference, 25);
  const account = emv("00", "tr.com.bkm") + emv("01", iban);
  const extra = purpose ? emv("62", emv("08", purpose)) : "";
  const body =
    emv("00", "01") +
    emv("01", "12") +
    emv("26", account) +
    emv("52", "0000") +
    emv("53", "949") +
    emv("54", bankTransfer.amountTry.toFixed(2)) +
    emv("58", "TR") +
    emv("59", name) +
    emv("60", "ISTANBUL") +
    extra +
    "6304";
  return body + crc16(body);
}
