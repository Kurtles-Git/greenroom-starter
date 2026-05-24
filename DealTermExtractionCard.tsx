import { motion } from "framer-motion";
import { FileText, Database, Sparkles, HelpCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/greenroom/card";
import { PlainBadge } from "@/components/greenroom/badge";
import { formatMoney } from "@/lib/format";
import type { ExtractedTerm, TermConfidence, TermSource } from "@/lib/settlementTrust";

const sourceIcon: Record<TermSource, typeof FileText> = {
  deal_notes: FileText,
  structured_field: Database,
  settlement_record: Database,
  inferred: Sparkles,
};

const confidenceMeta: Record<TermConfidence, { variant: "default" | "brand" | "amber" | "rose"; label: string }> = {
  verified: { variant: "brand", label: "Verified" },
  needs_confirmation: { variant: "amber", label: "Needs confirmation" },
  ambiguous: { variant: "rose", label: "Ambiguous" },
  missing: { variant: "default", label: "Missing" },
};

function formatValue(term: ExtractedTerm): string {
  if (term.value == null) return "—";
  if (term.key === "percentage" && typeof term.value === "number") return `${Math.round(term.value * 100)}%`;
  if (typeof term.value === "number") return formatMoney(term.value);
  return String(term.value);
}

export function DealTermExtractionCard({ terms }: { terms: ReadonlyArray<ExtractedTerm> }) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-ink-700" />
            Extracted deal terms
          </CardTitle>
          <CardDescription>
            Structured fields reconciled against free-text deal notes. Confidence reflects source agreement.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y divide-ink-100/80">
          {terms.map((term, i) => {
            const Icon = sourceIcon[term.source] ?? HelpCircle;
            const meta = confidenceMeta[term.confidence];
            return (
              <motion.li
                key={term.key}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: i * 0.04 }}
                className="px-5 py-3 flex items-start justify-between gap-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-medium text-ink-900">{term.label}</span>
                    <span className="font-mono tabular text-[13px] text-ink-700">{formatValue(term)}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-[11.5px] text-ink-500">
                    <Icon className="w-3 h-3" />
                    <span>{term.sourceLabel}</span>
                  </div>
                  {term.note && (
                    <p className="mt-1 text-[11.5px] text-amber-800">{term.note}</p>
                  )}
                </div>
                <PlainBadge variant={meta.variant}>{meta.label}</PlainBadge>
              </motion.li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
