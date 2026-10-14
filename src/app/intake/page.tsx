"use client";

import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ShippingForm, type ShippingFormData } from "./shipping-form";
import { ChangeLocationIcon, hasChangeLocationIcon } from "./change-location-icons";
import { getIntakeCatalog, parseIntakeCondition, type IntakeStep } from "./conditions";
import { createCaseFromIntake } from "../doctor/store";
import { determineTreatmentRecommendation, type TreatmentRecommendation } from "../doctor/triage";
import { useIntakeCopy } from "@/i18n/LanguageProvider";
import { signInWithGoogle } from "@/lib/google-signin";
import { ageFromDateOfBirth } from "@/lib/age";
import { HOME_PAGE_GUTTER_CLASS } from "@/constants/homeHeaderLayout";
import { DoctorMatchScreen } from "@/components/intake/DoctorMatchScreen";
import { DEFAULT_PHYSICIAN_ID, physicianById } from "@/lib/physicians";
import { physiciansNearDistrict } from "@/lib/istanbulGeo";

type FaceDetectionResult = {
  boundingBox: DOMRectReadOnly;
};

type FaceDetectorLike = {
  detect: (input: ImageBitmapSource) => Promise<FaceDetectionResult[]>;
};

type FaceDetectorConstructor = new (options?: { fastMode?: boolean; maxDetectedFaces?: number }) => FaceDetectorLike;

type WindowWithFaceDetector = Window & typeof globalThis & {
  FaceDetector?: FaceDetectorConstructor;
};

const istanbulDistricts = [
  "Adalar",
  "Arnavutköy",
  "Ataşehir",
  "Avcılar",
  "Bağcılar",
  "Bahçelievler",
  "Bakırköy",
  "Başakşehir",
  "Bayrampaşa",
  "Beşiktaş",
  "Beykoz",
  "Beylikdüzü",
  "Beyoğlu",
  "Büyükçekmece",
  "Çatalca",
  "Çekmeköy",
  "Esenler",
  "Esenyurt",
  "Eyüpsultan",
  "Fatih",
  "Gaziosmanpaşa",
  "Güngören",
  "Kadıköy",
  "Kağıthane",
  "Kartal",
  "Küçükçekmece",
  "Maltepe",
  "Pendik",
  "Sancaktepe",
  "Sarıyer",
  "Silivri",
  "Sultanbeyli",
  "Sultangazi",
  "Şile",
  "Şişli",
  "Tuzla",
  "Ümraniye",
  "Üsküdar",
  "Zeytinburnu",
];

const treatmentDetailOptions = ["Topical", "Oral", "Supplements", "Other"];
const sideEffectLevelOptions = ["None", "Mild", "Moderate", "Significant"];
const NONE_OF_THESE = "None of these";

const INTAKE_WORD_STAGGER_MS = 48;
const INTAKE_WORD_DURATION_MS = 420;
const INTAKE_LINE_STAGGER_MS = 260;
const INTAKE_LINE_DURATION_MS = 780;

function countInterstitialWords(text: string) {
  return text.split(/\s+/).filter((part) => part.length > 0).length;
}

function interstitialRevealDurationMs(title: string, body: string) {
  const words = countInterstitialWords(title);
  const lines = body.split("\n").length;
  const titleMs = INTAKE_WORD_DURATION_MS + Math.max(0, words - 1) * INTAKE_WORD_STAGGER_MS;
  const bodyStart = Math.round(titleMs * 0.45);
  const bodyMs = INTAKE_LINE_DURATION_MS + Math.max(0, lines - 1) * INTAKE_LINE_STAGGER_MS;
  return bodyStart + bodyMs + 320;
}

function FadeWords({ text, delayMs = 0, nowrap = false }: { text: string; delayMs?: number; nowrap?: boolean }) {
  let wordIndex = 0;
  return (
    <>
      {text.split("\n").map((line, lineIndex) => (
        <span key={`line-${lineIndex}`} className={nowrap ? "block whitespace-nowrap" : "block"}>
          {line.length === 0
            ? "\u00A0"
            : line.split(/(\s+)/).map((part, partIndex) => {
                if (!part.trim()) {
                  return <span key={`space-${lineIndex}-${partIndex}`}>{part}</span>;
                }
                const delay = delayMs + wordIndex * INTAKE_WORD_STAGGER_MS;
                wordIndex += 1;
                return (
                  <span
                    key={`word-${lineIndex}-${partIndex}`}
                    className="inline-block"
                    style={{
                      animation: `intake-fade-from-right ${INTAKE_WORD_DURATION_MS}ms ease-out both`,
                      animationDelay: `${delay}ms`,
                    }}
                  >
                    {part}
                  </span>
                );
              })}
        </span>
      ))}
    </>
  );
}

function FadeLines({ text, delayMs = 0 }: { text: string; delayMs?: number }) {
  return (
    <>
      {text.split("\n").map((line, lineIndex) => (
        <span
          key={`fade-line-${lineIndex}`}
          className="block"
          style={{
            animation: `intake-fade-from-bottom ${INTAKE_LINE_DURATION_MS}ms ease-out both`,
            animationDelay: `${delayMs + lineIndex * INTAKE_LINE_STAGGER_MS}ms`,
          }}
        >
          {line === "" ? "\u00A0" : line}
        </span>
      ))}
    </>
  );
}

export default function IntakePage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#f7f3ea]" />}>
      <IntakePageGate />
    </Suspense>
  );
}

function IntakePageGate() {
  const searchParams = useSearchParams();
  const conditionParam = searchParams.get("condition");
  const condition = parseIntakeCondition(conditionParam);
  // Remount when condition changes so each homepage card starts a fresh flow.
  return <IntakePageInner key={condition} conditionParam={conditionParam} />;
}

