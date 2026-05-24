import { motion } from "framer-motion";
import { Sparkles, AlertTriangle, Calculator, UserCheck, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/greenroom/card";
import type { AssumptionState, SettlementTrustAssessment } from "@/lib/settlementTrust";

interface AuditEvent {
  id: string;
  Icon: typeof Sparkles;
  title: string;
  detail: string;
  state: "done" | "pending";
}

export function AuditTrail({
  assessment,
  assumptionState,
  selectedScenarioId,
}: {
  assessment: SettlementTrustAssessment;
  assumptionState: AssumptionState;
  selectedScenarioId: "A" | "B";
}) {
  const confirmed = assumptionState === "human_confirmed";

  const events: AuditEvent[] = [
    {
      id: "notes_interpreted",
      Icon: Sparkles,
      title: "Deal notes interpreted",
      detail: `${assessment.terms.length} term${assessment.terms.length === 1 ? "" : "s"} extracted from structured fields and free-text notes.`,
      state: "done",
    },
    {
      id: "ambiguity_detected",
      Icon: AlertTriangle,
      title: assessment.ambiguous ? "Ambiguity detected" : "No ambiguity detected",
      detail: assessment.ambiguous
        ? "Recoup treatment relative to expense cap is unstated. Both interpretations are plausible."
        : "Deal terms reconcile cleanly across sources.",
      state: "done",
    },
    {
      id: "scenarios_calculated",
      Icon: Calculator,
      title: "Scenarios calculated",
      detail: `Scenario A: $${assessment.scenarioA.artistPayout.toLocaleString()} · Scenario B: $${assessment.scenarioB.artistPayout.toLocaleString()} · Δ $${assessment.valueAtRisk.toLocaleString()}.`,
      state: "done",
    },
    {
      id: "confirmation",
      Icon: confirmed ? UserCheck : Clock,
      title: confirmed ? "Human confirmation recorded" : "Confirmation pending",
      detail: confirmed
        ? `Talent buyer confirmed Scenario ${selectedScenarioId}. Alternative preserved in trail.`
        : `Awaiting human confirmation for Scenario ${selectedScenarioId}.`,
      state: confirmed ? "done" : "pending",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Audit trail</CardTitle>
          <CardDescription>
            Every interpretation, calculation, and human decision is recorded.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <ol className="relative space-y-3 pl-5">
          <span className="absolute left-[7px] top-1 bottom-1 w-px bg-ink-200/80" aria-hidden />
          {events.map((e, i) => (
            <motion.li
              key={e.id}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: i * 0.05 }}
              className="relative"
            >
              <span
                className={cn(
                  "absolute -left-5 top-1 inline-flex items-center justify-center w-3.5 h-3.5 rounded-full ring-2 ring-white",
                  e.state === "done" ? "bg-brand-700" : "bg-amber-500 animate-pulse",
                )}
                aria-hidden
              />
              <div className="flex items-start gap-2">
                <e.Icon
                  className={cn(
                    "w-3.5 h-3.5 mt-0.5 shrink-0",
                    e.state === "done" ? "text-ink-700" : "text-amber-700",
                  )}
                />
                <div className="min-w-0">
                  <div className="text-[12.5px] font-medium text-ink-900">{e.title}</div>
                  <p className="text-[11.5px] text-ink-500 leading-relaxed">{e.detail}</p>
                </div>
              </div>
            </motion.li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
