import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowUpRight, Search, Calendar } from "lucide-react";
import { DealTypeBadge, PlainBadge } from "@/components/greenroom/badge";
import { getAllShows } from "@/lib/queries";
import {
  formatMoneyCompact,
  formatShowDate,
  formatShowMonth,
  relativeShowDate,
} from "@/lib/format";

type Status = "booked" | "advanced" | "day_of" | "settled" | "closed";

type ShowRow = {
  show: { id: string; status: Status };
  artist: { name: string } | null;
  deal: { dealType: string; guaranteeFormatted: string | null } | null;
  settlement: { totalFormatted: string | null; status: string } | null;
  dateFormatted: string;
  dateRelative: string;
  month: string;
};

export const Route = createFileRoute("/shows")({
  head: () => ({ meta: [{ title: "Shows · Greenroom" }] }),
  loader: async () => {
    const rows = await getAllShows();
    const reversed = [...rows].reverse();
    const settledCount = reversed.filter((r) => r.settlement).length;
    const disputedCount = reversed.filter(
      (r) => r.settlement?.status === "disputed",
    ).length;
    const totalToArtists = reversed.reduce(
      (sum, r) => sum + (r.settlement?.totalToArtist ?? 0),
      0,
    );
    const serialized: ShowRow[] = reversed.map(
      ({ show, artist, deal, settlement }) => ({
        show: { id: show.id, status: show.status as Status },
        artist: artist ? { name: artist.name } : null,
        deal: deal
          ? {
              dealType: deal.dealType,
              guaranteeFormatted:
                deal.guaranteeAmount != null
                  ? formatMoneyCompact(deal.guaranteeAmount)
                  : null,
            }
          : null,
        settlement: settlement
          ? {
              totalFormatted:
                settlement.totalToArtist != null
                  ? formatMoneyCompact(settlement.totalToArtist)
                  : null,
              status: settlement.status,
            }
          : null,
        dateFormatted: formatShowDate(show.date),
        dateRelative: relativeShowDate(show.date),
        month: formatShowMonth(show.date),
      }),
    );
    return { rows: serialized, settledCount, disputedCount, totalToArtists };
  },
  component: ShowsPage,
});

function ShowsPage() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  if (pathname !== "/shows") return <Outlet />;

  const { rows, settledCount, disputedCount, totalToArtists } =
    Route.useLoaderData();
  return (
    <div className="px-12 py-10 max-w-7xl">
      <div className="mb-14">
        <div className="eyebrow mb-3">The Crescent · Nashville · 650 cap</div>
        <h1
          className="font-display text-[52px] font-medium text-ink-900 leading-[1.02]"
          style={{ letterSpacing: "-0.025em", fontOpticalSizing: "auto" }}
        >
          Shows
        </h1>
        <p className="text-[14px] text-ink-500 mt-3 max-w-lg leading-relaxed">
          Mariana&apos;s home view. {rows.length} shows over 24 months.{" "}
          {settledCount} settled
          {disputedCount > 0 && (
            <>
              ,{" "}
              <span className="text-rose-700">{disputedCount} disputed</span>
            </>
          )}
          .
        </p>
      </div>

      <div className="grid grid-cols-3 gap-px bg-ink-200/40 rounded-xl overflow-hidden mb-14">
        <StatCard label="Shows" value={String(rows.length)} />
        <StatCard label="Settled" value={String(settledCount)} accent />
        <StatCard
          label="Paid to artists"
          value={formatMoneyCompact(totalToArtists)}
          mono
        />
      </div>

      <ShowsList rows={rows} />
    </div>
  );
}

function StatCard({
  label,
  value,
  mono = false,
  accent = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
  accent?: boolean;
}) {
  return (
    <div className="bg-white px-6 py-5">
      <div
        className={`text-[32px] font-medium leading-none ${
          accent ? "text-brand-700" : "text-ink-900"
        } ${mono ? "font-mono tabular !font-semibold" : "font-display"}`}
        style={!mono ? { letterSpacing: "-0.02em" } : undefined}
      >
        {value}
      </div>
      <div className="text-[11px] font-medium text-ink-400 uppercase tracking-[0.08em] mt-2">
        {label}
      </div>
    </div>
  );
}

const lifecycleStatusVariants: Record<
  string,
  { variant: "default" | "amber" | "brand" | "rose" | "sky"; label: string }
> = {
  draft: { variant: "default", label: "Draft" },
  submitted: { variant: "sky", label: "Submitted" },
  in_review: { variant: "sky", label: "In review" },
  signed: { variant: "brand", label: "Signed" },
  disputed: { variant: "rose", label: "Disputed" },
  revised: { variant: "amber", label: "Revised" },
  finalized: { variant: "brand", label: "Finalized" },
  paid: { variant: "brand", label: "Paid" },
  voided: { variant: "default", label: "Voided" },
};