function IntakePageInner({ conditionParam }: { conditionParam: string | null }) {
  const intake = useIntakeCopy();
  const catalog = useMemo(
    () => getIntakeCatalog(conditionParam),
    [conditionParam],
  );
  const intakeSteps = catalog.intakeSteps;
  const medicalSteps = catalog.medicalSteps;
  const photoCheckTextBlocks =
    catalog.condition === "intimate-skin" ? [...intake.photoCheckIntimate] : [...intake.photoCheck];
  const postCameraInterstitialTextBlocks = [...intake.postCamera];
  const preAuthInterstitialTextBlocks =
    catalog.condition === "hair-loss"
      ? [...intake.preAuth]
      : catalog.condition === "erection"
        ? [...intake.preAuthErection]
        : catalog.condition === "premature-ejaculation"
          ? [...intake.preAuthPe]
          : [...intake.preAuthIntimate];
  const nextStepsInterstitialTextBlocks = [
    intake.nextSteps.title,
    intake.nextSteps.steps.map((step) => `${step.title}\n${step.body}`).join("\n\n"),
  ];
  const cameraPrepPoints =
    catalog.condition === "intimate-skin" ? [...intake.cameraPrepIntimate.points] : [...intake.cameraPrep.points];
  const totalCameraPrepPoints = cameraPrepPoints.length;
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [selectedMultiAnswers, setSelectedMultiAnswers] = useState<Record<string, string[]>>({});
  const [selectedGoalOptions, setSelectedGoalOptions] = useState<string[]>([]);
  const [returnedStepIndexForContinue, setReturnedStepIndexForContinue] = useState<number | null>(null);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const [isPhotoCheckButtonVisible, setIsPhotoCheckButtonVisible] = useState(false);
  const [cameraPrepVisiblePointCount, setCameraPrepVisiblePointCount] = useState(0);
  const [isCameraPrepButtonVisible, setIsCameraPrepButtonVisible] = useState(false);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isCameraReadyConfirmed, setIsCameraReadyConfirmed] = useState(false);
  const [isAutoCaptureSupported, setIsAutoCaptureSupported] = useState<boolean | null>(null);

  const [, setCameraGuidanceText] = useState("Align your face in the center");
  const [cameraCapturePhase, setCameraCapturePhase] = useState<"front" | "right">("front");
  const [capturedCameraImage, setCapturedCameraImage] = useState<string | null>(null);
  // Persisted across step changes so photos survive until intake submission.
  const [capturedPhotos, setCapturedPhotos] = useState<Record<string, string>>({});
  const [, setIsAutoCapturing] = useState(false);
  const [cameraCountdownValue, setCameraCountdownValue] = useState<number | null>(null);
  const [isCameraCaptureFlashVisible, setIsCameraCaptureFlashVisible] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraSessionRestartKey, setCameraSessionRestartKey] = useState(0);
  const [locationQuery, setLocationQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [isLocationReady, setIsLocationReady] = useState(false);
  const [hasAcceptedLocationConsent, setHasAcceptedLocationConsent] = useState(false);
  const [preferredDoctorId, setPreferredDoctorId] = useState(DEFAULT_PHYSICIAN_ID);
  const [isDoctorMatchOpen, setIsDoctorMatchOpen] = useState(false);
  const [hasConfirmedDoctorMatch, setHasConfirmedDoctorMatch] = useState(false);
  const [isChoosingPhysician, setIsChoosingPhysician] = useState(false);
  const [isViewingPhysicianProfile, setIsViewingPhysicianProfile] = useState(false);
  const [isDoctorPopupOpen, setIsDoctorPopupOpen] = useState(false);
  const [isDoctorPopupVisible, setIsDoctorPopupVisible] = useState(false);
  const [shouldShowDoctorPopupAbout, setShouldShowDoctorPopupAbout] = useState(false);
  const assignedDoctor = physicianById(preferredDoctorId);
  const [isDoctorAssignmentNoticeVisible, setIsDoctorAssignmentNoticeVisible] = useState(false);
  const [medicalFollowUpText, setMedicalFollowUpText] = useState<Record<string, string>>({});
  const [treatmentSelections, setTreatmentSelections] = useState<Record<string, boolean>>({});
  const [treatmentOtherDetail, setTreatmentOtherDetail] = useState("");
  const [treatmentSideEffectsLevel, setTreatmentSideEffectsLevel] = useState<string | null>(null);
  const [isTreatmentTypesDropdownOpen, setIsTreatmentTypesDropdownOpen] = useState(false);
  const [isTreatmentSideEffectsDropdownOpen, setIsTreatmentSideEffectsDropdownOpen] = useState(false);
  const [shippingFormData, setShippingFormData] = useState<ShippingFormData>({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    streetAddress: "",
    aptSuite: "",
    city: "",
    province: "",
    postalCode: "",
    phone: "",
    email: "",
  });
  const [shippingRevealIndex, setShippingRevealIndex] = useState(0);
  const [recommendationReveal, setRecommendationReveal] = useState(false);
  const [shippingFlowStep, setShippingFlowStep] = useState<1 | 2>(1);
  const [authMode, setAuthMode] = useState<"signup" | "login">("signup");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authConfirm, setAuthConfirm] = useState("");
  const [authPasswordVisible, setAuthPasswordVisible] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const [authStage, setAuthStage] = useState<"identifier" | "code" | "profile">("identifier");
  const [authChannel, setAuthChannel] = useState<"email" | "phone">("email");
  const [authIdentifier, setAuthIdentifier] = useState("");
  const [authDestination, setAuthDestination] = useState("");
  const [authCode, setAuthCode] = useState("");
  const authVerifyLock = useRef(false);
  const [authError, setAuthError] = useState("");
  const [signedInEmail, setSignedInEmail] = useState("");
  const [authAfterGuestSubmit, setAuthAfterGuestSubmit] = useState(false);
  const [intakeSaveStatus, setIntakeSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const advanceTimeoutRef = useRef<number | null>(null);
  const fadeTimeoutRef = useRef<number | null>(null);
  const locationReadyTimeoutRef = useRef<number | null>(null);
  const matchingSuccessTimeoutRef = useRef<number | null>(null);
  const matchingCompleteTimeoutRef = useRef<number | null>(null);
  const doctorAssignmentNoticeTimeoutRef = useRef<number | null>(null);
  const doctorPopupAutoCloseTimeoutRef = useRef<number | null>(null);
  const doctorPopupFadeTimeoutRef = useRef<number | null>(null);
  const doctorPopupOpenTimeoutRef = useRef<number | null>(null);
  const doctorPopupIsIntroRef = useRef(false);
  const shippingRevealTimeoutRef = useRef<number | null>(null);
  const recommendationRevealTimeoutRef = useRef<number | null>(null);
  const photoCheckRevealIntervalRef = useRef<number | null>(null);
  const photoCheckButtonTimeoutRef = useRef<number | null>(null);
  const cameraReadyDelayTimeoutRef = useRef<number | null>(null);
  const cameraCountdownTimeoutRef = useRef<number | null>(null);
  const cameraCaptureFlashTimeoutRef = useRef<number | null>(null);
  const cameraDetectionIntervalRef = useRef<number | null>(null);
  const cameraStableDetectionCountRef = useRef(0);
  const cameraVideoRef = useRef<HTMLVideoElement | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const treatmentTypesDropdownRef = useRef<HTMLDivElement | null>(null);
  const treatmentSideEffectsDropdownRef = useRef<HTMLDivElement | null>(null);
  const hasSubmittedCaseRef = useRef(false);
  const preAuthInterstitialIndex = intakeSteps.length;
  const authStepIndex = preAuthInterstitialIndex + 1;
  const locationStepIndex = authStepIndex + 1;
  const medicalStartIndex = locationStepIndex + 1;
  const medicalEndIndex = medicalStartIndex + medicalSteps.length - 1;
  const photoCheckStepIndex = medicalStartIndex + medicalSteps.findIndex((step) => step.id === "photo-check");
  const finalReviewStepIndex = medicalStartIndex + medicalSteps.findIndex((step) => step.id === "review-submit-interstitial");
  const shippingInfoStepIndex = medicalStartIndex + medicalSteps.findIndex((step) => step.id === "shipping-info");
  const nextStepsStepIndex = medicalStartIndex + medicalSteps.findIndex((step) => step.id === "next-steps");
  const recommendationStepIndex = medicalStartIndex + medicalSteps.findIndex((step) => step.id === "recommendation-interstitial");
  const prePhotoCheckStepIndex = Math.max(photoCheckStepIndex - 1, medicalStartIndex);
  const isAuthStep = currentStepIndex === authStepIndex;
  const isLocationStep = currentStepIndex === locationStepIndex;

  useEffect(() => {
    void fetch("/api/auth/me", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) return;
        const user = (await res.json()) as { email?: string; phone?: string | null; hasCase?: boolean };
        if (user.hasCase) {
          window.location.replace("/care");
          return;
        }
        if (user.email) setSignedInEmail(user.email);
        else if (user.phone) setSignedInEmail(user.phone);
      })
      .catch(() => undefined);
  }, []);

  const isMedicalStep = currentStepIndex >= medicalStartIndex && currentStepIndex <= medicalEndIndex;
  const isFirstMedicalStep = currentStepIndex === medicalStartIndex;
  const isPreAuthInterstitialStep = currentStepIndex === preAuthInterstitialIndex;
  const currentStep = currentStepIndex < intakeSteps.length ? intakeSteps[currentStepIndex] : isMedicalStep ? medicalSteps[currentStepIndex - medicalStartIndex] : null;
  const stepCopy = currentStep ? intake.steps[currentStep.id] : undefined;
  const stepTitle = stepCopy?.title || currentStep?.title || "";
  const stepDescription = stepCopy?.description || currentStep?.description || "";
  const selectedOption = currentStep ? selectedAnswers[currentStep.id] ?? null : null;
  const currentMedicalStepNumber = isMedicalStep ? currentStepIndex - medicalStartIndex + 1 : 0;
  const medicalProgressPercentage = isMedicalStep ? (currentMedicalStepNumber / medicalSteps.length) * 100 : 0;
  const progressBarStepIds = catalog.progressBarStepIds;
  const isProgressBarStep = currentStep ? progressBarStepIds.includes(currentStep.id) : false;
  const currentProgressIndex = isProgressBarStep ? progressBarStepIds.indexOf(currentStep!.id) : -1;
  const discreteProgress = isProgressBarStep && currentProgressIndex >= 0
    ? ((currentProgressIndex + 1) / progressBarStepIds.length) * 100
    : 0;
  const displayedMedicalProgressBase = isMedicalStep ? discreteProgress : 0;
  const normalizedLocationQuery = locationQuery.trim().toLocaleLowerCase("tr");
  const filteredCities = normalizedLocationQuery
    ? istanbulDistricts.filter((district) => district.toLocaleLowerCase("tr").includes(normalizedLocationQuery))
    : istanbulDistricts;
  const canContinueLocation = Boolean(selectedCity && isLocationReady && hasAcceptedLocationConsent);
  const isCheckboxSelectionStep = Boolean(currentStep?.multiSelect);
  const currentMultiSelections = currentStep ? selectedMultiAnswers[currentStep.id] ?? [] : [];
  const hasMultiSelections = currentMultiSelections.length > 0;
  const hasGoalSelections = selectedGoalOptions.length > 0;
  const currentMedicalTextValue = currentStep ? medicalFollowUpText[currentStep.id] ?? "" : "";
  const needsMedicalConditionsText =
    currentStep?.id === "medical-conditions" && selectedOption !== null && selectedOption !== "No known conditions";
  const needsMedicationText =
    (currentStep?.id === "medications" || currentStep?.id === "ed-medications") &&
    Boolean(selectedOption?.startsWith("Yes"));
  const needsPreviousTreatmentsText = currentStep?.id === "previous-hair-loss-treatments" && selectedOption === "Yes";
  const needsFinalNotesText = currentStep?.id === "final-notes" && selectedOption === "Yes";
  const isMedicalDoctorIntroStep =
    currentStep?.id === "progression" ||
    currentStep?.id === "ed-experience" ||
    currentStep?.id === "pe-concern" ||
    currentStep?.id === "is-concern";
  const whyWeAskNote =
    catalog.condition === "hair-loss" && currentStep?.id === "family-history"
      ? { body: intake.whyWeAsk.familyHistory, href: intake.whyWeAsk.familyHistoryHref }
      : catalog.condition === "hair-loss" && currentStep?.id === "recent-changes"
        ? { body: intake.whyWeAsk.recentChanges, href: intake.whyWeAsk.recentChangesHref }
        : currentStep?.id === "ed-morning"
          ? { body: intake.whyWeAsk.edMorning, href: intake.whyWeAsk.edMorningHref }
          : currentStep?.id === "pe-onset"
            ? { body: intake.whyWeAsk.peOnset, href: intake.whyWeAsk.peOnsetHref }
            : null;
  const isPhotoCheckStep = currentStep?.id === "photo-check";
  const isCameraPrepStep = currentStep?.id === "camera-prep";
  const isCameraCaptureStep = currentStep?.id === "camera-capture";
  const isPostCameraInterstitialStep = currentStep?.id === "post-camera-interstitial";
  const isFinalReviewInterstitialStep = currentStep?.id === "review-submit-interstitial";
  const finalReviewInterstitialTextBlocks =
    intakeSaveStatus === "error"
      ? [intake.save.errorTitle, intake.save.errorBody]
      : [...intake.finalReview];
  const isNextStepsInterstitialStep = currentStep?.id === "next-steps";
  const isTypedPauseStep = isPreAuthInterstitialStep || isNextStepsInterstitialStep;
  const isRecommendationInterstitialStep = currentStep?.id === "recommendation-interstitial";
  const isShippingInfoStep = currentStep?.id === "shipping-info";
  const derivedAge = ageFromDateOfBirth(shippingFormData.dateOfBirth);
  const canContinueDetails =
    authMode === "login"
      ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingFormData.email.trim()) && Boolean(authPassword)
      : Boolean(shippingFormData.firstName.trim()) &&
        Boolean(shippingFormData.lastName.trim()) &&
        derivedAge !== null &&
        derivedAge >= 18 &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingFormData.email.trim()) &&
        authPassword.length >= 8;
  const detailsContinueHint =
    authMode === "login"
      ? !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingFormData.email.trim())
        ? intake.shipping.emailRequired
        : !authPassword
          ? intake.shipping.passwordRequired
          : ""
      : !shippingFormData.firstName.trim() || !shippingFormData.lastName.trim()
        ? ""
        : derivedAge === null
          ? intake.shipping.dobRequired
          : derivedAge < 18
            ? intake.shipping.dobAdult
            : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingFormData.email.trim())
                ? intake.shipping.emailRequired
                : authPassword.length < 8
                  ? intake.auth.passwordTooShort
                  : "";
  const isAgeStartedStep = currentStep?.id === "age-started";
  const displayedMedicalProgress = isMedicalStep ? displayedMedicalProgressBase : 0;
  const [isTreatmentInfoOpen, setIsTreatmentInfoOpen] = useState(false);
  const [recommendedTreatment, setRecommendedTreatment] = useState<TreatmentRecommendation | null>(null);
  useEffect(() => {
    if (isRecommendationInterstitialStep) {
      // Determine treatment recommendation based on intake answers
      const recommendation = determineTreatmentRecommendation({
        answers: selectedAnswers,
        followUpText: medicalFollowUpText,
        treatmentSelections,
        treatmentOtherDetail,
        sideEffectsLevel: treatmentSideEffectsLevel,
        city: selectedCity,
        firstName: shippingFormData.firstName,
        photos: Object.values(capturedPhotos),
        condition: catalog.condition,
      });
      setRecommendedTreatment(recommendation);
    }
  }, [isRecommendationInterstitialStep, selectedAnswers, medicalFollowUpText, treatmentSelections, treatmentOtherDetail, treatmentSideEffectsLevel, selectedCity, shippingFormData.firstName, capturedPhotos, catalog.condition]);

  // Persist the completed intake as a doctor-dashboard case (once).
  const persistCompletedIntake = useCallback(async (): Promise<boolean> => {
    if (!signedInEmail && !shippingFormData.phone.trim()) return false;
    if (hasSubmittedCaseRef.current) return false;
    hasSubmittedCaseRef.current = true;
    setIntakeSaveStatus("saving");
    try {
      await createCaseFromIntake({
        answers: {
          ...selectedAnswers,
          ...Object.fromEntries(
            Object.entries(selectedMultiAnswers).map(([id, values]) => [id, values.join("; ")]),
          ),
          condition: catalog.condition,
        },
        followUpText: medicalFollowUpText,
        treatmentSelections,
        treatmentOtherDetail,
        sideEffectsLevel: treatmentSideEffectsLevel,
        city: selectedCity,
        firstName: shippingFormData.firstName,
        lastName: shippingFormData.lastName,
        postalCode: shippingFormData.postalCode,
        phone: shippingFormData.phone,
        province: shippingFormData.province,
        photos: Object.values(capturedPhotos),
        preferredDoctorId,
      });
      setIntakeSaveStatus("saved");
      return true;
    } catch (error) {
      hasSubmittedCaseRef.current = false;
      setIntakeSaveStatus("error");
      console.error(error);
      return false;
    }
  }, [
    selectedAnswers,
    selectedMultiAnswers,
    medicalFollowUpText,
    treatmentSelections,
    treatmentOtherDetail,
    treatmentSideEffectsLevel,
    selectedCity,
    shippingFormData,
    capturedPhotos,
    signedInEmail,
    preferredDoctorId,
    catalog.condition,
  ]);

  useEffect(() => {
    if (!isFinalReviewInterstitialStep || intakeSaveStatus !== "idle") {
      return;
    }
    if (!signedInEmail && !shippingFormData.phone.trim()) {
      setAuthAfterGuestSubmit(true);
      setCurrentStepIndex(shippingInfoStepIndex);
      return;
    }
    void persistCompletedIntake();
  }, [isFinalReviewInterstitialStep, intakeSaveStatus, persistCompletedIntake, signedInEmail, shippingFormData.phone, shippingInfoStepIndex]);
  useEffect(() => {
    if (isShippingInfoStep) {
      setShippingFlowStep(1);
      setShippingRevealIndex(0);
    }
  }, [isShippingInfoStep]);

  useEffect(() => {
    setShippingRevealIndex(0);
    const timer = setTimeout(() => setShippingRevealIndex(1), 50);
    const timer2 = setTimeout(() => setShippingRevealIndex(2), 100);
    const timer3 = setTimeout(() => setShippingRevealIndex(3), 150);
    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [shippingFlowStep]);

  const shouldShowSelectedAnswerContinue = Boolean(
    currentStep &&
      returnedStepIndexForContinue === currentStepIndex &&
      !isCheckboxSelectionStep &&
      selectedOption !== null &&
      !needsMedicalConditionsText &&
      !needsMedicationText &&
      !needsPreviousTreatmentsText &&
      !needsFinalNotesText &&
      currentStep.id !== "final-notes",
  );
  const hasAnyTreatmentSelection = Object.values(treatmentSelections).some(Boolean);
  const isOtherTreatmentSelected = Boolean(treatmentSelections.other);
  const selectedTreatmentLabels = treatmentDetailOptions.filter((detailOption) => treatmentSelections[detailOption.toLocaleLowerCase("en")]);
  const treatmentSelectionSummary = selectedTreatmentLabels.length > 0 ? selectedTreatmentLabels.map((label) => intake.option(label)).join(", ") : intake.selectAll;
  const treatmentSideEffectSummary = treatmentSideEffectsLevel ? intake.option(treatmentSideEffectsLevel) : intake.selectOption;
  const recommendedTreatmentCopy = recommendedTreatment
    ? intake.treatment(recommendedTreatment.title, recommendedTreatment.description)
    : intake.treatment("Topical Finasteride + Minoxidil", "Evidence-backed combination for male pattern hair loss.");
  const cameraInstructionText =
    cameraCapturePhase === "front"
      ? intake.camera.align
      : intake.camera.tilt;
  const nextCameraCapturePhase = cameraCapturePhase === "front" ? "right" : null;
  const isReviewingIntermediateCameraCapture = nextCameraCapturePhase !== null && capturedCameraImage !== null;
  const canContinueCameraCapture = cameraError !== null || capturedCameraImage !== null || (isCameraReadyConfirmed && cameraCountdownValue === null);
  const cameraPrimaryButtonLabel =
    cameraError !== null
      ? intake.camera.continue
      : capturedCameraImage !== null
        ? nextCameraCapturePhase === null
          ? intake.camera.continue
          : intake.camera.looksGood
        : cameraCountdownValue !== null
          ? intake.camera.capturing
          : intake.camera.capture;
  const interstitialPrimaryButtonLabel =
    isFinalReviewInterstitialStep
      ? intakeSaveStatus === "error"
        ? intake.save.retry
        : intakeSaveStatus === "saving"
          ? intake.save.savingButton
          : intake.goToProfile
      : intake.continue;
  const isInterstitialButtonVisible = isFinalReviewInterstitialStep
    ? intakeSaveStatus === "saved" || intakeSaveStatus === "error" || intakeSaveStatus === "saving"
    : isPhotoCheckButtonVisible;
  const activeInterstitialTextBlocks = isPreAuthInterstitialStep
    ? preAuthInterstitialTextBlocks
    : isNextStepsInterstitialStep
      ? nextStepsInterstitialTextBlocks
    : isPostCameraInterstitialStep
      ? postCameraInterstitialTextBlocks
      : isFinalReviewInterstitialStep
        ? finalReviewInterstitialTextBlocks
        : photoCheckTextBlocks;
  const interstitialTitleMs =
    INTAKE_WORD_DURATION_MS +
    Math.max(0, countInterstitialWords(activeInterstitialTextBlocks[0] ?? "") - 1) * INTAKE_WORD_STAGGER_MS;
  const interstitialBodyDelayMs = Math.round(interstitialTitleMs * 0.45);
  const canContinueMedicalFollowUp = currentStep?.id === "final-notes"
    ? (selectedOption === "Yes"
        ? currentMedicalTextValue.trim().length > 0
        : selectedOption === "No"
          ? true
          : false)
    : (needsMedicalConditionsText || needsMedicationText || needsPreviousTreatmentsText || needsFinalNotesText
        ? currentMedicalTextValue.trim().length > 0
        : true);

  const stopCameraStream = useCallback(() => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current = null;
    }

    if (cameraVideoRef.current) {
      cameraVideoRef.current.srcObject = null;
    }
  }, []);

  const clearCameraDetectionLoop = useCallback(() => {
    if (cameraDetectionIntervalRef.current) {
      window.clearInterval(cameraDetectionIntervalRef.current);
      cameraDetectionIntervalRef.current = null;
    }

    cameraStableDetectionCountRef.current = 0;
  }, []);

  const clearCameraReadyDelay = useCallback(() => {
    if (cameraReadyDelayTimeoutRef.current) {
      window.clearTimeout(cameraReadyDelayTimeoutRef.current);
      cameraReadyDelayTimeoutRef.current = null;
    }
  }, []);

  const clearCameraCountdown = useCallback(() => {
    if (cameraCountdownTimeoutRef.current) {
      window.clearTimeout(cameraCountdownTimeoutRef.current);
      cameraCountdownTimeoutRef.current = null;
    }

    setCameraCountdownValue(null);
  }, []);

  const clearCameraCaptureFlash = useCallback(() => {
    if (cameraCaptureFlashTimeoutRef.current) {
      window.clearTimeout(cameraCaptureFlashTimeoutRef.current);
      cameraCaptureFlashTimeoutRef.current = null;
    }

    setIsCameraCaptureFlashVisible(false);
  }, []);

  const captureCurrentCameraFrame = useCallback(() => {
    const videoElement = cameraVideoRef.current;

    if (!videoElement || videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
      return null;
    }

    const captureCanvas = document.createElement("canvas");
    captureCanvas.width = videoElement.videoWidth;
    captureCanvas.height = videoElement.videoHeight;

    const context = captureCanvas.getContext("2d");

    if (!context) {
      return null;
    }

    context.translate(captureCanvas.width, 0);
    context.scale(-1, 1);
    context.drawImage(videoElement, 0, 0, captureCanvas.width, captureCanvas.height);

    return captureCanvas.toDataURL("image/jpeg", 0.92);
  }, []);

  useEffect(() => {
    return () => {
      if (advanceTimeoutRef.current) {
        window.clearTimeout(advanceTimeoutRef.current);
        advanceTimeoutRef.current = null;
      }

      if (fadeTimeoutRef.current) {
        window.clearTimeout(fadeTimeoutRef.current);
        fadeTimeoutRef.current = null;
      }

      if (locationReadyTimeoutRef.current) {
        window.clearTimeout(locationReadyTimeoutRef.current);
      }

      if (doctorAssignmentNoticeTimeoutRef.current) {
        window.clearTimeout(doctorAssignmentNoticeTimeoutRef.current);
      }

      if (doctorPopupAutoCloseTimeoutRef.current) {
        window.clearTimeout(doctorPopupAutoCloseTimeoutRef.current);
      }

      if (doctorPopupFadeTimeoutRef.current) {
        window.clearTimeout(doctorPopupFadeTimeoutRef.current);
      }

      if (doctorPopupOpenTimeoutRef.current) {
        window.clearTimeout(doctorPopupOpenTimeoutRef.current);
      }

      if (photoCheckRevealIntervalRef.current) {
        window.clearInterval(photoCheckRevealIntervalRef.current);
      }

      if (photoCheckButtonTimeoutRef.current) {
        window.clearTimeout(photoCheckButtonTimeoutRef.current);
      }

      clearCameraCaptureFlash();
      clearCameraDetectionLoop();
      clearCameraCountdown();
      clearCameraReadyDelay();

      stopCameraStream();

      clearMatchingTimeouts();
    };
  }, [clearCameraCaptureFlash, clearCameraCountdown, clearCameraDetectionLoop, clearCameraReadyDelay, stopCameraStream]);

  useEffect(() => {
    if (!isMedicalStep) {
      setIsDoctorPopupOpen(false);
      setIsDoctorPopupVisible(false);
    }
  }, [isMedicalStep]);

  useEffect(() => {
    if (!needsPreviousTreatmentsText) {
      setIsTreatmentTypesDropdownOpen(false);
      setIsTreatmentSideEffectsDropdownOpen(false);
    }
  }, [needsPreviousTreatmentsText]);

  // Keep a persistent copy of each captured photo (by phase) so it survives
  // when the camera step clears `capturedCameraImage`.
  useEffect(() => {
    if (isCameraCaptureStep && capturedCameraImage) {
      setCapturedPhotos((current) => ({ ...current, [cameraCapturePhase]: capturedCameraImage }));
    }
  }, [isCameraCaptureStep, capturedCameraImage, cameraCapturePhase]);

  useEffect(() => {
    if (!isCameraCaptureStep) {
      setIsCameraLoading(false);
      setIsCameraReady(false);
      setIsCameraReadyConfirmed(false);
      setIsAutoCaptureSupported(null);
      setCameraCapturePhase("front");
      setCameraGuidanceText("Align your face in the center");
      setCapturedCameraImage(null);
      setIsAutoCapturing(false);
      clearCameraCaptureFlash();
      clearCameraCountdown();
      setCameraError(null);
      clearCameraDetectionLoop();
      clearCameraReadyDelay();
      stopCameraStream();
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setIsCameraLoading(false);
      setIsCameraReady(false);
      setIsCameraReadyConfirmed(false);
      setIsAutoCaptureSupported(false);
      setCapturedCameraImage(null);
      setIsAutoCapturing(false);
      clearCameraCaptureFlash();
      clearCameraCountdown();
      setCameraError("Camera preview is not supported on this device or browser.");
      return;
    }

    let isCancelled = false;

    const startCamera = async () => {
      setIsCameraLoading(true);
      setIsCameraReady(false);
      setIsCameraReadyConfirmed(false);
      setIsAutoCaptureSupported(false);
      setCameraGuidanceText("Align your face in the center");
      setCapturedCameraImage(null);
      setIsAutoCapturing(false);
      clearCameraCaptureFlash();
      clearCameraCountdown();
      setCameraError(null);
      clearCameraDetectionLoop();
      clearCameraReadyDelay();
      stopCameraStream();

      try {
        let stream: MediaStream;

        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { ideal: "user" },
            },
            audio: false,
          });
        } catch {
          stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        }

        if (isCancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        cameraStreamRef.current = stream;

        if (cameraVideoRef.current) {
          cameraVideoRef.current.srcObject = stream;
          await cameraVideoRef.current.play().catch(() => undefined);
        }

        setIsCameraReady(true);
        cameraReadyDelayTimeoutRef.current = window.setTimeout(() => {
          setIsCameraReadyConfirmed(true);
          setCameraGuidanceText("Align your face in the center");
          cameraReadyDelayTimeoutRef.current = null;
        }, 650);
      } catch {
        if (!isCancelled) {
          setIsCameraReady(false);
          setIsCameraReadyConfirmed(false);
          setCapturedCameraImage(null);
          setIsAutoCapturing(false);
          clearCameraCaptureFlash();
          clearCameraCountdown();
          setCameraError("We couldn’t access your camera. Please allow camera access in your browser settings.");
        }
      } finally {
        if (!isCancelled) {
          setIsCameraLoading(false);
        }
      }
    };

    startCamera();

    return () => {
      isCancelled = true;
      clearCameraDetectionLoop();
      clearCameraCaptureFlash();
      clearCameraCountdown();
      clearCameraReadyDelay();
      stopCameraStream();
    };
  }, [cameraSessionRestartKey, clearCameraCaptureFlash, clearCameraCountdown, clearCameraDetectionLoop, clearCameraReadyDelay, isCameraCaptureStep, stopCameraStream]);

  useEffect(() => {
    clearCameraDetectionLoop();

    if (!isCameraCaptureStep || !isCameraReady || !isCameraReadyConfirmed || cameraError !== null || capturedCameraImage !== null || isAutoCaptureSupported !== true) {
      return;
    }

    const FaceDetectorClass = (window as WindowWithFaceDetector).FaceDetector;

    if (!FaceDetectorClass) {
      setIsAutoCaptureSupported(false);
      setCameraGuidanceText("Automatic capture isn’t available here. Continue manually.");
      return;
    }

    const faceDetector = new FaceDetectorClass({ fastMode: true, maxDetectedFaces: 1 });
    let isCancelled = false;

    const getAverageBrightness = (videoElement: HTMLVideoElement) => {
      const sampleCanvas = document.createElement("canvas");
      sampleCanvas.width = 24;
      sampleCanvas.height = 32;

      const context = sampleCanvas.getContext("2d", { willReadFrequently: true });

      if (!context) {
        return 100;
      }

      context.drawImage(videoElement, 0, 0, sampleCanvas.width, sampleCanvas.height);

      const imageData = context.getImageData(0, 0, sampleCanvas.width, sampleCanvas.height).data;
      let luminanceTotal = 0;

      for (let index = 0; index < imageData.length; index += 4) {
        luminanceTotal += imageData[index] * 0.2126 + imageData[index + 1] * 0.7152 + imageData[index + 2] * 0.0722;
      }

      return luminanceTotal / (imageData.length / 4);
    };

    const analyzeFrame = async () => {
      const videoElement = cameraVideoRef.current;

      if (!videoElement || videoElement.readyState < 2 || videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
        return;
      }

      try {
        const detectedFaces = await faceDetector.detect(videoElement);

        if (isCancelled) {
          return;
        }

        const averageBrightness = getAverageBrightness(videoElement);

        if (averageBrightness < 78) {
          cameraStableDetectionCountRef.current = 0;
          setIsAutoCapturing(false);
          setCameraGuidanceText("Make sure lighting is clear");
          return;
        }

        if (detectedFaces.length === 0) {
          cameraStableDetectionCountRef.current = 0;
          setIsAutoCapturing(false);
          setCameraGuidanceText("Position your face inside the oval");
          return;
        }

        const detectedFace = detectedFaces[0].boundingBox;
        const targetWidth = videoElement.videoWidth * 0.58;
        const targetHeight = videoElement.videoHeight * 0.72;
        const targetCenterX = videoElement.videoWidth / 2;
        const targetCenterY = videoElement.videoHeight / 2;
        const faceCenterX = detectedFace.x + detectedFace.width / 2;
        const faceCenterY = detectedFace.y + detectedFace.height / 2;
        const horizontalOffset = Math.abs(faceCenterX - targetCenterX);
        const verticalOffset = Math.abs(faceCenterY - targetCenterY);

        if (detectedFace.height < targetHeight * 0.42) {
          cameraStableDetectionCountRef.current = 0;
          setIsAutoCapturing(false);
          setCameraGuidanceText("Get closer");
          return;
        }

        if (detectedFace.height > targetHeight * 0.84) {
          cameraStableDetectionCountRef.current = 0;
          setIsAutoCapturing(false);
          setCameraGuidanceText("Move slightly back");
          return;
        }

        if (horizontalOffset > targetWidth * 0.12) {
          cameraStableDetectionCountRef.current = 0;
          setIsAutoCapturing(false);
          setCameraGuidanceText("Center your face");
          return;
        }

        if (verticalOffset > targetHeight * 0.16) {
          cameraStableDetectionCountRef.current = 0;
          setIsAutoCapturing(false);
          setCameraGuidanceText(faceCenterY > targetCenterY ? "Move a little up" : "Move a little down");
          return;
        }

        cameraStableDetectionCountRef.current += 1;

        if (cameraStableDetectionCountRef.current < 2) {
          setIsAutoCapturing(true);
          setCameraGuidanceText("Hold still");
          return;
        }

        setIsAutoCapturing(true);
        setCameraGuidanceText("Capturing automatically…");
        clearCameraDetectionLoop();

        const capturedFrame = captureCurrentCameraFrame();

        if (capturedFrame) {
          setCapturedCameraImage(capturedFrame);
          setCameraGuidanceText("Captured automatically");
          stopCameraStream();
          return;
        }

        setIsAutoCaptureSupported(false);
        setIsAutoCapturing(false);
        setCameraGuidanceText("Automatic capture isn’t available here. Continue manually.");
      } catch {
        if (!isCancelled) {
          clearCameraDetectionLoop();
          setIsAutoCaptureSupported(false);
          setIsAutoCapturing(false);
          setCameraGuidanceText("Automatic capture isn’t available here. Continue manually.");
        }
      }
    };

    cameraDetectionIntervalRef.current = window.setInterval(() => {
      void analyzeFrame();
    }, 500);

    void analyzeFrame();

    return () => {
      isCancelled = true;
      clearCameraDetectionLoop();
      setIsAutoCapturing(false);
    };
  }, [cameraError, capturedCameraImage, captureCurrentCameraFrame, clearCameraDetectionLoop, isAutoCaptureSupported, isCameraCaptureStep, isCameraReady, isCameraReadyConfirmed, stopCameraStream]);

  useLayoutEffect(() => {
    if (photoCheckRevealIntervalRef.current) {
      window.clearInterval(photoCheckRevealIntervalRef.current);
      photoCheckRevealIntervalRef.current = null;
    }

    if (photoCheckButtonTimeoutRef.current) {
      window.clearTimeout(photoCheckButtonTimeoutRef.current);
      photoCheckButtonTimeoutRef.current = null;
    }

    if (!isPhotoCheckStep && !isCameraPrepStep && !isPostCameraInterstitialStep && !isPreAuthInterstitialStep && !isFinalReviewInterstitialStep && !isNextStepsInterstitialStep) {
      return;
    }

    if (isPhotoCheckStep || isPostCameraInterstitialStep || isPreAuthInterstitialStep || isFinalReviewInterstitialStep || isNextStepsInterstitialStep) {
      setIsPhotoCheckButtonVisible(false);
      setCameraPrepVisiblePointCount(0);
      setIsCameraPrepButtonVisible(false);

      if (isPhotoCheckStep || isPostCameraInterstitialStep || isPreAuthInterstitialStep || isNextStepsInterstitialStep) {
        const revealMs = interstitialRevealDurationMs(
          activeInterstitialTextBlocks[0] ?? "",
          activeInterstitialTextBlocks[1] ?? "",
        );
        photoCheckButtonTimeoutRef.current = window.setTimeout(() => {
          setIsPhotoCheckButtonVisible(true);
          photoCheckButtonTimeoutRef.current = null;
        }, revealMs);
      }
    } else {
      setIsPhotoCheckButtonVisible(false);
      setCameraPrepVisiblePointCount(0);
      setIsCameraPrepButtonVisible(false);

      const revealNextCameraPrepPoint = (nextCount: number) => {
        photoCheckRevealIntervalRef.current = window.setTimeout(() => {
          setCameraPrepVisiblePointCount(nextCount);

          if (nextCount < totalCameraPrepPoints) {
            revealNextCameraPrepPoint(nextCount + 1);
            return;
          }

          photoCheckRevealIntervalRef.current = null;
          photoCheckButtonTimeoutRef.current = window.setTimeout(() => {
            setIsCameraPrepButtonVisible(true);
            photoCheckButtonTimeoutRef.current = null;
          }, 650);
        }, nextCount === 1 ? 80 : 420);
      };

      revealNextCameraPrepPoint(1);
    }

    return () => {
      if (photoCheckRevealIntervalRef.current) {
        window.clearInterval(photoCheckRevealIntervalRef.current);
        photoCheckRevealIntervalRef.current = null;
      }

      if (photoCheckButtonTimeoutRef.current) {
        window.clearTimeout(photoCheckButtonTimeoutRef.current);
        photoCheckButtonTimeoutRef.current = null;
      }

      if (shippingRevealTimeoutRef.current) {
        window.clearTimeout(shippingRevealTimeoutRef.current);
        shippingRevealTimeoutRef.current = null;
      }

      if (recommendationRevealTimeoutRef.current) {
        window.clearTimeout(recommendationRevealTimeoutRef.current);
        recommendationRevealTimeoutRef.current = null;
      }
    };
  }, [currentStepIndex, isCameraPrepStep, isPhotoCheckStep, isPostCameraInterstitialStep, isPreAuthInterstitialStep, isFinalReviewInterstitialStep, isNextStepsInterstitialStep, medicalEndIndex, activeInterstitialTextBlocks[0], activeInterstitialTextBlocks[1]]);

  useEffect(() => {
    // Reset and start staged reveal only on shipping-info step
    if (!isShippingInfoStep) {
      setShippingRevealIndex(0);
      if (shippingRevealTimeoutRef.current) {
        window.clearTimeout(shippingRevealTimeoutRef.current);
        shippingRevealTimeoutRef.current = null;
      }
      return;
    }

    setShippingRevealIndex(0);

    const scheduleNext = (next: number) => {
      shippingRevealTimeoutRef.current = window.setTimeout(() => {
        setShippingRevealIndex(next);
        if (next < 3) {
          scheduleNext(next + 1);
        } else {
          shippingRevealTimeoutRef.current = null;
        }
      }, next === 0 ? 80 : 220);
    };

    scheduleNext(1);

    return () => {
      if (shippingRevealTimeoutRef.current) {
        window.clearTimeout(shippingRevealTimeoutRef.current);
        shippingRevealTimeoutRef.current = null;
      }
    };
  }, [isShippingInfoStep]);

  useEffect(() => {
    // Simple bottom-up fade for recommendation page
    if (!isRecommendationInterstitialStep) {
      setRecommendationReveal(false);
      setIsTreatmentInfoOpen(false);
      if (recommendationRevealTimeoutRef.current) {
        window.clearTimeout(recommendationRevealTimeoutRef.current);
        recommendationRevealTimeoutRef.current = null;
      }
      return;
    }

    setRecommendationReveal(false);
    recommendationRevealTimeoutRef.current = window.setTimeout(() => {
      setRecommendationReveal(true);
      recommendationRevealTimeoutRef.current = null;
    }, 50);

    return () => {
      if (recommendationRevealTimeoutRef.current) {
        window.clearTimeout(recommendationRevealTimeoutRef.current);
        recommendationRevealTimeoutRef.current = null;
      }
    };
  }, [isRecommendationInterstitialStep]);

  useEffect(() => {
    if (!isTreatmentInfoOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsTreatmentInfoOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isTreatmentInfoOpen]);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const targetNode = event.target as Node;

      if (treatmentTypesDropdownRef.current && !treatmentTypesDropdownRef.current.contains(targetNode)) {
        setIsTreatmentTypesDropdownOpen(false);
      }

      if (treatmentSideEffectsDropdownRef.current && !treatmentSideEffectsDropdownRef.current.contains(targetNode)) {
        setIsTreatmentSideEffectsDropdownOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  const clearIntroDoctorPopupClose = () => {
    if (doctorPopupAutoCloseTimeoutRef.current) {
      window.clearTimeout(doctorPopupAutoCloseTimeoutRef.current);
      doctorPopupAutoCloseTimeoutRef.current = null;
    }
    if (doctorPopupFadeTimeoutRef.current) {
      window.clearTimeout(doctorPopupFadeTimeoutRef.current);
      doctorPopupFadeTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    clearIntroDoctorPopupClose();

    if (doctorPopupOpenTimeoutRef.current) {
      window.clearTimeout(doctorPopupOpenTimeoutRef.current);
      doctorPopupOpenTimeoutRef.current = null;
    }

    if (!isMedicalDoctorIntroStep) {
      doctorPopupIsIntroRef.current = false;
      setIsDoctorPopupVisible(false);
      setIsDoctorAssignmentNoticeVisible(false);
      return;
    }

    return () => {
      if (doctorAssignmentNoticeTimeoutRef.current) {
        window.clearTimeout(doctorAssignmentNoticeTimeoutRef.current);
        doctorAssignmentNoticeTimeoutRef.current = null;
      }

      if (doctorPopupAutoCloseTimeoutRef.current) {
        window.clearTimeout(doctorPopupAutoCloseTimeoutRef.current);
        doctorPopupAutoCloseTimeoutRef.current = null;
      }

      if (doctorPopupFadeTimeoutRef.current) {
        window.clearTimeout(doctorPopupFadeTimeoutRef.current);
        doctorPopupFadeTimeoutRef.current = null;
      }

      if (doctorPopupOpenTimeoutRef.current) {
        window.clearTimeout(doctorPopupOpenTimeoutRef.current);
        doctorPopupOpenTimeoutRef.current = null;
      }
    };
  }, [isMedicalDoctorIntroStep]);

  useEffect(() => {
    if (!isDoctorAssignmentNoticeVisible) return;
    doctorAssignmentNoticeTimeoutRef.current = window.setTimeout(() => {
      setIsDoctorAssignmentNoticeVisible(false);
      doctorAssignmentNoticeTimeoutRef.current = null;
    }, 3000);
    return () => {
      if (doctorAssignmentNoticeTimeoutRef.current) {
        window.clearTimeout(doctorAssignmentNoticeTimeoutRef.current);
        doctorAssignmentNoticeTimeoutRef.current = null;
      }
    };
  }, [isDoctorAssignmentNoticeVisible]);

  const clearLocationReadyTimeout = () => {
    if (locationReadyTimeoutRef.current) {
      window.clearTimeout(locationReadyTimeoutRef.current);
      locationReadyTimeoutRef.current = null;
    }
  };

  const clearMatchingTimeouts = () => {
    if (matchingSuccessTimeoutRef.current) {
      window.clearTimeout(matchingSuccessTimeoutRef.current);
      matchingSuccessTimeoutRef.current = null;
    }

    if (matchingCompleteTimeoutRef.current) {
      window.clearTimeout(matchingCompleteTimeoutRef.current);
      matchingCompleteTimeoutRef.current = null;
    }
  };

  const resetLocationButtonState = () => {
    clearLocationReadyTimeout();
    setIsLocationLoading(false);
    setIsLocationReady(false);
  };

  const openDoctorPopup = (showAbout = true, choose = false, expandProfile = false) => {
    setIsTreatmentInfoOpen(false);
    if (showAbout || choose) {
      doctorPopupIsIntroRef.current = false;
      clearIntroDoctorPopupClose();
    }

    if (doctorPopupOpenTimeoutRef.current) {
      window.clearTimeout(doctorPopupOpenTimeoutRef.current);
      doctorPopupOpenTimeoutRef.current = null;
    }

    setIsDoctorPopupOpen(true);
    setIsDoctorPopupVisible(false);
    setIsChoosingPhysician(choose);
    setIsViewingPhysicianProfile(expandProfile);
    setShouldShowDoctorPopupAbout(showAbout && !choose);
    setIsDoctorAssignmentNoticeVisible(false);

    doctorPopupOpenTimeoutRef.current = window.setTimeout(() => {
      setIsDoctorPopupVisible(true);
      doctorPopupOpenTimeoutRef.current = null;
    }, 20);
  };

  const closeDoctorPopup = () => {
    if (doctorPopupOpenTimeoutRef.current) {
      window.clearTimeout(doctorPopupOpenTimeoutRef.current);
      doctorPopupOpenTimeoutRef.current = null;
    }

    setIsDoctorPopupVisible(false);
    setIsDoctorPopupOpen(false);
    setShouldShowDoctorPopupAbout(false);
    setIsChoosingPhysician(false);
    setIsViewingPhysicianProfile(false);
  };

  const advanceToStep = (nextStepIndex: number) => {
    if (nextStepIndex === currentStepIndex) {
      return;
    }

    // Cancel any in-flight transition so a remount/HMR can't leave us faded & stuck.
    if (advanceTimeoutRef.current) {
      window.clearTimeout(advanceTimeoutRef.current);
      advanceTimeoutRef.current = null;
    }
    if (fadeTimeoutRef.current) {
      window.clearTimeout(fadeTimeoutRef.current);
      fadeTimeoutRef.current = null;
    }

    closeDoctorPopup();
    setIsTreatmentInfoOpen(false);
    setIsAdvancing(true);
    setIsFading(false);

    advanceTimeoutRef.current = window.setTimeout(() => {
      setIsFading(true);
      fadeTimeoutRef.current = window.setTimeout(() => {
        setReturnedStepIndexForContinue(null);
        setCurrentStepIndex(nextStepIndex);
        setIsAdvancing(false);
        setIsFading(false);
        fadeTimeoutRef.current = null;
      }, 150);
      advanceTimeoutRef.current = null;
    }, 500);
  };

  const getNextQuestionStepIndex = () => {
    if (currentStepIndex < intakeSteps.length - 1) {
      return currentStepIndex + 1;
    }

    if (currentStepIndex === intakeSteps.length - 1) {
      return preAuthInterstitialIndex;
    }

    if (isMedicalStep && currentStepIndex < medicalEndIndex) {
      const currentMedical = medicalSteps[currentStepIndex - medicalStartIndex];
      if (currentMedical?.id === "final-notes") {
        return nextStepsStepIndex;
      }
      if (currentMedical?.id === "next-steps") {
        return shippingInfoStepIndex;
      }
      if (currentMedical?.id === "shipping-info") {
        return recommendationStepIndex >= 0 ? recommendationStepIndex : finalReviewStepIndex;
      }
      if (currentMedical?.id === "recommendation-interstitial") {
        return finalReviewStepIndex;
      }
      return currentStepIndex + 1;
    }

    return currentStepIndex;
  };

  const handleOptionClick = (option: string) => {
    if (isAdvancing || !currentStep) {
      return;
    }

    if (currentStep.multiSelect) {
      setSelectedMultiAnswers((current) => {
        const existing = current[currentStep.id] ?? [];
        const isNone = option === NONE_OF_THESE;
        if (isNone) {
          return { ...current, [currentStep.id]: existing.includes(NONE_OF_THESE) ? [] : [NONE_OF_THESE] };
        }
        const withoutNone = existing.filter((value) => value !== NONE_OF_THESE);
        const next = withoutNone.includes(option)
          ? withoutNone.filter((value) => value !== option)
          : [...withoutNone, option];
        return { ...current, [currentStep.id]: next };
      });
      setIsDoctorPopupOpen(false);
      return;
    }

    if (currentStep.id === "goal") {
      setSelectedGoalOptions((currentOptions) => {
        const isAllOfTheAboveOption = option === "All of the above";
        const hasCurrentOption = currentOptions.includes(option);

        if (isAllOfTheAboveOption) {
          return hasCurrentOption ? [] : [option];
        }

        const nextOptions = currentOptions.filter((currentOption) => currentOption !== "All of the above");

        return hasCurrentOption ? nextOptions.filter((currentOption) => currentOption !== option) : [...nextOptions, option];
      });
      return;
    }

    setSelectedAnswers((currentAnswers) => ({
      ...currentAnswers,
      [currentStep.id]: option,
    }));

    // On the 'final-notes' step, do not auto-advance on selection; require pressing Submit
    if (currentStep.id === "final-notes") {
      setIsDoctorPopupOpen(false);
      return;
    }

    // Stay on the step when a follow-up text field is required for this choice.
    if (
      (currentStep.id === "medical-conditions" && option !== "No known conditions") ||
      ((currentStep.id === "medications" || currentStep.id === "ed-medications") && option.startsWith("Yes")) ||
      (currentStep.id === "previous-hair-loss-treatments" && option === "Yes")
    ) {
      setIsDoctorPopupOpen(false);
      return;
    }

    const nextStepIndex = getNextQuestionStepIndex();

    if (nextStepIndex === currentStepIndex) {
      setIsDoctorPopupOpen(false);
      return;
    }

    if (currentStep.id === "medical-conditions" && option === "No known conditions") {
      setMedicalFollowUpText((currentValues) => ({ ...currentValues, [currentStep.id]: "" }));
    }

    if (currentStep.id === "medications" && option === "No") {
      setMedicalFollowUpText((currentValues) => ({ ...currentValues, [currentStep.id]: "" }));
    }

    if (currentStep.id === "ed-medications" && option === "No") {
      setMedicalFollowUpText((currentValues) => ({ ...currentValues, [currentStep.id]: "" }));
    }

    if (currentStep.id === "previous-hair-loss-treatments" && option !== "Yes") {
      setTreatmentSelections({});
      setTreatmentOtherDetail("");
      setTreatmentSideEffectsLevel(null);
      setMedicalFollowUpText((currentValues) => ({ ...currentValues, [currentStep.id]: "" }));
    }

    if (currentStep.id === "final-notes" && option === "No") {
      setMedicalFollowUpText((currentValues) => ({ ...currentValues, [currentStep.id]: "" }));
    }

    advanceToStep(nextStepIndex);
  };

  const handlePreAuthInterstitialContinue = () => {
    if (!isPreAuthInterstitialStep || !isPhotoCheckButtonVisible) {
      return;
    }

    advanceToStep(authStepIndex);
  };

  const handleNextStepsInterstitialContinue = () => {
    if (!isNextStepsInterstitialStep || !isPhotoCheckButtonVisible) {
      return;
    }

    advanceToStep(shippingInfoStepIndex);
  };

  const handleCameraRetake = () => {
    if (!isCameraCaptureStep) {
      return;
    }

    clearCameraCaptureFlash();
    clearCameraCountdown();
    clearCameraDetectionLoop();
    clearCameraReadyDelay();
    stopCameraStream();
    setCapturedCameraImage(null);
    setCameraError(null);
    setIsCameraReady(false);
    setIsCameraReadyConfirmed(false);
    setCameraSessionRestartKey((currentValue) => currentValue + 1);
  };

  const handleCameraPrepContinue = () => {
    if (!isCameraPrepStep) {
      return;
    }

    const nextStepIndex = getNextQuestionStepIndex();

    if (nextStepIndex === currentStepIndex) {
      return;
    }

    advanceToStep(nextStepIndex);
  };

  const handlePhotoCheckContinue = () => {
    if (!isPhotoCheckStep && !isPostCameraInterstitialStep && !isPreAuthInterstitialStep && !isFinalReviewInterstitialStep) {
      return;
    }

    const nextStepIndex = getNextQuestionStepIndex();

    if (nextStepIndex === currentStepIndex) {
      return;
    }

    advanceToStep(nextStepIndex);
  };

  const handleCameraCaptureContinue = () => {
    if (!isCameraCaptureStep || !canContinueCameraCapture) {
      return;
    }

    if (capturedCameraImage === null && cameraError === null) {
      setIsAutoCapturing(true);
      setCameraCountdownValue(3);

      const startCountdown = (value: number) => {
        cameraCountdownTimeoutRef.current = window.setTimeout(() => {
          if (value > 1) {
            setCameraCountdownValue(value - 1);
            startCountdown(value - 1);
            return;
          }

          cameraCountdownTimeoutRef.current = null;
          setCameraCountdownValue(null);

          const capturedFrame = captureCurrentCameraFrame();

          if (capturedFrame) {
            clearCameraCaptureFlash();
            setIsCameraCaptureFlashVisible(true);
            setIsAutoCapturing(false);
            stopCameraStream();

            cameraCaptureFlashTimeoutRef.current = window.setTimeout(() => {
              setIsCameraCaptureFlashVisible(false);
              cameraCaptureFlashTimeoutRef.current = null;
            }, 300);
            setCapturedCameraImage(capturedFrame);
            return;
          }

          setIsAutoCapturing(false);
          setCameraError("We couldn’t capture your photo. Please try again.");
        }, 1000);
      };

      startCountdown(3);
      return;
    }

    if (isReviewingIntermediateCameraCapture && nextCameraCapturePhase !== null) {
      clearCameraCaptureFlash();
      clearCameraCountdown();
      clearCameraDetectionLoop();
      clearCameraReadyDelay();
      stopCameraStream();
      setCapturedCameraImage(null);
      setCameraError(null);
      setIsCameraReady(false);
      setIsCameraReadyConfirmed(false);
      setCameraCapturePhase(nextCameraCapturePhase);
      setCameraSessionRestartKey((currentValue) => currentValue + 1);
      return;
    }

    const nextStepIndex = getNextQuestionStepIndex();

    if (nextStepIndex === currentStepIndex) {
      return;
    }

    advanceToStep(nextStepIndex);
  };

  const handleCheckboxStepContinue = () => {
    if (!currentStep || !currentStep.multiSelect || currentMultiSelections.length === 0) {
      return;
    }

    setSelectedAnswers((currentAnswers) => ({
      ...currentAnswers,
      [currentStep.id]: currentMultiSelections.join("; "),
    }));

    const nextStepIndex = getNextQuestionStepIndex();

    if (nextStepIndex === currentStepIndex) {
      return;
    }

    advanceToStep(nextStepIndex);
  };

  const handleSelectedAnswerContinue = () => {
    if (!currentStep || isCheckboxSelectionStep || selectedOption === null) {
      return;
    }

    const nextStepIndex = getNextQuestionStepIndex();

    if (nextStepIndex === currentStepIndex) {
      return;
    }

    advanceToStep(nextStepIndex);
  };

  const handleRecommendationContinue = () => {
    if (isAdvancing) {
      return;
    }
    // Always show the intake-complete interstitial after the treatment plan.
    // Persistence runs on that step (or redirects to account setup if needed).
    advanceToStep(finalReviewStepIndex);
  };

  const continuePastAuth = () => {
    if (authAfterGuestSubmit) {
      setAuthAfterGuestSubmit(false);
      setReturnedStepIndexForContinue(null);
      setCurrentStepIndex(finalReviewStepIndex);
      return;
    }
    setIsLocationDropdownOpen(Boolean(locationQuery.trim()));
    setReturnedStepIndexForContinue(null);
    setCurrentStepIndex(locationStepIndex);
  };

  const finishIdentityAuth = () => {
    if (isShippingInfoStep) {
      if (!canContinueDetails) {
        return;
      }
      advanceToStep(recommendationStepIndex >= 0 ? recommendationStepIndex : shippingInfoStepIndex + 1);
      return;
    }
    continuePastAuth();
  };

  const authFailureMessage = (code: string | undefined) => {
    if (code === "expired") return intake.auth.codeExpired;
    if (code === "invalid_code") return intake.auth.codeInvalid;
    if (code === "send_failed") return intake.auth.couldNotContinue;
    return intake.auth.identifierInvalid;
  };

  const handleSendLoginCode = async () => {
    const identifier = authIdentifier.trim();
    if (!identifier) {
      setAuthError(intake.auth.identifierInvalid);
      return;
    }
    setAuthBusy(true);
    setAuthError("");
    const started = Date.now();
    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier }),
      });
      const payload = (await res.json().catch(() => ({}))) as {
        error?: string;
        display?: string;
        channel?: "email" | "phone";
      };
      if (!res.ok) {
        setAuthError(authFailureMessage(payload.error));
        return;
      }
      const wait = 900 - (Date.now() - started);
      if (wait > 0) {
        await new Promise((resolve) => window.setTimeout(resolve, wait));
      }
      const display = payload.display || identifier;
      setAuthDestination(display);
      setAuthCode("");
      setAuthStage("code");
      setAuthChannel(payload.channel === "phone" ? "phone" : "email");
      if (payload.channel === "phone") {
        setSelectedAnswers((current) => ({ ...current, phone: display }));
        setShippingFormData((current) => ({ ...current, phone: display }));
      } else {
        setAuthEmail(display);
        setShippingFormData((current) => ({ ...current, email: display }));
      }
    } catch {
      setAuthError(intake.auth.identifierInvalid);
    } finally {
      setAuthBusy(false);
    }
  };

  const handleVerifyLoginCode = async (code: string) => {
    if (authVerifyLock.current || code.length !== 6) return;
    authVerifyLock.current = true;
    setAuthBusy(true);
    setAuthError("");
    try {
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: authIdentifier.trim(), code }),
      });
      const payload = (await res.json().catch(() => ({}))) as {
        error?: string;
        email?: string | null;
        phone?: string | null;
        firstName?: string | null;
        lastName?: string | null;
        needsProfile?: boolean;
        hasCase?: boolean;
      };
      if (!res.ok) {
        setAuthCode("");
        setAuthError(authFailureMessage(payload.error));
        return;
      }
      if (payload.hasCase) {
        window.location.replace("/care");
        return;
      }
      setSignedInEmail(payload.email || payload.phone || authDestination);
      if (payload.phone) setAuthChannel("phone");
      if (payload.email) setAuthChannel("email");
      if (payload.needsProfile) {
        setShippingFormData((current) => ({
          ...current,
          email: payload.email || current.email,
          phone: payload.phone || current.phone,
          firstName: payload.firstName || current.firstName,
          lastName: payload.lastName || current.lastName,
        }));
        setAuthStage("profile");
        return;
      }
      finishIdentityAuth();
    } catch {
      setAuthError(intake.auth.codeInvalid);
    } finally {
      authVerifyLock.current = false;
      setAuthBusy(false);
    }
  };

  const handleCompleteProfile = async () => {
    const firstName = shippingFormData.firstName.trim();
    const lastName = shippingFormData.lastName.trim();
    const dateOfBirth = shippingFormData.dateOfBirth.trim();
    const email = shippingFormData.email.trim();
    const phone = shippingFormData.phone.trim();
    const age = ageFromDateOfBirth(dateOfBirth);
    if (!firstName || !lastName) {
      setAuthError(intake.auth.nameHint);
      return;
    }
    if (age === null) {
      setAuthError(intake.shipping.dobRequired);
      return;
    }
    if (age < 18) {
      setAuthError(intake.shipping.dobAdult);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setAuthError(intake.shipping.emailRequired);
      return;
    }
    setAuthBusy(true);
    setAuthError("");
    setSelectedAnswers((current) => ({
      ...current,
      dateOfBirth,
      age: String(age),
      email,
      phone,
    }));
    try {
      const res = await fetch("/api/auth/complete-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, dateOfBirth, email, phone }),
      });
      if (res.status !== 401 && !res.ok) {
        setAuthError(intake.auth.couldNotContinue);
        return;
      }
      setSignedInEmail(email || phone);
      finishIdentityAuth();
    } catch {
      setAuthError(intake.auth.couldNotContinue);
    } finally {
      setAuthBusy(false);
    }
  };

  const handleAuthSubmit = async () => {
    const email = authEmail.trim();
    if (!email || !authPassword) {
      setAuthError(intake.auth.requiredFields);
      return;
    }
    if (authPassword.length < 8) {
      setAuthError(intake.auth.passwordTooShort);
      return;
    }
    if (authMode === "signup" && authPassword !== authConfirm) {
      setAuthError(intake.auth.passwordMismatch);
      return;
    }
    setAuthBusy(true);
    setAuthError("");
    try {
      const res = await fetch(authMode === "signup" ? "/api/auth/signup" : "/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: authPassword }),
      });
      const payload = (await res.json().catch(() => ({}))) as { error?: string; email?: string; hasCase?: boolean };
      if (!res.ok) {
        setAuthError(payload.error || (authMode === "signup" ? "Could not create account." : "Could not sign in."));
        return;
      }
      if (payload.hasCase) {
        window.location.replace("/care");
        return;
      }
      setSignedInEmail(payload.email || email);
      finishIdentityAuth();
    } catch {
      setAuthError(authMode === "signup" ? "Could not create account." : "Could not sign in.");
    } finally {
      setAuthBusy(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthBusy(true);
    setAuthError("");
    try {
      const user = await signInWithGoogle();
      if (user.hasCase) {
        window.location.replace("/care");
        return;
      }
      if (user.email) setSignedInEmail(user.email);
      if (user.needsProfile) {
        setAuthChannel("email");
        setShippingFormData((current) => ({
          ...current,
          email: user.email || current.email,
          firstName: user.firstName || current.firstName,
          lastName: user.lastName || current.lastName,
        }));
        setAuthStage("profile");
        return;
      }
      finishIdentityAuth();
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Could not sign in with Google.");
    } finally {
      setAuthBusy(false);
    }
  };

  const handleLocationQueryChange = (value: string) => {
    setLocationQuery(value);
    setIsLocationDropdownOpen(true);

    if (selectedCity && value !== selectedCity) {
      setSelectedCity(null);
      resetLocationButtonState();
    }
  };

  const handleCitySelect = (city: string) => {
    setLocationQuery(city);
    setSelectedCity(city);
    setHasConfirmedDoctorMatch(false);
    const nearest = physiciansNearDistrict(city)[0];
    if (nearest) setPreferredDoctorId(nearest.physician.id);
    setIsLocationDropdownOpen(false);
    resetLocationButtonState();
    setIsLocationLoading(true);

    locationReadyTimeoutRef.current = window.setTimeout(() => {
      setIsLocationLoading(false);
      setIsLocationReady(true);
      locationReadyTimeoutRef.current = null;
    }, 1000);
  };

  const handleLocationContinueClick = () => {
    if (!canContinueLocation) {
      return;
    }

    setIsDoctorPopupOpen(false);
    setReturnedStepIndexForContinue(null);
    if (!hasConfirmedDoctorMatch) {
      setIsDoctorMatchOpen(true);
      return;
    }
    setCurrentStepIndex(medicalStartIndex);
  };

  const handleMedicalFollowUpContinue = () => {
    if (!currentStep || !canContinueMedicalFollowUp) {
      return;
    }

    const nextStepIndex = getNextQuestionStepIndex();

    if (nextStepIndex === currentStepIndex) {
      return;
    }

    advanceToStep(nextStepIndex);
  };

  const handlePreviousClick = () => {
    if (advanceTimeoutRef.current) {
      window.clearTimeout(advanceTimeoutRef.current);
      advanceTimeoutRef.current = null;
    }

    if (fadeTimeoutRef.current) {
      window.clearTimeout(fadeTimeoutRef.current);
      fadeTimeoutRef.current = null;
    }

    clearLocationReadyTimeout();
    clearMatchingTimeouts();
    clearCameraCountdown();
    setIsLocationLoading(false);

    setIsAdvancing(false);
    setIsFading(false);
    setIsLocationDropdownOpen(false);
    setCurrentStepIndex((currentIndex) => {
      // Custom previous mapping for the subflow
      if (isRecommendationInterstitialStep && shippingInfoStepIndex >= 0) {
        setReturnedStepIndexForContinue(shippingInfoStepIndex);
        return shippingInfoStepIndex;
      }
      if (isFinalReviewInterstitialStep && recommendationStepIndex >= 0) {
        setReturnedStepIndexForContinue(recommendationStepIndex);
        return recommendationStepIndex;
      }

      const previousStepIndex =
        currentIndex === locationStepIndex
          ? authStepIndex
          : currentIndex === authStepIndex
          ? preAuthInterstitialIndex
          : currentIndex === medicalStartIndex
          ? locationStepIndex
          : isCameraCaptureStep
            ? Math.max(currentIndex - 3, 0)
          : isAgeStartedStep
            ? prePhotoCheckStepIndex
            : Math.max(currentIndex - 1, 0);

      setReturnedStepIndexForContinue(previousStepIndex);

      return previousStepIndex;
    });
  };

  return (
    <main className={`relative min-h-screen bg-[#f7f3ea] text-[#232320] ${
      isShippingInfoStep || isRecommendationInterstitialStep || (whyWeAskNote && !shouldShowSelectedAnswerContinue)
        ? "overflow-hidden"
        : "overflow-x-hidden overflow-y-auto"
    }`}>
      <Script src="https://google.com" strategy="afterInteractive" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-8%] top-[-12%] h-[26rem] w-[32rem] rounded-full bg-white/70 blur-3xl" />
        <div className="absolute right-[-8%] top-[-10%] h-[28rem] w-[34rem] rounded-full bg-white/60 blur-3xl" />
        <div className="absolute left-[10%] top-[28%] h-[22rem] w-[28rem] rounded-full bg-[#efe6d5]/55 blur-3xl" />
        <div className="absolute right-[8%] bottom-[16%] h-[20rem] w-[24rem] rounded-full bg-[#eee5d8]/50 blur-3xl" />
      </div>

      <div className={`relative flex min-w-0 flex-col ${HOME_PAGE_GUTTER_CLASS} ${
        isCameraCaptureStep
          ? "h-dvh overflow-hidden pb-24 pt-6 sm:h-screen sm:pb-6 sm:pt-5"
          : isShippingInfoStep || isRecommendationInterstitialStep
            ? "h-dvh overflow-hidden pb-4 pt-4 sm:pt-5"
          : isPhotoCheckStep || isCameraPrepStep || isPostCameraInterstitialStep || isPreAuthInterstitialStep || isFinalReviewInterstitialStep || isNextStepsInterstitialStep
            ? "h-dvh overflow-hidden"
            : whyWeAskNote && !shouldShowSelectedAnswerContinue
              ? "h-dvh overflow-hidden pb-6 pt-4 sm:pt-5"
            : whyWeAskNote
              ? "min-h-dvh overflow-visible pb-8 pt-4 sm:pb-6 sm:pt-5"
            : "min-h-screen overflow-y-auto pb-8 pt-4 sm:pb-6 sm:pt-5"
      }`}>
        {!isAuthStep && !isPhotoCheckStep && !isCameraPrepStep && !isPostCameraInterstitialStep && !isPreAuthInterstitialStep && !isFinalReviewInterstitialStep && !isNextStepsInterstitialStep ? (
          <div className={`flex w-full shrink-0 items-start justify-between gap-6 ${
            isCameraCaptureStep || isShippingInfoStep || isRecommendationInterstitialStep ? "" : "mt-[10vh] sm:mt-0"
          }`}>
            <a href="/" className="inline-flex items-center">
              <Image
                src="/hiros_logo.png"
                alt="Hiros"
                width={111}
                height={46}
                priority
                unoptimized
                className="h-auto w-[80px]"
              />
            </a>

            {currentStepIndex === 0 ? (
              <button
                type="button"
                onClick={() => {
                  setAuthStage("identifier");
                  setAuthCode("");
                  setAuthError("");
                  setCurrentStepIndex(authStepIndex);
                }}
                className="inline-flex cursor-pointer items-center rounded-full border border-dashed border-[#c77e57] bg-white/80 px-4 py-2.5 text-[14px] font-semibold text-[#9a5c3c]"
              >
                Login
              </button>
            ) : null}

            {!isAuthStep && !isShippingInfoStep && !isRecommendationInterstitialStep ? (
              isCameraCaptureStep ? (
                <div
                  aria-hidden="true"
                  className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/65 px-5 py-3 text-[15px] font-medium opacity-0 shadow-[0_8px_24px_rgba(0,0,0,0.04)] backdrop-blur-sm"
                >
                  <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
                    <path d="M11.75 5.75 7.5 10l4.25 4.25" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>{intake.previous}</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handlePreviousClick}
                  disabled={currentStepIndex === 0}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-black/10 bg-white/65 px-3 py-2.5 text-[15px] font-medium text-black/68 shadow-[0_8px_24px_rgba(0,0,0,0.04)] backdrop-blur-sm transition-colors hover:bg-white/80 disabled:cursor-default disabled:opacity-45 disabled:hover:bg-white/65 sm:px-5 sm:py-3"
                >
                  <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
                    <path d="M11.75 5.75 7.5 10l4.25 4.25" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="hidden sm:inline">{intake.previous}</span>
                </button>
              )
            ) : null}
          </div>
        ) : null}

        <section
          className={`mx-auto flex w-full min-w-0 max-w-[1440px] flex-1 justify-center ${
            isCameraCaptureStep
              ? "min-h-0 flex-1 flex-col items-center pt-3 sm:pt-0"
              : isAuthStep
                ? "min-h-[calc(100dvh-6rem)] items-center"
              : isShippingInfoStep
                ? "min-h-0 flex-1 items-start pt-6 sm:pt-8"
              : isRecommendationInterstitialStep
                ? "min-h-0 flex-1 items-center"
              : isPhotoCheckStep ||
                  isPostCameraInterstitialStep ||
                  isPreAuthInterstitialStep ||
                  isFinalReviewInterstitialStep ||
                  isNextStepsInterstitialStep ||
                  isCameraPrepStep
                ? "min-h-0 flex-1 flex-col items-center justify-center"
                : "items-start pt-6 sm:pt-12"
          }`}
        >
          {isMedicalStep && !isPhotoCheckStep && !isCameraPrepStep && !isPostCameraInterstitialStep && !isFinalReviewInterstitialStep && !isNextStepsInterstitialStep && !isAuthStep && !isShippingInfoStep && !isRecommendationInterstitialStep ? (
            <div className={`absolute inset-x-4 top-[53px] max-w-[700px] sm:inset-x-auto sm:left-1/2 sm:top-10 sm:w-full sm:-translate-x-1/2 ${isCameraCaptureStep ? "hidden sm:block" : ""}`}>
              <div className="h-[7px] overflow-hidden rounded-full bg-black/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#5f7f4f] via-[#8ea57a] to-[#4b6942] transition-[width] duration-500 ease-out"
                  style={{ width: `${displayedMedicalProgress}%` }}
                />
              </div>
            </div>
          ) : null}

          {isAuthStep ? (
            <div className={`relative mx-auto w-full max-w-[500px] rounded-[32px] bg-white px-6 shadow-[0_18px_50px_rgba(40,50,90,0.10)] ${authStage === "profile" ? "max-h-[min(860px,calc(100dvh-2rem))] overflow-y-auto pb-8 pt-6 sm:pb-10 sm:pt-7" : authStage === "code" ? "flex min-h-[531px] flex-col py-[80px]" : "py-[80px]"}`}>
              {authStage === "code" || authStage === "profile" ? (
                <button
                  type="button"
                  onClick={() => {
                    setAuthError("");
                    if (authStage === "profile") {
                      setAuthStage("code");
                      return;
                    }
                    setAuthStage("identifier");
                    setAuthCode("");
                  }}
                  className="absolute left-5 top-5 flex h-8 w-8 items-center justify-center rounded-full text-[#222] hover:bg-black/5"
                  aria-label={intake.previous}
                >
                  <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden="true">
                    <path d="M12.25 4.75 7 10l5.25 5.25" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              ) : null}
              {authStage !== "code" ? (
                <button
                  type="button"
                  onClick={handlePreviousClick}
                  className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full text-[#222] hover:bg-black/5"
                  aria-label={intake.previous}
                >
                  <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
                    <path d="M5 5l10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                  </svg>
                </button>
              ) : null}

              {authStage === "profile" ? null : (
                <div className={`flex justify-center ${authStage === "code" ? "pt-2" : "mb-[20px]"}`}>
                  <Image src="/hiros_logo.png" alt="Hiros" width={111} height={46} priority unoptimized className="h-auto w-[84px]" />
                </div>
              )}

              {authStage === "profile" ? (
                <form
                  className="mx-auto mt-8 w-full max-w-[430px] pb-2"
                  onSubmit={(event) => {
                    event.preventDefault();
                    void handleCompleteProfile();
                  }}
                >
                  <h1 className="text-center text-[26px] font-semibold leading-[1.2] tracking-[-0.03em] text-[#222222]">
                    {intake.auth.createAccountTitle}
                  </h1>
                  <p className="mx-auto mt-2 max-w-[36ch] text-center text-[15px] leading-[1.4] text-[#6a6a6a]">
                    {intake.auth.createAccountSubtitle}
                  </p>

                  <p className="mt-6 text-[16px] font-semibold text-[#222222]">{intake.auth.legalName}</p>
                  <div className="mt-2 overflow-hidden rounded-xl border border-[#222222]">
                    <input
                      type="text"
                      autoComplete="given-name"
                      value={shippingFormData.firstName}
                      placeholder={intake.shipping.firstName}
                      onChange={(event) => {
                        setShippingFormData((current) => ({ ...current, firstName: event.target.value }));
                        setAuthError("");
                      }}
                      className="h-14 w-full border-b border-[#dddddd] px-4 text-[16px] text-[#222222] outline-none placeholder:text-[#8c8c8c]"
                    />
                    <input
                      type="text"
                      autoComplete="family-name"
                      value={shippingFormData.lastName}
                      placeholder={intake.shipping.lastName}
                      onChange={(event) => {
                        setShippingFormData((current) => ({ ...current, lastName: event.target.value }));
                        setAuthError("");
                      }}
                      className="h-14 w-full px-4 text-[16px] text-[#222222] outline-none placeholder:text-[#8c8c8c]"
                    />
                  </div>
                  <p className="mt-2 text-[13px] leading-[1.45] text-[#6a6a6a]">{intake.auth.nameHint}</p>

                  <p className="mt-6 text-[16px] font-semibold text-[#222222]">{intake.shipping.dateOfBirth}</p>
                  <label className="relative mt-2 flex h-14 items-center rounded-xl border border-[#b0b0b0] px-4">
                    <span className={shippingFormData.dateOfBirth ? "text-[16px] text-[#222222]" : "text-[16px] text-[#8c8c8c]"}>
                      {shippingFormData.dateOfBirth
                        ? shippingFormData.dateOfBirth.split("-").reverse().join(".")
                        : intake.auth.selectDate}
                    </span>
                    <input
                      type="date"
                      required
                      value={shippingFormData.dateOfBirth}
                      onChange={(event) => {
                        setShippingFormData((current) => ({ ...current, dateOfBirth: event.target.value }));
                        setAuthError("");
                      }}
                      className="absolute inset-0 cursor-pointer opacity-0"
                    />
                  </label>

                  <p className="mt-6 text-[16px] font-semibold text-[#222222]">{intake.shipping.email}</p>
                  {authChannel === "email" && shippingFormData.email ? (
                    <div className="mt-2 rounded-xl border border-[#dddddd] bg-[#f7f7f7] px-4 py-2.5">
                      <p className="text-[12px] text-[#6a6a6a]">{intake.shipping.email}</p>
                      <p className="text-[16px] text-[#6a6a6a]">{shippingFormData.email}</p>
                    </div>
                  ) : (
                    <input
                      type="email"
                      autoComplete="email"
                      value={shippingFormData.email}
                      placeholder={intake.shipping.email}
                      onChange={(event) => {
                        setShippingFormData((current) => ({ ...current, email: event.target.value }));
                        setAuthError("");
                      }}
                      className="mt-2 h-14 w-full rounded-xl border border-[#222222] px-4 text-[16px] outline-none placeholder:text-[#8c8c8c]"
                    />
                  )}
                  <p className="mt-2 text-[13px] leading-[1.45] text-[#6a6a6a]">{intake.shipping.emailNote}</p>

                  <p className="mt-6 text-[16px] font-semibold text-[#222222]">{intake.shipping.phone}</p>
                  {authChannel === "phone" && shippingFormData.phone ? (
                    <div className="mt-2 rounded-xl border border-[#dddddd] bg-[#f7f7f7] px-4 py-2.5">
                      <p className="text-[12px] text-[#6a6a6a]">{intake.shipping.phone}</p>
                      <p className="text-[16px] text-[#6a6a6a]">{shippingFormData.phone}</p>
                    </div>
                  ) : (
                    <input
                      type="tel"
                      autoComplete="tel"
                      value={shippingFormData.phone}
                      placeholder={intake.auth.phonePlaceholder}
                      onChange={(event) => {
                        setShippingFormData((current) => ({ ...current, phone: event.target.value }));
                        setAuthError("");
                      }}
                      className="mt-2 h-14 w-full rounded-xl border border-[#222222] px-4 text-[16px] outline-none placeholder:text-[#8c8c8c]"
                    />
                  )}
                  <p className="mt-2 text-[13px] leading-[1.45] text-[#6a6a6a]">{intake.shipping.phoneNote}</p>

                  {authError ? <p className="mt-4 text-[13px] font-medium text-[#a81d12]">{authError}</p> : null}
                  <p className="mt-5 text-[13px] leading-[1.45] text-[#222222]">
                    {intake.auth.agreeLegalBefore}
                    <Link href="/terms" className="font-semibold underline underline-offset-[3px]">{intake.auth.agreeLegalTerms}</Link>
                    {intake.auth.agreeLegalAnd}
                    <Link href="/privacy" className="font-semibold underline underline-offset-[3px]">{intake.auth.agreeLegalPrivacy}</Link>
                    {intake.auth.agreeLegalAfter}
                  </p>
                  <button
                    type="submit"
                    disabled={authBusy}
                    className={`mt-4 flex h-12 w-full items-center justify-center rounded-lg text-[16px] font-semibold ${
                      authBusy ? "bg-[#f2f2f2]" : "bg-[#111111] text-white"
                    }`}
                  >
                    {authBusy ? (
                      <span className="auth-send-dots" aria-label={intake.auth.agreeContinue}>
                        <span />
                        <span />
                        <span />
                      </span>
                    ) : (
                      intake.auth.agreeContinue
                    )}
                  </button>
                </form>
              ) : signedInEmail ? (
                <div className="mx-auto mt-8 w-full max-w-[430px]">
                  <h1 className="text-center text-[22px] font-semibold leading-[1.2] tracking-[-0.03em] text-[#222222]">
                    {intake.auth.loginHeading}
                  </h1>
                  <p className="mt-4 text-center text-[15px] font-medium text-black/55">
                    {intake.auth.signedInAs} <span className="font-semibold text-[#222222]">{signedInEmail}</span>
                  </p>
                  {authError ? <p className="mt-3 text-center text-[13px] font-medium text-[#a81d12]">{authError}</p> : null}
                  <button
                    type="button"
                    onClick={() => {
                      void fetch("/api/auth/me", { cache: "no-store" })
                        .then(async (res) => {
                          if (res.ok) {
                            const user = (await res.json()) as { hasCase?: boolean };
                            if (user.hasCase) {
                              window.location.replace("/care");
                              return;
                            }
                          }
                          finishIdentityAuth();
                        })
                        .catch(() => finishIdentityAuth());
                    }}
                    className="mt-6 flex h-12 w-full items-center justify-center rounded-lg bg-[#111111] text-[16px] font-semibold text-white"
                  >
                    {intake.auth.continueAs}
                  </button>
                </div>
              ) : authStage === "code" ? (
                <div className="mx-auto mt-6 flex w-full max-w-[430px] flex-1 flex-col">
                  <h1 className="text-center text-[22px] font-semibold leading-[1.2] tracking-[-0.03em] text-[#222222]">
                    {intake.auth.confirmTitle}
                  </h1>
                  <p className="mx-auto mt-2 max-w-[36ch] text-center text-[15px] leading-[1.4] text-[#6a6a6a]">
                    {intake.auth.codeSent(authDestination)}
                  </p>
                  <div className="relative mx-auto mt-8 h-[64px] w-full max-w-[280px] rounded-xl border border-[#222222]">
                    <div className="pointer-events-none flex h-full items-center justify-center gap-3 text-[22px] font-medium text-[#222222]" aria-hidden="true">
                      {Array.from({ length: 6 }, (_, index) => (
                        <span key={index} className={`relative inline-flex w-[18px] justify-center ${authCode[index] ? "" : "text-[#b0b0b0]"}`}>
                          {authCode.length < 6 && index === authCode.length ? (
                            <span className="auth-code-caret absolute left-0 top-1/2 -translate-y-1/2" />
                          ) : null}
                          {authCode[index] ?? "–"}
                        </span>
                      ))}
                    </div>
                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      autoFocus
                      value={authCode}
                      aria-label={intake.auth.confirmTitle}
                      onChange={(event) => {
                        const next = event.target.value.replace(/\D/g, "").slice(0, 6);
                        setAuthCode(next);
                        setAuthError("");
                        if (next.length === 6) void handleVerifyLoginCode(next);
                      }}
                      className="absolute inset-0 cursor-text bg-transparent text-transparent caret-transparent outline-none"
                    />
                  </div>
                  {authError ? <p className="mt-3 text-center text-[13px] font-medium text-[#a81d12]">{authError}</p> : null}
                  {authBusy ? (
                    <div className="mt-6 flex h-12 w-full items-center justify-center rounded-lg bg-[#f2f2f2]" aria-hidden="true">
                      <span className="auth-send-dots">
                        <span />
                        <span />
                        <span />
                      </span>
                    </div>
                  ) : (
                    <p className="mt-6 text-center text-[15px] text-[#222222]">
                      {intake.auth.didntGet}{" "}
                      <button type="button" onClick={() => void handleSendLoginCode()} className="font-semibold underline underline-offset-[3px]">
                        {intake.auth.resendCode}
                      </button>
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthStage("identifier");
                      setAuthCode("");
                      setAuthError("");
                    }}
                    className="mt-auto flex h-12 w-full items-center justify-center rounded-lg bg-[#f2f2f2] text-[16px] font-semibold text-[#222222]"
                  >
                    {intake.auth.tryAnotherWay}
                  </button>
                </div>
              ) : (
                <form
                  className="mx-auto w-full max-w-[430px]"
                  onSubmit={(event) => {
                    event.preventDefault();
                    void handleSendLoginCode();
                  }}
                >
                  <h1 className="text-center text-[22px] font-semibold leading-[1.2] tracking-[-0.03em] text-[#222222]">
                    {intake.auth.loginHeading}
                  </h1>
                  <input
                    type="text"
                    autoComplete="username"
                    value={authIdentifier}
                    onChange={(event) => {
                      setAuthIdentifier(event.target.value);
                      setAuthError("");
                    }}
                    placeholder={intake.auth.identifierPlaceholder}
                    className="mt-6 h-14 w-full rounded-xl border border-[#222222] bg-white px-4 text-[16px] text-[#222222] outline-none placeholder:text-[#8c8c8c]"
                  />
                  <p className="mt-3 text-[13px] leading-[1.45] text-[#6a6a6a]">
                    {intake.auth.codeNotice}{" "}
                    <Link href="/privacy" className="font-semibold text-[#222222] underline underline-offset-[3px]">
                      {intake.auth.privacyPolicy}
                    </Link>
                  </p>
                  {authError ? <p className="mt-3 text-[13px] font-medium text-[#a81d12]">{authError}</p> : null}
                  <button
                    type="submit"
                    disabled={authBusy}
                    className={`mt-4 flex h-12 w-full items-center justify-center rounded-lg text-[16px] font-semibold ${
                      authBusy ? "bg-[#f2f2f2]" : "bg-[#111111] text-white"
                    }`}
                  >
                    {authBusy ? (
                      <span className="auth-send-dots" aria-label={intake.auth.continueAs}>
                        <span />
                        <span />
                        <span />
                      </span>
                    ) : (
                      intake.auth.continueAs
                    )}
                  </button>
                  <div className="mt-4 flex items-center gap-3 text-[14px] text-[#717171]">
                    <span className="h-px flex-1 bg-[#dddddd]" />
                    <span>{intake.shipping.or}</span>
                    <span className="h-px flex-1 bg-[#dddddd]" />
                  </div>
                  <div className="mt-4 flex items-center justify-center gap-4">
                    <button
                      type="button"
                      disabled={authBusy}
                      onClick={() => void handleGoogleSignIn()}
                      aria-label={intake.auth.google}
                      className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#b0b0b0] bg-white disabled:opacity-50"
                    >
                      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                        <path fill="#4285F4" d="M21.6 12.23c0-.68-.06-1.33-.18-1.95H12v3.69h5.39a4.6 4.6 0 0 1-2 3.02v2.5h3.24c1.9-1.75 2.97-4.32 2.97-7.26Z" />
                        <path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.44l-3.24-2.5c-.9.6-2.05.96-3.38.96-2.6 0-4.81-1.75-5.6-4.1H3.05v2.58A10 10 0 0 0 12 22Z" />
                        <path fill="#FBBC05" d="M6.4 13.92A5.98 5.98 0 0 1 6.08 12c0-.67.12-1.32.32-1.92V7.5H3.05A10 10 0 0 0 2 12c0 1.61.39 3.14 1.05 4.5l3.35-2.58Z" />
                        <path fill="#EA4335" d="M12 5.98c1.47 0 2.78.5 3.82 1.48l2.87-2.87C16.95 2.97 14.7 2 12 2A10 10 0 0 0 3.05 7.5l3.35 2.58c.79-2.35 3-4.1 5.6-4.1Z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      disabled={authBusy}
                      onClick={() => setAuthError(intake.auth.comingSoon)}
                      aria-label={intake.auth.apple}
                      className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#b0b0b0] bg-white disabled:opacity-50"
                    >
                      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                        <path
                          fill="#111111"
                          d="M16.7 12.6c0-2.1 1.7-3.1 1.8-3.2-1-1.4-2.5-1.6-3-1.7-1.3-.1-2.5.7-3.1.7s-1.6-.7-2.7-.7c-1.4 0-2.7.8-3.4 2.1-1.5 2.5-.4 6.3 1 8.3.7 1 1.6 2.1 2.7 2.1 1.1 0 1.5-.7 2.8-.7s1.6.7 2.8.7 1.9-1 2.6-2c.8-1.2 1.2-2.3 1.2-2.4-.1 0-2.3-.9-2.3-3.2ZM15 6.8c.6-.7 1-1.7.9-2.7-1 .1-2.1.6-2.8 1.4-.6.7-1.1 1.7-.9 2.6 1 .1 2.1-.5 2.8-1.3Z"
                        />
                      </svg>
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : isLocationStep ? (
            <div className="mx-auto flex min-h-[580px] w-full max-w-[560px] flex-col items-start pt-3">
              <div className="w-full">
                <h1 className="w-full font-title text-[22px] font-medium leading-[1.2] tracking-[-0.03em] text-[#2b2a28] sm:text-[42px] sm:leading-[1.02] sm:tracking-[-0.07em]">
                  {intake.location.title}
                </h1>
                <p className="mt-4 max-w-[40ch] text-[16px] font-medium leading-[1.45] tracking-[-0.02em] text-black/52 sm:text-[17px]">
                  {intake.location.subtitle}
                </p>

                <div className="relative mx-auto mt-8 w-full">
                  <div
                    className={`rounded-[18px] p-[1.5px] shadow-[0_10px_26px_rgba(0,0,0,0.02)] backdrop-blur-[2px] ${
                      selectedCity
                        ? "bg-gradient-to-r from-[#5f7f4f] via-[#8ea57a] to-[#4b6942]"
                        : "border border-black/10 bg-white/74"
                    }`}
                  >
                    <div className="flex min-h-[48px] items-center rounded-[17px] bg-[#fffef9] px-5 sm:min-h-[56px] sm:px-6">
                      <input
                        type="text"
                        value={locationQuery}
                        onChange={(event) => handleLocationQueryChange(event.target.value)}
                        onFocus={() => {
                          if (!selectedCity) {
                            setIsLocationDropdownOpen(true);
                          }
                        }}
                        onBlur={() => {
                          window.setTimeout(() => {
                            setIsLocationDropdownOpen(false);
                          }, 120);
                        }}
                        placeholder={intake.location.placeholder}
                        className="w-full bg-transparent text-[18px] font-medium tracking-[-0.03em] text-[#262522] outline-none placeholder:text-black/28"
                      />
                    </div>
                  </div>

                  {isLocationDropdownOpen && filteredCities.length > 0 ? (
                    <div className="absolute left-0 right-0 top-[calc(100%+10px)] z-20 overflow-hidden rounded-[18px] border border-black/10 bg-[#fffef9] shadow-[0_18px_40px_rgba(0,0,0,0.08)]">
                      <div className="max-h-[280px] overflow-y-auto py-2">
                        {filteredCities.map((city) => (
                          <button
                            key={city}
                            type="button"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => handleCitySelect(city)}
                            className="flex w-full items-center px-5 py-3 text-left text-[16px] font-medium tracking-[-0.02em] text-[#262522] transition-colors hover:bg-[#f3efe7]"
                          >
                            {city}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>

                <button
                  type="button"
                  onClick={() => setHasAcceptedLocationConsent((currentValue) => !currentValue)}
                  className="mt-5 flex w-full items-start gap-4 text-left"
                >
                  <span
                    className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border-[1.5px] transition-colors ${
                      hasAcceptedLocationConsent ? "border-[#b77a61] bg-[#b77a61] text-white" : "border-[#b77a61] bg-white/70 text-transparent"
                    }`}
                    aria-hidden="true"
                  >
                    <svg viewBox="0 0 20 20" fill="none" className="h-3 w-3">
                      <path d="M5.5 10.25 8.5 13.25 14.5 6.75" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span className="text-[14px] font-medium leading-[1.45] tracking-[-0.02em] text-[#2b2a28]/82">
                    {intake.location.consent.beforeTerms}
                    <span className="underline underline-offset-[3px]">{intake.location.consent.terms}</span>
                    {intake.location.consent.beforeTelehealth}
                    <span className="underline underline-offset-[3px]">{intake.location.consent.telehealth}</span>
                    {intake.location.consent.beforePrivacy}
                    <span className="underline underline-offset-[3px]">{intake.location.consent.privacy}</span>
                    {intake.location.consent.after}
                  </span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleLocationContinueClick}
                disabled={!canContinueLocation}
                className={`mt-8 w-full rounded-full px-5 py-3 text-[15px] font-medium tracking-[-0.03em] transition-colors sm:mt-[56px] sm:px-6 sm:py-3.5 sm:text-[16px] ${
                  canContinueLocation ? "cursor-pointer bg-[#11110f] text-white" : "cursor-default bg-black/10 text-black/30"
                }`}
              >
                {isLocationLoading ? (
                  <span className="flex items-center justify-center gap-3">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" aria-hidden="true" />
                    <span className="sr-only">Loading location options</span>
                  </span>
                ) : isLocationReady ? (
                  intake.continue
                ) : (
                  intake.continue
                )}
              </button>
            </div>
          ) : isPhotoCheckStep || isPostCameraInterstitialStep || isPreAuthInterstitialStep || isFinalReviewInterstitialStep || isNextStepsInterstitialStep || isRecommendationInterstitialStep || isShippingInfoStep ? (
            <div className={`w-full min-w-0 transition-opacity duration-150 ease-out ${isFading ? "opacity-0" : "opacity-100"} ${isTypedPauseStep || isFinalReviewInterstitialStep ? "max-w-[560px]" : "max-w-[700px]"}`}>
              <div
                className={`flex w-full min-w-0 flex-col gap-6 ${
                  isFinalReviewInterstitialStep || isRecommendationInterstitialStep || isShippingInfoStep ? "pb-0" : "pb-2"
                } ${
                  isRecommendationInterstitialStep || isShippingInfoStep
                    ? "items-stretch"
                    : "items-center gap-8 sm:gap-16"
                }`}
              >
                <div className={`min-w-0 ${isRecommendationInterstitialStep || isShippingInfoStep ? "mx-auto w-full" : isTypedPauseStep ? "w-max max-w-full" : isFinalReviewInterstitialStep ? "mx-auto flex w-full max-w-[29em] flex-col items-center" : "mx-auto w-full max-w-[34rem]"}`}>
                  <div
                    className={`space-y-4 sm:space-y-10 ${isFinalReviewInterstitialStep ? "w-full text-center" : "text-left"}`}
                  >
                    {isShippingInfoStep ? (
                      <div className="mx-auto w-full max-w-[520px]">
                        <div className="rounded-[28px] bg-white px-8 pb-6 pt-8 shadow-[0_18px_50px_rgba(40,50,90,0.08)] sm:px-10 sm:pb-7 sm:pt-9">
                          <p className="text-[14px] font-medium text-[#6b6b6b]">
                            {authMode === "login" ? intake.shipping.signIn : intake.shipping.eyebrow}
                          </p>
                          <h1 className="mt-1 text-left text-[38px] font-semibold leading-[1.15] tracking-[-0.03em] text-[#111111]">
                            {authMode === "login" ? intake.shipping.loginTitle : stepTitle}
                          </h1>
                          <div className="mt-[40px]">
                            <ShippingForm
                              formData={shippingFormData}
                              onChange={setShippingFormData}
                              password={authPassword}
                              onPasswordChange={setAuthPassword}
                              passwordVisible={authPasswordVisible}
                              onTogglePassword={() => setAuthPasswordVisible((current) => !current)}
                              mode={authMode}
                            />
                          </div>

                          {authError ? <p className="mt-4 text-center text-[13px] font-medium text-[#a81d12]">{authError}</p> : null}
                          <button
                            type="button"
                            onClick={() => {
                              void (async () => {
                                const dateOfBirth = shippingFormData.dateOfBirth.trim();
                                const age = ageFromDateOfBirth(dateOfBirth);
                                const email = shippingFormData.email.trim();
                                if (age !== null) {
                                  setSelectedAnswers((current) => ({
                                    ...current,
                                    dateOfBirth,
                                    age: String(age),
                                    email,
                                  }));
                                }
                                if (!signedInEmail) {
                                  setAuthBusy(true);
                                  setAuthError("");
                                  try {
                                    const endpoint = authMode === "login" ? "/api/auth/login" : "/api/auth/signup";
                                    const res = await fetch(endpoint, {
                                      method: "POST",
                                      headers: { "Content-Type": "application/json" },
                                      body: JSON.stringify({
                                        email,
                                        password: authPassword,
                                        firstName: shippingFormData.firstName.trim(),
                                        lastName: shippingFormData.lastName.trim(),
                                      }),
                                    });
                                    const payload = (await res.json().catch(() => ({}))) as {
                                      error?: string;
                                      email?: string;
                                      hasCase?: boolean;
                                    };
                                    if (!res.ok) {
                                      setAuthError(payload.error || intake.shipping.emailRequired);
                                      return;
                                    }
                                    if (payload.hasCase) {
                                      window.location.replace("/care");
                                      return;
                                    }
                                    setSignedInEmail(payload.email || email);
                                  } catch {
                                    setAuthError(intake.shipping.emailRequired);
                                    return;
                                  } finally {
                                    setAuthBusy(false);
                                  }
                                }
                                advanceToStep(
                                  recommendationStepIndex >= 0 ? recommendationStepIndex : shippingInfoStepIndex + 1,
                                );
                              })();
                            }}
                            disabled={!canContinueDetails || authBusy}
                            className={`${authError ? "mt-3" : "mt-5"} w-full rounded-full px-6 py-3 text-[16px] font-semibold tracking-[-0.02em] transition-colors ${
                              canContinueDetails && !authBusy
                                ? "bg-[#11110f] text-white"
                                : "cursor-not-allowed bg-black/10 text-black/30"
                            }`}
                          >
                            {authBusy ? "…" : authMode === "login" ? intake.shipping.signIn : intake.shipping.createAccountCta}
                          </button>
                          <div className="my-3 flex items-center gap-3 text-[13px] text-[#8a8a8a]">
                            <span className="h-px flex-1 bg-[#e6e6e6]" />
                            <span>{intake.shipping.or}</span>
                            <span className="h-px flex-1 bg-[#e6e6e6]" />
                          </div>
                          <button
                            type="button"
                            disabled={authBusy}
                            onClick={() => {
                              void (async () => {
                                const dateOfBirth = shippingFormData.dateOfBirth.trim();
                                const age = ageFromDateOfBirth(dateOfBirth);
                                if (age !== null) {
                                  setSelectedAnswers((current) => ({
                                    ...current,
                                    dateOfBirth,
                                    age: String(age),
                                    email: shippingFormData.email.trim(),
                                  }));
                                }
                                setAuthBusy(true);
                                setAuthError("");
                                try {
                                  const user = await signInWithGoogle();
                                  if (user.hasCase) {
                                    window.location.replace("/care");
                                    return;
                                  }
                                  if (user.email) setSignedInEmail(user.email);
                                  advanceToStep(
                                    recommendationStepIndex >= 0 ? recommendationStepIndex : shippingInfoStepIndex + 1,
                                  );
                                } catch (error) {
                                  setAuthError(error instanceof Error ? error.message : intake.auth.google);
                                } finally {
                                  setAuthBusy(false);
                                }
                              })();
                            }}
                            className="flex w-full items-center justify-center gap-2.5 rounded-full border border-[#e6e6e6] bg-white px-6 py-3 text-[16px] font-semibold tracking-[-0.02em] text-[#1a1a1a] transition-colors hover:bg-[#fafafa] disabled:opacity-50"
                          >
                            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                              <path fill="#4285F4" d="M21.6 12.23c0-.68-.06-1.33-.18-1.95H12v3.69h5.39a4.6 4.6 0 0 1-2 3.02v2.5h3.24c1.9-1.75 2.97-4.32 2.97-7.26Z" />
                              <path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.44l-3.24-2.5c-.9.6-2.05.96-3.38.96-2.6 0-4.81-1.75-5.6-4.1H3.05v2.58A10 10 0 0 0 12 22Z" />
                              <path fill="#FBBC05" d="M6.4 13.92A5.98 5.98 0 0 1 6.08 12c0-.67.12-1.32.32-1.92V7.5H3.05A10 10 0 0 0 2 12c0 1.61.39 3.14 1.05 4.5l3.35-2.58Z" />
                              <path fill="#EA4335" d="M12 5.98c1.47 0 2.78.5 3.82 1.48l2.87-2.87C16.95 2.97 14.7 2 12 2A10 10 0 0 0 3.05 7.5l3.35 2.58c.79-2.35 3-4.1 5.6-4.1Z" />
                            </svg>
                            {intake.auth.google}
                          </button>
                          <p className="mt-3 text-center text-[12px] leading-[1.45] text-[#8a8a8a]">
                            {intake.shipping.legalBefore}
                            <Link href="/terms" className="underline underline-offset-[3px]">{intake.shipping.legalTerms}</Link>
                            {intake.shipping.legalAnd}
                            <Link href="/privacy" className="underline underline-offset-[3px]">{intake.shipping.legalPrivacy}</Link>{intake.shipping.legalAfter}
                          </p>
                        </div>

                        <p className="mt-3 text-center text-[14px] text-[#6b6b6b]">
                          {authMode === "login" ? intake.shipping.needAccount : intake.shipping.haveAccount}{" "}
                          <button
                            type="button"
                            onClick={() => {
                              setAuthMode((current) => (current === "login" ? "signup" : "login"));
                              setAuthError("");
                            }}
                            className="font-medium text-[#111] underline underline-offset-[3px]"
                          >
                            {authMode === "login" ? intake.shipping.createAccountLink : intake.shipping.signIn}
                          </button>
                        </p>
                      </div>
                    ) : null}
                    {isRecommendationInterstitialStep ? (
                      <div className={`mx-auto w-full max-w-[520px] transition-all duration-500 ${recommendationReveal ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}>
                        <div className="rounded-[28px] bg-white px-8 pb-6 pt-[25px] shadow-[0_18px_50px_rgba(40,50,90,0.08)] sm:px-10 sm:pb-6 sm:pt-[25px]">
                          <h1 className="text-left text-[38px] font-semibold leading-[1.15] tracking-[-0.03em] text-[#111111]">
                            {intake.recommend.title}
                          </h1>
                          <p className="mt-2 text-[14px] font-medium leading-[1.4] text-black/45">
                            {intake.recommend.titleSubtitle}
                          </p>

                          {recommendedTreatment && recommendedTreatment.type !== "review" ? (
                          <div className="mt-8 border-t border-black/[0.06] pt-4">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <h2 className="text-[20px] font-semibold leading-[1.2] tracking-[-0.03em] text-[#111111]">{recommendedTreatmentCopy?.title}</h2>
                                <p className="mt-1 text-[14px] font-medium leading-[1.4] text-black/50">{recommendedTreatmentCopy?.description}</p>
                              </div>
                              <img src={recommendedTreatment.imageSrc} alt="" className="h-14 w-14 rounded-full object-cover" />
                            </div>

                            <ul className="mt-4 space-y-2.5">
                              {intake.recommend.bullets.slice(0, 2).map((bullet) => (
                                <li key={bullet} className="flex items-start gap-2.5 text-[14px] font-medium leading-[1.4] text-[#2b2a28]">
                                  <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#5f7f4f]/12 text-[#5f7f4f]">
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                  </span>
                                  {bullet}
                                </li>
                              ))}
                            </ul>
                            <div className="mt-2 flex justify-end">
                              <button
                                type="button"
                                onClick={() => {
                                  closeDoctorPopup();
                                  setIsTreatmentInfoOpen(true);
                                }}
                                aria-expanded={isTreatmentInfoOpen}
                                className="text-[13px] font-semibold tracking-[-0.02em] text-[#c77e57] underline underline-offset-[3px]"
                              >
                                {intake.recommend.moreInfo}
                              </button>
                            </div>
                          </div>
                          ) : recommendedTreatment && recommendedTreatment.type === "review" ? (
                          <div className="mt-8 border-t border-black/[0.06] pt-4">
                            <div className="rounded-[16px] bg-[#fdf3da] px-4 py-4">
                              <h2 className="text-[18px] font-semibold tracking-[-0.03em] text-[#111111]">{recommendedTreatmentCopy?.title}</h2>
                              <p className="mt-1 text-[14px] font-medium leading-[1.4] text-black/60">{recommendedTreatmentCopy?.description}</p>
                            </div>
                          </div>
                          ) : null}

                          <div className="mt-5 border-t border-black/[0.06] pt-4">
                            <div className="flex w-full items-center gap-4 rounded-[22px] bg-[#faf7f2] px-5 py-3 text-left">
                              <div className="min-w-0 flex-1">
                                <p className="text-[20px] font-semibold leading-[1.15] tracking-[-0.03em] text-[#111111]">{intake.doctor.specialty}</p>
                                <p className="mt-2 text-[15px] font-medium tracking-[-0.02em] text-[#1a1a1a]">{assignedDoctor.fullName}</p>
                                <p className="mt-0.5 text-[13px] font-medium text-black/45">{intake.doctor.role}</p>
                              </div>
                              <img
                                src={assignedDoctor.imageSrc}
                                alt=""
                                className="h-16 w-16 shrink-0 rounded-full object-cover object-[center_18%] ring-2 ring-[#c77e57]/25"
                              />
                            </div>
                            {recommendedTreatment && recommendedTreatment.type !== "review" ? (
                            <div className="mt-5 flex items-end justify-between gap-4 border-t border-black/[0.06] pt-5">
                              <p className="text-[13px] font-medium leading-[1.35] text-black/45">{intake.recommend.chargeAfterApproval}</p>
                              <p className="shrink-0 text-[22px] font-semibold tracking-[-0.03em] text-[#111111]">
                                ₺750<span className="text-[14px] font-medium text-black/40"> / {intake.recommend.month}</span>
                              </p>
                            </div>
                            ) : null}
                          </div>

                          <p className="mt-6 text-[14px] font-medium leading-[1.4] text-black/45">
                            {intake.recommend.chargeReassurance}
                          </p>
                          <button
                            type="button"
                            onClick={handleRecommendationContinue}
                            disabled={isAdvancing}
                            className="mt-5 w-full rounded-full bg-[#11110f] px-6 py-3 text-[16px] font-semibold tracking-[-0.02em] text-white transition-colors disabled:opacity-70"
                          >
                            {intake.continue}
                          </button>
                        </div>
                      </div>
                    ) : null}
                    {isFinalReviewInterstitialStep && intakeSaveStatus !== "error" ? (
                      <div className="flex w-full items-center justify-center">
                        <svg
                          width="84"
                          height="84"
                          viewBox="0 0 132 132"
                          className="mx-auto block drop-shadow-sm"
                          aria-hidden="true"
                          focusable="false"
                        >
                          <circle cx="66" cy="66" r="60" fill="none" stroke="#9cc796" strokeWidth="6" />
                          <path
                            d="M40 68 L60 86 L96 50"
                            fill="none"
                            stroke="#5f7f4f"
                            strokeWidth="9"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeDasharray="180"
                            strokeDashoffset="180"
                          >
                            <animate attributeName="stroke-dashoffset" from="180" to="0" dur="0.8s" begin="0.15s" fill="freeze" />
                          </path>
                        </svg>
                      </div>
                    ) : null}
                    {!(isRecommendationInterstitialStep || isShippingInfoStep) ? (
                    <div className={isTypedPauseStep ? "w-max max-w-full" : "w-full min-w-0"}>
                      <p className={`${isTypedPauseStep ? "w-max max-w-full" : "w-full"} whitespace-pre-wrap ${isFinalReviewInterstitialStep ? "text-center" : "text-left"} font-title text-[clamp(1.375rem,0.95rem+2.8vw,2.625rem)] font-medium leading-[1.18] tracking-[-0.04em] text-[#c77e57]`}>
                        <FadeWords text={activeInterstitialTextBlocks[0] ?? ""} nowrap={isNextStepsInterstitialStep} />
                      </p>
                    </div>
                    ) : null}

                    {!(isRecommendationInterstitialStep || isShippingInfoStep) ? (
                    <div className={isTypedPauseStep ? "w-0 min-w-full" : "w-full min-w-0"}>
                      {isNextStepsInterstitialStep ? (
                        <div className="space-y-6 sm:space-y-8">
                          {intake.nextSteps.steps.map((step, stepIndex) => {
                            const headingDelay = interstitialBodyDelayMs + stepIndex * 2 * INTAKE_LINE_STAGGER_MS;
                            const stepNumber = String(stepIndex + 1).padStart(2, "0");
                            return (
                              <div key={step.title} className="flex items-start gap-3">
                                <span
                                  className="mt-[0.35em] w-6 shrink-0 text-[11px] font-medium tabular-nums tracking-[0.08em] text-[#c77e57]/40"
                                  aria-hidden="true"
                                  style={{
                                    animation: `intake-fade-from-bottom ${INTAKE_LINE_DURATION_MS}ms ease-out both`,
                                    animationDelay: `${headingDelay}ms`,
                                  }}
                                >
                                  {stepNumber}
                                </span>
                                <div className="min-w-0 flex-1">
                                  <p className="text-left text-[clamp(1.0625rem,0.92rem+1.1vw,1.5rem)] font-medium leading-[1.3] tracking-[-0.03em] text-[#c77e57]">
                                    <FadeLines text={step.title} delayMs={headingDelay} />
                                  </p>
                                  <p className="mt-1 text-left text-[clamp(0.9375rem,0.82rem+1.1vw,1.375rem)] font-medium leading-[1.45] tracking-[-0.03em] text-[#c77e57]/78">
                                    <FadeLines text={step.body} delayMs={headingDelay + INTAKE_LINE_STAGGER_MS} />
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                      <p
                        className={`w-full whitespace-pre-wrap break-words font-medium text-[#c77e57] ${
                          isFinalReviewInterstitialStep ? "text-center" : "text-left"
                        } ${
                          isPostCameraInterstitialStep
                            ? "text-[clamp(1.25rem,0.88rem+2.5vw,2.375rem)] leading-[1.22] tracking-[-0.04em]"
                            : "text-[clamp(0.9375rem,0.82rem+1.1vw,1.375rem)] leading-[1.45] tracking-[-0.03em]"
                        }`}
                      >
                        <FadeLines text={activeInterstitialTextBlocks[1] ?? ""} delayMs={interstitialBodyDelayMs} />
                      </p>
                      )}
                    </div>
                    ) : null}
                  </div>

                  {!isRecommendationInterstitialStep && !isShippingInfoStep ? (
                  <div className={`flex ${isFinalReviewInterstitialStep ? "mt-8 min-h-[56px] justify-center sm:mt-[40px]" : "mt-8 min-h-[56px] sm:mt-[56px] sm:min-h-[72px]"} ${isTypedPauseStep ? "w-0 min-w-full" : "w-full"} items-end`}>
                    {isTypedPauseStep ? (
                      <button
                        type="button"
                        onClick={isNextStepsInterstitialStep ? handleNextStepsInterstitialContinue : handlePreAuthInterstitialContinue}
                        disabled={!isInterstitialButtonVisible}
                        aria-hidden={!isInterstitialButtonVisible}
                        tabIndex={isInterstitialButtonVisible ? 0 : -1}
                        className={`w-full rounded-full px-5 py-3 text-[15px] font-medium tracking-[-0.03em] transition-all duration-300 sm:px-6 sm:py-3.5 sm:text-[16px] ${
                          isInterstitialButtonVisible
                            ? "translate-y-0 bg-[#11110f] text-white opacity-100"
                            : "translate-y-2 bg-black/10 text-black/30 opacity-0"
                        }`}
                      >
                        {interstitialPrimaryButtonLabel}
                      </button>
                    ) : isFinalReviewInterstitialStep ? (
                      intakeSaveStatus === "saved" ? (
                      <Link
                        href="/care"
                        className={`inline-flex w-auto rounded-full px-8 py-3 text-center text-[15px] font-medium tracking-[-0.03em] transition-all duration-300 sm:py-3.5 sm:text-[16px] ${
                          isInterstitialButtonVisible
                            ? "translate-y-0 bg-[#11110f] text-white opacity-100"
                            : "translate-y-2 bg-black/10 text-black/30 opacity-0"
                        }`}
                      >
                        {interstitialPrimaryButtonLabel}
                      </Link>
                      ) : (
                      <button
                        type="button"
                        onClick={() => {
                          if (intakeSaveStatus !== "error") return;
                          void persistCompletedIntake();
                        }}
                        disabled={intakeSaveStatus !== "error"}
                        aria-hidden={!isInterstitialButtonVisible}
                        tabIndex={isInterstitialButtonVisible ? 0 : -1}
                        className={`inline-flex w-auto rounded-full px-8 py-3 text-[15px] font-medium tracking-[-0.03em] transition-all duration-300 sm:py-3.5 sm:text-[16px] ${
                          isInterstitialButtonVisible
                            ? "translate-y-0 bg-[#11110f] text-white opacity-100"
                            : "translate-y-2 bg-black/10 text-black/30 opacity-0"
                        }`}
                      >
                        {interstitialPrimaryButtonLabel}
                      </button>
                      )
                    ) : (
                      <div className="flex w-full flex-col gap-3">
                        <button
                          type="button"
                          onClick={handlePhotoCheckContinue}
                          disabled={!isInterstitialButtonVisible}
                          aria-hidden={!isInterstitialButtonVisible}
                          tabIndex={isInterstitialButtonVisible ? 0 : -1}
                          className={`w-full rounded-full px-5 py-3 text-[15px] font-medium tracking-[-0.03em] transition-all duration-300 sm:px-6 sm:py-3.5 sm:text-[16px] ${
                            isInterstitialButtonVisible
                              ? "translate-y-0 bg-[#11110f] text-white opacity-100"
                              : "translate-y-2 bg-black/10 text-black/30 opacity-0"
                          }`}
                        >
                          {catalog.condition === "intimate-skin" ? intake.photoUpload : isPhotoCheckStep ? intake.photoCheckContinue : interstitialPrimaryButtonLabel}
                        </button>
                        {catalog.condition === "intimate-skin" ? (
                          <button
                            type="button"
                            onClick={() => {
                              const goalIndex = medicalStartIndex + medicalSteps.findIndex((step) => step.id === "is-goal");
                              if (goalIndex >= medicalStartIndex) advanceToStep(goalIndex);
                            }}
                            disabled={!isInterstitialButtonVisible}
                            className={`w-full rounded-full border border-black/12 bg-white px-5 py-3 text-[15px] font-medium tracking-[-0.03em] text-[#2b2a28] transition-all duration-300 sm:px-6 sm:py-3.5 sm:text-[16px] ${
                              isInterstitialButtonVisible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
                            }`}
                          >
                            {intake.photoSkip}
                          </button>
                        ) : null}
                      </div>
                    )}
                  </div>
                  ) : null}
                </div>
              </div>
            </div>
          ) : isCameraPrepStep ? (
            <div className={`w-full ${isShippingInfoStep ? "max-w-[980px]" : "max-w-[700px]"} transition-opacity duration-150 ease-out ${isFading ? "opacity-0" : "opacity-100"}`}>
              <div className="flex w-full min-w-0 flex-col items-center gap-8 pb-2 sm:gap-16">
                <div className="w-full min-w-0 max-w-[34rem] text-left">
                  <h1 className="font-title text-[clamp(1.375rem,0.95rem+2.8vw,2.625rem)] font-medium leading-[1.18] tracking-[-0.04em] text-[#c77e57]">
                    {catalog.condition === "intimate-skin" ? intake.cameraPrepIntimate.title : intake.cameraPrep.title}
                  </h1>

                  <div className="mt-6 space-y-4 text-left sm:mt-12 sm:space-y-7">
                    {cameraPrepPoints.map((prepPoint, index) => {
                      const isVisible = index < cameraPrepVisiblePointCount;

                      return (
                        <div
                          key={prepPoint}
                          className={`flex items-start gap-4 transition-all duration-500 ${
                            isVisible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
                          }`}
                        >
                          <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#7d9a68] via-[#6f8f5a] to-[#557546] text-white shadow-[0_6px_14px_rgba(95,127,79,0.2)]">
                            <svg viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
                              <path d="M5.5 10.25 8.5 13.25 14.5 6.75" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </span>
                          <p className="text-[clamp(1rem,0.9rem+1vw,1.5rem)] font-medium leading-[1.3] tracking-[-0.03em] text-[#2b2a28]">
                            {prepPoint}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-0 flex min-h-[72px] w-full max-w-[34rem] items-end">
                  <button
                    type="button"
                    onClick={handleCameraPrepContinue}
                    disabled={!isCameraPrepButtonVisible}
                    aria-hidden={!isCameraPrepButtonVisible}
                    tabIndex={isCameraPrepButtonVisible ? 0 : -1}
                    className={`w-full rounded-full px-5 py-3 text-[15px] font-medium tracking-[-0.03em] transition-all duration-300 sm:px-6 sm:py-3.5 sm:text-[16px] ${
                      isCameraPrepButtonVisible
                        ? "translate-y-0 bg-[#11110f] text-white opacity-100"
                        : "translate-y-2 bg-black/10 text-black/30 opacity-0"
                    }`}
                  >
                    {intake.cameraPrep.ready}
                  </button>
                </div>
              </div>
            </div>
          ) : isCameraCaptureStep ? (
            <div className={`mx-auto flex h-full min-h-0 w-full max-w-[1080px] flex-col items-center transition-opacity duration-150 ease-out ${isFading ? "opacity-0" : "opacity-100"}`}>
              <div className="flex min-h-0 w-full flex-1 flex-col items-center sm:flex-none">
                <div className="mx-auto flex min-h-0 w-full flex-1 overflow-hidden rounded-[24px] bg-[#ece4d7] shadow-[0_24px_60px_rgba(0,0,0,0.12)] sm:w-[60vw] sm:max-w-[820px] sm:flex-none sm:rounded-[30px]">
                  <div className="relative min-h-0 w-full flex-1 bg-[#e7ddcf] sm:h-[74vh] sm:min-h-[640px] sm:max-h-[900px] sm:flex-none">
                    {capturedCameraImage ? (
                      <img src={capturedCameraImage} alt="Captured face preview" className="h-full w-full object-cover" />
                    ) : (
                      <video
                        ref={cameraVideoRef}
                        autoPlay
                        playsInline
                        muted
                        style={{ transform: isCameraReady ? "scaleX(-1) scale(1.03)" : "scaleX(-1) scale(1)" }}
                        className={`h-full w-full object-cover transition-all duration-700 ${isCameraReady ? "opacity-100" : "opacity-0"}`}
                      />
                    )}

                    {capturedCameraImage ? (
                      null
                    ) : null}

                    {isCameraLoading ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#e7ddcf] text-center text-[#7a6c5d]">
                        <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#c77e57]/30 border-t-[#c77e57]" aria-hidden="true" />
                        <p className="px-6 text-[15px] font-medium tracking-[-0.02em]">{intake.camera.opening}</p>
                      </div>
                    ) : null}

                    {cameraError ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-[#e7ddcf] px-8 text-center">
                        <p className="max-w-[22rem] text-[15px] font-medium leading-[1.45] tracking-[-0.02em] text-[#7a6c5d]">
                          {cameraError === "Camera preview is not supported on this device or browser."
                            ? intake.camera.unsupported
                            : cameraError === "We couldn’t access your camera. Please allow camera access in your browser settings."
                              ? intake.camera.access
                              : cameraError === "We couldn’t capture your photo. Please try again."
                                ? intake.camera.captureFail
                                : cameraError}
                        </p>
                      </div>
                    ) : null}

                    <div className={`pointer-events-none absolute inset-0 z-[20] bg-white transition-opacity duration-100 ${isCameraCaptureFlashVisible ? "opacity-100" : "opacity-0"}`} />

                    <div className="pointer-events-none absolute inset-0 px-8 text-center">
                      {cameraCountdownValue !== null ? (
                        <div className="flex h-full -translate-y-12 items-center justify-center sm:-translate-y-14">
                          <div className="text-[50px] font-semibold tracking-[-0.06em] text-white sm:text-[61px]">
                            {cameraCountdownValue}
                          </div>
                        </div>
                      ) : null}

                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/48 via-black/18 to-transparent px-6 pb-6 pt-24">
                        <div className="mx-auto flex w-full max-w-[360px] flex-col items-center gap-4">
                          {cameraCapturePhase === "right" && !cameraError && !capturedCameraImage ? (
                            <div className="camera-down-arrow-flow flex items-center text-white/82 [filter:drop-shadow(0_2px_10px_rgba(0,0,0,0.24))]">
                              <svg viewBox="0 0 24 24" fill="currentColor" className="h-16 w-16 sm:h-32 sm:w-32" aria-hidden="true">
                                <path d="M11.25 4a.75.75 0 0 1 1.5 0v10.69l3.22-3.22a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 1 1 1.06-1.06l3.22 3.22V4Z" />
                              </svg>
                            </div>
                          ) : null}

                          {!cameraError && !capturedCameraImage ? (
                            <p className={`text-center text-[16px] font-medium tracking-[-0.02em] text-white transition-opacity duration-300 sm:text-[17px] ${
                              cameraCountdownValue !== null ? "opacity-0" : "opacity-100"
                            }`}>
                              {cameraInstructionText}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCameraCaptureContinue}
                  disabled={!canContinueCameraCapture}
                  className={`mx-auto mt-4 block w-full max-w-[360px] shrink-0 rounded-full px-5 py-3 text-[15px] font-medium tracking-[-0.03em] transition-colors sm:mt-6 sm:max-w-[380px] sm:px-6 sm:py-3.5 sm:text-[16px] ${
                    canContinueCameraCapture ? "bg-[#11110f] text-white" : "bg-black/10 text-black/30"
                  }`}
                >
                  {cameraPrimaryButtonLabel}
                </button>

                {capturedCameraImage ? (
                  <button
                    type="button"
                    onClick={handleCameraRetake}
                    className="mx-auto mt-3 block text-[14px] font-medium tracking-[-0.02em] text-black/68 underline underline-offset-[3px] transition-colors hover:text-black/82"
                  >
                    {intake.camera.retake}
                  </button>
                ) : null}
              </div>
            </div>
          ) : (
            <div
              key={`question-${currentStepIndex}`}
              className={`w-full max-w-[700px] ${isMedicalStep ? "pt-6 sm:pt-2" : ""} ${
                isFading ? "opacity-0 transition-opacity duration-150 ease-out" : "intake-enter-from-right"
              }`}
            >
                <>
                  <h1 className="w-full max-w-full font-title text-[22px] font-medium leading-[1.2] tracking-[-0.03em] text-[#2b2a28] sm:text-[42px] sm:leading-[1.02] sm:tracking-[-0.07em]">
                    {stepTitle}
                  </h1>
                  {stepDescription ? (
                    <p className="mt-2.5 text-[13px] font-medium leading-[1.45] tracking-[-0.02em] text-black/52 sm:mt-4 sm:text-[16px] lg:text-[17px]">
                      {stepDescription}
                    </p>
                  ) : null}

              <div className="mt-6 space-y-2.5 sm:mt-8 sm:space-y-3">
                {currentStep!.options.map((option) => {
                  const isSelected = isCheckboxSelectionStep
                    ? currentMultiSelections.includes(option)
                    : selectedOption === option;
                  const optionIcon =
                    currentStep?.id === "change-location" && hasChangeLocationIcon(option);
                  return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleOptionClick(option)}
                    className={`group block w-full cursor-pointer rounded-[16px] text-left transition duration-200 sm:rounded-[15px] sm:p-[1.5px] ${
                      isSelected
                        ? "border border-[#2b2a28] bg-white sm:border-0 sm:bg-gradient-to-r sm:from-[#5f7f4f] sm:via-[#8ea57a] sm:to-[#4b6942]"
                        : "border border-black/12 bg-white hover:bg-black/[0.02] sm:border-0 sm:bg-black/10 sm:hover:bg-black/14"
                    }`}
                  >
                    <span
                      className={`flex min-h-[56px] w-full items-center gap-3 rounded-[15px] px-4 py-3.5 text-left text-[14px] font-medium leading-[1.35] tracking-[-0.02em] text-[#1a1a1a] sm:min-h-[68px] sm:gap-3.5 sm:rounded-[14px] sm:px-5 sm:py-4.5 sm:text-[16px] sm:tracking-[-0.03em] sm:text-[#262522] sm:shadow-[0_10px_26px_rgba(0,0,0,0.02)] sm:backdrop-blur-[2px] ${
                        optionIcon ? "min-h-[64px] sm:min-h-[80px]" : ""
                      } ${
                        isCheckboxSelectionStep ? "justify-between" : ""
                      } ${isSelected ? "sm:bg-[#fffef9]" : "sm:bg-white/74 sm:group-hover:bg-white/84"}`}
                    >
                      {optionIcon ? <ChangeLocationIcon option={option} /> : null}
                      <span className={optionIcon ? "flex-1" : undefined}>{intake.option(option)}</span>
                      {isCheckboxSelectionStep ? (
                        <span
                          className={`ml-4 flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] transition-colors ${
                            isSelected ? "bg-[#5f7f4f] text-white" : "bg-black/14 text-white"
                          }`}
                          aria-hidden="true"
                        >
                          <svg viewBox="0 0 20 20" fill="none" className="h-3 w-3">
                            <path d="M5.5 10.25 8.5 13.25 14.5 6.75" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                      ) : null}
                    </span>
                  </button>
                  );
                })}
              </div>

              {whyWeAskNote ? (
                <div className="mt-4 rounded-[22px] bg-[#fffef9] px-5 py-5 sm:mt-5 sm:px-6 sm:py-6">
                  <p className="text-[15px] font-semibold tracking-[-0.02em] text-[#c77e57]">{intake.whyWeAsk.title}</p>
                  <p className="mt-2 text-[14px] font-medium leading-[1.5] tracking-[-0.02em] text-black/52 sm:text-[15px]">
                    {whyWeAskNote.body}
                  </p>
                  <a
                    href={whyWeAskNote.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-block text-[14px] font-medium tracking-[-0.02em] text-[#2b2a28] underline underline-offset-[3px]"
                  >
                    {intake.whyWeAsk.source}
                  </a>
                </div>
              ) : null}

              {isCheckboxSelectionStep || shouldShowSelectedAnswerContinue ? (
                <div className="mt-7">
                  <button
                    type="button"
                    onClick={isCheckboxSelectionStep ? handleCheckboxStepContinue : handleSelectedAnswerContinue}
                    disabled={isCheckboxSelectionStep ? !hasMultiSelections : false}
                    className={`w-full rounded-full px-5 py-3 text-[15px] font-medium tracking-[-0.03em] transition-colors sm:px-6 sm:py-3.5 sm:text-[16px] ${
                      isCheckboxSelectionStep && !hasMultiSelections
                        ? "bg-black/10 text-black/30"
                        : "cursor-pointer bg-[#11110f] text-white"
                    }`}
                  >
                    {intake.continue}
                  </button>
                </div>
              ) : null}

              {isMedicalStep && (needsMedicalConditionsText || needsMedicationText || needsPreviousTreatmentsText || needsFinalNotesText) ? (
                <div className="mt-5 w-full space-y-5">
                  {needsMedicalConditionsText || needsMedicationText || needsPreviousTreatmentsText || needsFinalNotesText ? (
                    <div className="w-full">
                      {!needsFinalNotesText && !needsPreviousTreatmentsText ? (
                        <p className="text-[14px] font-medium tracking-[-0.02em] text-black/56">
                          {needsPreviousTreatmentsText
                            ? intake.followUp.triedBriefly
                            : intake.followUp.tellUs}
                        </p>
                      ) : null}
                      <textarea
                        value={currentMedicalTextValue}
                        onChange={(event) =>
                          setMedicalFollowUpText((currentValues) => ({
                            ...currentValues,
                            [currentStep!.id]: event.target.value,
                          }))
                        }
                        rows={4}
                        placeholder={needsFinalNotesText
                          ? intake.followUp.notesPlaceholder
                          : needsPreviousTreatmentsText
                            ? intake.followUp.treatmentsPlaceholder
                            : needsMedicationText
                              ? intake.followUp.medicationPlaceholder
                              : intake.followUp.conditionsPlaceholder}
                        className="mt-3 w-full resize-none rounded-[18px] border border-black/10 bg-[#fffef9] px-4 py-3 text-[15px] font-medium leading-[1.45] tracking-[-0.02em] text-[#262522] outline-none placeholder:text-black/28"
                      />
                    </div>
                  ) : null}

                  {needsPreviousTreatmentsText && false ? (
                    <div className="w-full space-y-5">
                      <div ref={treatmentTypesDropdownRef} className="w-full">
                        <p className="text-[14px] font-medium tracking-[-0.02em] text-black/56">{intake.followUp.typesTried}</p>
                        <div className="mt-3 overflow-hidden rounded-[22px] border border-black/10 bg-white/72 shadow-[0_10px_26px_rgba(0,0,0,0.02)] backdrop-blur-[2px]">
                          <button
                            type="button"
                            onClick={() => setIsTreatmentTypesDropdownOpen((currentValue) => !currentValue)}
                            className="flex min-h-[48px] w-full items-center justify-between gap-4 bg-[#fffef9] px-5 text-left sm:min-h-[56px] sm:px-6"
                            aria-expanded={isTreatmentTypesDropdownOpen}
                          >
                            <span className="min-w-0 flex-1 truncate text-[16px] font-medium tracking-[-0.03em] text-[#262522]">{treatmentSelectionSummary}</span>
                            <svg
                              viewBox="0 0 20 20"
                              fill="none"
                              className={`h-5 w-5 shrink-0 text-black/48 transition-transform duration-200 ${isTreatmentTypesDropdownOpen ? "rotate-180" : "rotate-0"}`}
                              aria-hidden="true"
                            >
                              <path d="M5.5 7.75 10 12.25l4.5-4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>

                          {isTreatmentTypesDropdownOpen ? (
                            <div className="border-t border-black/8">
                              {treatmentDetailOptions.map((detailOption) => {
                                const detailKey = detailOption.toLocaleLowerCase("en");
                                const isSelected = Boolean(treatmentSelections[detailKey]);

                                return (
                                  <button
                                    key={detailOption}
                                    type="button"
                                    onClick={() =>
                                      setTreatmentSelections((currentSelections) => ({
                                        ...currentSelections,
                                        [detailKey]: !currentSelections[detailKey],
                                      }))
                                    }
                                    className="flex w-full items-center justify-between gap-4 bg-transparent px-5 py-4 text-left text-[#262522] transition-colors hover:bg-[#fbfaf5] sm:px-6"
                                  >
                                    <span className="text-[16px] font-medium leading-[1.35] tracking-[-0.03em]">{intake.option(detailOption)}</span>
                                    <span
                                      className={`ml-4 flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] transition-colors ${
                                        isSelected ? "bg-gradient-to-br from-[#c98c72] to-[#b77a61] text-white" : "border border-[#b77a61] bg-transparent text-transparent"
                                      }`}
                                      aria-hidden="true"
                                    >
                                      <svg viewBox="0 0 20 20" fill="none" className="h-3 w-3">
                                        <path d="M5.5 10.25 8.5 13.25 14.5 6.75" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                                      </svg>
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          ) : null}
                        </div>
                      </div>

                      {isOtherTreatmentSelected ? (
                        <div className="w-full">
                          <p className="text-[14px] font-medium tracking-[-0.02em] text-black/56">{intake.followUp.otherDetails}</p>
                          <input
                            type="text"
                            value={treatmentOtherDetail}
                            onChange={(event) => setTreatmentOtherDetail(event.target.value)}
                            placeholder={intake.followUp.otherPlaceholder}
                            className="mt-3 w-full rounded-[18px] border border-black/10 bg-[#fffef9] px-4 py-3 text-[15px] font-medium tracking-[-0.02em] text-[#262522] outline-none placeholder:text-black/28"
                          />
                        </div>
                      ) : null}

                      <div ref={treatmentSideEffectsDropdownRef} className="w-full">
                        <p className="text-[14px] font-medium tracking-[-0.02em] text-black/56">{intake.followUp.sideEffects}</p>
                        <div className="mt-3 overflow-hidden rounded-[22px] border border-black/10 bg-white/72 shadow-[0_10px_26px_rgba(0,0,0,0.02)] backdrop-blur-[2px]">
                          <button
                            type="button"
                            onClick={() => setIsTreatmentSideEffectsDropdownOpen((currentValue) => !currentValue)}
                            className="flex min-h-[48px] w-full items-center justify-between gap-4 bg-[#fffef9] px-5 text-left sm:min-h-[56px] sm:px-6"
                            aria-expanded={isTreatmentSideEffectsDropdownOpen}
                          >
                            <span className="min-w-0 flex-1 truncate text-[16px] font-medium tracking-[-0.03em] text-[#262522]">{treatmentSideEffectSummary}</span>
                            <svg
                              viewBox="0 0 20 20"
                              fill="none"
                              className={`h-5 w-5 shrink-0 text-black/48 transition-transform duration-200 ${isTreatmentSideEffectsDropdownOpen ? "rotate-180" : "rotate-0"}`}
                              aria-hidden="true"
                            >
                              <path d="M5.5 7.75 10 12.25l4.5-4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>

                          {isTreatmentSideEffectsDropdownOpen ? (
                            <div className="border-t border-black/8">
                              {sideEffectLevelOptions.map((sideEffectOption) => (
                                <button
                                  key={sideEffectOption}
                                  type="button"
                                  onClick={() => {
                                    setTreatmentSideEffectsLevel(sideEffectOption);
                                    setIsTreatmentSideEffectsDropdownOpen(false);
                                  }}
                                  className="flex w-full items-center bg-transparent px-5 py-4 text-left text-[#262522] transition-colors hover:bg-[#fbfaf5] sm:px-6"
                                >
                                  <span className="text-[16px] font-medium leading-[1.35] tracking-[-0.03em]">{intake.option(sideEffectOption)}</span>
                                </button>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ) : null}

                </div>
              ) : null}

              {currentStep?.id === "final-notes" ||
              (isMedicalStep && (needsMedicalConditionsText || needsMedicationText || needsPreviousTreatmentsText)) ? (
                <button
                  type="button"
                  onClick={handleMedicalFollowUpContinue}
                  disabled={!canContinueMedicalFollowUp}
                  className={`mt-5 w-full rounded-full px-5 py-3 text-[15px] font-medium tracking-[-0.03em] transition-colors sm:px-6 sm:py-3.5 sm:text-[16px] ${
                    canContinueMedicalFollowUp ? "bg-[#11110f] text-white" : "bg-black/10 text-black/30"
                  }`}
                >
                  {currentStep?.id === "final-notes" ? intake.submitIntake : intake.continue}
                </button>
              ) : null}
            </>
            </div>
          )}
        </section>
      </div>

      {isTreatmentInfoOpen ? (
        <>
          <button
            type="button"
            aria-label={intake.recommend.moreInfoClose}
            onClick={() => setIsTreatmentInfoOpen(false)}
            className="fixed inset-0 z-[82] bg-black/35"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="treatment-info-title"
            className="fixed inset-x-4 bottom-6 z-[83] mx-auto w-[calc(100%-2rem)] max-w-[440px] overflow-hidden rounded-[28px] border border-black/10 bg-white shadow-[0_24px_60px_rgba(0,0,0,0.2)] sm:inset-x-auto sm:bottom-10 sm:right-6 sm:w-[400px]"
          >
            <div className="flex items-start justify-between border-b border-black/8 bg-[#fbfaf5] px-5 py-4">
              <div>
                <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#848484]">{intake.recommend.moreInfo}</p>
                <h3 id="treatment-info-title" className="mt-1 text-[20px] font-semibold tracking-[-0.04em] text-black">
                  {recommendedTreatmentCopy?.title}
                </h3>
              </div>
              <button
                type="button"
                aria-label={intake.recommend.moreInfoClose}
                onClick={() => setIsTreatmentInfoOpen(false)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black text-white transition-colors hover:bg-[#1a1a1a]"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
                  <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="max-h-[min(70vh,520px)] space-y-5 overflow-y-auto px-5 py-5">
              <p className="text-[14px] font-medium leading-[1.45] text-black/55">{recommendedTreatmentCopy?.description}</p>
              <div>
                <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-[#848484]">{intake.recommend.moreInfoWhatTitle}</p>
                <p className="mt-2 text-[14px] font-medium leading-[1.5] text-[#2b2a28]/82">{intake.recommend.moreInfoWhat}</p>
              </div>
              <div>
                <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-[#848484]">{intake.recommend.moreInfoHowTitle}</p>
                <p className="mt-2 text-[14px] font-medium leading-[1.5] text-[#2b2a28]/82">{intake.recommend.moreInfoHow}</p>
              </div>
              <ul className="space-y-2.5">
                {intake.recommend.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-2.5 text-[14px] font-medium leading-[1.4] text-[#2b2a28]">
                    <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#5f7f4f]/12 text-[#5f7f4f]">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                    {bullet}
                  </li>
                ))}
              </ul>
              <div>
                <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-[#848484]">{intake.recommend.included}</p>
                <ul className="mt-2.5 space-y-2">
                  {intake.recommend.includedItems.map((item) => (
                    <li key={item} className="text-[14px] font-medium leading-[1.4] text-[#2b2a28]/82">{item}</li>
                  ))}
                </ul>
              </div>
              <p className="text-[13px] font-medium leading-[1.45] text-black/45">{intake.recommend.reviewNote}</p>
            </div>
          </div>
        </>
      ) : null}

      {isMedicalStep && !isShippingInfoStep && !isRecommendationInterstitialStep ? (
        <div className="fixed bottom-6 right-6 z-[60] flex items-end justify-end">
          {isDoctorAssignmentNoticeVisible && isFirstMedicalStep ? (
            <div
              role="status"
              className="flex max-w-[min(420px,calc(100vw-3rem))] items-center gap-3 rounded-[28px] border border-[#5f7f4f] bg-white px-3.5 py-3 shadow-[0_16px_40px_rgba(0,0,0,0.12)]"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#5f7f4f] text-white">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                  <path d="M20 6.5 9.5 17 4 11.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <p className="text-[15px] font-medium leading-[1.25] tracking-[-0.03em] text-[#1a1a1a]">
                <span className="font-semibold">{assignedDoctor.fullName}</span> {intake.doctor.assigned}
              </p>
            </div>
          ) : (
            <div
              aria-label={assignedDoctor.fullName}
              className="relative flex h-[63px] w-[63px] items-center justify-center overflow-hidden rounded-full border-2 border-white/80 bg-[#fbfaf5] shadow-[0_12px_30px_rgba(0,0,0,0.28)]"
            >
              <Image
                src={assignedDoctor.imageSrc}
                alt={assignedDoctor.fullName}
                fill
                sizes="63px"
                className="object-cover object-[center_18%]"
              />
            </div>
          )}
        </div>
      ) : null}

      {isDoctorMatchOpen && selectedCity ? (
        <DoctorMatchScreen
          district={selectedCity}
          selectedId={preferredDoctorId}
          onSelect={setPreferredDoctorId}
          onBack={() => setIsDoctorMatchOpen(false)}
          onContinue={() => {
            setHasConfirmedDoctorMatch(true);
            setIsDoctorMatchOpen(false);
            setReturnedStepIndexForContinue(null);
            setIsDoctorAssignmentNoticeVisible(true);
            setCurrentStepIndex(medicalStartIndex);
          }}
          copy={intake.doctorMatch}
        />
      ) : null}
    </main>
  );
}
