/**
 * Settlement Trust Layer — deterministic domain logic.
 *
 * Powers the Coastal Spell-style Vs deal ambiguity workflow on
 * `/shows/[id]/settle`. No external AI calls — term extraction is
 * simulated as structured keyword parsing over the free-text deal note.
 *
 * Math is deterministic and rounds payouts to whole dollars (banker's
 * floor on .5 boundaries is avoided by using Math.round). The guarantee
 * floor is always applied: artist payout = max(guarantee, computed share).
 */

import type { ShowWithRelations } from "@/lib/queries";

// ---------------------------------------------------------------------------
// Demo fallback constants (Coastal Spell scenario)
// ---------------------------------------------------------------------------

export const COASTAL_SPELL_DEFAULTS = {
  gross: 19840,
  fees: 1984,
  expenseCap: 2500,
  guarantee: 5000,
  percentage: 0.8,
  marketingRecoup: 900,
  scenarioAPayout: 12285,
  scenarioBPayout: 11565,
  valueAtRisk: 720,
} as const;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TermSource = "deal_notes" | "structured_field" | "settlement_record" | "inferred";
export type TermConfidence = "verified" | "needs_confirmation" | "ambiguous" | "missing";

export interface ExtractedTerm {
  key: string;
  label: string;
  value: string | number | null;
  source: TermSource;
  sourceLabel: string;
  confidence: TermConfidence;
  matchesStructured: boolean | null;
  note?: string;
}

export type TrustFlagSeverity = "info" | "warning" | "critical";

export interface TrustFlag {
  id: string;
  severity: TrustFlagSeverity;
  title: string;
  detail: string;
  termKeys: string[];
}

export interface ScenarioInputs {
  gross: number;
  fees: number;
  cappedExpenses: number;
  marketingRecoup: number;
  guarantee: number;
  percentage: number;
}

export interface ScenarioResult {
  id: "A" | "B";
  label: string;
  description: string;
  net: number;
  artistShare: number;
  artistPayout: number;          // after guarantee floor, rounded
  guaranteeApplied: boolean;
  breakdown: ReadonlyArray<{ label: string; amount: number; sign: "+" | "-" | "=" }>;
}

export type AssumptionState = "unconfirmed" | "human_confirmed";

export interface SettlementTrustAssessment {
  showId: string;
  dealType: string;
  inputs: ScenarioInputs;
  terms: ReadonlyArray<ExtractedTerm>;
  flags: ReadonlyArray<TrustFlag>;
  scenarioA: ScenarioResult;
  scenarioB: ScenarioResult;
  valueAtRisk: number;
  recommendedScenario: "A" | "B";
  recommendationReason: string;
  relationshipRisk: RelationshipRisk;
  ambiguous: boolean;
}

export type RelationshipRiskLevel = "low" | "medium" | "high";

export interface RelationshipRisk {
  level: RelationshipRiskLevel;
  score: number; // 0–100
  reasons: ReadonlyArray<string>;
}

// ---------------------------------------------------------------------------
// Deterministic math
// ---------------------------------------------------------------------------

function round(n: number): number {
  return Math.round(n);
}

/** Scenario A — marketing recoup is *inside* the capped expenses. */
export function computeScenarioA(inputs: ScenarioInputs): ScenarioResult {
  const { gross, fees, cappedExpenses, guarantee, percentage } = inputs;
  const net = gross - fees - cappedExpenses;
  const share = net * percentage;
  const artistPayout = Math.max(guarantee, round(share));
  return {
    id: "A",
    label: "Recoup inside expense cap",
    description:
      "The $900 marketing recoup is absorbed within the $2,500 expense cap. Only the cap is deducted before the split.",
    net,
    artistShare: share,
    artistPayout,
    guaranteeApplied: artistPayout === guarantee && round(share) < guarantee,
    breakdown: [
      { label: "Gross box office", amount: gross, sign: "+" },
      { label: "Ticketing fees", amount: fees, sign: "-" },
      { label: "Capped expenses (recoup absorbed)", amount: cappedExpenses, sign: "-" },
      { label: "Net pool", amount: net, sign: "=" },
      { label: `Artist share (${Math.round(percentage * 100)}%)`, amount: round(share), sign: "=" },
    ],
  };
}

