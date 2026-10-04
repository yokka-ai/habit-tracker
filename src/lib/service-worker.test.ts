import { describe, expect, it, vi } from "vitest";
import { registerServiceWorker } from "./service-worker.ts";

function fakeNavigator(register: () => Promise<unknown>) {
  return { serviceWorker: { register } } as unknown as Navigator;
}

describe("registerServiceWorker", () => {
  it("does nothing when disabled", async () => {
    const register = vi.fn();
    await registerServiceWorker({ enabled: false, navigator: fakeNavigator(register) });
    expect(register).not.toHaveBeenCalled();
  });

  it("does nothing when service workers are unsupported", async () => {
    await expect(
      registerServiceWorker({ enabled: true, navigator: {} as Navigator }),
    ).resolves.toBeUndefined();
  });

  it("registers /sw.js and checks for an update", async () => {
    const update = vi.fn().mockResolvedValue(undefined);
    const register = vi.fn().mockResolvedValue({ update });
    await registerServiceWorker({ enabled: true, navigator: fakeNavigator(register) });
    expect(register).toHaveBeenCalledWith("/sw.js");
    expect(update).toHaveBeenCalled();
  });

  it("warns instead of throwing when registration fails", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const register = vi.fn().mockRejectedValue(new Error("nope"));
    await expect(
      registerServiceWorker({ enabled: true, navigator: fakeNavigator(register) }),
    ).resolves.toBeUndefined();
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});
