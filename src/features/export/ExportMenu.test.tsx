import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ExportMenu } from "./ExportMenu.tsx";

afterEach(() => vi.restoreAllMocks());

describe("ExportMenu", () => {
  it("downloads a dated CSV file", () => {
    URL.createObjectURL = vi.fn(() => "blob:test");
    URL.revokeObjectURL = vi.fn();
    const names: string[] = [];
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      names.push(this.download);
    });
    render(<ExportMenu habits={[]} />);
    fireEvent.click(screen.getByRole("button", { name: "Export" }));
    fireEvent.click(screen.getByRole("button", { name: "Download CSV" }));
    expect(names).toHaveLength(1);
    expect(names[0]).toMatch(/^habits-\d{4}-\d{2}-\d{2}\.csv$/);
    expect(screen.queryByRole("button", { name: "Download CSV" })).toBeNull();
  });

  it("offers a JSON backup", () => {
    render(<ExportMenu habits={[]} />);
    fireEvent.click(screen.getByRole("button", { name: "Export" }));
    expect(screen.getByRole("button", { name: "Download JSON backup" })).toBeInTheDocument();
  });
});
