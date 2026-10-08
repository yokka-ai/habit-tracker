import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

// jsdom has no canvas; the confetti effect then skips drawing.
HTMLCanvasElement.prototype.getContext = () => null;
