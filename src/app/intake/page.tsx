"use client";

import Image from "next/image";
import Link from "next/link";
import { type MouseEvent, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ShippingForm, type ShippingFormData } from "./shipping-form";
import { addStoredCase } from "../doctor/store";
import { buildCaseFromIntake, determineTreatmentRecommendation, type TreatmentRecommendation } from "../doctor/triage";

type IntakeStep = {
  id: string;
  title: string;
  description: string;
  options: string[];
};

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

const turkeyCities = [
  "Adana",
  "Adıyaman",
  "Afyonkarahisar",
  "Ağrı",
  "Aksaray",
  "Amasya",
  "Ankara",
  "Antakya",
  "Antalya",
  "Ardahan",
  "Artvin",
  "Aydın",
  "Balıkesir",
  "Bartın",
  "Batman",
  "Bayburt",
  "Bilecik",
  "Bingöl",
  "Bitlis",
  "Bolu",
  "Burdur",
  "Bursa",
  "Çanakkale",
  "Çankırı",
  "Çorum",
  "Denizli",
  "Diyarbakır",
  "Düzce",
  "Edirne",
  "Elazığ",
  "Erzincan",
  "Erzurum",
  "Eskişehir",
  "Gaziantep",
  "Giresun",
  "Gümüşhane",
  "Hakkâri",
  "Hatay",
  "Iğdır",
  "Isparta",
  "İstanbul",
  "İzmir",
  "Kahramanmaraş",
  "Karabük",
  "Karaman",
  "Kars",
  "Kastamonu",
  "Kayseri",
  "Kilis",
  "Kırıkkale",
  "Kırklareli",
  "Kırşehir",
  "Kocaeli",
  "Konya",
  "Kütahya",
  "Malatya",
  "Manisa",
  "Mardin",
  "Mersin",
  "Muğla",
  "Muş",
  "Nevşehir",
  "Niğde",
  "Ordu",
  "Osmaniye",
  "Rize",
  "Sakarya",
  "Samsun",
  "Siirt",
  "Sinop",
  "Sivas",
  "Şanlıurfa",
  "Şırnak",
  "Tekirdağ",
  "Tokat",
  "Trabzon",
  "Tunceli",
  "Uşak",
  "Van",
  "Yalova",
  "Yozgat",
  "Zonguldak",
];

const intakeSteps: IntakeStep[] = [
  {
    id: "current-situation",
    title: "What made you start today?",
    description: "Choose the option that feels closest to your experience.",
    options: [
      "My hairline has changed",
      "I’m seeing more thinning or shedding",
      "I want clarity before it progresses",
      "I’m not sure yet",
    ],
  },
  {
    id: "change-location",
    title: "Where are you noticing changes?",
    description: "Choose the option that feels closest to your experience.",
    options: ["Hairline / temples", "Crown", "Overall thinning", "More shedding than usual", "Patchy or unusual areas", "Not sure"],
  },
  {
    id: "timeline",
    title: "How long have you noticed this?",
    description: "Choose the option that feels closest to your experience.",
    options: ["Less than 3 months", "3–6 months", "6–12 months", "1–3 years", "More than 3 years"],
  },
  {
    id: "clarity",
    title: "What would you like more clarity on?",
    description: "Choose the option that feels closest to your experience.",
    options: ["Whether this looks normal", "What options might fit my situation", "Whether I should act now or wait", "What a physician may recommend", "I’m not sure yet"],
  },
  {
    id: "primary-goal",
    title: "What is your primary goal?",
    description: "Choose the option that feels closest to your experience.",
    options: [
      "I want to prevent further hair loss",
      "I want to improve hair density or regrowth",
      "I want both prevention and regrowth",
      "I'm not sure yet",
    ],
  },
];

const medicalSteps: IntakeStep[] = [
  {
    id: "progression",
    title: "How has your hair loss changed over time?",
    description: "Choose the option that feels closest to your experience.",
    options: [
      "Slow and steady over years",
      "Gradual over months",
      "Comes and goes",
      "Sudden increase in shedding",
      "Not sure",
    ],
  },
  {
    id: "symptoms",
    title: "Are you experiencing any scalp symptoms?",
    description: "Choose the option that feels closest to your experience.",
    options: [
      "No symptoms",
      "Mild dandruff or dryness",
      "Itching",
      "Redness or irritation",
      "Pain, sores, or infection",
    ],
  },
  {
    id: "family-history",
    title: "Is there a family history of hair loss?",
    description: "Choose the option that feels closest to your experience.",
    options: [
      "Father or grandfather experienced hair loss",
      "Mother’s side experienced hair loss",
      "Some family thinning",
      "No known family history",
      "Not sure",
    ],
  },
  {
    id: "medical-conditions",
    title: "Do you currently have any ongoing medical conditions?",
    description: "Choose the option that feels closest to your experience.",
    options: [
      "No known conditions",
      "Yes — stable or managed conditions",
      "Yes — ongoing concerns I’d like to mention",
    ],
  },
  {
    id: "medications",
    title: "Are you currently taking any medications or supplements?",
    description: "Choose the option that feels closest to your experience.",
    options: ["No", "Yes"],
  },
  {
    id: "photo-check",
    title: "",
    description: "",
    options: [],
  },
  {
    id: "camera-prep",
    title: "",
    description: "",
    options: [],
  },
  {
    id: "camera-capture",
    title: "",
    description: "",
    options: [],
  },
  {
    id: "post-camera-interstitial",
    title: "",
    description: "",
    options: [],
  },
  {
    id: "recent-changes",
    title: "Have there been any recent changes that may be relevant?",
    description: "Choose the option that feels closest to your experience.",
    options: [
      "Major stress",
      "Illness or fever",
      "Weight or diet change",
      "New medication or supplement",
      "None of these",
      "Not sure",
    ],
  },
  {
    id: "previous-hair-loss-treatments",
    title: "Have you tried anything for your hair loss before?",
    description: "Choose the option that feels closest to your experience.",
    options: ["No", "Yes"],
  },
  {
    id: "final-notes",
    title: "Is there anything else you’d like the physician to know?",
    description: "",
    options: ["No", "Yes"],
  },
  {
    id: "next-steps",
    title: "",
    description: "",
    options: [],
  },
  {
    id: "shipping-info",
    title: "Confirm your delivery details",
    description: "If treatment is approved, we’ll use these details to prepare your treatment for discreet delivery in plain, unbranded packaging.",
    options: [],
  },
  {
    id: "recommendation-interstitial",
    title: "",
    description: "",
    options: [],
  },
  {
    id: "payment-method",
    title: "Select payment method",
    description: "Add a payment method now. You won’t be charged unless treatment is approved by your physician.",
    options: [],
  },
  {
    id: "review-submit-interstitial",
    title: "",
    description: "",
    options: [],
  },
  {
    id: "next-steps-legacy",
    title: "",
    description: "",
    options: [],
  },
];

const assignedDoctor = {
  name: "Dr. Emre Kaya",
  role: "Licensed physician",
  imageSrc: "/why_hiros_doctors.png",
  intro: "Assigned to review your medical intake and help guide the next appropriate step based on the answers you share.",
  details: [
    "Focused on structured hair-loss intake review",
    "Reviews symptom pattern, medical history, and treatment context",
    "Helps determine the next appropriate physician-guided step",
  ],
};

const treatmentDetailOptions = ["Topical", "Oral", "Supplements", "Procedures", "Other"];
const sideEffectLevelOptions = ["None", "Mild", "Moderate", "Significant"];
const photoCheckTextBlocks = [
  "Your physician will now\nneed a quick visual check\nto better understand\nyour hair loss.",
  "Your photos are private and only visible\nto your assigned physician.",
];
const totalPhotoCheckCharacters = photoCheckTextBlocks.reduce((totalCount, textBlock) => totalCount + textBlock.length, 0);
const postCameraInterstitialTextBlocks = ["That’s it.", "Let’s answer a few more\nquestions to complete\nyour intake."];
const totalPostCameraInterstitialCharacters = postCameraInterstitialTextBlocks.reduce((totalCount, textBlock) => totalCount + textBlock.length, 0);
const finalReviewInterstitialTextBlocks = [
  "Your intake is complete.",
  "Your answers and photos have been\nsubmitted for physician review.",
];
const totalFinalReviewInterstitialCharacters = finalReviewInterstitialTextBlocks.reduce((totalCount, textBlock) => totalCount + textBlock.length, 0);
const preAuthInterstitialTextBlocks = [
  "You’re doing the right\nthing by checking early.",
  "Hair loss can have different causes.\n\nThe next part of your intake will continue\nunder the review of a licensed physician.",
];
const totalPreAuthInterstitialCharacters = preAuthInterstitialTextBlocks.reduce((totalCount, textBlock) => totalCount + textBlock.length, 0);
const cameraPrepPoints = [
  "Remove any hat or cap",
  "Stand in a well-lit area",
  "Pull your hair back so your hairline is visible",
];
const totalCameraPrepPoints = cameraPrepPoints.length;

