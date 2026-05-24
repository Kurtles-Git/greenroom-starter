import { motion } from "framer-motion";
import { AlertTriangle, ArrowUpRight, User, Building2, Wallet, MessageSquare } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/greenroom/card";
import { PlainBadge } from "@/components/greenroom/badge";
import { formatMoney } from "@/lib/format";
import type { SettlementTrustAssessment, RecoveryPayload } from "@/lib/settlementTrust";

interface Props {
  assessment: SettlementTrustAssessment;
  payload: RecoveryPayload;
  recoveryUrl: string;
  recoveryFlatUrl: string;
  forceTrigger?: boolean;
}

export function RecoveryModeCard({ assessment, payload, recoveryUrl, recoveryFlatUrl, forceTrigger }: Props) {
  const isTriggered =
    forceTrigger ||
    (assessment.relationshipRisk.level === "high" &&
      assessment.valueAtRisk > 0 &&
      assessment.ambiguous);

  if (!isTriggered) return null;


  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="relative"
    >
      <motion.span
        aria-hidden
        className="pointer-events-none absolute -inset-px rounded-xl ring-1 ring-rose-300/40"
        animate={{ opacity: [0.35, 0.75, 0.35] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
      />
      <Card accent="rose">
        <CardHeader>
          <div>
            <CardTitle className="flex items-center gap-2">
              <span className="relative inline-flex">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-700" />
                <span className="absolute -right-0.5 -top-0.5 w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping" />
                <span className="absolute -right-0.5 -top-0.5 w-1.5 h-1.5 rounded-full bg-rose-600" />
              </span>
              High relationship risk detected
            </CardTitle>
            <CardDescription>
              Recovery Mode uses the structured risk event from Greenroom to prepare a
              relationship-preserving response.
            </CardDescription>
          </div>
          <PlainBadge variant="rose">Requires action</PlainBadge>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-start gap-2.5">
              <div className="mt-0.5 shrink-0 rounded-full bg-rose-50 ring-1 ring-rose-200/80 p-1">
                <User className="w-3 h-3 text-rose-700" />
              </div>
              <div>
                <div className="eyebrow text-[10px] text-ink-500">Stakeholder</div>
                <div className="text-[13px] text-ink-900 font-medium">
                  {payload.stakeholder_name}
                </div>
                {payload.company_or_account && (
                  <div className="text-[11.5px] text-ink-500 flex items-center gap-1 mt-0.5">
                    <Building2 className="w-3 h-3" />
                    {payload.company_or_account}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="mt-0.5 shrink-0 rounded-full bg-rose-50 ring-1 ring-rose-200/80 p-1">
                <MessageSquare className="w-3 h-3 text-rose-700" />
              </div>
              <div>
                <div className="eyebrow text-[10px] text-ink-500">Issue</div>
                <div className="text-[13px] text-ink-900 font-medium">
                  {payload.issue_summary}
                </div>
                <div className="text-[11.5px] text-ink-500 mt-0.5 leading-snug">
                  {payload.issue_details}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="mt-0.5 shrink-0 rounded-full bg-rose-50 ring-1 ring-rose-200/80 p-1">
                <Wallet className="w-3 h-3 text-rose-700" />
              </div>
              <div>
                <div className="eyebrow text-[10px] text-ink-500">Value at risk</div>
                <div className="text-[13px] text-ink-900 font-medium">
                  {formatMoney(assessment.valueAtRisk)}
                </div>
                <div className="text-[11.5px] text-ink-500 mt-0.5">
                  Risk score {assessment.relationshipRisk.score}/100
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-4 border-t border-ink-100/80">
            <div className="text-[12px] text-ink-600">
              <span className="font-medium text-ink-800">Recommended next action:</span>{" "}
              Contact the agent before the settlement is finalized so the ambiguity is resolved
              collaboratively, not adversarially.
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <a
                href={recoveryFlatUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md bg-white text-rose-800 px-3 py-2 text-[12px] font-medium ring-1 ring-rose-200/80 hover:bg-rose-50 hover:-translate-y-px transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/60 focus-visible:ring-offset-2"
              >
                Open with query params
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
              <a
                href={recoveryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-1.5 rounded-md bg-rose-700 text-white px-3.5 py-2 text-[12px] font-medium shadow-sm hover:bg-rose-800 hover:-translate-y-px hover:shadow-md active:translate-y-0 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/60 focus-visible:ring-offset-2"
              >
                Open Recovery Mode
                <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </div>

          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
