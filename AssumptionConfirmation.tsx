import { AnimatePresence, motion } from "framer-motion";
import { Check, AlertTriangle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/greenroom/card";
import { Button } from "@/components/greenroom/button";
import { PlainBadge } from "@/components/greenroom/badge";
import { formatMoney } from "@/lib/format";
import type { AssumptionState, ScenarioResult } from "@/lib/settlementTrust";

interface Props {
  selected: ScenarioResult;
  state: AssumptionState;
  onConfirm: () => void;
  onReset: () => void;
}

export function AssumptionConfirmation({ selected, state, onConfirm, onReset }: Props) {
  const confirmed = state === "human_confirmed";
  return (
    <Card accent={confirmed ? "brand" : "amber"}>
      <CardHeader>
        <div>
          <CardTitle className="flex items-center gap-2">
            <motion.span
              key={confirmed ? "ok" : "warn"}
              initial={{ scale: 0.6, opacity: 0, rotate: -10 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 480, damping: 22 }}
              className="inline-flex"
            >
              {confirmed ? (
                <Check className="w-3.5 h-3.5 text-brand-700" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
              )}
            </motion.span>
            Human confirmation
          </CardTitle>
          <CardDescription>
            {confirmed
              ? "The selected assumption has been confirmed. The audit trail records this decision."
              : "Confirm the assumption used to generate the settlement statement."}
          </CardDescription>
        </div>
        <PlainBadge variant={confirmed ? "brand" : "amber"}>
          {confirmed ? "Human confirmed" : "Confirmation required"}
        </PlainBadge>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-ink-200/80 bg-ink-50/60 px-3 py-2.5 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[10px] eyebrow text-ink-500">Selected assumption</div>
            <div className="text-[13px] text-ink-900 font-medium truncate">
              Scenario {selected.id} · {selected.label}
            </div>
          </div>
          <div className="font-mono tabular text-[14px] text-ink-900">
            {formatMoney(selected.artistPayout)}
          </div>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {confirmed ? (
            <motion.div
              key="confirmed"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-3 flex items-center justify-between gap-3"
            >
              <p className="text-[12px] text-ink-600">
                Statement now reflects the confirmed assumption.
              </p>
              <Button variant="ghost" size="sm" onClick={onReset}>
                Unconfirm
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="unconfirmed"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-3 flex items-center justify-between gap-3"
            >
              <p className="text-[12px] text-ink-600">
                This is a possible interpretation, not a final ruling.
              </p>
              <Button variant="brand" size="sm" onClick={onConfirm} className="focus-visible:ring-2 focus-visible:ring-brand-700/60 focus-visible:ring-offset-2">
                <Check className="w-3.5 h-3.5" /> Confirm assumption
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
