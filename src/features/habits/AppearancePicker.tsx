import { EMOJI_CHOICES, type HabitColor, PALETTE } from "../../lib/appearance.ts";

type Props = {
  idPrefix: string;
  color: HabitColor;
  emoji: string;
  onColor: (color: HabitColor) => void;
  onEmoji: (emoji: string) => void;
};

const optionClass =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600";

export function AppearancePicker({ idPrefix, color, emoji, onColor, onEmoji }: Props) {
  return (
    <div className="mt-2 space-y-2">
      <fieldset>
        <legend className="sr-only">Colour</legend>
        <div className="flex flex-wrap gap-1">
          {PALETTE.map((entry) => (
            <label key={entry.id} className="cursor-pointer">
              <input
                type="radio"
                name={`${idPrefix}-color`}
                value={entry.id}
                checked={color === entry.id}
                onChange={() => onColor(entry.id)}
                aria-label={entry.label}
                className="peer sr-only"
              />
              <span
                aria-hidden="true"
                className={`block h-6 w-6 rounded-full ${entry.fill} border-2 border-transparent peer-checked:border-stone-900 peer-checked:ring-2 peer-checked:ring-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-emerald-600 dark:peer-checked:border-white dark:peer-checked:ring-stone-900`}
              />
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="sr-only">Emoji (optional)</legend>
        <div className="flex flex-wrap gap-1">
          <button
            type="button"
            aria-pressed={emoji === ""}
            aria-label="No emoji"
            onClick={() => onEmoji("")}
            className={`rounded-lg border px-2 py-0.5 text-xs aria-pressed:bg-stone-200 dark:aria-pressed:bg-stone-700 border-stone-300 dark:border-stone-600 ${optionClass}`}
          >
            None
          </button>
          {EMOJI_CHOICES.map((choice) => (
            <button
              key={choice}
              type="button"
              aria-pressed={emoji === choice}
              aria-label={`Emoji ${choice}`}
              onClick={() => onEmoji(choice)}
              className={`rounded-lg border border-stone-300 px-1.5 py-0.5 aria-pressed:bg-stone-200 dark:border-stone-600 dark:aria-pressed:bg-stone-700 ${optionClass}`}
            >
              {choice}
            </button>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
