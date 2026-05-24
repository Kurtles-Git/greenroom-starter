import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/greenroom/card";
import { PlainBadge } from "@/components/greenroom/badge";
import { formatMoney } from "@/lib/format";
import type { ScenarioResult } from "@/lib/settlementTrust";

interface Props {
  scenarioA: ScenarioResult;
  scenarioB: ScenarioResult;
  selected: "A" | "B";
  recommended: "A" | "B";
  valueAtRisk: number;
  onSelect: (id: "A" | "B") => void;
}

export function ScenarioComparison({
  scenarioA,
  scenarioB,
  selected,
  recommended,
  valueAtRisk,
  onSelect,
}: Props) {
  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="eyebrow text-[10px] text-ink-500 mb-0.5">Scenario comparison</div>
          <h3 className="text-[13px] font-semibold text-ink-900 tracking-tight">
            Two payout outcomes are plausible
          </h3>
        </div>
        <div className="text-right">
          <div className="eyebrow text-[10px] text-ink-500 mb-0.5">Value at risk</div>
          <div className="font-mono tabular text-[14px] text-ink-900">
            {formatMoney(valueAtRisk)}
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {[scenarioA, scenarioB].map((s) => {
          const isSelected = selected === s.id;
          const isRecommended = recommended === s.id;
          return (
            <ScenarioCard
              key={s.id}
              scenario={s}
              selected={isSelected}
              recommended={isRecommended}
              onSelect={() => onSelect(s.id)}
            />
          );
        })}
      </div>
    </div>
  );
}

function ScenarioCard({
  scenario,
  selected,
  recommended,
  onSelect,
}: {
  scenario: ScenarioResult;
  selected: boolean;
  recommended: boolean;
  onSelect: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.995 }}
      animate={{
        boxShadow: selected
          ? "0 0 0 2px rgb(var(--brand-700)/0.6), 0 8px 24px -16px rgba(26,24,20,0.18)"
          : "0 1px 2px rgba(26,24,20,0.03)",
      }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "text-left w-full group relative",
        "rounded-lg border bg-white overflow-hidden",
        "transition-colors hover:border-ink-300",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-700/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
        selected ? "border-brand-700" : "border-ink-200/80",
      )}
    >
      <Card
        className={cn("border-0 shadow-none rounded-none")}
        accent={selected ? "brand" : undefined}
      >
        <CardHeader>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wide text-ink-500">
                Scenario {scenario.id}
              </span>
              {recommended && <PlainBadge variant="amber">Conservative default</PlainBadge>}
              <AnimatePresence initial={false}>
                {selected && (
                  <motion.span
                    key="sel"
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    transition={{ type: "spring", stiffness: 420, damping: 26 }}
                    className="inline-flex items-center gap-1 rounded-full bg-brand-50 text-brand-800 px-1.5 py-[1px] text-[10.5px] ring-1 ring-brand-700/30"
                  >
                    <Check className="w-3 h-3" /> Selected
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
            <CardTitle className="mt-1">{scenario.label}</CardTitle>
            <p className="mt-1 text-[12px] text-ink-500 leading-relaxed">
              {scenario.description}
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-1 text-[12.5px]">
            {scenario.breakdown.map((row, i) => (
              <li
                key={`${row.label}-${i}`}
                className={cn(
                  "flex items-center justify-between gap-3",
                  row.sign === "=" && "font-medium text-ink-900 pt-1 border-t border-ink-100/80",
                )}
              >
                <span className="text-ink-600">{row.label}</span>
                <span className="font-mono tabular text-ink-800">
                  {row.sign === "-" ? "−" : ""}
                  {formatMoney(row.amount)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-end justify-between border-t border-ink-100/80 pt-3">
            <div>
              <div className="eyebrow text-[10px] text-ink-500">Artist payout</div>
              {scenario.guaranteeApplied && (
                <div className="text-[10.5px] text-amber-800 mt-0.5">Guarantee floor applied</div>
              )}
            </div>
            <div className="font-mono tabular text-[20px] font-semibold text-ink-900">
              {formatMoney(scenario.artistPayout)}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.button>
  );
}
