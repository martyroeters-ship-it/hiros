export type TrackerStepStatus = "complete" | "active" | "pending";

export type DashboardTrackerStep = {
  label: string;
  status: TrackerStepStatus;
  date?: string;
  icon?: "truck" | "house";
};

export type DashboardNotificationIcon = "check" | "camera" | "message" | "clock";

export type DashboardNotification = {
  id: string;
  title: string;
  detail: string;
  time: string;
  badge?: string;
  badgeClass?: string;
  icon: DashboardNotificationIcon;
  href?: string;
};

export type DashboardPhoto = {
  id: string;
  kind: string;
  label: string;
  src: string;
  date: string;
  createdAt: number;
};

export type DashboardMessage = {
  id: string;
  from: "patient" | "doctor";
  body: string;
  date: string;
  time: string;
  createdAt: number;
};

export type DashboardPhysicianNote = {
  id: string;
  date: string;
  text: string;
};

export type DashboardTimelineEvent = {
  date: string;
  label: string;
  sub: string;
  type: "physician" | "photo" | "start";
};

export type PatientDashboardSnapshot = {
  signedIn: boolean;
  greetingSubtitle: string;
  caseId: string | null;
  statusTitle: string;
  statusDetail: string;
  statusCta: { label: string; href: string };
  stepCurrent: number;
  stepTotal: number;
  tracker: DashboardTrackerStep[];
  estimatedDelivery: string;
  doctorName: string | null;
  doctorSpecialty: string | null;
  doctorLicense: string | null;
  doctorLabel: string;
  treatmentName: string | null;
  treatmentStart: string | null;
  treatmentFollowUp: string | null;
  treatmentNotes: string | null;
  treatmentApproved: boolean;
  physicianSince: string | null;
  lastReviewAt: string | null;
  isPremium: boolean;
  unreadMessageCount: number;
  photos: DashboardPhoto[];
  messages: DashboardMessage[];
  physicianNotes: DashboardPhysicianNote[];
  timeline: DashboardTimelineEvent[];
  currentMedications: string[];
  nextUp: { title: string; detail: string; cta: string; href: string };
  notifications: DashboardNotification[];
  paymentDue: boolean;
  paymentClaimed: boolean;
  paymentStatus: string | null;
  paymentReference: string;
};
