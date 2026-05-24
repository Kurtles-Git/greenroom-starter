import { motion } from "framer-motion";
import { AlertTriangle, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TrustFlag, TrustFlagSeverity } from "@/lib/settlementTrust";

const severityMeta: Record<
  TrustFlagSeverity,
  { Icon: typeof Info; wrap: string; iconClass: string; titleClass: string }
> = {
  info: {
    Icon: Info,
    wrap: "bg-sky-50 border-sky-200/80",
    iconClass: "text-sky-700",
    titleClass: "text-sky-900",
  },
  warning: {
    Icon: AlertTriangle,
    wrap: "bg-amber-50 border-amber-200/80",
    iconClass: "text-amber-700",
    titleClass: "text-amber-900",
  },
  critical: {
    Icon: AlertCircle,
    wrap: "bg-rose-50 border-rose-200/80",
    iconClass: "text-rose-700",
    titleClass: "text-rose-900",
  },
};

export function TrustFlagList({ flags }: { flags: ReadonlyArray<TrustFlag> }) {
  if (flags.length === 0) {
    return (
      <div className="rounded-lg border border-ink-200/80 bg-white px-4 py-3 text-[12.5px] text-ink-500">
        No trust flags. Deal terms reconcile cleanly.
      </div>
    );
  }
  return (
    <ul className="space-y-2">
      {flags.map((flag, i) => {
        const m = severityMeta[flag.severity];
        return (
          <motion.li
            key={flag.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, delay: i * 0.05 }}
            className={cn("rounded-lg border px-4 py-3 flex items-start gap-3", m.wrap)}
          >
            <m.Icon className={cn("w-4 h-4 mt-0.5 shrink-0", m.iconClass)} />
            <div className="min-w-0">
              <div className={cn("text-[13px] font-semibold", m.titleClass)}>{flag.title}</div>
              <p className="mt-0.5 text-[12px] text-ink-700 leading-relaxed">{flag.detail}</p>
            </div>
          </motion.li>
        );
      })}
    </ul>
  );
}
