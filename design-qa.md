# Footer Design QA

## Evidence

- Source visual truth: `/var/folders/dz/q28f_jgj4q7g7535_jj08t140000gn/T/codex-clipboard-d924bed4-23c0-479c-850c-ca0ca842d630.png`
- Implementation screenshot: `/private/tmp/campusvoice-footer-default-1281.png`
- Source dimensions: 2562 × 122 px, evaluated as a 1281 × 61 CSS px strip at 2× density
- Implementation viewport: 1281 × 800 CSS px at 1× density
- Implementation footer: 1281 × 64 CSS px
- State: default, light theme, page scrolled to the bottom

## Full-view comparison

- The footer spans the full viewport width with a white surface.
- Copyright copy is anchored to the left and the attribution is anchored to the right.
- Both groups use muted gray typography and consistent 16 px horizontal insets.
- The attribution uses a filled red heart and preserves the source copy order.

## Focused-region comparison

- Typography: 16 px desktop body text with a similar neutral sans-serif weight and line height.
- Spacing: 20 px vertical padding yields a 64 px footer, within 3 px of the normalized source height.
- Colors: existing `card` and `muted-foreground` tokens reproduce the white and gray treatment; the heart uses the project's red palette.
- Assets: the heart is the existing Lucide icon, not a text glyph or improvised drawing.
- Copy: `© 2026 34th 國立清華大學學生會 版權所有` and `Made with ♥ by NTHUSA IT Team` match the reference.
- Link: `NTHUSA IT Team` points to `https://github.com/nthu-sa` and opens in a new tab.

## Responsive and interaction checks

- At 320 px width the two footer groups stack, remain centered, and produce no horizontal overflow.
- At 1281 px width the footer remains a single row and produces no horizontal overflow.
- Hover and keyboard-focus styles reveal an underline and stronger foreground color without changing the default visual match.
- Browser console errors: none.

## Findings and iteration history

- The initial desktop padding produced an 88 px footer. It was reduced to the current token-aligned 64 px height to match the 61 px normalized reference.
- No P0, P1, or P2 visual or functional issues remain.

final result: passed
