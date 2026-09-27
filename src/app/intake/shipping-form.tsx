"use client";

import { useState } from "react";
import { useIntakeCopy } from "@/i18n/LanguageProvider";
import { datePartsFromIso, toIsoDateOfBirth } from "@/lib/age";

type ShippingFormData = {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  streetAddress: string;
  aptSuite: string;
  city: string;
  province: string;
  postalCode: string;
  phone: string;
  email: string;
};

type ShippingFormProps = {
  formData: ShippingFormData;
  onChange: (data: ShippingFormData) => void;
  password: string;
  onPasswordChange: (value: string) => void;
  passwordVisible: boolean;
  onTogglePassword: () => void;
  mode?: "signup" | "login";
};

function passwordStrength(password: string, copy: { weak: string; medium: string; strong: string; weakHint: string; mediumHint: string; strongHint: string }) {
  if (!password) {
    return { score: 0, label: "", hint: "", color: "#d4d4d4" };
  }

  let points = 0;
  if (password.length >= 8) points += 1;
  if (password.length >= 12) points += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) points += 1;
  if (/\d/.test(password) || /[^A-Za-z0-9]/.test(password)) points += 1;

  if (points <= 1) {
    return { score: 0.34, label: copy.weak, hint: copy.weakHint, color: "#e24b4b" };
  }
  if (points <= 2) {
    return { score: 0.67, label: copy.medium, hint: copy.mediumHint, color: "#e6a23c" };
  }
  return { score: 1, label: copy.strong, hint: copy.strongHint, color: "#5f7f4f" };
}

const fieldClass =
  "h-11 w-full rounded-full border border-[#e6e6e6] bg-white px-4 text-[15px] text-[#1a1a1a] outline-none transition-colors placeholder:text-[#b3b3b3] focus:border-[#c8c8c8]";

function FieldLabel({ children }: { children: string }) {
  return <span className="mb-[7px] block text-[13px] font-medium leading-none text-[#1a1a1a]">{children}</span>;
}

export function ShippingForm({
  formData,
  onChange,
  password,
  onPasswordChange,
  passwordVisible,
  onTogglePassword,
  mode = "signup",
}: ShippingFormProps) {
  const intake = useIntakeCopy();
  const [dobParts, setDobParts] = useState(() => datePartsFromIso(formData.dateOfBirth));
  const strength = passwordStrength(password, {
    weak: intake.shipping.passwordWeak,
    medium: intake.shipping.passwordMedium,
    strong: intake.shipping.passwordStrong,
    weakHint: intake.shipping.passwordWeakHint,
    mediumHint: intake.shipping.passwordMediumHint,
    strongHint: intake.shipping.passwordStrongHint,
  });

  const handleChange = (field: keyof ShippingFormData, value: string) => {
    onChange({ ...formData, [field]: value });
  };

  const handleDobPart = (part: "day" | "month" | "year", value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, part === "year" ? 4 : 2);
    const next = { ...dobParts, [part]: digits };
    setDobParts(next);
    const combined =
      next.year.length === 4 && next.month && next.day
        ? toIsoDateOfBirth(`${next.year}-${next.month}-${next.day}`)
        : "";
    onChange({ ...formData, dateOfBirth: combined });
  };

  return (
    <div className="w-full space-y-3">
      <label className="block">
        <FieldLabel>{intake.shipping.email}</FieldLabel>
        <input
          type="email"
          autoComplete="email"
          value={formData.email}
          onChange={(e) => handleChange("email", e.target.value)}
          onInput={(e) => handleChange("email", e.currentTarget.value)}
          className={fieldClass}
        />
      </label>

      {mode === "signup" ? (
        <div className="grid grid-cols-2 gap-3">
          <label className="block min-w-0">
            <FieldLabel>{intake.shipping.firstName}</FieldLabel>
            <input
              type="text"
              autoComplete="given-name"
              value={formData.firstName}
              onChange={(e) => handleChange("firstName", e.target.value)}
              onInput={(e) => handleChange("firstName", e.currentTarget.value)}
              className={fieldClass}
            />
          </label>
          <label className="block min-w-0">
            <FieldLabel>{intake.shipping.lastName}</FieldLabel>
            <input
              type="text"
              autoComplete="family-name"
              value={formData.lastName}
              onChange={(e) => handleChange("lastName", e.target.value)}
              onInput={(e) => handleChange("lastName", e.currentTarget.value)}
              className={fieldClass}
            />
          </label>
        </div>
      ) : null}

      <div>
        <label className="block">
          <FieldLabel>{intake.shipping.password}</FieldLabel>
          <div className="relative">
            <input
              type={passwordVisible ? "text" : "password"}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              className={`${fieldClass} pr-12`}
            />
            <button
              type="button"
              onClick={onTogglePassword}
              aria-label={passwordVisible ? intake.shipping.hidePassword : intake.shipping.showPassword}
              className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center text-[#8a8a8a]"
            >
              {passwordVisible ? (
                <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" aria-hidden="true">
                  <path d="M3 3l18 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M10.6 10.6A3 3 0 0 0 13.4 13.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c6 0 10 7 10 7a17.6 17.6 0 0 1-3.2 3.9M6.1 6.1C3.8 7.8 2 12 2 12s4 7 10 7c1.5 0 2.9-.3 4.2-.9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" aria-hidden="true">
                  <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" stroke="currentColor" strokeWidth="1.8" />
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
                </svg>
              )}
            </button>
          </div>
        </label>
        {password ? (
          <div className="mt-2">
            <div className="h-[3px] overflow-hidden rounded-full bg-[#ececec]">
              <div
                className="h-full rounded-full transition-[width] duration-200"
                style={{ width: `${Math.round(strength.score * 100)}%`, backgroundColor: strength.color }}
              />
            </div>
            <div className="mt-1.5 flex items-start justify-between gap-3">
              <p className="text-[12px] leading-[1.35] text-[#8a8a8a]">{strength.hint}</p>
              <p className="shrink-0 text-[12px] font-medium" style={{ color: strength.color }}>
                {strength.label}
              </p>
            </div>
          </div>
        ) : null}
      </div>

      {mode === "signup" ? (
        <>
          <div>
            <FieldLabel>{intake.shipping.dateOfBirth}</FieldLabel>
            <div className="grid grid-cols-3 gap-3">
              <input
                type="text"
                inputMode="numeric"
                autoComplete="bday-day"
                placeholder={intake.shipping.dobDay}
                value={dobParts.day}
                onChange={(e) => handleDobPart("day", e.target.value)}
                className={fieldClass}
              />
              <input
                type="text"
                inputMode="numeric"
                autoComplete="bday-month"
                placeholder={intake.shipping.dobMonth}
                value={dobParts.month}
                onChange={(e) => handleDobPart("month", e.target.value)}
                className={fieldClass}
              />
              <input
                type="text"
                inputMode="numeric"
                autoComplete="bday-year"
                placeholder={intake.shipping.dobYear}
                value={dobParts.year}
                onChange={(e) => handleDobPart("year", e.target.value)}
                className={fieldClass}
              />
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

export type { ShippingFormData };
