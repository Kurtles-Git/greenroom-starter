import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Copy, Check, FileText } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/greenroom/card";
import { Button } from "@/components/greenroom/button";
import { PlainBadge } from "@/components/greenroom/badge";
import type { SettlementStatement } from "@/lib/settlementTrust";

export function SettlementStatementPreview({ statement }: { statement: SettlementStatement }) {
  const [copied, setCopied] = useState(false);
  const confirmed = statement.assumptionState === "human_confirmed";

  const text = [
    statement.headline,
    "",
    statement.body,
    "",
    ...statement.bullets.map((b) => `• ${b}`),
  ].join("\n");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <Card accent={confirmed ? "brand" : undefined}>
      <CardHeader>
        <div>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-ink-700" />
            Agent-facing statement
          </CardTitle>
          <CardDescription>
            Plain-language explanation of the selected assumption and the math behind it.
          </CardDescription>
        </div>
        <PlainBadge variant={confirmed ? "brand" : "amber"}>
          {confirmed ? "Reflects confirmed assumption" : "Pending confirmation"}
        </PlainBadge>
      </CardHeader>
      <CardContent>
        <motion.div
          key={statement.selectedScenarioId + statement.assumptionState}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22 }}
          className="rounded-md border border-ink-200/80 bg-white px-4 py-4"
        >
          <div className="text-[14px] font-semibold text-ink-900">{statement.headline}</div>
          <p className="mt-2 text-[12.5px] text-ink-700 leading-relaxed">{statement.body}</p>
          <ul className="mt-3 space-y-1 text-[12px] text-ink-700">
            {statement.bullets.map((b, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-ink-400">•</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <span>Selected: {statement.assumptionLabel}</span>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleCopy}
          aria-live="polite"
          className="focus-visible:ring-2 focus-visible:ring-brand-700/40 focus-visible:ring-offset-2"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={copied ? "copied" : "copy"}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -3 }}
              transition={{ duration: 0.16 }}
              className="inline-flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-brand-700" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy statement"}
            </motion.span>
          </AnimatePresence>
        </Button>
      </CardFooter>
    </Card>
  );
}