function getAccentColor(row: ShowRow): string {
  if (row.settlement) {
    const s = row.settlement.status;
    if (s === "paid" || s === "finalized" || s === "signed") return "bg-brand-500";
    if (s === "disputed") return "bg-rose-500";
    if (s === "revised") return "bg-amber-500";
    if (s === "submitted" || s === "in_review") return "bg-sky-400";
    return "bg-ink-300";
  }
  return "bg-ink-200";
}

function groupByMonth(rows: ShowRow[]): { month: string; rows: ShowRow[] }[] {
  const groups: Map<string, ShowRow[]> = new Map();
  for (const row of rows) {
    if (!groups.has(row.month)) groups.set(row.month, []);
    groups.get(row.month)!.push(row);
  }
  return Array.from(groups.entries()).map(([month, rows]) => ({ month, rows }));
}

function ShowsList({ rows }: { rows: ShowRow[] }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    if (!query.trim()) return rows;
    const q = query.toLowerCase();
    return rows.filter(
      (r) =>
        r.artist?.name.toLowerCase().includes(q) ||
        r.deal?.dealType.toLowerCase().includes(q) ||
        r.dateFormatted.toLowerCase().includes(q),
    );
  }, [rows, query]);
  const months = useMemo(() => groupByMonth(filtered), [filtered]);

  return (
    <div>
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search artists, deals…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-64 pl-9 pr-3 py-2 text-[13px] bg-white border border-ink-200/60 rounded-lg text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-700/20 focus:border-brand-300 transition-all"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="py-20 text-center">
          <Calendar className="h-8 w-8 text-ink-200 mx-auto mb-3" />
          <div className="text-[14px] text-ink-500">
            {query ? `No shows matching "${query}"` : "No shows yet."}
          </div>
          {query && (
            <button
              onClick={() => setQuery("")}
              className="mt-2 text-[12px] text-brand-700 hover:text-brand-800 font-medium"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {months.map(({ month, rows }) => (
            <section key={month}>
              <div className="flex items-baseline justify-between mb-1 px-1 sticky top-0 bg-canvas/95 backdrop-blur-sm z-10 py-2 -my-1">
                <h3 className="text-[13px] font-semibold text-ink-900">{month}</h3>
                <span className="text-[11px] font-mono tabular text-ink-400">
                  {rows.length} {rows.length === 1 ? "show" : "shows"}
                </span>
              </div>
              <div className="border-t border-ink-200/50">
                <ul>
                  {rows.map((row) => (
                    <ShowListRow key={row.show.id} row={row} />
                  ))}
                </ul>
              </div>
            </section>
          ))}
        </div>
      )}

      {query && filtered.length > 0 && (
        <div className="mt-4 text-center">
          <span className="text-[12px] text-ink-400">
            {filtered.length} of {rows.length} shows
          </span>
        </div>
      )}
    </div>
  );
}

function ShowListRow({ row }: { row: ShowRow }) {
  const { show, artist, deal, settlement } = row;
  const accent = getAccentColor(row);
  return (
    <li className="relative group list-none">
      <div
        className={`absolute left-0 top-3 bottom-3 w-[3px] rounded-full transition-all duration-150 group-hover:top-1 group-hover:bottom-1 ${accent}`}
      />
      <Link
        to="/shows/$id"
        params={{ id: show.id }}
        className="grid grid-cols-[84px_1fr_120px_auto_24px] items-center gap-4 pl-5 pr-2 py-3 rounded-lg hover:bg-white/80 hover:shadow-[0_1px_4px_rgba(26,24,20,0.04)] transition-all duration-150"
      >
        <div>
          <div className="text-[12.5px] font-medium text-ink-800 tabular">
            {row.dateFormatted}
          </div>
          <div className="text-[10px] text-ink-400 mt-px">{row.dateRelative}</div>
        </div>
        <div className="min-w-0">
          <div className="text-[14.5px] font-medium text-ink-900 truncate group-hover:text-brand-800 transition-colors">
            {artist?.name ?? "—"}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            {deal && <DealTypeBadge type={deal.dealType} />}
            {deal?.guaranteeFormatted && (
              <span className="font-mono tabular text-[11px] text-ink-500">
                {deal.guaranteeFormatted}
                {deal.dealType === "vs" ? " min" : ""}
              </span>
            )}
          </div>
        </div>
        <div className="text-right">
          {settlement?.totalFormatted ? (
            <>
              <div className="font-mono tabular text-[14px] font-semibold text-ink-900">
                {settlement.totalFormatted}
              </div>
              <div className="text-[9px] text-ink-400 uppercase tracking-[0.08em] mt-px">
                to artist
              </div>
            </>
          ) : null}
        </div>
        <div className="flex justify-end">
          {settlement ? <SettlementPill status={settlement.status} /> : null}
        </div>
        <ArrowUpRight className="h-3.5 w-3.5 text-ink-200 group-hover:text-ink-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all duration-150" />
      </Link>
    </li>
  );
}

function SettlementPill({ status }: { status: string }) {
  const v = lifecycleStatusVariants[status] ?? {
    variant: "default" as const,
    label: status,
  };
  return <PlainBadge variant={v.variant}>{v.label}</PlainBadge>;
}
