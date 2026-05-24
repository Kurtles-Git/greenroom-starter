import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useServerFn } from "@tanstack/react-start";
import {
  HelpCircle,
  MessageSquareText,
  HandCoins,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/greenroom/card";
import type { SettlementTrustAssessment } from "@/lib/settlementTrust";
import { generateRecoveryPlaybook } from "@/lib/recovery.functions";
import type { RecoveryApiInput } from "@/lib/recovery.functions";

interface Props {
  assessment: SettlementTrustAssessment;
  payload: RecoveryApiInput;
  forceTrigger?: boolean;
}

interface LiveAction {
  action_label?: string;
  action_description?: string;
  recommended?: boolean;
}
interface LivePlaybook {
  diagnosis?: string;
  confidence_score?: number;
  recommended_action?: string;
  suggested_message?: string;
  actions?: LiveAction[];
  playbook_json?: {
    risk_summary?: string;
    recommended_path?: string;
    pre_reply_checklist?: string[];
    next_steps?: string[];
    success_metrics?: string[];
    follow_up_sequence?: { trigger?: string; message?: string }[];
  };
}

export function RecoveryPlaybookPreview({ assessment, payload, forceTrigger }: Props) {
  const isTriggered =
    forceTrigger ||
    (assessment.relationshipRisk.level === "high" &&
      assessment.valueAtRisk > 0 &&
      assessment.ambiguous);


  const callApi = useServerFn(generateRecoveryPlaybook);
  const [loading, setLoading] = useState(false);
  const [live, setLive] = useState<LivePlaybook | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isTriggered) return null;

  const handleGenerate = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await callApi({ data: payload });
      if (res.ok && res.playbook) {
        setLive(res.playbook as LivePlaybook);
      } else {
        setErrorMsg(res.error ?? "Live playbook unavailable");
      }
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Recovery playbook preview</CardTitle>
            <CardDescription>
              A relationship-preserving response drafted from the structured risk event.
            </CardDescription>
          </div>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading}
            className="group inline-flex items-center gap-1.5 shrink-0 rounded-md bg-ink-900 text-white px-3 py-1.5 text-[11.5px] font-medium shadow-sm hover:bg-ink-800 hover:-translate-y-px hover:shadow-md active:translate-y-0 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-500/60 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {loading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : live ? (
              <CheckCircle2 className="w-3 h-3" />
            ) : (
              <Sparkles className="w-3 h-3" />
            )}
            {loading ? "Generating…" : live ? "Refresh playbook" : "Generate live playbook"}
          </button>
        </CardHeader>

        <CardContent className="space-y-5">
          <AnimatePresence mode="wait">
            {live ? (
              <motion.div
                key="live"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-5"
              >
                <div className="rounded-lg bg-brand-50/40 ring-1 ring-brand-200/60 p-3.5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Sparkles className="w-3 h-3 text-brand-700" />
                    <span className="eyebrow text-[10px] text-brand-800">
                      Live from Recovery Mode
                      {typeof live.confidence_score === "number" && (
                        <span className="text-ink-500 font-normal ml-1.5">
                          · confidence {Math.round(live.confidence_score * 100)}%
                        </span>
                      )}
                    </span>
                  </div>
                  {live.diagnosis && (
                    <p className="text-[12.5px] text-ink-800 leading-relaxed">
                      {live.diagnosis}
                    </p>
                  )}
                  {live.recommended_action && (
                    <div className="text-[11.5px] text-ink-600 mt-2">
                      <span className="font-medium text-ink-800">Recommended:</span>{" "}
                      {live.recommended_action}
                    </div>
                  )}
                </div>

                {live.suggested_message && (
                  <Block icon={<MessageSquareText className="w-3 h-3 text-ink-700" />} title="Suggested message">
                    <div className="rounded-lg bg-canvas-soft p-3.5 ring-1 ring-ink-200/60">
                      <p className="text-[12px] text-ink-700 leading-relaxed whitespace-pre-wrap">
                        {live.suggested_message}
                      </p>
                    </div>
                  </Block>
                )}

                {live.playbook_json?.pre_reply_checklist && live.playbook_json.pre_reply_checklist.length > 0 && (
                  <Block icon={<HelpCircle className="w-3 h-3 text-ink-700" />} title="Pre-reply checklist">
                    <ul className="space-y-1.5">
                      {live.playbook_json.pre_reply_checklist.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-[12px] text-ink-600">
                          <ArrowRight className="w-3 h-3 text-ink-400 mt-0.5 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </Block>
                )}

                {live.actions && live.actions.length > 0 && (
                  <Block icon={<HandCoins className="w-3 h-3 text-ink-700" />} title="Action options">
                    <ul className="space-y-2">
                      {live.actions.slice(0, 4).map((a, i) => (
                        <li
                          key={i}
                          className={`rounded-md p-2.5 ring-1 ${
                            a.recommended
                              ? "bg-brand-50/40 ring-brand-200/60"
                              : "bg-canvas-soft ring-ink-200/60"
                          }`}
                        >
                          <div className="text-[12px] font-medium text-ink-900 flex items-center gap-1.5">
                            {a.action_label}
                            {a.recommended && (
                              <span className="text-[10px] font-medium text-brand-800 bg-brand-100/60 px-1.5 py-0.5 rounded">
                                Recommended
                              </span>
                            )}
                          </div>
                          {a.action_description && (
                            <div className="text-[11.5px] text-ink-600 mt-0.5 leading-snug">
                              {a.action_description}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </Block>
                )}

                {live.playbook_json?.follow_up_sequence && live.playbook_json.follow_up_sequence.length > 0 && (
                  <Block icon={<AlertCircle className="w-3 h-3 text-ink-700" />} title="Follow-up sequence">
                    <ol className="space-y-2 text-[12px] text-ink-600">
                      {live.playbook_json.follow_up_sequence.slice(0, 3).map((f, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-ink-400 font-mono text-[10px] mt-0.5">{i + 1}.</span>
                          <div>
                            {f.trigger && (
                              <div className="font-medium text-ink-800">{f.trigger}</div>
                            )}
                            {f.message && (
                              <div className="text-ink-600 mt-0.5 whitespace-pre-wrap leading-relaxed">
                                {f.message}
                              </div>
                            )}
                          </div>
                        </li>
                      ))}
                    </ol>
                  </Block>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="static"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-5"
              >
                {errorMsg && (
                  <div className="text-[11.5px] text-amber-800 bg-amber-50/60 ring-1 ring-amber-200/60 rounded-md px-3 py-2">
                    Live playbook unavailable ({errorMsg}). Showing offline preview.
                  </div>
                )}

                <Block icon={<HelpCircle className="w-3 h-3 text-ink-700" />} title="What to clarify first">
                  <p className="text-[12px] text-ink-600 leading-relaxed">
                    The marketing recoup of{" "}
                    <span className="font-mono tabular text-ink-800">
                      ${assessment.inputs.marketingRecoup.toLocaleString()}
                    </span>{" "}
                    was mentioned in the deal notes, but its relationship to the expense cap of{" "}
                    <span className="font-mono tabular text-ink-800">
                      ${assessment.inputs.cappedExpenses.toLocaleString()}
                    </span>{" "}
                    was never stated. Ask the agent: was the recoup intended to be absorbed inside the cap, or deducted on top of it?
                  </p>
                </Block>

                <Block icon={<MessageSquareText className="w-3 h-3 text-ink-700" />} title="Recommended message">
                  <div className="rounded-lg bg-canvas-soft p-3.5 ring-1 ring-ink-200/60">
                    <p className="text-[12px] text-ink-700 leading-relaxed italic">
                      &ldquo;Hi — I&apos;m finalizing the settlement for this show and want to make sure
                      we&apos;re aligned on the recoup treatment. The deal note references both the
                      expense cap and the marketing recoup, but doesn&apos;t specify whether the recoup
                      sits inside or outside the cap. That changes the artist payout by{" "}
                      <span className="font-mono tabular not-italic font-medium">
                        ${assessment.valueAtRisk.toLocaleString()}
                      </span>
                      . Can you confirm which interpretation your team intended?&rdquo;
                    </p>
                  </div>
                </Block>

                <Block icon={<HandCoins className="w-3 h-3 text-ink-700" />} title="Concession options">
                  <ul className="space-y-1.5">
                    <li className="flex items-start gap-2 text-[12px] text-ink-600">
                      <ArrowRight className="w-3 h-3 text-ink-400 mt-0.5 shrink-0" />
                      <span>
                        Split the difference ({" "}
                        <span className="font-mono tabular text-ink-800">
                          ${Math.round(assessment.valueAtRisk / 2).toLocaleString()}
                        </span>{" "}
                        each) and document the ambiguity for the next deal.
                      </span>
                    </li>
                    <li className="flex items-start gap-2 text-[12px] text-ink-600">
                      <ArrowRight className="w-3 h-3 text-ink-400 mt-0.5 shrink-0" />
                      <span>
                        Accept the more favorable interpretation to the artist as a goodwill gesture,
                        especially if the show over-performed.
                      </span>
                    </li>
                    <li className="flex items-start gap-2 text-[12px] text-ink-600">
                      <ArrowRight className="w-3 h-3 text-ink-400 mt-0.5 shrink-0" />
                      <span>
                        Offer a credit on a future show instead of adjusting this settlement.
                      </span>
                    </li>
                  </ul>
                </Block>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function Block({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 shrink-0 w-6 h-6 rounded-full bg-ink-50 ring-1 ring-ink-200/80 flex items-center justify-center">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[12.5px] font-semibold text-ink-900 mb-1.5">{title}</div>
        {children}
      </div>
    </div>
  );
}
