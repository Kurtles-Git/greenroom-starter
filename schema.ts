// Type-only schema (ported from the original Drizzle schema).
export type SettlementStage =
  | "draft" | "submitted" | "in_review" | "signed"
  | "disputed" | "revised" | "finalized" | "paid" | "voided";

export interface User { id: string; name: string; email: string; role: "booker"|"gm"|"production"|"box_office"; venueId: string; }
export interface Venue { id: string; name: string; capacity: number; city: string; state: string; }
export interface Agency { id: string; name: string; }
export interface Agent { id: string; name: string; agencyId: string | null; email: string; phone: string | null; preferencesNotes: string | null; }
export interface Artist { id: string; name: string; agentId: string | null; managerEmail: string | null; genre: string | null; priorShowCount: number; }
export interface Show {
  id: string; venueId: string; artistId: string; date: string;
  status: "booked"|"advanced"|"day_of"|"settled"|"closed";
  doorsTime: string | null; setTime: string | null; openerArtistId: string | null;
  roomConfig: "standing"|"seated"|"mixed"; internalNotes: string | null; createdAt: Date;
}
export interface Deal {
  id: string; showId: string;
  dealType: "flat"|"percentage_of_gross"|"percentage_of_net"|"vs"|"door";
  guaranteeAmount: number | null; percentage: number | null;
  percentageBasis: "gross"|"net" | null;
  expenseCap: number | null; hospitalityCap: number | null;
  bonusesJson: string | null; dealNotesFreetext: string | null; createdAt: Date;
}
export interface TicketSale { id: string; showId: string; qty: number; gross: number; fees: number; capturedAt: Date; }
export interface Comp {
  id: string; showId: string;
  category: "artist_gl"|"label"|"press"|"venue_staff"|"sponsor"|"promo"|"other";
  count: number; faceValue: number; countsTowardGross: boolean; notes: string | null;
}
export interface Expense {
  id: string; showId: string;
  category: "production"|"sound"|"lights"|"hospitality"|"marketing"|"backline"|"security"|"other";
  amount: number; description: string | null; approved: boolean;
  absorbedByVenue: boolean; enteredByUserId: string | null; enteredAt: Date;
}
export interface Settlement {
  id: string; showId: string; status: SettlementStage;
  draftedAt: Date | null; submittedAt: Date | null; reviewStartedAt: Date | null;
  signedAt: Date | null; disputedAt: Date | null; revisedAt: Date | null;
  finalizedAt: Date | null; paidAt: Date | null;
  completedAt: Date | null; completedByUserId: string | null;
  grossBoxOffice: number | null; netBoxOffice: number | null;
  totalExpenses: number | null; totalToArtist: number | null;
  calculationJson: string | null; recoupsJson: string | null;
  signoffText: string | null; notes: string | null;
}

export type Bonus =
  | { type: "gross_threshold"; label: string; threshold: number; amount: number; stacks?: boolean }
  | { type: "sellout"; label: string; amount: number }
  | { type: "attendance_threshold"; label: string; threshold: number; amount: number }
  | { type: "tier_ratchet"; label: string; tiers: { from: number; to: number | null; percentage: number }[] };

export type Recoup = {
  id: string;
  category: "marketing"|"hospitality_overage"|"production_overage"|"prior_advance"|"damages"|"other";
  label: string; amount: number;
  status: "agreed"|"disputed"|"withdrawn";
};