/** Scenario B — marketing recoup is *outside* the cap, deducted separately. */
export function computeScenarioB(inputs: ScenarioInputs): ScenarioResult {
  const { gross, fees, cappedExpenses, marketingRecoup, guarantee, percentage } = inputs;
  const net = gross - fees - marketingRecoup - cappedExpenses;
  const share = net * percentage;
  const artistPayout = Math.max(guarantee, round(share));
  return {
    id: "B",
    label: "Recoup outside expense cap",
    description:
      "The $900 marketing recoup is deducted from gross before the cap is applied, in addition to capped expenses.",
    net,
    artistShare: share,
    artistPayout,
    guaranteeApplied: artistPayout === guarantee && round(share) < guarantee,
    breakdown: [
      { label: "Gross box office", amount: gross, sign: "+" },
      { label: "Ticketing fees", amount: fees, sign: "-" },
      { label: "Marketing recoup (separate)", amount: marketingRecoup, sign: "-" },
      { label: "Capped expenses", amount: cappedExpenses, sign: "-" },
      { label: "Net pool", amount: net, sign: "=" },
      { label: `Artist share (${Math.round(percentage * 100)}%)`, amount: round(share), sign: "=" },
    ],
  };
}

export function computeValueAtRisk(a: ScenarioResult, b: ScenarioResult): number {
  return Math.abs(a.artistPayout - b.artistPayout);
}

// ---------------------------------------------------------------------------
// Simulated AI term extraction (deterministic keyword parser)
// ---------------------------------------------------------------------------

interface NoteSignals {
  hasExpenseCap: boolean;
  expenseCapAmount: number | null;
  hasMarketingRecoup: boolean;
  marketingRecoupAmount: number | null;
  recoupBasis: "gross" | "net" | "unspecified";
  hasAmbiguousRecoupTreatment: boolean;
}

function parseNoteSignals(note: string | null | undefined): NoteSignals {
  const text = (note ?? "").toLowerCase();

  const capMatch = text.match(/(?:expenses?\s+capped?|expense\s+cap)(?:\s+at)?[^$\d]*\$?\s*([\d,]+)/);
  const recoupMatch = text.match(/(?:marketing\s+recoup[^$]*)\$?\s*([\d,]+)/);

  const recoupAgainstGross = /recoup[^.]*against\s+gross/.test(text);
  const recoupInsideCap = /recoup[^.]*(inside|within|included|part of)\s+(the\s+)?(expense\s+)?cap/.test(text);

  const hasRecoupMention = /recoup/.test(text);
  // Ambiguous if the note mentions both a cap and a recoup but never explicitly
  // states whether the recoup sits inside or outside the cap.
  const hasAmbiguousRecoupTreatment =
    !!capMatch && hasRecoupMention && !recoupInsideCap;

  return {
    hasExpenseCap: !!capMatch,
    expenseCapAmount: capMatch ? Number(capMatch[1].replace(/,/g, "")) : null,
    hasMarketingRecoup: !!recoupMatch || /marketing\s+recoup/.test(text),
    marketingRecoupAmount: recoupMatch ? Number(recoupMatch[1].replace(/,/g, "")) : null,
    recoupBasis: recoupAgainstGross ? "gross" : recoupInsideCap ? "net" : "unspecified",
    hasAmbiguousRecoupTreatment,
  };
}

// ---------------------------------------------------------------------------
// Public API: build the full assessment for a show
// ---------------------------------------------------------------------------

export interface BuildAssessmentOptions {
  /** If true, missing data is back-filled from COASTAL_SPELL_DEFAULTS. */
  useDemoFallback?: boolean;
}

