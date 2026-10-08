import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from "react";
import {
  DEFAULT_LOCALE,
  detectLocale,
  type Locale,
  readStoredLocale,
  storeLocale,
  type Translate,
  translator,
} from "../../lib/i18n/index.ts";

type I18n = { locale: Locale; setLocale: (locale: Locale) => void; t: Translate };

const I18nContext = createContext<I18n>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
  t: translator(DEFAULT_LOCALE),
});

/** The language: a remembered choice, else the browser's preference. Also sets `<html lang>`. */
export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(
    () => readStoredLocale(window.localStorage) ?? detectLocale(window.navigator.languages ?? []),
  );
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  const value = useMemo<I18n>(
    () => ({
      locale,
      t: translator(locale),
      setLocale: (next) => {
        setLocaleState(next);
        storeLocale(window.localStorage, next);
      },
    }),
    [locale],
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18n {
  return useContext(I18nContext);
}
