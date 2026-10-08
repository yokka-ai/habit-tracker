import { LOCALES, type Locale } from "../../lib/i18n/index.ts";
import { useI18n } from "./I18nProvider.tsx";

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();
  return (
    <>
      <label htmlFor="language" className="sr-only">
        {t("language.label")}
      </label>
      <select
        id="language"
        value={locale}
        onChange={(event) => setLocale(event.target.value as Locale)}
        className="rounded-lg border border-stone-300 bg-white px-2 py-1.5 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100"
      >
        {LOCALES.map((code) => (
          <option key={code} value={code}>
            {t(`language.${code}`)}
          </option>
        ))}
      </select>
    </>
  );
}
