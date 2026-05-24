import { motion } from "framer-motion";
import { ShieldAlert, ShieldCheck, AlertTriangle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Field } from "@/components/greenroom/card";
import { DealTypeBadge, PlainBadge } from "@/components/greenroom/badge";
import { formatMoney } from "@/lib/format";
import type { SettlementTrustAssessment } from "@/lib/settlementTrust";

const riskMeta = {
  low: { Icon: ShieldCheck, variant: "brand" as const, label: "Low relationship risk" },
  medium: { Icon: ShieldAlert, variant: "amber" as const, label: "Medium relationship risk" },
  high: { Icon: AlertTriangle, variant: "rose" as const, label: "High relationship risk" },
};

export function DealTrustPanel({ assessment }: { assessment: SettlementTrustAssessment }) {
  const meta = riskMeta[assessment.relationshipRisk.level];
  const accent =
    assessment.relationshipRisk.level === "high"
      ? "rose"
      : assessment.relationshipRisk.level === "medium"
        ? "amber"
        : "brand";

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <Card accent={accent}>
        <CardHeader>
          <div>
            <CardTitle className="flex items-center gap-2">
              <meta.Icon className="w-3.5 h-3.5 text-ink-700" />
              Settlement trust panel
            </CardTitle>
            <CardDescription>
              {assessment.ambiguous
                ? "Ambiguity detected in the deal note. Two payout outcomes are plausible."
                : "Deal terms reconciled across structured fields and deal notes."}
            </CardDescription>
          </div>
          <PlainBadge variant={meta.variant}>{meta.label}</PlainBadge>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Field label="Deal type" value={<DealTypeBadge type={assessment.dealType} />} />
            <Field label="Risk score" value={`${assessment.relationshipRisk.score} / 100`} mono />
            <Field label="Value at risk" value={formatMoney(assessment.valueAtRisk)} mono />
            <Field
              label="Primary ambiguity"
              value={assessment.ambiguous ? "Recoup treatment vs cap" : "None"}
            />
          </div>
          {assessment.relationshipRisk.reasons.length > 0 && (
            <ul className="mt-4 space-y-1 text-[12px] text-ink-600">
              {assessment.relationshipRisk.reasons.map((r) => (
                <li key={r} className="flex gap-2">
                  <span className="text-ink-400">•</span> {r}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
