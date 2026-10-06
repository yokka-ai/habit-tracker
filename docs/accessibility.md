# Accessibility

What was checked in the accessibility pass (HT-22).

## Automated

- `src/a11y.test.tsx` runs axe-core (through `src/test/axe.ts`) on the empty screen, a list with
  checked-off habits, a habit in edit mode, and the shortcuts dialog. All report no violations.
- Colour contrast is not checked by axe in tests (jsdom has no layout); it was reviewed by hand below.

## Keyboard

- Every action is a real `<button>`, input or label, so it is reachable with Tab and used with
  Enter or Space: add, check off, move up/down, edit, archive, delete (with confirm), restore,
  import, export, theme toggle.
- Reordering works without dragging through the Move up / Move down buttons.
- Shortcuts: `n` focuses the new habit field, `1`-`9` toggle today, `?` lists them. They are ignored
  while typing in a field.
- Edit mode: Enter saves, Escape cancels.
- Focus is visible everywhere (emerald outline on `:focus-visible`, or `:focus` for text fields).

## Screen readers

- Buttons have names that include the habit (for example "Done today: Drink water") and
  `aria-pressed` for the check-off state.
- Decorative glyphs (emoji, drag handle, colour bar) are `aria-hidden`.
- Check-offs are announced through a polite live region (`role="status"`): "Drink water checked off
  for today" / "unchecked for today". Validation errors use `role="alert"`.
- Heading structure: one `h1` ("Habit Tracker"), section headings below it.

## Colour contrast

- Text uses stone-900 on stone-50 and stone-100 on stone-950; secondary text is stone-500 on white or
  stone-400 on stone-900, both above 4.5:1 for normal text.
- Not covered yet: streak announcements (there is no streak display in the app yet).
