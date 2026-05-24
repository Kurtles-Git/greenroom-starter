import { useMemo } from "react";
import { shows as allShows, artists as allArtists, deals } from "@/db/index";
import { formatShowDate, formatMoneyCompact } from "@/lib/format";
import { CommandPalette, type ShowEntry, type ArtistEntry } from "./command-palette";

const dealLabels: Record<string, string> = {
  flat: "Flat",
  percentage_of_gross: "% of gross",
  percentage_of_net: "% of net",
  vs: "Vs deal",
  door: "Door deal",
};

export function CommandPaletteData() {
  const { shows, artists } = useMemo(() => {
    const today = new Date(); today.setHours(0,0,0,0);
    const todayIso = today.toISOString().slice(0, 10);

    const showsList: ShowEntry[] = allShows
      .filter((s) => s.date <= todayIso)
      .map((show) => {
        const artist = allArtists.find((a) => a.id === show.artistId) ?? null;
        const deal = deals.find((d) => d.showId === show.id) ?? null;
        return {
          id: show.id,
          artistName: artist?.name ?? "Unknown Artist",
          dateFormatted: formatShowDate(show.date),
          dealType: deal ? (dealLabels[deal.dealType] ?? deal.dealType) : null,
          guaranteeFormatted:
            deal?.guaranteeAmount != null
              ? formatMoneyCompact(deal.guaranteeAmount)
              : null,
        };
      });

    const artistsList: ArtistEntry[] = allArtists.map((artist) => {
      const showCount = allShows.filter((s) => s.artistId === artist.id).length;
      return { name: artist.name, genre: artist.genre, showCount };
    });

    return { shows: showsList, artists: artistsList };
  }, []);

  return <CommandPalette shows={shows} artists={artists} />;
}
