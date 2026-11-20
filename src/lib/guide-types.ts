export type VisitSlot = {
  id: string;
  startsAt: string;
  capacity: number;
  available: number;
};

export type PublicGuidedVisit = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  category: string;
  neighborhood: string;
  meetingPoint: string;
  durationMinutes: number;
  pricePerPersonCents: number;
  imageUrl: string | null;
  guide: { displayName: string; bio: string };
  slots: VisitSlot[];
};

export type GuideDashboard = {
  profile: { id: string; displayName: string; bio: string } | null;
  visit: {
    id: string;
    slug: string;
    title: string;
    summary: string;
    description: string;
    category: string;
    neighborhood: string;
    meetingPoint: string;
    durationMinutes: number;
    pricePerPersonCents: number;
    imageUrl: string;
    status: "draft" | "published" | "paused";
  } | null;
  slots: Array<{ id: string; startsAt: string; capacity: number; active: boolean }>;
  stripe: {
    connected: boolean;
    detailsSubmitted: boolean;
    chargesEnabled: boolean;
    transfersEnabled: boolean;
  };
};
