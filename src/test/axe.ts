import axe from "axe-core";

/** Runs axe on a container and returns readable violation summaries (empty when clean). */
export async function axeViolations(container: Element = document.body): Promise<string[]> {
  const results = await axe.run(container, {
    // jsdom has no layout engine, so colour contrast is checked by hand (see docs/accessibility.md)
    rules: { "color-contrast": { enabled: false } },
  });
  return results.violations.map(
    (v) => `${v.id}: ${v.help} (${v.nodes.map((n) => n.target.join(" ")).join(", ")})`,
  );
}
