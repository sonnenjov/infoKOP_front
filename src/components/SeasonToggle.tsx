import { Season } from "../hooks/useSeason";

interface SeasonToggleProps {
  activeSeason: Season;
  onSwitch: (season: Season) => void;
}

export function SeasonToggle({ activeSeason, onSwitch }: SeasonToggleProps) {
  return (
    <div className={activeSeason == 'summer' ? 'summer' : 'winter'}>
      <button
        onClick={() => onSwitch('summer')}
        className={activeSeason === 'summer' ? 'summer-inactive' : 'summer-active'}
      >
        Leto
      </button>
      <button
        onClick={() => onSwitch('winter')}
        className={activeSeason === 'winter' ? 'winter-inactive' : 'winter-active'}
      >
        Zima
      </button>
    </div>
  );
}