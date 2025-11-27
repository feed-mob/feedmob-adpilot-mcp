# Color Pattern Guidelines

System-defined palettes keep MCP UI components consistent with ChatGPT. Use the provided neutrals for structure and apply brand accents sparingly.

## Base Palette
- Light mode: neutral backgrounds only (`bg/primary`, `bg/secondary`, `bg/tertiary`) for surfaces and cards; avoid tinted backdrops.
- Dark mode: the same hierarchy (`bg/primary`, `bg/secondary`, `bg/tertiary`) with reversed contrast; never lighten beyond the light palette or darken beyond the system dark base.
- Reserve `text/inverted` and `icon/inverted` for dark-on-light or light-on-dark swaps inside elevated cards or callouts.

## Text & Icon Usage
- Text: use `text/primary` for body, `text/secondary` for supporting copy, `text/tertiary` for metadata, and `text/inverted` only on dark chips or banners.
- Icons: mirror text contrast (`icon/primary`, `icon/secondary`, `icon/tertiary`, `icon/inverted`) to match their host background; do not mix icon contrast levels in one component.

## Accent Colors
- Supported accents: blue, red, orange, green. Use for actions, status, or highlights; do not recolor system neutrals.
- Keep a single accent per view or component cluster to reduce noise; prefer blue for primary actions by default.
- Avoid rebranding core neutrals—apply brand only through accents, icons, or inline imagery.

## Light vs Dark Behavior
- Default to light neutrals unless the host surface is explicitly dark; do not mix palettes within one container.
- When layering, step contrasts gradually (primary surface → secondary card → tertiary inset) to keep hierarchy readable.

## Accessibility
- Maintain WCAG AA: 4.5:1 for body text and 3:1 for large text/icons. Verify inverted text remains compliant on accent and dark backgrounds.
- Avoid pure black on pure white; slight offsets improve readability and reduce glare.

## Implementation Notes
- Define tokens for both modes and consume them via CSS variables or theme objects; example:
  - Light: `--bg-primary: #f5f5f5`, `--bg-secondary: #ededed`, `--bg-tertiary: #e6e6e6`, `--text-primary: #111`, `--text-secondary: #444`, `--text-tertiary: #666`.
  - Dark: `--bg-primary: #0f0f10`, `--bg-secondary: #1a1b1d`, `--bg-tertiary: #242529`, `--text-primary: #f5f5f5`, `--text-secondary: #c8c8cc`, `--text-tertiary: #9a9aa0`.
- Accents: `--accent-blue: #0078ff`, `--accent-red: #ff352b`, `--accent-orange: #ff8b2f`, `--accent-green: #0d9b45`; adjust to match brand only if contrast stays compliant.
