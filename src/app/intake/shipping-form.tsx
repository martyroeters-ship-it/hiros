"use client";

import { useState } from "react";

const turkeyProvinces = [
  "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Amasya", "Ankara", "Antalya", "Artvin",
  "Aydın", "Balıkesir", "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa",
  "Çanakkale", "Çankırı", "Çorum", "Denizli", "Diyarbakır", "Edirne", "Elazığ", "Erzincan",
  "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkari", "Hatay", "Isparta",
  "İçel (Mersin)", "İstanbul", "İzmir", "Kars", "Kastamonu", "Kayseri", "Kırklareli", "Kırşehir",
  "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa", "Kahramanmaraş", "Mardin", "Muğla",
  "Muş", "Nevşehir", "Niğde", "Ordu", "Rize", "Sakarya", "Samsun", "Siirt", "Sinop",
  "Sivas", "Tekirdağ", "Tokat", "Trabzon", "Tunceli", "Şanlıurfa", "Uşak", "Van", "Yozgat",
  "Zonguldak", "Aksaray", "Bayburt", "Karaman", "Kırıkkale", "Batman", "Şırnak", "Bartın",
  "Ardahan", "Iğdır", "Yalova", "Karabük", "Kilis", "Osmaniye", "Düzce"
];

type ShippingFormData = {
  firstName: string;
  lastName: string;
  streetAddress: string;
  aptSuite: string;
  city: string;
  province: string;
  postalCode: string;
  phone: string;
};

type ShippingFormProps = {
  formData: ShippingFormData;
  onChange: (data: ShippingFormData) => void;
  onContinue: () => void;
  hideBanner?: boolean;
};

