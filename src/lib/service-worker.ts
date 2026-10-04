type Options = {
  enabled?: boolean;
  navigator?: Pick<Navigator, "serviceWorker">;
};

/** Registers the offline service worker. Only runs in production builds, where the file exists. */
export function registerServiceWorker({
  enabled = import.meta.env.PROD,
  navigator: nav = window.navigator,
}: Options = {}): Promise<ServiceWorkerRegistration | undefined> {
  if (!enabled || !("serviceWorker" in nav)) return Promise.resolve(undefined);
  return nav.serviceWorker.register("/sw.js").then(
    (registration) => {
      // Check for a new deploy on every visit; the worker itself skips waiting.
      void registration.update().catch(() => undefined);
      return registration;
    },
    (error: unknown) => {
      console.warn("Could not register the service worker", error);
      return undefined;
    },
  );
}
