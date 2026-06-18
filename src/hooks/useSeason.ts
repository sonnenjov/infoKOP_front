import { useState } from "react";

export type Season = 'summer' | 'winter';

function detectSeason(): Season {
  const month = new Date().getMonth();
  return (month >= 3 && month <= 7) ? 'summer' : 'winter';
}

export function useSeason() {
  const [season, setSeason] = useState<Season>(detectSeason());
  return { season, setSeason };
}