export function buildSettlementTrustAssessment(
  data: ShowWithRelations,
  opts: BuildAssessmentOptions = {},
): SettlementTrustAssessment {
  const useFallback = opts.useDemoFallback ?? true;
  const d = COASTAL_SPELL_DEFAULTS;

  const { show, deal, ticketSales, expenses } = data;

  const computedGross = ticketSales.reduce((s, t) => s + t.gross, 0);
  const computedFees = ticketSales.reduce((s, t) => s + t.fees, 0);
  const computedExpenses = expenses
    .filter((e) => !e.absorbedByVenue)
    .reduce((s, e) => s + e.amount, 0);

  const gross = computedGross > 0 ? computedGross : useFallback ? d.gross : 0;
  const fees = computedFees > 0 ? computedFees : useFallback ? d.fees : 0;
  const guarantee = deal?.guaranteeAmount ?? (useFallback ? d.guarantee : 0);
  const percentage = deal?.percentage ?? (useFallback ? d.percentage : 0);
  const expenseCap = deal?.expenseCap ?? (useFallback ? d.expenseCap : 0);

  const signals = parseNoteSignals(deal?.dealNotesFreetext);
  const marketingRecoup =
    signals.marketingRecoupAmount ?? (useFallback ? d.marketingRecoup : 0);

  // Capped expenses applied to scenarios: the lesser of actual and cap.
  const cappedExpenses =
    computedExpenses > 0 ? Math.min(computedExpenses, expenseCap) : expenseCap;

  const inputs: ScenarioInputs = {
    gross,
    fees,
    cappedExpenses,
    marketingRecoup,
    guarantee,
    percentage,
  };

  const scenarioA = computeScenarioA(inputs);
  const scenarioB = computeScenarioB(inputs);
  const valueAtRisk = computeValueAtRisk(scenarioA, scenarioB);

  const terms = extractTerms({
    deal,
    signals,
    expenseCap,
    marketingRecoup,
    guarantee,
    percentage,
  });

  const flags = buildTrustFlags({ signals, terms, valueAtRisk });
  const ambiguous = signals.hasAmbiguousRecoupTreatment;

  // Recommend the scenario that is *less* favorable to the artist as the
  // conservative default — Mariana can confirm or override.
  const recommendedScenario: "A" | "B" =
    scenarioB.artistPayout <= scenarioA.artistPayout ? "B" : "A";
  const recommendationReason =
    "Conservative default: assume the recoup is deducted separately until the agent confirms otherwise.";

  const relationshipRisk = computeRelationshipRisk({
    valueAtRisk,
    ambiguous,
    hasDispute: data.settlement?.status === "disputed",
  });

  return {
    showId: show.id,
    dealType: deal?.dealType ?? "unknown",
    inputs,
    terms,
    flags,
    scenarioA,
    scenarioB,
    valueAtRisk,
    recommendedScenario,
    recommendationReason,
    relationshipRisk,
    ambiguous,
  };
}

// ---------------------------------------------------------------------------
// Term extraction & trust flags
// ---------------------------------------------------------------------------

function extractTerms(args: {
  deal: ShowWithRelations["deal"];
  signals: NoteSignals;
  expenseCap: number;
  marketingRecoup: number;
  guarantee: number;
  percentage: number;
}): ExtractedTerm[] {
  const { deal, signals, expenseCap, marketingRecoup, guarantee, percentage } = args;
  const hasStructuredCap = deal?.expenseCap != null;
  const hasStructuredGuarantee = deal?.guaranteeAmount != null;
  const hasStructuredPercentage = deal?.percentage != null;

  const capMatches =
    signals.expenseCapAmount != null && hasStructuredCap
      ? signals.expenseCapAmount === deal?.expenseCap
      : null;

  return [
    {
      key: "guarantee",
      label: "Guarantee",
      value: guarantee,
      source: hasStructuredGuarantee ? "structured_field" : "inferred",
      sourceLabel: hasStructuredGuarantee ? "Matches structured field" : "Inferred from demo defaults",
      confidence: hasStructuredGuarantee ? "verified" : "needs_confirmation",
      matchesStructured: hasStructuredGuarantee,
    },
    {
      key: "percentage",
      label: "Artist percentage",
      value: percentage,
      source: hasStructuredPercentage ? "structured_field" : "inferred",
      sourceLabel: hasStructuredPercentage ? "Matches structured field" : "Inferred from demo defaults",
      confidence: hasStructuredPercentage ? "verified" : "needs_confirmation",
      matchesStructured: hasStructuredPercentage,
    },
    {
      key: "expense_cap",
      label: "Expense cap",
      value: expenseCap,
      source: signals.hasExpenseCap ? "deal_notes" : hasStructuredCap ? "structured_field" : "inferred",
      sourceLabel: signals.hasExpenseCap
        ? hasStructuredCap
          ? capMatches
            ? "Extracted from deal notes · matches structured field"
            : "Extracted from deal notes · differs from structured field"
          : "Extracted from deal notes · structured field missing"
        : hasStructuredCap
          ? "Matches structured field"
          : "Inferred from demo defaults",
      confidence:
        signals.hasExpenseCap && hasStructuredCap && capMatches
          ? "verified"
          : signals.hasExpenseCap && hasStructuredCap && capMatches === false
            ? "ambiguous"
            : "needs_confirmation",
      matchesStructured: hasStructuredCap ? capMatches : null,
    },
    {
      key: "marketing_recoup",
      label: "Marketing recoup",
      value: marketingRecoup,
      source: signals.hasMarketingRecoup ? "deal_notes" : "inferred",
      sourceLabel: signals.hasMarketingRecoup
        ? "Extracted from deal notes · structured field missing"
        : "Inferred from demo defaults",
      confidence: signals.hasMarketingRecoup ? "needs_confirmation" : "missing",
      matchesStructured: false,
      note: signals.hasAmbiguousRecoupTreatment
        ? "Ambiguous wording — recoup treatment relative to expense cap is unstated."
        : undefined,
    },
  ];
}