export default function IntakePage() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [selectedGoalOptions, setSelectedGoalOptions] = useState<string[]>([]);
  const [returnedStepIndexForContinue, setReturnedStepIndexForContinue] = useState<number | null>(null);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const [matchingStage, setMatchingStage] = useState<"loading" | "success">("loading");
  const [photoCheckVisibleCharacterCount, setPhotoCheckVisibleCharacterCount] = useState(0);
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
  const [isDoctorPopupOpen, setIsDoctorPopupOpen] = useState(false);
  const [isDoctorPopupVisible, setIsDoctorPopupVisible] = useState(false);
  const [shouldShowDoctorPopupAbout, setShouldShowDoctorPopupAbout] = useState(false);
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
    streetAddress: "",
    aptSuite: "",
    city: "",
    province: "",
    postalCode: "",
    phone: "",
  });
  const [nextStepsTitleVisibleCount, setNextStepsTitleVisibleCount] = useState(0);
  const [nextStepsContainerIndex, setNextStepsContainerIndex] = useState(0);
  const [shippingRevealIndex, setShippingRevealIndex] = useState(0);
  const [recommendationReveal, setRecommendationReveal] = useState(false);
  const [shippingFlowStep, setShippingFlowStep] = useState<1 | 2>(1);
  const advanceTimeoutRef = useRef<number | null>(null);
  const fadeTimeoutRef = useRef<number | null>(null);
  const locationReadyTimeoutRef = useRef<number | null>(null);
  const matchingSuccessTimeoutRef = useRef<number | null>(null);
  const matchingCompleteTimeoutRef = useRef<number | null>(null);
  const doctorAssignmentNoticeTimeoutRef = useRef<number | null>(null);
  const doctorPopupAutoCloseTimeoutRef = useRef<number | null>(null);
  const doctorPopupFadeTimeoutRef = useRef<number | null>(null);
  const doctorPopupOpenTimeoutRef = useRef<number | null>(null);
  const shippingRevealTimeoutRef = useRef<number | null>(null);
  const recommendationRevealTimeoutRef = useRef<number | null>(null);
  const photoCheckRevealIntervalRef = useRef<number | null>(null);
  const photoCheckButtonTimeoutRef = useRef<number | null>(null);
  const nextStepsTitleIntervalRef = useRef<number | null>(null);
  const nextStepsContainerTimeoutRef = useRef<number | null>(null);
  const cameraReadyDelayTimeoutRef = useRef<number | null>(null);
  const cameraCountdownTimeoutRef = useRef<number | null>(null);
  const cameraCaptureFlashTimeoutRef = useRef<number | null>(null);
  const cameraDetectionIntervalRef = useRef<number | null>(null);
  const cameraStableDetectionCountRef = useRef(0);
  const cameraVideoRef = useRef<HTMLVideoElement | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const treatmentTypesDropdownRef = useRef<HTMLDivElement | null>(null);
  const treatmentSideEffectsDropdownRef = useRef<HTMLDivElement | null>(null);
  const preAuthInterstitialIndex = intakeSteps.length;
  const authStepIndex = preAuthInterstitialIndex + 1;
  const locationStepIndex = authStepIndex + 1;
  const matchingStepIndex = locationStepIndex + 1;
  const medicalStartIndex = matchingStepIndex + 1;
  const medicalEndIndex = medicalStartIndex + medicalSteps.length - 1;
  const photoCheckStepIndex = medicalStartIndex + medicalSteps.findIndex((step) => step.id === "photo-check");
  const finalReviewStepIndex = medicalStartIndex + medicalSteps.findIndex((step) => step.id === "review-submit-interstitial");
  const shippingInfoStepIndex = medicalStartIndex + medicalSteps.findIndex((step) => step.id === "shipping-info");
  const paymentMethodStepIndex = medicalStartIndex + medicalSteps.findIndex((step) => step.id === "payment-method");
  const nextStepsStepIndex = medicalStartIndex + medicalSteps.findIndex((step) => step.id === "next-steps");
  const recommendationStepIndex = medicalStartIndex + medicalSteps.findIndex((step) => step.id === "recommendation-interstitial");
  const prePhotoCheckStepIndex = Math.max(photoCheckStepIndex - 1, medicalStartIndex);
  const isAuthStep = currentStepIndex === authStepIndex;
  const isLocationStep = currentStepIndex === locationStepIndex;
  const isMatchingStep = currentStepIndex === matchingStepIndex;
  const isMedicalStep = currentStepIndex >= medicalStartIndex && currentStepIndex <= medicalEndIndex;
  const isFirstMedicalStep = currentStepIndex === medicalStartIndex;
  const isPreAuthInterstitialStep = currentStepIndex === preAuthInterstitialIndex;
  const currentStep = currentStepIndex < intakeSteps.length ? intakeSteps[currentStepIndex] : isMedicalStep ? medicalSteps[currentStepIndex - medicalStartIndex] : null;
  const selectedOption = currentStep ? selectedAnswers[currentStep.id] ?? null : null;
  const currentMedicalStepNumber = isMedicalStep ? currentStepIndex - medicalStartIndex + 1 : 0;
  const medicalProgressPercentage = isMedicalStep ? (currentMedicalStepNumber / medicalSteps.length) * 100 : 0;
  // Discrete progress across finalized visible medical pages (exclude camera/interstitial screens)
  const progressBarStepIds = [
    "progression",
    "symptoms",
    "family-history",
    "medical-conditions",
    "medications",
    "recent-changes",
    "previous-hair-loss-treatments",
    "final-notes",
    "shipping-info",
    "recommendation-interstitial",
    "treatment-details",
    // placeholder to reserve final segment so shipping sits ~90%
    "progress-end",
  ];
  const isProgressBarStep = currentStep ? progressBarStepIds.includes(currentStep.id) : false;
  const currentProgressIndex = isProgressBarStep ? progressBarStepIds.indexOf(currentStep!.id) : -1;
  const discreteProgress = isProgressBarStep && currentProgressIndex >= 0
    ? ((currentProgressIndex + 1) / progressBarStepIds.length) * 100
    : 0;
  const displayedMedicalProgressBase = isMedicalStep ? discreteProgress : 0;
  const normalizedLocationQuery = locationQuery.trim().toLocaleLowerCase("tr");
  const filteredCities = normalizedLocationQuery
    ? turkeyCities.filter((city) => city.toLocaleLowerCase("tr").includes(normalizedLocationQuery)).slice(0, 8)
    : [];
  const canContinueLocation = Boolean(selectedCity && isLocationReady && hasAcceptedLocationConsent);
  const isCheckboxSelectionStep = currentStep?.id === "goal";
  const hasGoalSelections = selectedGoalOptions.length > 0;
  const currentMedicalTextValue = currentStep ? medicalFollowUpText[currentStep.id] ?? "" : "";
  const needsMedicalConditionsText = currentStep?.id === "medical-conditions" && selectedOption !== null && selectedOption !== "No known conditions";
  const needsMedicationText = currentStep?.id === "medications" && selectedOption === "Yes";
  const needsPreviousTreatmentsText = currentStep?.id === "previous-hair-loss-treatments" && selectedOption === "Yes";
  const needsFinalNotesText = currentStep?.id === "final-notes" && selectedOption === "Yes";
  const isMedicalDoctorIntroStep = currentStep?.id === "progression";
  const isFamilyHistoryStep = currentStep?.id === "family-history";
  const isPhotoCheckStep = currentStep?.id === "photo-check";
  const isCameraPrepStep = currentStep?.id === "camera-prep";
  const isCameraCaptureStep = currentStep?.id === "camera-capture";
  const isPostCameraInterstitialStep = currentStep?.id === "post-camera-interstitial";
  const isFinalReviewInterstitialStep = currentStep?.id === "review-submit-interstitial";
  const isNextStepsInterstitialStep = currentStep?.id === "next-steps";
  const isRecommendationInterstitialStep = currentStep?.id === "recommendation-interstitial";
  const isShippingInfoStep = currentStep?.id === "shipping-info";
  const isPaymentMethodStep = currentStep?.id === "payment-method";
  const isAgeStartedStep = currentStep?.id === "age-started";
  const displayedMedicalProgress = isMedicalStep ? (isPaymentMethodStep ? 95 : displayedMedicalProgressBase) : 0;
  const [hasAcknowledgedPhysicianReview, setHasAcknowledgedPhysicianReview] = useState(false);
  const [selectedTreatmentPlan, setSelectedTreatmentPlan] = useState<'primary' | 'alternative'>('primary');
  const [recommendedTreatment, setRecommendedTreatment] = useState<TreatmentRecommendation | null>(null);
  useEffect(() => {
    if (isRecommendationInterstitialStep) {
      setHasAcknowledgedPhysicianReview(false);
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
      });
      setRecommendedTreatment(recommendation);
    }
  }, [isRecommendationInterstitialStep, selectedAnswers, medicalFollowUpText, treatmentSelections, treatmentOtherDetail, treatmentSideEffectsLevel, selectedCity, shippingFormData.firstName, capturedPhotos]);
  useEffect(() => {
    if (isPaymentMethodStep) {
      setSelectedTreatmentPlan('primary');
      // Also determine treatment for payment step if not already set
      if (!recommendedTreatment) {
        const recommendation = determineTreatmentRecommendation({
          answers: selectedAnswers,
          followUpText: medicalFollowUpText,
          treatmentSelections,
          treatmentOtherDetail,
          sideEffectsLevel: treatmentSideEffectsLevel,
          city: selectedCity,
          firstName: shippingFormData.firstName,
          photos: Object.values(capturedPhotos),
        });
        setRecommendedTreatment(recommendation);
      }
    }
  }, [isPaymentMethodStep, recommendedTreatment, selectedAnswers, medicalFollowUpText, treatmentSelections, treatmentOtherDetail, treatmentSideEffectsLevel, selectedCity, shippingFormData.firstName, capturedPhotos]);

  // Persist the completed intake as a doctor-dashboard case (once).
  const hasSubmittedCaseRef = useRef(false);
  useEffect(() => {
    if (!isFinalReviewInterstitialStep || hasSubmittedCaseRef.current) {
      return;
    }
    hasSubmittedCaseRef.current = true;

    const newCase = buildCaseFromIntake({
      answers: selectedAnswers,
      followUpText: medicalFollowUpText,
      treatmentSelections,
      treatmentOtherDetail,
      sideEffectsLevel: treatmentSideEffectsLevel,
      city: selectedCity,
      firstName: shippingFormData.firstName,
      photos: Object.values(capturedPhotos),
    });
    addStoredCase(newCase);
  }, [
    isFinalReviewInterstitialStep,
    selectedAnswers,
    medicalFollowUpText,
    treatmentSelections,
    treatmentOtherDetail,
    treatmentSideEffectsLevel,
    selectedCity,
    shippingFormData.firstName,
    capturedPhotos,
  ]);
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

  // Ensure reveal animation also runs when entering the dedicated payment step
  useEffect(() => {
    if (!isPaymentMethodStep) return;
    setShippingRevealIndex(0);
    const timer = setTimeout(() => setShippingRevealIndex(1), 50);
    const timer2 = setTimeout(() => setShippingRevealIndex(2), 100);
    const timer3 = setTimeout(() => setShippingRevealIndex(3), 150);
    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [isPaymentMethodStep]);
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
  const treatmentSelectionSummary = selectedTreatmentLabels.length > 0 ? selectedTreatmentLabels.join(", ") : "Select all that apply";
  const treatmentSideEffectSummary = treatmentSideEffectsLevel ?? "Select an option";
  const cameraInstructionText =
    cameraCapturePhase === "front"
      ? "Align your face in the center"
      : "Tilt your head down slightly";
  const nextCameraCapturePhase = cameraCapturePhase === "front" ? "right" : null;
  const isReviewingIntermediateCameraCapture = nextCameraCapturePhase !== null && capturedCameraImage !== null;
  const canContinueCameraCapture = cameraError !== null || capturedCameraImage !== null || (isCameraReadyConfirmed && cameraCountdownValue === null);
  const cameraPrimaryButtonLabel =
    cameraError !== null
      ? "Continue"
      : capturedCameraImage !== null
        ? nextCameraCapturePhase === null
          ? "Continue"
          : "Looks good"
        : cameraCountdownValue !== null
          ? "Capturing..."
          : "Capture photo";
  const interstitialPrimaryButtonLabel = isFinalReviewInterstitialStep ? "Go to my profile" : "Continue";
  const isInterstitialButtonVisible = isFinalReviewInterstitialStep ? true : isPhotoCheckButtonVisible;
  const activeInterstitialTextBlocks = isPreAuthInterstitialStep
    ? preAuthInterstitialTextBlocks
    : isPostCameraInterstitialStep
      ? postCameraInterstitialTextBlocks
      : isFinalReviewInterstitialStep
        ? finalReviewInterstitialTextBlocks
        : photoCheckTextBlocks;
  const totalActiveInterstitialCharacters = isPreAuthInterstitialStep
    ? totalPreAuthInterstitialCharacters
    : isPostCameraInterstitialStep
      ? totalPostCameraInterstitialCharacters
      : isFinalReviewInterstitialStep
        ? totalFinalReviewInterstitialCharacters
        : totalPhotoCheckCharacters;
  let remainingInterstitialCharacters = photoCheckVisibleCharacterCount;
  const visibleInterstitialTextBlocks = activeInterstitialTextBlocks.map((textBlock) => {
    const visibleCharacterCount = Math.max(0, Math.min(textBlock.length, remainingInterstitialCharacters));
    remainingInterstitialCharacters -= textBlock.length;
    return textBlock.slice(0, visibleCharacterCount);
  });
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
      }

      if (fadeTimeoutRef.current) {
        window.clearTimeout(fadeTimeoutRef.current);
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

      if (nextStepsTitleIntervalRef.current) {
        window.clearInterval(nextStepsTitleIntervalRef.current);
      }

      if (nextStepsContainerTimeoutRef.current) {
        window.clearTimeout(nextStepsContainerTimeoutRef.current);
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

    if (isNextStepsInterstitialStep) {
      setNextStepsTitleVisibleCount(0);
      setNextStepsContainerIndex(0);

      const titleText = "Almost done, here's \nwhat happens next:";
      
      nextStepsTitleIntervalRef.current = window.setInterval(() => {
        setNextStepsTitleVisibleCount((currentCount) => {
          if (currentCount >= titleText.length) {
            if (nextStepsTitleIntervalRef.current) {
              window.clearInterval(nextStepsTitleIntervalRef.current);
              nextStepsTitleIntervalRef.current = null;
            }
            
            // Start revealing containers after title is complete
            const revealNextContainer = (index: number) => {
              nextStepsContainerTimeoutRef.current = window.setTimeout(() => {
                setNextStepsContainerIndex(index);
                if (index < 4) {
                  revealNextContainer(index + 1);
                }
              }, index === 1 ? 200 : 400);
            };
            revealNextContainer(1);
            
            return currentCount;
          }
          return currentCount + 1;
        });
      }, 30);
      
      return;
    }

    if (isPhotoCheckStep || isPostCameraInterstitialStep || isPreAuthInterstitialStep || isFinalReviewInterstitialStep) {
      setPhotoCheckVisibleCharacterCount(0);
      setIsPhotoCheckButtonVisible(false);
      setCameraPrepVisiblePointCount(0);
      setIsCameraPrepButtonVisible(false);

      photoCheckRevealIntervalRef.current = window.setInterval(() => {
        setPhotoCheckVisibleCharacterCount((currentCount) => {
          if (currentCount >= totalActiveInterstitialCharacters) {
            return currentCount;
          }

          const nextCount = currentCount + 1;

          if (nextCount >= totalActiveInterstitialCharacters) {
            if (photoCheckRevealIntervalRef.current) {
              window.clearInterval(photoCheckRevealIntervalRef.current);
              photoCheckRevealIntervalRef.current = null;
            }

            photoCheckButtonTimeoutRef.current = window.setTimeout(() => {
              if (isPhotoCheckStep || isPostCameraInterstitialStep || isPreAuthInterstitialStep) {
                setIsPhotoCheckButtonVisible(true);
              }

              photoCheckButtonTimeoutRef.current = null;
            }, 220);
          }

          return nextCount;
        });
      }, 32);
    } else {
      setPhotoCheckVisibleCharacterCount(0);
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

      if (nextStepsTitleIntervalRef.current) {
        window.clearInterval(nextStepsTitleIntervalRef.current);
        nextStepsTitleIntervalRef.current = null;
      }

      if (nextStepsContainerTimeoutRef.current) {
        window.clearTimeout(nextStepsContainerTimeoutRef.current);
        nextStepsContainerTimeoutRef.current = null;
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
  }, [currentStepIndex, isCameraPrepStep, isPhotoCheckStep, isPostCameraInterstitialStep, isPreAuthInterstitialStep, isFinalReviewInterstitialStep, isNextStepsInterstitialStep, medicalEndIndex, totalActiveInterstitialCharacters]);

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

  useEffect(() => {
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

    if (!isMedicalDoctorIntroStep) {
      setIsDoctorPopupVisible(false);
      setIsDoctorAssignmentNoticeVisible(false);
      return;
    }

    openDoctorPopup(false);

    doctorPopupAutoCloseTimeoutRef.current = window.setTimeout(() => {
      setIsDoctorPopupVisible(false);
      doctorPopupAutoCloseTimeoutRef.current = null;
    }, 3300);

    doctorPopupFadeTimeoutRef.current = window.setTimeout(() => {
      closeDoctorPopup();
      setIsDoctorAssignmentNoticeVisible(true);
      doctorPopupFadeTimeoutRef.current = null;
    }, 3520);

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
    if (!isMatchingStep) {
      clearMatchingTimeouts();
      setMatchingStage("loading");
      return;
    }

    setMatchingStage("loading");

    matchingSuccessTimeoutRef.current = window.setTimeout(() => {
      setMatchingStage("success");
      matchingSuccessTimeoutRef.current = null;
    }, 3500);

    matchingCompleteTimeoutRef.current = window.setTimeout(() => {
      setCurrentStepIndex(medicalStartIndex);
      setMatchingStage("loading");
      matchingCompleteTimeoutRef.current = null;
    }, 4300);

    return () => {
      clearMatchingTimeouts();
    };
  }, [isMatchingStep, medicalStartIndex]);

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

  const openDoctorPopup = (showAbout = true) => {
    if (doctorPopupOpenTimeoutRef.current) {
      window.clearTimeout(doctorPopupOpenTimeoutRef.current);
      doctorPopupOpenTimeoutRef.current = null;
    }

    setIsDoctorPopupOpen(true);
    setIsDoctorPopupVisible(false);
    setShouldShowDoctorPopupAbout(showAbout);
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
  };

  const advanceToStep = (nextStepIndex: number) => {
    setIsAdvancing(true);
    closeDoctorPopup();

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
        return recommendationStepIndex >= 0 ? recommendationStepIndex : (paymentMethodStepIndex >= 0 ? paymentMethodStepIndex : currentStepIndex + 1);
      }
      if (currentMedical?.id === "recommendation-interstitial") {
        return paymentMethodStepIndex >= 0 ? paymentMethodStepIndex : finalReviewStepIndex;
      }
      if (currentMedical?.id === "payment-method") {
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

    if (selectedOption === option && !needsMedicalConditionsText && !needsMedicationText && !needsPreviousTreatmentsText && !needsFinalNotesText) {
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

    if (currentStep.id === "previous-hair-loss-treatments" && option !== "Yes") {
      setTreatmentSelections({});
      setTreatmentOtherDetail("");
      setTreatmentSideEffectsLevel(null);
      setMedicalFollowUpText((currentValues) => ({ ...currentValues, [currentStep.id]: "" }));
    }

    if (currentStep.id === "final-notes" && option === "No") {
      setMedicalFollowUpText((currentValues) => ({ ...currentValues, [currentStep.id]: "" }));
    }

    if (
      (currentStep.id === "medical-conditions" && option !== "No known conditions") ||
      (currentStep.id === "medications" && option === "Yes") ||
      (currentStep.id === "previous-hair-loss-treatments" && option === "Yes") ||
      (currentStep.id === "final-notes" && option === "Yes")
    ) {
      setIsDoctorPopupOpen(false);
      return;
    }

    advanceToStep(nextStepIndex);
  };

  const handlePreAuthInterstitialContinue = () => {
    if (!isPreAuthInterstitialStep || !isPhotoCheckButtonVisible) {
      return;
    }

    advanceToStep(authStepIndex);
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
    if (!currentStep || currentStep.id !== "goal" || selectedGoalOptions.length === 0) {
      return;
    }

    setSelectedAnswers((currentAnswers) => ({
      ...currentAnswers,
      [currentStep.id]: selectedGoalOptions.join(" | "),
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

  const handleContinueWithEmailClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    setIsLocationDropdownOpen(Boolean(locationQuery.trim()));
    setReturnedStepIndexForContinue(null);
    setCurrentStepIndex(locationStepIndex);
  };

  const handleLocationQueryChange = (value: string) => {
    setLocationQuery(value);
    setIsLocationDropdownOpen(Boolean(value.trim()));

    if (selectedCity && value !== selectedCity) {
      setSelectedCity(null);
      resetLocationButtonState();
    }
  };

  const handleCitySelect = (city: string) => {
    setLocationQuery(city);
    setSelectedCity(city);
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
    setMatchingStage("loading");
    setReturnedStepIndexForContinue(null);
    setCurrentStepIndex(matchingStepIndex);
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
    setMatchingStage("loading");
    setIsLocationDropdownOpen(false);
    setCurrentStepIndex((currentIndex) => {
      // Custom previous mapping for the subflow
      if (isRecommendationInterstitialStep && shippingInfoStepIndex >= 0) {
        setReturnedStepIndexForContinue(shippingInfoStepIndex);
        return shippingInfoStepIndex;
      }

      const previousStepIndex =
        currentIndex === medicalStartIndex
          ? locationStepIndex
          : currentIndex === matchingStepIndex
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

  const visiblePhotoCheckTextBlocks = photoCheckTextBlocks.reduce<string[]>((visibleBlocks, textBlock) => {
    const revealedCharacterCount = visibleBlocks.join("").length;
    const availableCharacterCount = Math.max(photoCheckVisibleCharacterCount - revealedCharacterCount, 0);
    visibleBlocks.push(textBlock.slice(0, availableCharacterCount));
    return visibleBlocks;
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f7f3ea] text-[#232320]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-8%] top-[-12%] h-[26rem] w-[32rem] rounded-full bg-white/70 blur-3xl" />
        <div className="absolute right-[-8%] top-[-10%] h-[28rem] w-[34rem] rounded-full bg-white/60 blur-3xl" />
        <div className="absolute left-[10%] top-[28%] h-[22rem] w-[28rem] rounded-full bg-[#efe6d5]/55 blur-3xl" />
        <div className="absolute right-[8%] bottom-[16%] h-[20rem] w-[24rem] rounded-full bg-[#eee5d8]/50 blur-3xl" />
      </div>

      <div className={`relative flex ${isCameraCaptureStep || isMatchingStep ? "h-screen overflow-hidden" : "min-h-screen overflow-y-auto"} flex-col px-4 pb-8 pt-4 sm:px-8 sm:pb-6 sm:pt-5 lg:px-10`}>
        {!isMatchingStep && !isPhotoCheckStep && !isCameraPrepStep && !isPostCameraInterstitialStep && !isPreAuthInterstitialStep && !isFinalReviewInterstitialStep && !isNextStepsInterstitialStep ? (
          <div className={`flex w-full items-start justify-between gap-6 ${isCameraCaptureStep ? "" : "mt-[10vh] sm:mt-0"}`}>
            <a href="/" className="inline-flex items-center">
              <Image
                src="/hiros_logo.png"
                alt="Hiros"
                width={111}
                height={46}
                priority
                unoptimized
                className="h-auto w-[72px] sm:w-[96px]"
              />
            </a>

            {!isAuthStep ? (
              isCameraCaptureStep ? (
                <div
                  aria-hidden="true"
                  className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/65 px-5 py-3 text-[15px] font-medium opacity-0 shadow-[0_8px_24px_rgba(0,0,0,0.04)] backdrop-blur-sm"
                >
                  <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
                    <path d="M11.75 5.75 7.5 10l4.25 4.25" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>Previous</span>
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
                  <span className="hidden sm:inline">Previous</span>
                </button>
              )
            ) : null}
          </div>
        ) : null}

        <section
          className={`mx-auto flex w-full max-w-[1440px] flex-1 justify-center ${
            isMatchingStep || isCameraCaptureStep || isRecommendationInterstitialStep
              ? "items-center"
              : "items-start pt-6 sm:pt-12"
          }`}
        >
          {isMedicalStep && !isPhotoCheckStep && !isCameraPrepStep && !isPostCameraInterstitialStep && !isFinalReviewInterstitialStep && !isNextStepsInterstitialStep ? (
            <div className="absolute inset-x-4 top-[4.25rem] max-w-[700px] sm:inset-x-auto sm:left-1/2 sm:top-10 sm:w-full sm:-translate-x-1/2">
              <div className="h-[7px] overflow-hidden rounded-full bg-black/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#5f7f4f] via-[#8ea57a] to-[#4b6942] transition-[width] duration-500 ease-out"
                  style={{ width: `${displayedMedicalProgress}%` }}
                />
              </div>
            </div>
          ) : null}

          {isAuthStep ? (
            <div className="w-full max-w-[520px] pt-3">
              <h1 className="text-center font-title text-[42px] font-medium leading-[1.02] tracking-[-0.07em] text-[#2b2a28] sm:text-[50px]">
                Continue your intake securely
              </h1>
              <p className="mx-auto mt-4 max-w-[34ch] text-center text-[16px] font-medium leading-[1.45] tracking-[-0.02em] text-black/52 sm:text-[17px]">
                Choose a secure sign-in method to save your progress and continue.
              </p>

              <div className="mx-auto mt-8 w-full max-w-[430px] space-y-3">
                <a
                  href="https://accounts.google.com/signin"
                  className="group block w-full cursor-pointer rounded-full border border-black/10 bg-white/74 p-[1.5px] transition duration-200 hover:border-black/14 hover:bg-white/84"
                >
                  <span className="flex min-h-[54px] w-full items-center justify-center gap-3 rounded-full bg-[#fffef9] px-5 text-center text-[16px] font-medium leading-[1.35] tracking-[-0.03em] text-[#262522] sm:min-h-[56px] sm:px-6">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                      <path fill="#4285F4" d="M21.6 12.23c0-.68-.06-1.33-.18-1.95H12v3.69h5.39a4.6 4.6 0 0 1-2 3.02v2.5h3.24c1.9-1.75 2.97-4.32 2.97-7.26Z" />
                      <path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.44l-3.24-2.5c-.9.6-2.05.96-3.38.96-2.6 0-4.81-1.75-5.6-4.1H3.05v2.58A10 10 0 0 0 12 22Z" />
                      <path fill="#FBBC05" d="M6.4 13.92A5.98 5.98 0 0 1 6.08 12c0-.67.12-1.32.32-1.92V7.5H3.05A10 10 0 0 0 2 12c0 1.61.39 3.14 1.05 4.5l3.35-2.58Z" />
                      <path fill="#EA4335" d="M12 5.98c1.47 0 2.78.5 3.82 1.48l2.87-2.87C16.95 2.97 14.7 2 12 2A10 10 0 0 0 3.05 7.5l3.35 2.58c.79-2.35 3-4.1 5.6-4.1Z" />
                    </svg>
                    <span>Continue with Google</span>
                  </span>
                </a>

                <a
                  href="#"
                  className="group block w-full cursor-pointer rounded-full border border-black/10 bg-white/74 p-[1.5px] transition duration-200 hover:border-black/14 hover:bg-white/84"
                >
                  <span className="flex min-h-[54px] w-full items-center justify-center gap-3 rounded-full bg-[#fffef9] px-5 text-center text-[16px] font-medium leading-[1.35] tracking-[-0.03em] text-[#262522] sm:min-h-[56px] sm:px-6">
                    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                      <path d="M16.63 12.57c-.03-3.12 2.54-4.62 2.66-4.7-1.46-2.13-3.72-2.42-4.52-2.46-1.92-.2-3.75 1.13-4.73 1.13-1 0-2.5-1.1-4.12-1.07-2.1.03-4.07 1.23-5.15 3.12-2.22 3.84-.56 9.48 1.56 12.56 1.06 1.5 2.3 3.17 3.93 3.11 1.59-.06 2.18-1 4.1-1 1.9 0 2.45 1 4.12.96 1.7-.03 2.78-1.52 3.8-3.03 1.23-1.72 1.72-3.43 1.74-3.52-.04-.01-3.33-1.28-3.36-5.1ZM13.5 3.33c.84-1.02 1.42-2.4 1.26-3.8-1.22.05-2.75.84-3.63 1.84-.78.9-1.48 2.3-1.3 3.64 1.37.1 2.78-.69 3.67-1.68Z" />
                    </svg>
                    <span>Continue with Apple</span>
                  </span>
                </a>
              </div>

              <div className="mx-auto mt-6 flex w-full max-w-[430px] items-center gap-4 text-[15px] font-medium tracking-[-0.02em] text-black/38">
                <span className="h-px flex-1 bg-black/10" />
                <span>or</span>
                <span className="h-px flex-1 bg-black/10" />
              </div>

              <div className="mx-auto mt-6 w-full max-w-[430px]">
                <a
                  href="#"
                  onClick={handleContinueWithEmailClick}
                  className="group block w-full cursor-pointer rounded-full border border-black/10 bg-white/74 p-[1.5px] transition duration-200 hover:border-black/14 hover:bg-white/84"
                >
                  <span className="flex min-h-[54px] w-full items-center justify-center gap-3 rounded-full bg-[#fffef9] px-5 text-center text-[16px] font-medium leading-[1.35] tracking-[-0.03em] text-[#262522] sm:min-h-[56px] sm:px-6">
                    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
                      <rect x="3" y="5" width="18" height="14" rx="3" stroke="currentColor" strokeWidth="1.8" />
                      <path d="M5.5 8 12 13l6.5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>Continue with email</span>
                  </span>
                </a>
              </div>

              <p className="mt-6 text-center text-[15px] font-medium leading-[1.45] tracking-[-0.02em] text-black/42">
                Your information stays private and securely connected to your intake.
              </p>
            </div>
          ) : isLocationStep ? (
            <div className="mx-auto flex min-h-[580px] w-full max-w-[560px] flex-col items-start pt-3">
              <div className="w-full">
                <h1 className="w-full font-title text-[42px] font-medium leading-[1.02] tracking-[-0.07em] text-[#2b2a28] sm:text-[50px]">
                  Where are you currently located?
                </h1>
                <p className="mt-4 max-w-[40ch] text-[16px] font-medium leading-[1.45] tracking-[-0.02em] text-black/52 sm:text-[17px]">
                  We’ll use your location and preferences to match you with the right licensed physician.
                </p>

                <div className="relative mx-auto mt-8 w-full">
                  <div
                    className={`rounded-[18px] p-[1.5px] shadow-[0_10px_26px_rgba(0,0,0,0.02)] backdrop-blur-[2px] ${
                      selectedCity
                        ? "bg-gradient-to-r from-[#5f7f4f] via-[#8ea57a] to-[#4b6942]"
                        : "border border-black/10 bg-white/74"
                    }`}
                  >
                    <div className="flex min-h-[62px] items-center rounded-[17px] bg-[#fffef9] px-5 sm:px-6">
                      <input
                        type="text"
                        value={locationQuery}
                        onChange={(event) => handleLocationQueryChange(event.target.value)}
                        onFocus={() => {
                          if (!selectedCity && locationQuery.trim()) {
                            setIsLocationDropdownOpen(true);
                          }
                        }}
                        onBlur={() => {
                          window.setTimeout(() => {
                            setIsLocationDropdownOpen(false);
                          }, 120);
                        }}
                        placeholder="Search for your city"
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
                    By clicking "Continue," I agree to the <span className="underline underline-offset-[3px]">Terms and Conditions</span> and <span className="underline underline-offset-[3px]">Telehealth Consent</span> and acknowledge the <span className="underline underline-offset-[3px]">Privacy Policy</span>.
                  </span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleLocationContinueClick}
                disabled={!canContinueLocation}
                className={`mt-[56px] w-full rounded-full px-6 py-4 text-[16px] font-medium tracking-[-0.03em] transition-colors ${
                  canContinueLocation ? "cursor-pointer bg-[#11110f] text-white" : "cursor-default bg-black/10 text-black/30"
                }`}
              >
                {isLocationLoading ? (
                  <span className="flex items-center justify-center gap-3">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" aria-hidden="true" />
                    <span className="sr-only">Loading location options</span>
                  </span>
                ) : isLocationReady ? (
                  "Continue"
                ) : (
                  "Continue"
                )}
              </button>
            </div>
          ) : isMatchingStep ? (
            <div className="flex w-full max-w-[560px] flex-col items-center justify-center px-4 text-center">
              <div className="relative flex h-40 w-40 items-center justify-center">
                <span
                  className={`absolute inset-0 rounded-full border-[4px] border-transparent border-t-[#5f7f4f] border-r-[#8ea57a] border-b-[#4b6942] transition-opacity duration-500 ${
                    matchingStage === "loading" ? "animate-spin opacity-100" : "opacity-0"
                  }`}
                  aria-hidden="true"
                />
                <span className="absolute flex h-32 w-32 items-center justify-center transition-all duration-500">
                  {matchingStage === "success" ? (
                    <svg viewBox="0 0 20 20" fill="none" className="h-11 w-11 text-[#5f7f4f]" aria-hidden="true">
                      <path d="M5.5 10.25 8.5 13.25 14.5 6.75" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <Image
                      src="/hiros_h.png"
                      alt="Hiros"
                      width={90}
                      height={90}
                      priority
                      unoptimized
                      className="h-[90px] w-auto"
                    />
                  )}
                </span>
              </div>

              <p className="mt-10 max-w-[32ch] text-[16px] font-medium leading-[1.5] tracking-[-0.02em] text-[#2b2a28]/82">
                We’re matching you with a licensed physician.
              </p>
            </div>
          ) : isPhotoCheckStep || isPostCameraInterstitialStep || isPreAuthInterstitialStep || isFinalReviewInterstitialStep || isNextStepsInterstitialStep || isRecommendationInterstitialStep ? (
            <div className={`w-full max-w-[700px] transition-opacity duration-150 ease-out ${isFading ? "opacity-0" : "opacity-100"}`}>
              <div className={`flex min-h-[620px] w-full flex-col items-center justify-center gap-14 ${isFinalReviewInterstitialStep || isNextStepsInterstitialStep || isRecommendationInterstitialStep ? "pb-0" : "pb-2"} pt-8 sm:min-h-[660px] sm:gap-16 sm:pt-12`}>
                <div className={`mx-auto ${isPostCameraInterstitialStep ? "w-fit max-w-[34rem]" : isRecommendationInterstitialStep ? "w-full" : "w-full max-w-[34rem]"}`}>
                  <div className="space-y-8 text-left sm:space-y-10">
                    {isNextStepsInterstitialStep ? (
                      <div className="w-full">
                        <div className="relative">
                          <h1 className="invisible whitespace-pre-line text-[34px] font-medium leading-[1.08] tracking-[-0.06em] text-[#c77e57] sm:text-[48px]">Almost done, here's \nwhat happens next:</h1>
                          <h1 className="absolute inset-0 whitespace-pre-line text-[34px] font-medium leading-[1.08] tracking-[-0.06em] text-[#c77e57] sm:text-[48px]">
                            {"Almost done, here's \nwhat happens next:".slice(0, nextStepsTitleVisibleCount)}
                          </h1>
                        </div>

                        <div className="relative mt-8 space-y-5">

                          <div className={`rounded-[20px] bg-gradient-to-r from-[#5f7f4f] via-[#8ea57a] to-[#4b6942] p-[1.5px] shadow-[0_10px_26px_rgba(0,0,0,0.04)] transition-all duration-500 ${nextStepsContainerIndex >= 1 ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}>
                            <div className="flex items-stretch gap-4 rounded-[18px] bg-[#fffef9] p-5">
                              <span className="mt-1 z-20 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#7d9a68] via-[#6f8f5a] to-[#557546] text-white">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                  <path d="M5 12h12" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
                                  <path d="M13 6l6 6-6 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                              </span>
                              <div className="flex-1">
                                <p className="text-[18px] font-semibold leading-[1.24] tracking-[-0.04em] text-[#2b2a28] sm:text-[20px]">Complete your treatment profile</p>
                                <p className="mt-1 text-[15px] font-medium leading-[1.45] tracking-[-0.02em] text-black/62">Add your delivery address and payment method.</p>
                              </div>
                            </div>
                          </div>

                          <div className={`relative z-10 flex items-stretch gap-4 rounded-[18px] bg-white/80 p-5 shadow-[0_10px_26px_rgba(0,0,0,0.04)] backdrop-blur-[2px] transition-all duration-500 ${nextStepsContainerIndex >= 2 ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}>
                            <span className="relative mt-1 ml-[2px] z-20 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#b77a61] bg-white text-[#b77a61]">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                <circle cx="12" cy="13" r="8" stroke="currentColor" stroke-width="2.2"/>
                                <path d="M12 9v5l3 2" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M8.5 4l2 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                                <path d="M15.5 4l-2 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                              </svg>
                            </span>
                            <div className="flex-1">
                              <p className="text-[18px] font-semibold leading-[1.24] tracking-[-0.04em] text-[#2b2a28] sm:text-[20px]">Physician review</p>
                              <p className="mt-1 text-[12px] font-semibold leading-[1.45] tracking-[-0.02em] text-[#c77e57]">Most reviews are completed within 12–24 hours.</p>
                              <p className="mt-1 text-[15px] font-medium leading-[1.45] tracking-[-0.02em] text-black/62">A licensed physician reviews your answers and photos.</p>
                            </div>
                          </div>

                          <div className={`relative flex items-stretch gap-4 rounded-[18px] bg-white/80 p-5 shadow-[0_10px_26px_rgba(0,0,0,0.04)] backdrop-blur-[2px] transition-all duration-500 ${nextStepsContainerIndex >= 3 ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}>
                            <span className="mt-1 z-20 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#b77a61] bg-white text-[#b77a61]">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                <circle cx="12" cy="13" r="8" stroke="currentColor" stroke-width="2.2"/>
                                <path d="M12 9v5l3 2" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M8.5 4l2 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                                <path d="M15.5 4l-2 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                              </svg>
                            </span>
                            <div className="flex-1">
                              <p className="text-[18px] font-semibold leading-[1.24] tracking-[-0.04em] text-[#2b2a28] sm:text-[20px]">Personalized treatment plan</p>
                              <p className="mt-1 text-[15px] font-medium leading-[1.45] tracking-[-0.02em] text-black/62">Available after physician approval.</p>
                              <p className="mt-1 text-[15px] font-medium leading-[1.45] tracking-[-0.02em] text-black/62">Receive your treatment recommendation, progress tracking tools, and follow-up guidance.</p>
                            </div>
                          </div>

                          <div className={`transition-all duration-500 ${nextStepsContainerIndex >= 4 ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}>
                            <p className="pt-2 text-[13px] font-medium leading-[1.45] tracking-[-0.01em] text-black/46">You will only be charged if treatment is approved by your physician.</p>
                            <div className="mt-3 flex w-full justify-end">
                              <button
                                type="button"
                                onClick={() => advanceToStep(shippingInfoStepIndex)}
                                className="inline-flex items-center rounded-full bg-[#1b1b1b] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-black focus:outline-none focus-visible:ring-2 focus-visible:ring-black/40"
                              >
                                Continue
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                    ) : null}
                    {isRecommendationInterstitialStep ? (
                      <>
                      <div className={`overflow-hidden rounded-[22px] border border-black/5 bg-white/80 p-4 shadow-[0_10px_26px_rgba(0,0,0,0.04)] backdrop-blur-[2px] sm:p-6 transition-all duration-500 ${recommendationReveal ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}>
                        <div className="w-full max-w-[700px] mx-auto">
                          <p className="mb-2 text-[13px] font-semibold tracking-[-0.01em] text-[#c77e57]">Step 2 out of 3</p>
                          <h1 className="font-title font-medium leading-[1.02] tracking-[-0.07em] text-[#2b2a28] text-[34px] sm:text-[42px]">What physicians often consider</h1>

                          <div className="mt-4 flex items-start gap-4">
                            <img src={assignedDoctor.imageSrc} alt={assignedDoctor.name} className="h-20 w-20 rounded-full object-cover" />
                            <div>
                              <p className="text-[16px] leading-[1.55] tracking-[-0.02em] text-black/70">
                                Based on the information you've provided, physicians reviewing similar cases often consider the following treatment options for male pattern hair loss.
                              </p>
                              
                            </div>
                          </div>

                          {recommendedTreatment && recommendedTreatment.type !== "review" ? (
                          <div className="mt-6 rounded-[18px] border border-black/10 bg-white p-5 shadow-[0_6px_18px_rgba(0,0,0,0.04)] sm:p-6">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <h2 className="text-[22px] font-semibold leading-[1.1] tracking-[-0.04em] text-[#2b2a28] sm:text-[24px]">{recommendedTreatment.title}</h2>
                                <p className="mt-1 text-[14px] font-medium leading-[1.45] tracking-[-0.01em] text-black/60">{recommendedTreatment.description}</p>
                              </div>
                              <img src={recommendedTreatment.imageSrc} alt="Treatment" className="h-16 w-16 rounded-full object-cover" />
                            </div>

                            <ul className="mt-4 space-y-2.5">
                              <li className="flex items-start gap-3 text-[14px] leading-[1.5] text-[#2b2a28]">
                                <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#c77e57]/10 text-[#c77e57]">
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                </span>
                                <span>Lower systemic exposure than oral finasteride</span>
                              </li>
                              <li className="flex items-start gap-3 text-[14px] leading-[1.5] text-[#2b2a28]">
                                <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#c77e57]/10 text-[#c77e57]">
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                </span>
                                <span>Clinical studies show improvements in hair density</span>
                              </li>
                              <li className="flex items-start gap-3 text-[14px] leading-[1.5] text-[#2b2a28]">
                                <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#c77e57]/10 text-[#c77e57]">
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                </span>
                                <span>Physician review determines suitability</span>
                              </li>
                            </ul>

                            <div className="mt-5 rounded-[14px] bg-[#faf7f2] p-4">
                              <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[#c77e57]">Expected monthly cost</p>
                              <p className="mt-1 text-[20px] font-semibold tracking-[-0.03em] text-[#2b2a28]">₺500–750 / month</p>
                            </div>

                            <div className="mt-4">
                              <p className="text-[13px] font-semibold tracking-[-0.01em] text-[#2b2a28]">Included with Hiros</p>
                              <ul className="mt-3 space-y-2.5 text-[14px] text-[#2b2a28]">
                                <li className="flex items-start gap-3"><span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#5f7f4f]/10 text-[#5f7f4f]"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 7c2-2.5 5-2.5 7 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M8 10v7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="16" r="6" stroke="currentColor" strokeWidth="2"/><path d="M15 14l3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg></span><span>Physician review</span></li>
                                <li className="flex items-start gap-3"><span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#5f7f4f]/10 text-[#5f7f4f]"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/0 svg"><path d="M4 16l4-4 3 3 5-6 4 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M4 20h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg></span><span>Progress tracking</span></li>
                                <li className="flex items-start gap-3"><span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#5f7f4f]/10 text-[#5f7f4f]"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 22c4-2 8-6 8-10a8 8 0 10-16 0c0 4 4 8 8 10z" stroke="currentColor" strokeWidth="2"/><path d="M12 8v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg></span><span>Side-effect monitoring</span></li>
                                <li className="flex items-start gap-3"><span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#5f7f4f]/10 text-[#5f7f4f]"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/><path d="M12 7v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg></span><span>Follow-up support</span></li>
                                <li className="flex items-start gap-3"><span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#5f7f4f]/10 text-[#5f7f4f]"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 7h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M6 7l1.5-3h9L18 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><rect x="4" y="7" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="2"/></svg></span><span>Discreet pharmacy delivery</span></li>
                              </ul>
                            </div>
                          </div>
                          ) : recommendedTreatment && recommendedTreatment.type === "review" ? (
                          <div className="mt-6 rounded-[18px] border-2 border-[#eac06a] bg-[#fdf3da] p-5 shadow-[0_6px_18px_rgba(0,0,0,0.04)] sm:p-6">
                            <div className="flex items-start gap-4">
                              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#ec8a1e]/10">
                                <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-[#ec8a1e]" aria-hidden="true">
                                  <path d="M12 3 2.5 19.5h19L12 3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                                  <path d="M12 10v3.5M12 16.5h.01" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <h2 className="text-[22px] font-semibold leading-[1.1] tracking-[-0.04em] text-[#2b2a28] sm:text-[24px]">{recommendedTreatment.title}</h2>
                                <p className="mt-2 text-[14px] font-medium leading-[1.45] tracking-[-0.01em] text-black/70">{recommendedTreatment.description}</p>
                                <p className="mt-3 text-[13px] font-medium leading-[1.45] text-black/60">A physician will carefully review your intake and determine the most appropriate next step for your situation.</p>
                              </div>
                            </div>
                          </div>
                          ) : null}

                          <div className="mt-6 flex w-full flex-col gap-3">
                            <label className="flex items-start gap-3 text-[14px] leading-[1.45] text-[#2b2a28]">
                              <input
                                type="checkbox"
                                className="mt-1 h-[18px] w-[18px] cursor-pointer rounded border-[#c77e57]/60 text-[#2b2a28] accent-[#c77e57] focus:ring-[#c77e57]"
                                checked={hasAcknowledgedPhysicianReview}
                                onChange={(e) => setHasAcknowledgedPhysicianReview(e.target.checked)}
                              />
                              <span>Your physician will review your answers and photos before determining whether treatment is appropriate for you.</span>
                            </label>
                            <button
                              type="button"
                              onClick={() => advanceToStep(paymentMethodStepIndex)}
                              disabled={!hasAcknowledgedPhysicianReview}
                              className="inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-[15px] font-semibold tracking-[-0.02em] shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-black/40 disabled:cursor-not-allowed disabled:opacity-50 bg-[#1b1b1b] text-white hover:bg-black disabled:hover:bg-[#1b1b1b]"
                            >
                              Add payment method
                            </button>
                            <button type="button" className="inline-flex w-full items-center justify-center rounded-full border border-black/12 bg-white px-5 py-3 text-[15px] font-semibold tracking-[-0.02em] text-[#2b2a28] hover:bg-black/[0.03]">
                              Learn about other options
                            </button>
                          </div>

                          <p className="mt-3 text-[12px] font-medium leading-[1.45] tracking-[-0.01em] text-black/46">
                            No payment is collected unless treatment is approved.
                          </p>
                        </div>
                      </div>
                      </>
                    ) : null}
                    {isFinalReviewInterstitialStep ? (
                      <div className="flex w-full items-center justify-center">
                        <svg
                          width="84"
                          height="84"
                          viewBox="0 0 132 132"
                          className="block mx-auto drop-shadow-sm transform -translate-x-[5px] pr-[2px]"
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
                    {!(isNextStepsInterstitialStep || isRecommendationInterstitialStep) ? (
                    <div className="relative max-w-[34rem]">
                      <p className="invisible whitespace-pre-line text-[34px] font-medium leading-[1.08] tracking-[-0.06em] sm:text-[48px]">
                        {activeInterstitialTextBlocks[0]}
                      </p>
                      <p className="absolute inset-0 max-w-[34rem] text-[34px] font-medium leading-[1.08] tracking-[-0.06em] text-[#c77e57] sm:text-[48px]">
                        {visibleInterstitialTextBlocks[0].split("\n").map((line, lineIndex) => (
                          <span key={`photo-check-primary-${lineIndex}`} className="block whitespace-pre">
                            {line === "" ? "\u00A0" : line}
                          </span>
                        ))}
                      </p>
                    </div>
                    ) : null}

                    {!(isNextStepsInterstitialStep || isRecommendationInterstitialStep) ? (
                    <div className="relative w-full max-w-[34rem]">
                      <p
                        className={`invisible w-full whitespace-pre-line font-medium ${
                          isPostCameraInterstitialStep
                            ? "text-[34px] leading-[1.08] tracking-[-0.06em] sm:text-[48px]"
                            : "text-[22px] leading-[1.18] tracking-[-0.04em] sm:text-[30px]"
                        }`}
                      >
                        {activeInterstitialTextBlocks[1]}
                      </p>
                      <p
                        className={`absolute inset-0 w-full max-w-[34rem] whitespace-pre-line font-medium text-[#c77e57] ${
                          isPostCameraInterstitialStep
                            ? "text-[34px] leading-[1.08] tracking-[-0.06em] sm:text-[48px]"
                            : "text-[22px] leading-[1.18] tracking-[-0.04em] sm:text-[30px]"
                        }`}
                      >
                        {visibleInterstitialTextBlocks[1].split("\n").map((line, lineIndex) => (
                          <span key={`photo-check-secondary-${lineIndex}`} className="block whitespace-pre">
                            {line === "" ? "\u00A0" : line}
                          </span>
                        ))}
                      </p>
                    </div>
                    ) : null}
                  </div>

                  {!isNextStepsInterstitialStep ? (
                  <div className={`flex ${isFinalReviewInterstitialStep ? "min-h-[56px] mt-[40px]" : "min-h-[72px] mt-[56px]"} items-end justify-start w-full`}>
                    {isPreAuthInterstitialStep ? (
                      <button
                        type="button"
                        onClick={handlePreAuthInterstitialContinue}
                        disabled={!isInterstitialButtonVisible}
                        aria-hidden={!isInterstitialButtonVisible}
                        tabIndex={isInterstitialButtonVisible ? 0 : -1}
                        className={`w-full max-w-[500px] self-start rounded-full px-6 py-4 text-[16px] font-medium tracking-[-0.03em] transition-all duration-300 ${
                          isInterstitialButtonVisible
                            ? "translate-y-0 bg-[#11110f] text-white opacity-100"
                            : "translate-y-2 bg-black/10 text-black/30 opacity-0"
                        }`}
                      >
                        {interstitialPrimaryButtonLabel}
                      </button>
                    ) : isFinalReviewInterstitialStep ? (
                      <Link
                        href="/dashboard"
                        className={`w-full max-w-[500px] self-start rounded-full px-6 py-4 text-center text-[16px] font-medium tracking-[-0.03em] transition-all duration-300 ${
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
                        onClick={handlePhotoCheckContinue}
                        disabled={!isInterstitialButtonVisible}
                        aria-hidden={!isInterstitialButtonVisible}
                        tabIndex={isInterstitialButtonVisible ? 0 : -1}
                        className={`w-full max-w-[500px] self-start rounded-full px-6 py-4 text-[16px] font-medium tracking-[-0.03em] transition-all duration-300 ${
                          isInterstitialButtonVisible
                            ? "translate-y-0 bg-[#11110f] text-white opacity-100"
                            : "translate-y-2 bg-black/10 text-black/30 opacity-0"
                        }`}
                      >
                        {interstitialPrimaryButtonLabel}
                      </button>
                    )}
                  </div>
                  ) : null}
                </div>
              </div>
            </div>
          ) : isCameraPrepStep ? (
            <div className={`w-full ${isShippingInfoStep ? "max-w-[980px]" : "max-w-[700px]"} transition-opacity duration-150 ease-out ${isFading ? "opacity-0" : "opacity-100"}`}>
              <div className="flex min-h-[620px] w-full flex-col items-center justify-center gap-14 pb-2 pt-8 sm:min-h-[660px] sm:gap-16 sm:pt-12">
                <div className="w-full max-w-[34rem] text-left">
                  <h1 className="text-[34px] font-medium leading-[1.08] tracking-[-0.06em] text-[#c77e57] sm:text-[48px]">
                    Let's get you ready.
                  </h1>

                  <div className="mt-10 space-y-6 sm:mt-12 sm:space-y-7">
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
                          <p className="text-[20px] font-medium leading-[1.24] tracking-[-0.04em] text-[#2b2a28] sm:text-[24px]">
                            {prepPoint}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex min-h-[72px] w-full max-w-[34rem] items-end justify-start mt-0">
                  <button
                    type="button"
                    onClick={handleCameraPrepContinue}
                    disabled={!isCameraPrepButtonVisible}
                    aria-hidden={!isCameraPrepButtonVisible}
                    tabIndex={isCameraPrepButtonVisible ? 0 : -1}
                    className={`w-full max-w-[500px] self-start rounded-full px-6 py-4 text-[16px] font-medium tracking-[-0.03em] transition-all duration-300 ${
                      isCameraPrepButtonVisible
                        ? "translate-y-0 bg-[#11110f] text-white opacity-100"
                        : "translate-y-2 bg-black/10 text-black/30 opacity-0"
                    }`}
                  >
                    I am ready
                  </button>
                </div>
              </div>
            </div>
          ) : isCameraCaptureStep ? (
            <div className={`w-full max-w-[1080px] transition-opacity duration-150 ease-out ${isFading ? "opacity-0" : "opacity-100"}`}>
              <div className="w-full">
                <div className="mx-auto w-full overflow-hidden rounded-[30px] bg-[#ece4d7] shadow-[0_24px_60px_rgba(0,0,0,0.12)] sm:w-[60vw] sm:max-w-[820px]">
                  <div className="relative h-[74vh] min-h-[640px] max-h-[900px] w-full bg-[#e7ddcf]">
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
                        <p className="px-6 text-[15px] font-medium tracking-[-0.02em]">Opening your camera…</p>
                      </div>
                    ) : null}

                    {cameraError ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-[#e7ddcf] px-8 text-center">
                        <p className="max-w-[22rem] text-[15px] font-medium leading-[1.45] tracking-[-0.02em] text-[#7a6c5d]">{cameraError}</p>
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
                              <svg viewBox="0 0 24 24" fill="currentColor" className="h-28 w-28 sm:h-32 sm:w-32" aria-hidden="true">
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
                  className={`mx-auto mt-6 block w-full max-w-[360px] rounded-full px-6 py-4 text-[16px] font-medium tracking-[-0.03em] transition-colors sm:max-w-[380px] ${
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
                    Retake photo
                  </button>
                ) : null}
              </div>
            </div>
          ) : (
            <div className={`w-full max-w-[700px] transition-opacity duration-150 ease-out ${isFading ? "opacity-0" : "opacity-100"} ${isMedicalStep ? "pt-6 sm:pt-2" : ""}`}>
              {isShippingInfoStep ? (
                <>
                  <div className={`mb-[26px] grid grid-cols-[1fr_auto] items-stretch gap-3 overflow-hidden rounded-2xl border border-[#CCD5C8] bg-[#E7EDE7] p-3.5 text-[#2D3A2F] transition-all duration-300 sm:gap-4 sm:p-4 ${shippingRevealIndex >= 1 ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}>
                    <div className="min-w-0 flex items-center">
                      <div>
                        <div className="text-[15px] font-semibold leading-tight tracking-[-0.01em] sm:text-[16px] mb-0.5">Physician review and approval</div>
                        <p className="text-[13px] leading-snug text-[#2D3A2F]/90 sm:text-[14px]">
                          {currentStep!.description}
                        </p>
                      </div>
                    </div>
                    <div className="-my-3.5 -mr-3.5 h-auto w-[140px] self-stretch sm:-my-4 sm:-mr-4 sm:w-[170px]">
                      <img
                        src="/delivery_intake.png"
                        alt="Delivery"
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  </div>
                  <p className={`mb-2 text-[13px] font-semibold tracking-[-0.01em] text-[#c77e57] transition-all duration-300 ${shippingRevealIndex >= 1 ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}>Step 1 out of 3</p>
                  <h1 className={`${isMedicalStep ? "w-full max-w-full" : "max-w-[20ch]"} mb-2 font-title font-medium leading-[1.02] tracking-[-0.07em] text-[#2b2a28] text-[34px] sm:text-[42px] transition-all duration-300 ${shippingRevealIndex >= 2 ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}>
                    {currentStep!.title}
                  </h1>
                  <p className={`mb-4 text-[14px] font-medium leading-[1.45] tracking-[-0.02em] text-black/55 transition-all duration-300 ${shippingRevealIndex >= 2 ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}>
                    We’ll only use these details if treatment is approved.
                  </p>
                  <div className={`transition-all duration-300 ${shippingRevealIndex >= 3 ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}>
                    <ShippingForm
                      formData={shippingFormData}
                      onChange={setShippingFormData}
                      onContinue={() => advanceToStep(recommendationStepIndex >= 0 ? recommendationStepIndex : shippingInfoStepIndex + 1)}
                    />
                    <p className="mt-4 text-[12px] leading-[1.4] tracking-[-0.01em] text-black/55">
                      *Delivery is available for eligible treatments through participating pharmacy partners.
                    </p>
                  </div>
                </>
              ) : isPaymentMethodStep ? (
                <>
                  <div className={`mb-[26px] grid grid-cols-[1fr_auto] items-stretch gap-3 overflow-hidden rounded-2xl border border-[#CCD5C8] bg-[#E7EDE7] p-3.5 text-[#2D3A2F] transition-all duration-300 sm:gap-4 sm:p-4 ${shippingRevealIndex >= 1 ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}>
                    <div className="min-w-0 flex items-center">
                      <div>
                        <div className="text-[15px] font-semibold leading-tight tracking-[-0.01em] sm:text-[16px] mb-0.5">Physician review and approval</div>
                        <p className="mt-0.5 text-[14px] leading-snug text-[#2D3A2F]/80">
                          Your case will be reviewed by a licensed physician before any payment is collected. Most reviews are completed within 24 hours.
                        </p>
                      </div>
                    </div>
                    <div className="-my-3.5 -mr-3.5 h-auto w-[140px] self-stretch sm:-my-4 sm:-mr-4 sm:w-[170px]">
                      <img
                        src="/hiros_intake_doctor.png"
                        alt="Doctor"
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  </div>
                  <p className={`mb-2 text-[13px] font-semibold tracking-[-0.01em] text-[#c77e57] transition-all duration-300 ${shippingRevealIndex >= 1 ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}>Step 3 out of 3</p>
                  <h1 className={`${isMedicalStep ? "w-full max-w-full" : "max-w-[16ch]"} mb-6 font-title text-[42px] font-medium leading-[1.02] tracking-[-0.07em] text-[#2b2a28] sm:text-[50px] transition-all duration-300 ${shippingRevealIndex >= 1 ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}>
                    You're almost done
                  </h1>
                  <div className={`mb-4 transition-all duration-300 ${shippingRevealIndex >= 1 ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}>
                    <div className="rounded-[22px] border border-black/10 bg-white shadow-[0_16px_40px_rgba(0,0,0,0.06)]">
                      <div className="px-6 py-5">
                        <h2 className="font-title text-[22px] font-medium leading-[1.1] tracking-[-0.04em] text-[#2b2a28]">
                          {shippingFormData.firstName && shippingFormData.firstName.trim().length > 0
                            ? `${shippingFormData.firstName}'s treatment overview`
                            : 'Your treatment overview'}
                        </h2>
                      </div>
                      <div className="px-6 pb-6">
                        <div className="overflow-hidden rounded-[18px] border border-black/10">
                          <div className="bg-[#945f41] px-5 py-3 text-[13px] font-semibold tracking-[-0.01em] text-white sm:px-6 sm:py-3.5">
                            {recommendedTreatment?.type === "review" ? "Physician review recommended" : "Most commonly considered treatment"}
                          </div>
                          {recommendedTreatment?.type !== "review" ? (
                          <div className="flex items-center justify-between gap-4 bg-[#fbfaf5] px-5 py-4 sm:px-6">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-[18px] font-semibold leading-[1.15] tracking-[-0.03em] text-[#2b2a28]">{recommendedTreatment?.title || "Topical Finasteride + Minoxidil"}</p>
                                <span className="shrink-0 rounded-full bg-[#e1e9e1] px-2.5 py-0.5 text-[11px] font-semibold leading-none text-[#2D3A2F]">Recommended</span>
                              </div>
                              <p className="mt-1 text-[13px] font-medium leading-[1.45] tracking-[-0.01em] text-black/60">{recommendedTreatment?.description || "Evidence-backed combination for male pattern hair loss."}</p>
                            </div>
                            <img src={recommendedTreatment?.imageSrc || "/treatment-bottle.png"} alt="Treatment" className="h-16 w-16 rounded-[12px] object-cover" />
                          </div>
                          ) : (
                          <div className="bg-[#fdf3da] px-5 py-4 sm:px-6">
                            <div className="flex items-start gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#ec8a1e]/10">
                                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-[#ec8a1e]" aria-hidden="true">
                                  <path d="M12 3 2.5 19.5h19L12 3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                                  <path d="M12 10v3.5M12 16.5h.01" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <p className="text-[16px] font-semibold leading-[1.15] tracking-[-0.03em] text-[#2b2a28]">{recommendedTreatment?.title}</p>
                                <p className="mt-1 text-[13px] font-medium leading-[1.45] tracking-[-0.01em] text-black/70">{recommendedTreatment?.description}</p>
                              </div>
                            </div>
                          </div>
                          )}
                        </div>

                        <div className="mt-6">
                          <p className="text-[14px] font-semibold tracking-[-0.02em] text-[#2b2a28]">Included with Hiros</p>
                          <ul className="mt-3 space-y-2 text-[14px] leading-[1.5] text-[#2b2a28]">
                            <li className="flex items-start gap-2"><span>✓</span><span>Physician review by a licensed physician</span></li>
                            <li className="flex items-start gap-2"><span>✓</span><span>Progress tracking and photo comparisons</span></li>
                            <li className="flex items-start gap-2"><span>✓</span><span>Side-effect monitoring and reporting</span></li>
                            <li className="flex items-start gap-2"><span>✓</span><span>Treatment reminders and status updates</span></li>
                            <li className="flex items-start gap-2"><span>✓</span><span>Discreet pharmacy delivery</span></li>
                          </ul>
                        </div>

                        <div className="mt-6 border-t border-black/10 pt-5">
                          <p className="text-[15px] font-semibold tracking-[-0.02em] text-[#2b2a28]">Preferred treatment plan (if approved)</p>

                          <div className="mt-4 space-y-3">
                            <button
                              type="button"
                              onClick={() => setSelectedTreatmentPlan('primary')}
                              className={`group block w-full rounded-[17px] p-[1.5px] transition ${selectedTreatmentPlan === 'primary' ? 'bg-gradient-to-r from-[#5f7f4f] via-[#8ea57a] to-[#4b6942]' : 'bg-black/10 hover:bg-black/14'}`}
                            >
                              <div className={`rounded-[15px] bg-white px-5 py-4 ${selectedTreatmentPlan === 'primary' ? 'shadow-[0_10px_26px_rgba(0,0,0,0.04)]' : 'shadow-[0_10px_26px_rgba(0,0,0,0.02)]'}`}>
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex items-start gap-3 text-left">
                                    <span
                                      className={`mt-1.5 inline-block h-3.5 w-3.5 rounded-full border ${
                                        selectedTreatmentPlan === 'primary'
                                          ? 'border-transparent bg-gradient-to-r from-[#5f7f4f] via-[#8ea57a] to-[#4b6942]'
                                          : 'border-black/25 bg-white'
                                      }`}
                                      aria-hidden="true"
                                    />
                                    <div>
                                      <p className="text-[16px] font-semibold text-[#2b2a28]">{recommendedTreatment?.title || "Topical Finasteride + Minoxidil"}</p>
                                      <p className="mt-1 text-[13px] leading-[1.45] tracking-[-0.01em] text-black/60">{recommendedTreatment?.type === "review" ? "Subject to physician review" : "Most commonly considered for cases similar to yours."}</p>
                                    </div>
                                  </div>
                                  <div className="shrink-0 text-right text-[15px] font-semibold tracking-[-0.02em] text-[#2b2a28]">
                                    ₺750/mo
                                  </div>
                                </div>
                              </div>
                            </button>

                            <button
                              type="button"
                              onClick={() => setSelectedTreatmentPlan('alternative')}
                              className={`group block w-full rounded-[17px] p-[1.5px] transition ${selectedTreatmentPlan === 'alternative' ? 'bg-gradient-to-r from-[#5f7f4f] via-[#8ea57a] to-[#4b6942]' : 'bg-black/10 hover:bg-black/14'}`}
                            >
                              <div className={`rounded-[15px] bg-white px-5 py-4 ${selectedTreatmentPlan === 'alternative' ? 'shadow-[0_10px_26px_rgba(0,0,0,0.04)]' : 'shadow-[0_10px_26px_rgba(0,0,0,0.02)]'}`}>
                                <div className="flex items-start gap-3 text-left">
                                  <span
                                    className={`mt-1.5 inline-block h-3.5 w-3.5 rounded-full border ${
                                      selectedTreatmentPlan === 'alternative'
                                        ? 'border-transparent bg-gradient-to-r from-[#5f7f4f] via-[#8ea57a] to-[#4b6942]'
                                        : 'border-black/25 bg-white'
                                    }`}
                                    aria-hidden="true"
                                  />
                                  <p className="text-[16px] font-semibold text-[#2b2a28]">Discuss other treatment options with my physician</p>
                                </div>
                              </div>
                            </button>

                            <p className="text-[12px] leading-[1.45] tracking-[-0.01em] text-black/55">
                              Final treatment recommendations are determined by your physician after reviewing your intake and photos.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={`mt-8 transition-all duration-300 ${shippingRevealIndex >= 2 ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}>
                    <h2 className={`${isMedicalStep ? "w-full max-w-full" : "max-w-[20ch]"} mb-2 font-title text-[34px] font-medium leading-[1.02] tracking-[-0.07em] text-[#2b2a28] sm:text-[42px]`}>
                      Select payment method
                    </h2>
                    <p className="mb-5 text-[16px] font-medium leading-[1.45] tracking-[-0.02em] text-black/52 sm:text-[17px]">
                      Add a payment method to complete your submission. No payment is collected until your physician reviews and approves treatment.
                    </p>

                    <div className="mb-2 flex items-center justify-between">
                      <label className="text-[14px] font-semibold tracking-[-0.02em] text-[#2b2a28]">Credit or Debit Card</label>
                      <div className="flex items-center gap-1.5 text-[10px] font-semibold text-black/55">
                        <span className="inline-flex items-center gap-1 rounded-md border border-black/10 bg-white px-1.5 py-0.5">
                          <svg aria-hidden="true" width="14" height="10" viewBox="0 0 24 16" className="text-[#1a1f71]"><rect x="1" y="2" width="22" height="12" rx="2" fill="currentColor" opacity="0.1"/></svg>
                          <span>Visa</span>
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-md border border-black/10 bg-white px-1.5 py-0.5">
                          <svg aria-hidden="true" width="14" height="10" viewBox="0 0 24 16"><circle cx="9" cy="8" r="4" fill="#EB001B"/><circle cx="15" cy="8" r="4" fill="#F79E1B"/></svg>
                          <span>Mastercard</span>
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-md border border-black/10 bg-white px-1.5 py-0.5">
                          <svg aria-hidden="true" width="14" height="10" viewBox="0 0 24 16" className="text-[#007a3d]"><rect x="1" y="2" width="22" height="12" rx="2" fill="currentColor" opacity="0.12"/></svg>
                          <span>Troy</span>
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-md border border-black/10 bg-white px-1.5 py-0.5">
                          <svg aria-hidden="true" width="14" height="10" viewBox="0 0 24 16" className="text-black"><rect x="1" y="2" width="22" height="12" rx="2" fill="currentColor" opacity="0.12"/></svg>
                          <span>Apple Pay</span>
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-md border border-black/10 bg-white px-1.5 py-0.5">
                          <svg aria-hidden="true" width="14" height="10" viewBox="0 0 24 16"><rect x="1" y="2" width="22" height="12" rx="2" fill="#4285F4" opacity="0.12"/></svg>
                          <span>Google Pay</span>
                        </span>
                      </div>
                    </div>
                    <div className="flex items-stretch gap-2 rounded-[14px] border border-black/10 bg-[#fffef9] p-2">
                      <div className="flex items-center pl-2 pr-1 text-black/50">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                          <rect x="3" y="5" width="18" height="14" rx="3" stroke="currentColor" strokeWidth="1.7" />
                          <rect x="3" y="9" width="18" height="3" fill="currentColor" opacity="0.12" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="Card number"
                        className="flex-1 rounded-[10px] bg-transparent px-2 py-2 text-[16px] font-medium tracking-[0.02em] text-[#262522] outline-none placeholder:text-black/35"
                      />
                      <button
                        type="button"
                        className="shrink-0 rounded-[12px] bg-[#2b2a28] px-3 py-2 text-[13px] font-semibold text-white hover:brightness-110"
                        onClick={() => {}}
                      >
                        Autofill link
                      </button>
                    </div>

                    <button
                      type="button"
                      className="mt-5 w-full rounded-[20px] bg-[#0e1b24] py-4 text-[16px] font-semibold tracking-[-0.02em] text-white shadow-[0_10px_26px_rgba(0,0,0,0.08)] hover:brightness-110"
                      onClick={() => advanceToStep(finalReviewStepIndex)}
                    >
                      Submit for physician review
                    </button>

                    

                    <p className="mt-4 text-center text-[12px] leading-[1.4] tracking-[-0.01em] text-black/55">
                      Compounded semaglutide is not approved nor evaluated for safety, effectiveness, or quality by the FDA.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <h1 className="w-full max-w-full font-title font-medium leading-[1.2] tracking-[-0.03em] text-[#2b2a28] text-[22px] sm:text-[42px] sm:leading-[1.02] sm:tracking-[-0.07em] lg:text-[50px]">
                    {currentStep!.title}
                  </h1>
                  {currentStep!.description ? (
                    <p className="mt-2.5 text-[13px] font-medium leading-[1.45] tracking-[-0.02em] text-black/52 sm:mt-4 sm:text-[16px] lg:text-[17px]">
                      {currentStep!.description}
                    </p>
                  ) : null}
                </>
              )}

              <div className="mt-6 space-y-2.5 sm:mt-8 sm:space-y-3">
                {currentStep!.options.map((option) => {
                  const isSelected = isCheckboxSelectionStep
                    ? selectedGoalOptions.includes(option)
                    : selectedOption === option;
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
                      className={`flex min-h-[52px] w-full items-center rounded-[15px] px-4 py-3.5 text-left text-[15px] font-medium leading-[1.35] tracking-[-0.02em] text-[#1a1a1a] sm:min-h-[62px] sm:rounded-[14px] sm:px-6 sm:text-[16px] sm:tracking-[-0.03em] sm:text-[#262522] sm:shadow-[0_10px_26px_rgba(0,0,0,0.02)] sm:backdrop-blur-[2px] ${
                        isCheckboxSelectionStep ? "justify-between" : ""
                      } ${isSelected ? "sm:bg-[#fffef9]" : "sm:bg-white/74 sm:group-hover:bg-white/84"}`}
                    >
                      <span>{option}</span>
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

              {isCheckboxSelectionStep ? (
                <button
                  type="button"
                  onClick={handleCheckboxStepContinue}
                  disabled={!hasGoalSelections}
                  className={`mt-7 w-full rounded-full px-6 py-4 text-[16px] font-medium tracking-[-0.03em] transition-colors ${
                    hasGoalSelections ? "cursor-pointer bg-[#11110f] text-white" : "bg-black/10 text-black/30"
                  }`}
                >
                  Continue
                </button>
              ) : null}

              {shouldShowSelectedAnswerContinue ? (
                <button
                  type="button"
                  onClick={handleSelectedAnswerContinue}
                  className="mt-7 w-full rounded-full bg-[#11110f] px-6 py-4 text-[16px] font-medium tracking-[-0.03em] text-white transition-colors"
                >
                  Continue
                </button>
              ) : null}

              {isMedicalStep && (needsMedicalConditionsText || needsMedicationText || needsPreviousTreatmentsText || needsFinalNotesText) ? (
                <div className="mt-5 w-full space-y-5">
                  {needsMedicalConditionsText || needsMedicationText || needsPreviousTreatmentsText || needsFinalNotesText ? (
                    <div className="w-full">
                      {!needsFinalNotesText && !needsPreviousTreatmentsText ? (
                        <p className="text-[14px] font-medium tracking-[-0.02em] text-black/56">
                          {needsPreviousTreatmentsText
                            ? "Tell us briefly what you’ve tried."
                            : needsMedicationText
                              ? "Please tell us briefly."
                              : "Please tell us briefly."}
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
                          ? "Optional — for example symptoms, concerns, or anything else you think may be relevant."
                          : needsPreviousTreatmentsText
                            ? "Describe what you’ve tried"
                            : needsMedicationText
                              ? "Add your current medications or supplements"
                              : "Add your medical conditions"}
                        className="mt-3 w-full resize-none rounded-[18px] border border-black/10 bg-[#fffef9] px-4 py-3 text-[15px] font-medium leading-[1.45] tracking-[-0.02em] text-[#262522] outline-none placeholder:text-black/28"
                      />
                    </div>
                  ) : null}

                  {needsPreviousTreatmentsText && false ? (
                    <div className="w-full space-y-5">
                      <div ref={treatmentTypesDropdownRef} className="w-full">
                        <p className="text-[14px] font-medium tracking-[-0.02em] text-black/56">Which types have you tried?</p>
                        <div className="mt-3 overflow-hidden rounded-[22px] border border-black/10 bg-white/72 shadow-[0_10px_26px_rgba(0,0,0,0.02)] backdrop-blur-[2px]">
                          <button
                            type="button"
                            onClick={() => setIsTreatmentTypesDropdownOpen((currentValue) => !currentValue)}
                            className="flex min-h-[62px] w-full items-center justify-between gap-4 bg-[#fffef9] px-5 text-left sm:px-6"
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
                                    <span className="text-[16px] font-medium leading-[1.35] tracking-[-0.03em]">{detailOption}</span>
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
                          <p className="text-[14px] font-medium tracking-[-0.02em] text-black/56">Add details for other treatments</p>
                          <input
                            type="text"
                            value={treatmentOtherDetail}
                            onChange={(event) => setTreatmentOtherDetail(event.target.value)}
                            placeholder="Describe the other treatment"
                            className="mt-3 w-full rounded-[18px] border border-black/10 bg-[#fffef9] px-4 py-3 text-[15px] font-medium tracking-[-0.02em] text-[#262522] outline-none placeholder:text-black/28"
                          />
                        </div>
                      ) : null}

                      <div ref={treatmentSideEffectsDropdownRef} className="w-full">
                        <p className="text-[14px] font-medium tracking-[-0.02em] text-black/56">How were the side effects overall?</p>
                        <div className="mt-3 overflow-hidden rounded-[22px] border border-black/10 bg-white/72 shadow-[0_10px_26px_rgba(0,0,0,0.02)] backdrop-blur-[2px]">
                          <button
                            type="button"
                            onClick={() => setIsTreatmentSideEffectsDropdownOpen((currentValue) => !currentValue)}
                            className="flex min-h-[62px] w-full items-center justify-between gap-4 bg-[#fffef9] px-5 text-left sm:px-6"
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
                                  <span className="text-[16px] font-medium leading-[1.35] tracking-[-0.03em]">{sideEffectOption}</span>
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
                  className={`mt-5 w-full rounded-full px-6 py-4 text-[16px] font-medium tracking-[-0.03em] transition-colors ${
                    canContinueMedicalFollowUp ? "bg-[#11110f] text-white" : "bg-black/10 text-black/30"
                  }`}
                >
                  {currentStep?.id === "final-notes" ? "Submit intake" : "Continue"}
                </button>
              ) : null}

              
            </div>
          )}
        </section>
      </div>

      

      {isMedicalStep ? (
        <>
          {isDoctorPopupOpen ? (
            <div className={`fixed bottom-10 right-6 z-[70] flex w-[360px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-[28px] border border-black/10 bg-white shadow-[0_24px_60px_rgba(0,0,0,0.2)] transition-all duration-220 ease-out ${isDoctorPopupVisible ? "translate-y-0 scale-100 opacity-100" : "translate-y-4 scale-[0.98] opacity-0"}`}>
              <div className="flex items-start justify-between border-b border-black/8 bg-[#fbfaf5] px-5 py-4">
                <div>
                  <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#848484]">Assigned physician</p>
                  <h3 className="mt-1 text-[22px] font-semibold tracking-[-0.04em] text-black">{assignedDoctor.name}</h3>
                </div>
                <button
                  type="button"
                  aria-label="Close doctor info"
                  onClick={closeDoctorPopup}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-white transition-colors hover:bg-[#1a1a1a]"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
                    <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <div className="relative h-[190px] w-full overflow-hidden bg-[#fbfaf5]">
                <Image src={assignedDoctor.imageSrc} alt={assignedDoctor.name} fill sizes="360px" className="object-cover object-[center_18%]" />
                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white via-white/70 to-transparent" />
              </div>

              <div className="space-y-4 px-5 pb-6 pt-1">
                <div>
                  <p className="text-[15px] font-medium tracking-[-0.02em] text-black/55">{assignedDoctor.role}</p>
                  <p className="mt-3 text-[15px] font-medium leading-[1.5] tracking-[-0.02em] text-[#2b2a28]/82">{assignedDoctor.intro}</p>
                </div>

                {shouldShowDoctorPopupAbout ? (
                  <div className="rounded-[22px] bg-[#f4f0e7] px-5 py-5">
                    <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-[#848484]">About</p>
                    <ul className="mt-3 space-y-2 text-[14px] font-medium leading-[1.45] tracking-[-0.02em] text-[#2b2a28]/82">
                      {assignedDoctor.details.map((detail) => (
                        <li key={detail}>{detail}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}

          {isMedicalDoctorIntroStep && !isDoctorPopupOpen ? (
            <button
              type="button"
              onClick={() => openDoctorPopup(true)}
              className={`fixed bottom-6 right-6 z-[65] w-full max-w-[340px] rounded-[24px] bg-gradient-to-r from-[#5f7f4f] via-[#8ea57a] to-[#4b6942] p-[1.5px] text-left shadow-[0_20px_50px_rgba(0,0,0,0.16)] transition-all duration-500 ease-out ${
                isDoctorAssignmentNoticeVisible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
              }`}
              aria-hidden={!isDoctorAssignmentNoticeVisible}
              tabIndex={isDoctorAssignmentNoticeVisible ? 0 : -1}
            >
              <span className="flex items-start gap-3 rounded-[22px] bg-white/95 px-5 py-4 backdrop-blur-sm">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#5f7f4f] text-white shadow-[0_6px_14px_rgba(95,127,79,0.25)]">
                  <svg viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
                    <path d="M5.5 10.25 8.5 13.25 14.5 6.75" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <p className="text-[14px] font-medium leading-[1.45] tracking-[-0.02em] text-[#2b2a28]">
                  <span className="font-semibold">{assignedDoctor.name}</span> has been assigned to review your medical intake.
                </p>
              </span>
            </button>
          ) : null}

          {!isFirstMedicalStep ? (
            <button
              type="button"
              aria-label={isDoctorPopupOpen ? "Close assigned doctor info" : "Open assigned doctor info"}
              aria-expanded={isDoctorPopupOpen}
              onClick={() => {
                if (isDoctorPopupOpen) {
                  closeDoctorPopup();
                  return;
                }

                openDoctorPopup(true);
              }}
              className="fixed bottom-6 right-6 z-[60] flex h-[63px] w-[63px] items-center justify-center overflow-hidden rounded-full border-2 border-white/80 bg-[#fbfaf5] shadow-[0_12px_30px_rgba(0,0,0,0.28)] transition-transform duration-300 hover:scale-105"
            >
              <Image
                src={assignedDoctor.imageSrc}
                alt={assignedDoctor.name}
                fill
                sizes="63px"
                className="object-cover object-[center_18%]"
              />
            </button>
          ) : null}
        </>
      ) : null}
    </main>
  );
}
