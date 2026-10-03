import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EMOJI_CHOICES, PALETTE } from "../../lib/appearance.ts";
import { AppearancePicker } from "./AppearancePicker.tsx";

describe("AppearancePicker", () => {
  it("lists every colour and emoji and reports picks", () => {
    const onColor = vi.fn();
    const onEmoji = vi.fn();
    render(
      <AppearancePicker
        idPrefix="t"
        color="emerald"
        emoji=""
        onColor={onColor}
        onEmoji={onEmoji}
      />,
    );
    expect(screen.getAllByRole("radio")).toHaveLength(PALETTE.length);
    expect(screen.getByRole("radio", { name: "Green" })).toBeChecked();
    fireEvent.click(screen.getByRole("radio", { name: "Blue" }));
    expect(onColor).toHaveBeenCalledWith("sky");
    expect(screen.getAllByRole("button", { name: /^Emoji / })).toHaveLength(EMOJI_CHOICES.length);
    fireEvent.click(screen.getByRole("button", { name: "Emoji 💧" }));
    expect(onEmoji).toHaveBeenCalledWith("💧");
  });
});