function buildTrustFlags(args: {
  signals: NoteSignals;
  terms: ReadonlyArray<ExtractedTerm>;
  valueAtRisk: number;
}): TrustFlag[] {
  const flags: TrustFlag[] = [];

  if (args.signals.hasAmbiguousRecoupTreatment) {
    flags.push({
      id: "ambiguous_recoup",
      severity: "critical",
      title: "Ambiguous recoup treatment",
      detail:
        "The deal note mentions a marketing recoup and an expense cap but does not state whether the recoup is inside or outside the cap. Two payout outcomes are plausible.",
      termKeys: ["expense_cap", "marketing_recoup"],
    });
  }

  const recoupTerm = args.terms.find((t) => t.key === "marketing_recoup");
  if (recoupTerm && recoupTerm.matchesStructured === false) {
    flags.push({
      id: "recoup_structured_missing",
      severity: "warning",
      title: "Structured field missing",
      detail: "Marketing recoup lives only in free-text deal notes. The in-app worksheet would otherwise miss it.",
      termKeys: ["marketing_recoup"],
    });
  }

  if (args.valueAtRisk >= 500) {
    flags.push({
      id: "material_var",
      severity: "warning",
      title: `Material value at risk: $${args.valueAtRisk.toLocaleString()}`,
      detail: "The payout delta between interpretations is large enough to damage the agent relationship if settled silently.",
      termKeys: [],
    });
  }

  return flags;
}

function computeRelationshipRisk(args: {
  valueAtRisk: number;
  ambiguous: boolean;
  hasDispute: boolean;
}): RelationshipRisk {
  const reasons: string[] = [];
  let score = 0;
  if (args.ambiguous) { score += 40; reasons.push("Ambiguous recoup treatment"); }
  if (args.valueAtRisk >= 500) { score += 30; reasons.push(`Value at risk $${args.valueAtRisk}`); }
  else if (args.valueAtRisk > 0) { score += 10; }
  if (args.hasDispute) { score += 30; reasons.push("Existing dispute flagged on settlement"); }

  const level: RelationshipRiskLevel = score >= 60 ? "high" : score >= 30 ? "medium" : "low";
  return { level, score: Math.min(100, score), reasons };
}

// ---------------------------------------------------------------------------
// Settlement statement & confirmation
// ---------------------------------------------------------------------------

export interface SettlementStatement {
  headline: string;
  body: string;
  bullets: ReadonlyArray<string>;
  selectedScenarioId: "A" | "B";
  assumptionLabel: string;
  assumptionState: AssumptionState;
}

export function buildSettlementStatement(
  assessment: SettlementTrustAssessment,
  selectedScenarioId: "A" | "B",
  assumptionState: AssumptionState = "unconfirmed",
): SettlementStatement {
  const chosen = selectedScenarioId === "A" ? assessment.scenarioA : assessment.scenarioB;
  const other = selectedScenarioId === "A" ? assessment.scenarioB : assessment.scenarioA;

  return {
    headline: `Artist payout: $${chosen.artistPayout.toLocaleString()} (${chosen.label.toLowerCase()})`,
    body:
      assumptionState === "human_confirmed"
        ? "This statement reflects the assumption confirmed by the talent buyer. The alternative interpretation is preserved in the audit trail."
        : "This is a possible interpretation. The assumption below needs human confirmation before the statement is sent.",
    bullets: [
      `Gross box office: $${assessment.inputs.gross.toLocaleString()}`,
      `Fees: -$${assessment.inputs.fees.toLocaleString()}`,
      `Capped expenses: -$${assessment.inputs.cappedExpenses.toLocaleString()}`,
      selectedScenarioId === "B"
        ? `Marketing recoup (separate): -$${assessment.inputs.marketingRecoup.toLocaleString()}`
        : `Marketing recoup absorbed inside expense cap`,
      `Artist share (${Math.round(assessment.inputs.percentage * 100)}%) vs guarantee $${assessment.inputs.guarantee.toLocaleString()}`,
      `Alternative interpretation would have paid $${other.artistPayout.toLocaleString()} (Δ $${assessment.valueAtRisk.toLocaleString()}).`,
    ],
    selectedScenarioId,
    assumptionLabel: chosen.label,
    assumptionState,
  };
}

