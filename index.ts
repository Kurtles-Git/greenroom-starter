// In-memory data layer backed by the seeded JSON dump from the original
// Greenroom SQLite database. Keeps queries.ts signatures identical so the
// ported pages don't need to change shape.
import raw from "@/data/greenroom-data.json";
import type {
  User, Venue, Agency, Agent, Artist, Show, Deal, TicketSale, Comp, Expense, Settlement,
} from "@/db/schema";

type RawRow = Record<string, unknown>;

function toDate(v: unknown): Date | null {
  if (v == null) return null;
  if (typeof v === "number") return new Date(v * 1000);
  if (typeof v === "string") {
    const n = Number(v);
    if (!Number.isNaN(n)) return new Date(n * 1000);
    return new Date(v);
  }
  return null;
}
function toBool(v: unknown): boolean { return v === 1 || v === true || v === "1" || v === "true"; }
function toNumOrNull(v: unknown): number | null { return v == null ? null : Number(v); }
function toStrOrNull(v: unknown): string | null { return v == null ? null : String(v); }

const r = raw as Record<string, RawRow[]>;

export const users: User[] = (r.users ?? []).map((u) => ({
  id: String(u.id), name: String(u.name), email: String(u.email),
  role: u.role as User["role"], venueId: String(u.venue_id),
}));
export const venues: Venue[] = (r.venues ?? []).map((v) => ({
  id: String(v.id), name: String(v.name), capacity: Number(v.capacity),
  city: String(v.city), state: String(v.state),
}));
export const agencies: Agency[] = (r.agencies ?? []).map((a) => ({
  id: String(a.id), name: String(a.name),
}));
export const agents: Agent[] = (r.agents ?? []).map((a) => ({
  id: String(a.id), name: String(a.name),
  agencyId: toStrOrNull(a.agency_id), email: String(a.email),
  phone: toStrOrNull(a.phone), preferencesNotes: toStrOrNull(a.preferences_notes),
}));
export const artists: Artist[] = (r.artists ?? []).map((a) => ({
  id: String(a.id), name: String(a.name),
  agentId: toStrOrNull(a.agent_id), managerEmail: toStrOrNull(a.manager_email),
  genre: toStrOrNull(a.genre), priorShowCount: Number(a.prior_show_count ?? 0),
}));
export const shows: Show[] = (r.shows ?? []).map((s) => ({
  id: String(s.id), venueId: String(s.venue_id), artistId: String(s.artist_id),
  date: String(s.date), status: s.status as Show["status"],
  doorsTime: toStrOrNull(s.doors_time), setTime: toStrOrNull(s.set_time),
  openerArtistId: toStrOrNull(s.opener_artist_id),
  roomConfig: (s.room_config as Show["roomConfig"]) ?? "standing",
  internalNotes: toStrOrNull(s.internal_notes),
  createdAt: toDate(s.created_at) ?? new Date(),
}));
export const deals: Deal[] = (r.deals ?? []).map((d) => ({
  id: String(d.id), showId: String(d.show_id), dealType: d.deal_type as Deal["dealType"],
  guaranteeAmount: toNumOrNull(d.guarantee_amount), percentage: toNumOrNull(d.percentage),
  percentageBasis: (d.percentage_basis as Deal["percentageBasis"]) ?? null,
  expenseCap: toNumOrNull(d.expense_cap), hospitalityCap: toNumOrNull(d.hospitality_cap),
  bonusesJson: toStrOrNull(d.bonuses_json), dealNotesFreetext: toStrOrNull(d.deal_notes_freetext),
  createdAt: toDate(d.created_at) ?? new Date(),
}));
export const ticketSales: TicketSale[] = (r.ticket_sales ?? []).map((t) => ({
  id: String(t.id), showId: String(t.show_id), qty: Number(t.qty),
  gross: Number(t.gross), fees: Number(t.fees),
  capturedAt: toDate(t.captured_at) ?? new Date(),
}));
export const comps: Comp[] = (r.comps ?? []).map((c) => ({
  id: String(c.id), showId: String(c.show_id), category: c.category as Comp["category"],
  count: Number(c.count), faceValue: Number(c.face_value),
  countsTowardGross: toBool(c.counts_toward_gross), notes: toStrOrNull(c.notes),
}));
export const expenses: Expense[] = (r.expenses ?? []).map((e) => ({
  id: String(e.id), showId: String(e.show_id), category: e.category as Expense["category"],
  amount: Number(e.amount), description: toStrOrNull(e.description),
  approved: toBool(e.approved), absorbedByVenue: toBool(e.absorbed_by_venue),
  enteredByUserId: toStrOrNull(e.entered_by_user_id),
  enteredAt: toDate(e.entered_at) ?? new Date(),
}));
export const settlements: Settlement[] = (r.settlements ?? []).map((s) => ({
  id: String(s.id), showId: String(s.show_id), status: s.status as Settlement["status"],
  draftedAt: toDate(s.drafted_at), submittedAt: toDate(s.submitted_at),
  reviewStartedAt: toDate(s.review_started_at), signedAt: toDate(s.signed_at),
  disputedAt: toDate(s.disputed_at), revisedAt: toDate(s.revised_at),
  finalizedAt: toDate(s.finalized_at), paidAt: toDate(s.paid_at),
  completedAt: toDate(s.completed_at), completedByUserId: toStrOrNull(s.completed_by_user_id),
  grossBoxOffice: toNumOrNull(s.gross_box_office), netBoxOffice: toNumOrNull(s.net_box_office),
  totalExpenses: toNumOrNull(s.total_expenses), totalToArtist: toNumOrNull(s.total_to_artist),
  calculationJson: toStrOrNull(s.calculation_json), recoupsJson: toStrOrNull(s.recoups_json),
  signoffText: toStrOrNull(s.signoff_text), notes: toStrOrNull(s.notes),
}));
