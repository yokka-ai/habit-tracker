import { useEffect, useRef, useState } from "react";
import { playConfetti, prefersReducedMotion } from "../../lib/confetti.ts";
import { useI18n } from "../i18n/I18nProvider.tsx";

type Props = { days: number; onDone: () => void };

const MESSAGE_MS = 4000;

/** A short "N days in a row!" message, with confetti unless motion is reduced. */
export function Celebration({ days, onDone }: Props) {
  const { t } = useI18n();
  const canvas = useRef<HTMLCanvasElement>(null);
  const [animate] = useState(() => !prefersReducedMotion());

  useEffect(() => {
    const timer = window.setTimeout(onDone, MESSAGE_MS);
    const stop = animate && canvas.current ? playConfetti(canvas.current, () => {}) : undefined;
    return () => {
      window.clearTimeout(timer);
      stop?.();
    };
  }, [animate, onDone]);

  return (
    <>
      {animate ? (
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-50">
          <canvas ref={canvas} className="h-full w-full" />
        </div>
      ) : null}
      <span role="status" className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
        {t("celebrate.streak", { count: days })}
      </span>
    </>
  );
}
