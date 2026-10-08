import type { KeyboardEvent } from "react";
import { useId } from "react";
import { MAX_CATEGORY_LENGTH, PRESET_CATEGORIES } from "../../lib/category.ts";
import { useI18n } from "../i18n/I18nProvider.tsx";

type Props = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (event: KeyboardEvent) => void;
  className: string;
};

/** Free text with the preset categories offered as suggestions, so custom ones work too. */
export function CategoryInput({ id, value, onChange, onKeyDown, className }: Props) {
  const { t } = useI18n();
  const listId = useId();
  return (
    <>
      <label htmlFor={id} className="sr-only">
        {t("category.label")}
      </label>
      <input
        id={id}
        type="text"
        list={listId}
        value={value}
        maxLength={MAX_CATEGORY_LENGTH}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={onKeyDown}
        placeholder={t("category.placeholder")}
        className={className}
      />
      <datalist id={listId}>
        {PRESET_CATEGORIES.map((preset) => (
          <option key={preset} value={preset} />
        ))}
      </datalist>
    </>
  );
}