// ---------------------------------------------------------------------------
// Recovery (Offramp) payload & URL
// ---------------------------------------------------------------------------

export interface RecoveryPayload {
  risk_type: "settlement_dispute";
  stakeholder_type: "agent" | "tour_manager" | "artist_manager" | "artist";
  stakeholder_name: string;
  company_or_account: string | null;
  issue_summary: string;
  issue_details: string;
  value_at_risk: number;
  currency: "USD";
  urgency: "low" | "medium" | "high";
  relationship_risk: RelationshipRiskLevel;
  source_app: "greenroom_case_demo";
  source_reference_id: string;
  scenario_a: { label: string; outcome_value: number; description: string };
  scenario_b: { label: string; outcome_value: number; description: string };
}

export function buildRecoveryPayload(
  data: ShowWithRelations,
  assessment: SettlementTrustAssessment,
): RecoveryPayload {
  const urgency: RecoveryPayload["urgency"] =
    assessment.relationshipRisk.level === "high" ? "high"
      : assessment.relationshipRisk.level === "medium" ? "medium" : "low";

  return {
    risk_type: "settlement_dispute",
    stakeholder_type: "agent",
    stakeholder_name: data.agent?.name ?? "Unknown agent",
    company_or_account: data.agency?.name ?? null,
    issue_summary: "Marketing recoup treatment unclear",
    issue_details:
      "The deal can be interpreted as either including the marketing recoup inside the expense cap or deducting it separately.",
    value_at_risk: assessment.valueAtRisk,
    currency: "USD",
    urgency,
    relationship_risk: assessment.relationshipRisk.level,
    source_app: "greenroom_case_demo",
    source_reference_id: data.show.id,
    scenario_a: {
      label: assessment.scenarioA.label,
      outcome_value: assessment.scenarioA.artistPayout,
      description: assessment.scenarioA.description,
    },
    scenario_b: {
      label: assessment.scenarioB.label,
      outcome_value: assessment.scenarioB.artistPayout,
      description: assessment.scenarioB.description,
    },
  };
}

/** Browser-safe Base64 encoding of a JSON payload. */
function encodePayloadBase64(payload: unknown): string {
  const json = JSON.stringify(payload);
  if (typeof btoa === "function") {
    // btoa needs latin1; encode UTF-8 first.
    const utf8 = unescape(encodeURIComponent(json));
    return btoa(utf8);
  }
  // Server / Node fallback.
  return Buffer.from(json, "utf-8").toString("base64");
}

export const OFFRAMP_RECOVERY_BASE_URL = "https://thatofframp.com/recovery/demo";

export function buildOfframpRecoveryUrl(payload: RecoveryPayload): string {
  const encoded = encodePayloadBase64(payload);
  const params = new URLSearchParams({ payload: encoded });
  return `${OFFRAMP_RECOVERY_BASE_URL}?${params.toString()}`;
}

/** Flat query-param deep link — skips nested scenario_* / issue_details objects. */
export function buildOfframpRecoveryFlatUrl(payload: RecoveryPayload): string {
  const params = new URLSearchParams();
  const flatKeys: ReadonlyArray<keyof RecoveryPayload> = [
    "risk_type",
    "stakeholder_type",
    "stakeholder_name",
    "company_or_account",
    "issue_summary",
    "value_at_risk",
    "currency",
    "urgency",
    "relationship_risk",
    "source_app",
    "source_reference_id",
  ];
  for (const key of flatKeys) {
    const v = payload[key];
    if (v == null) continue;
    params.set(key, String(v));
  }
  return `${OFFRAMP_RECOVERY_BASE_URL}?${params.toString()}`;
}

