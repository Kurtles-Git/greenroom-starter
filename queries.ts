import {
  shows, artists, agents, agencies, deals, ticketSales, comps, expenses, settlements, venues,
} from "@/db/index";
import type { Recoup } from "@/db/schema";

function todayDateString(): string {
  const d = new Date(); d.setHours(0,0,0,0);
  return d.toISOString().slice(0, 10);
}

export async function getAllShows() {
  const today = todayDateString();
  const rows = shows
    .filter((s) => s.date <= today)
    .map((show) => {
      const artist = artists.find((a) => a.id === show.artistId) ?? null;
      const agent = artist?.agentId ? agents.find((a) => a.id === artist.agentId) ?? null : null;
      const deal = deals.find((d) => d.showId === show.id) ?? null;
      const settlement = settlements.find((s) => s.showId === show.id) ?? null;
      return { show, artist, agent, deal, settlement };
    });
  rows.sort((a, b) => a.show.date.localeCompare(b.show.date));
  return rows;
}

export async function getShowById(id: string) {
  const show = shows.find((s) => s.id === id);
  if (!show) return null;
  const artist = artists.find((a) => a.id === show.artistId) ?? null;
  const agent = artist?.agentId ? agents.find((a) => a.id === artist.agentId) ?? null : null;
  const agency = agent?.agencyId ? agencies.find((a) => a.id === agent.agencyId) ?? null : null;
  const deal = deals.find((d) => d.showId === id) ?? null;
  const settlement = settlements.find((s) => s.showId === id) ?? null;
  const venue = venues.find((v) => v.id === show.venueId) ?? null;
  const showTicketSales = ticketSales.filter((t) => t.showId === id)
    .sort((a, b) => b.capturedAt.getTime() - a.capturedAt.getTime());
  const showExpenses = expenses.filter((e) => e.showId === id)
    .sort((a, b) => a.enteredAt.getTime() - b.enteredAt.getTime());
  const showComps = comps.filter((c) => c.showId === id);

  let recoups: Recoup[] = [];
  if (settlement?.recoupsJson) {
    try {
      const parsed = JSON.parse(settlement.recoupsJson);
      if (Array.isArray(parsed)) recoups = parsed;
    } catch {}
  }

  return {
    show, artist, agent, agency, deal, settlement, venue,
    ticketSales: showTicketSales, expenses: showExpenses, comps: showComps, recoups,
  };
}
export type ShowWithRelations = NonNullable<Awaited<ReturnType<typeof getShowById>>>;

export async function getAllArtists() {
  const rows = artists.map((artist) => {
    const agent = artist.agentId ? agents.find((a) => a.id === artist.agentId) ?? null : null;
    const agency = agent?.agencyId ? agencies.find((a) => a.id === agent.agencyId) ?? null : null;
    const artistShows = shows.filter((s) => s.artistId === artist.id);
    const showCount = artistShows.length;
    const lastShowDate = artistShows.length
      ? artistShows.map((s) => s.date).sort().reverse()[0]
      : null;
    return { artist, agent, agency, showCount, lastShowDate };
  });
  rows.sort((a, b) => b.showCount - a.showCount || a.artist.name.localeCompare(b.artist.name));
  return rows;
}

export async function getReports() {
  const today = todayDateString();
  const pastShowIds = new Set(shows.filter((s) => s.date <= today).map((s) => s.id));
  const pastDeals = deals.filter((d) => pastShowIds.has(d.showId));
  const pastSettlements = settlements.filter((s) => pastShowIds.has(s.showId));
  const pastComps = comps.filter((c) => pastShowIds.has(c.showId));

  const dealTypeCounts: Record<string, number> = {};
  for (const d of pastDeals) dealTypeCounts[d.dealType] = (dealTypeCounts[d.dealType] ?? 0) + 1;
  const totalDeals = pastDeals.length;
  const supportedTypes = ["flat", "percentage_of_gross"];
  const supportedCount = pastDeals.filter((d) => supportedTypes.includes(d.dealType)).length;
  const inAppToolUsageRate = totalDeals > 0 ? supportedCount / totalDeals : 0;

  const settlementStatus: Record<string, number> = {};
  for (const s of pastSettlements) settlementStatus[s.status] = (settlementStatus[s.status] ?? 0) + 1;

  const totalSettlements = pastSettlements.length;
  const disputedRate = totalSettlements > 0 ? (settlementStatus.disputed ?? 0) / totalSettlements : 0;
  const totalGross = pastSettlements.reduce((s, x) => s + (x.grossBoxOffice ?? 0), 0);
  const totalToArtists = pastSettlements.reduce((s, x) => s + (x.totalToArtist ?? 0), 0);
  const showCount = pastShowIds.size;
  const settledCount = pastShowIds.size;
  const dealsWithBonuses = pastDeals.filter((d) => d.bonusesJson).length;

  let totalRecoupValue = 0, disputedRecoupValue = 0, settlementsWithRecoups = 0;
  for (const s of pastSettlements) {
    if (!s.recoupsJson) continue;
    try {
      const recoups = JSON.parse(s.recoupsJson) as Recoup[];
      if (!Array.isArray(recoups) || recoups.length === 0) continue;
      settlementsWithRecoups++;
      for (const r of recoups) {
        totalRecoupValue += r.amount;
        if (r.status === "disputed") disputedRecoupValue += r.amount;
      }
    } catch {}
  }

  const totalCompTickets = pastComps.reduce((s, c) => s + c.count, 0);
  const totalCompFaceValue = pastComps.reduce((s, c) => s + c.count * c.faceValue, 0);
  const compsByCategory: Record<string, number> = {};
  for (const c of pastComps) compsByCategory[c.category] = (compsByCategory[c.category] ?? 0) + c.count;

  return {
    dealTypeCounts, totalDeals, inAppToolUsageRate,
    settlementStatus, totalSettlements, disputedRate,
    totalGross, totalToArtists, showCount, settledCount, dealsWithBonuses,
    totalRecoupValue, disputedRecoupValue, settlementsWithRecoups,
    totalCompTickets, totalCompFaceValue, compsByCategory,
  };
}
export type Reports = Awaited<ReturnType<typeof getReports>>;