export function ShippingForm({ formData, onChange, onContinue, hideBanner = false }: ShippingFormProps) {
  const [isProvinceDropdownOpen, setIsProvinceDropdownOpen] = useState(false);
  
  const isFormValid = 
    formData.firstName.trim() && 
    formData.lastName.trim() && 
    formData.streetAddress.trim() && 
    formData.city.trim() && 
    formData.province && 
    formData.postalCode.trim() && 
    formData.phone.trim();

  const handleChange = (field: keyof ShippingFormData, value: string) => {
    onChange({ ...formData, [field]: value });
  };

  return (
    <div className="w-full">
      {/* Shipping Banner intentionally removed; page renders title only */}

      {/* Form */}
      <div className="space-y-4">
        {/* First & Last Name */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="relative">
            <label className="absolute left-4 top-3 text-[12px] font-medium tracking-[-0.02em] text-black/40">
              First name (legal)
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => handleChange("firstName", e.target.value)}
              className="w-full rounded-[14px] border border-black/10 bg-[#fffef9] px-4 pb-3 pt-7 text-[16px] font-medium tracking-[-0.02em] text-[#262522] outline-none transition-colors focus:border-[#5f7f4f]/50"
              placeholder=""
            />
          </div>
          <div className="relative">
            <label className="absolute left-4 top-3 text-[12px] font-medium tracking-[-0.02em] text-black/40">
              Last name (legal)
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => handleChange("lastName", e.target.value)}
              className="w-full rounded-[14px] border border-black/10 bg-[#fffef9] px-4 pb-3 pt-7 text-[16px] font-medium tracking-[-0.02em] text-[#262522] outline-none transition-colors focus:border-[#5f7f4f]/50"
              placeholder=""
            />
          </div>
        </div>

        {/* Street Address */}
        <div className="relative">
          <label className="absolute left-4 top-3 text-[12px] font-medium tracking-[-0.02em] text-black/40">
            Street Address
          </label>
          <input
            type="text"
            value={formData.streetAddress}
            onChange={(e) => handleChange("streetAddress", e.target.value)}
            className="w-full rounded-[14px] border border-black/10 bg-[#fffef9] px-4 pb-3 pt-7 text-[16px] font-medium tracking-[-0.02em] text-[#262522] outline-none transition-colors focus:border-[#5f7f4f]/50"
            placeholder=""
          />
        </div>

        {/* Apt/Suite */}
        <div className="relative">
          <label className="absolute left-4 top-3 text-[12px] font-medium tracking-[-0.02em] text-black/40">
            Apt/Suite (optional)
          </label>
          <input
            type="text"
            value={formData.aptSuite}
            onChange={(e) => handleChange("aptSuite", e.target.value)}
            className="w-full rounded-[14px] border border-black/10 bg-[#fffef9] px-4 pb-3 pt-7 text-[16px] font-medium tracking-[-0.02em] text-[#262522] outline-none transition-colors focus:border-[#5f7f4f]/50"
            placeholder=""
          />
        </div>

        {/* City */}
        <div className="relative">
          <label className="absolute left-4 top-3 text-[12px] font-medium tracking-[-0.02em] text-black/40">
            City
          </label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => handleChange("city", e.target.value)}
            className="w-full rounded-[14px] border border-black/10 bg-[#fffef9] px-4 pb-3 pt-7 text-[16px] font-medium tracking-[-0.02em] text-[#262522] outline-none transition-colors focus:border-[#5f7f4f]/50"
            placeholder=""
          />
        </div>

        {/* Province & Postal Code */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Province Dropdown */}
          <div className="relative">
            <label className="absolute left-4 top-3 text-[12px] font-medium tracking-[-0.02em] text-black/40">
              Province
            </label>
            <button
              type="button"
              onClick={() => setIsProvinceDropdownOpen(!isProvinceDropdownOpen)}
              className={`w-full rounded-[14px] border border-black/10 bg-[#fffef9] px-4 pb-3 pt-7 text-left text-[16px] font-medium tracking-[-0.02em] text-[#262522] outline-none transition-colors focus:border-[#5f7f4f]/50 ${
                !formData.province && "text-black/30"
              }`}
            >
              {formData.province || "Select province"}
              <svg 
                viewBox="0 0 24 24" 
                fill="none" 
                className={`absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-black/40 transition-transform ${isProvinceDropdownOpen ? "rotate-180" : ""}`}
                stroke="currentColor" 
                strokeWidth="2"
              >
                <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            
            {isProvinceDropdownOpen && (
              <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-[240px] overflow-y-auto rounded-[14px] border border-black/10 bg-white shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
                {turkeyProvinces.map((province) => (
                  <button
                    key={province}
                    type="button"
                    onClick={() => {
                      handleChange("province", province);
                      setIsProvinceDropdownOpen(false);
                    }}
                    className="flex w-full items-center bg-transparent px-4 py-3 text-left text-[15px] font-medium tracking-[-0.02em] text-[#262522] transition-colors hover:bg-[#f7f3ea]"
                  >
                    {province}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Postal Code */}
          <div className="relative">
            <label className="absolute left-4 top-3 text-[12px] font-medium tracking-[-0.02em] text-black/40">
              Postal Code
            </label>
            <input
              type="text"
              value={formData.postalCode}
              onChange={(e) => handleChange("postalCode", e.target.value)}
              className="w-full rounded-[14px] border border-black/10 bg-[#fffef9] px-4 pb-3 pt-7 text-[16px] font-medium tracking-[-0.02em] text-[#262522] outline-none transition-colors focus:border-[#5f7f4f]/50"
              placeholder=""
            />
          </div>
        </div>

        {/* Country (readonly, defaults to Turkey) */}
        <div className="relative">
          <label className="absolute left-4 top-3 text-[12px] font-medium tracking-[-0.02em] text-black/40">
            Country
          </label>
          <input
            type="text"
            value="Türkiye"
            readOnly
            className="w-full rounded-[14px] border border-black/10 bg-black/5 px-4 pb-3 pt-7 text-[16px] font-medium tracking-[-0.02em] text-black/50 outline-none cursor-default"
          />
        </div>

        {/* Phone */}
        <div className="relative">
          <label className="absolute left-4 top-3 text-[12px] font-medium tracking-[-0.02em] text-black/40">
            Phone
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            className="w-full rounded-[14px] border border-black/10 bg-[#fffef9] px-4 pb-3 pt-7 text-[16px] font-medium tracking-[-0.02em] text-[#262522] outline-none transition-colors focus:border-[#5f7f4f]/50"
            placeholder="+90 (XXX) XXX XXXX"
          />
        </div>
      </div>

      {/* Phone note */}
      <p className="mt-4 text-[13px] font-medium leading-[1.4] tracking-[-0.02em] text-black/45">
        We'll only use your number to text order updates and important information about your treatment.
      </p>

      {/* Continue Button */}
      <button
        type="button"
        onClick={onContinue}
        disabled={!isFormValid}
        className={`mt-8 w-full rounded-full px-6 py-4 text-[16px] font-medium tracking-[-0.03em] transition-colors ${
          isFormValid 
            ? "bg-[#11110f] text-white hover:bg-[#11110f]/90" 
            : "bg-black/10 text-black/30 cursor-not-allowed"
        }`}
      >
        Continue
      </button>
    </div>
  );
}

export type { ShippingFormData };
