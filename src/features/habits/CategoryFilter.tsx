import { ALL_CATEGORIES } from "../../lib/category.ts";
import { useI18n } from "../i18n/I18nProvider.tsx";

type Props = {
  categories: string[];
  selected: string;
  onSelect: (category: string) => void;
};

const chipClass =
  "rounded-full border px-3 py-1 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600";

export function CategoryFilter({ categories, selected, onSelect }: Props) {
  const { t } = useI18n();
  const options = [ALL_CATEGORIES, ...categories];
  return (
    <fieldset aria-label={t("category.filter")} className="mb-4 flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option === ALL_CATEGORIES ? "all" : option}
          type="button"
          aria-pressed={option === selected}
          onClick={() => onSelect(option)}
          className={`${chipClass} ${
            option === selected
              ? "border-emerald-700 bg-emerald-700 text-white"
              : "border-stone-300 hover:bg-stone-100 dark:border-stone-600 dark:hover:bg-stone-800"
          }`}
        >
          {option === ALL_CATEGORIES ? t("category.all") : option}
        </button>
      ))}
    </fieldset>
  );
}
