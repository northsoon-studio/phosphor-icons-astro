# @northsoon/phosphor-icons-astro

[![npm](https://img.shields.io/npm/v/@northsoon/phosphor-icons-astro)](https://www.npmjs.com/package/@northsoon/phosphor-icons-astro)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Phosphor icons as fully-typed Astro components - 1512 icons, 6 weights, zero client JavaScript.

```astro
<Heart size={24} weight="fill" color="red" aria-label="Add to favorites" />
```

---

## Installation

```bash
npx astro add @northsoon/phosphor-icons-astro
```

Or manually:

```bash
npm install @northsoon/phosphor-icons-astro
```

```js
// astro.config.mjs
import { defineConfig } from "astro/config";
import phosphorIcons from "@northsoon/phosphor-icons-astro";

export default defineConfig({
  integrations: [phosphorIcons()],
});
```

---

## Usage

```astro
---
import RocketLaunch from '@northsoon/phosphor-icons-astro/icons/RocketLaunch.astro';
import ArrowRight   from '@northsoon/phosphor-icons-astro/icons/ArrowRight.astro';
import Heart        from '@northsoon/phosphor-icons-astro/icons/Heart.astro';
---

<!-- Default: size="1em", weight="regular", color="currentColor" -->
<RocketLaunch />

<!-- Change weight with a prop - no need to change the import -->
<RocketLaunch weight="bold" />
<RocketLaunch weight="duotone" />
<RocketLaunch weight="fill" />

<!-- Size as a number (px) or any CSS length string -->
<ArrowRight size={32} />
<ArrowRight size="2rem" />

<!-- Color -->
<Heart color="#e74c3c" weight="fill" />
<Heart color="var(--color-accent)" />

<!-- Decorative icon - aria-hidden="true" applied automatically -->
<RocketLaunch />

<!-- Meaningful icon - pass aria-label to set role="img" -->
<RocketLaunch aria-label="Launch rocket" />

<!-- Horizontal mirror for RTL layouts -->
<ArrowRight mirrored />

<!-- Any standard SVG / HTML attribute is accepted -->
<Heart class="icon icon-heart" data-testid="heart-icon" />
```

### Generic `<Icon />` (dynamic names)

When the icon name comes from a CMS, config, or prop, use the generic component - names are kebab-case with full IDE autocomplete:

```astro
---
import Icon from '@northsoon/phosphor-icons-astro/Icon.astro';
---

<Icon name="rocket-launch" weight="bold" size={32} />
<Icon name="heart" color="#e74c3c" aria-label="Favorites" />
```

> Prefer per-icon imports when the name is static - only imported icons end up in your bundle. `<Icon />` lazy-loads a single icon per name, but the per-icon import is still leaner.

---

## Props

Every icon component shares the same interface:

| Prop | Type | Default | Description |
|---|---|---|---|
| `size` | `number \| string` | `"1em"` | Width and height. Number = px, string = any CSS length |
| `weight` | `"thin" \| "light" \| "regular" \| "bold" \| "fill" \| "duotone"` | `"regular"` | Visual style |
| `color` | `string` | `"currentColor"` | Any valid CSS color |
| `mirrored` | `boolean` | `false` | Flip horizontally (RTL support) |
| `aria-label` | `string` | `undefined` | Adds `role="img"`. Without it, `aria-hidden="true"` is applied |
| `class` | `string` | `undefined` | CSS class |
| `...rest` | `HTMLAttributes<svg>` | - | Any valid SVG attribute (`data-*`, `id`, `style`, etc.) |

---

## Icon names

Icons are imported using `PascalCase`. Find any icon at [phosphoricons.com](https://phosphoricons.com/) and convert the name:

| Phosphor name | Import |
|---|---|
| `rocket-launch` | `RocketLaunch.astro` |
| `arrow-right` | `ArrowRight.astro` |
| `git-branch` | `GitBranch.astro` |

---

## Generating icons (local development)

The `icons/` directory and `icon-names.ts` are in `.gitignore` and must be generated locally (the generic `<Icon />` component needs both):

```bash
npm install
npm run build   # reads @phosphor-icons/core and generates icons/*.astro
```

When publishing to npm, `prepublishOnly` runs the build automatically so the
generated files are included in the published package.

To update icons after a new Phosphor release:

```bash
npm update @phosphor-icons/core
npm run build
```

---

## Improvements over phosphor-astro

| | [phosphor-astro](https://github.com/SeanMcP/phosphor-astro) | @northsoon/phosphor-icons-astro |
|---|---|---|
| Typed props | Generic `HTMLAttributes<svg>` | `size`, `weight`, `color`, `mirrored` |
| Change weight | Import a different file (`HeartBold.astro`) | `weight="bold"` prop |
| Accessibility | No `aria-label` or `role` handling | Auto `role="img"` when `aria-label` is set |
| Source | Shell script + local zip | `@phosphor-icons/core` (official npm package) |
| Files per icon | One per weight | **One per icon** (all weights included) |

---

## Credits

- Icons: [Phosphor Icons](https://phosphoricons.com/) - MIT License
- Icon data: [@phosphor-icons/core](https://github.com/phosphor-icons/core)
- Repository: [github.com/northsoon-studio/phosphor-icons-astro](https://github.com/northsoon-studio/phosphor-icons-astro)
- npm: [@northsoon/phosphor-icons-astro](https://www.npmjs.com/package/@northsoon/phosphor-icons-astro)

---

## Changelog

### v1.1.0

**Highlights:** real Astro integration, generic `<Icon />` component, and full name autocomplete.

**Added**
- Astro integration `phosphorIcons()` with an `astro:config:setup` hook (`npx astro add` ready)
- Generic `<Icon name="..." />` component for dynamic icon names (CMS, config, props): kebab-case names with IDE autocomplete, each icon lazy-loaded so unused icons stay out of the bundle
- `icon-names.ts` manifest, regenerated on every build: `IconName` union type (all 1512 icons), runtime `iconNames` list, and `iconCount`
- Installation guide for `npx astro add` plus manual config

**Fixed**
- `mirrored` combined with object `style` props now merges `transform` instead of dropping the user style

**Changed**
- `sideEffects: false` for better tree-shaking; new `Icon.astro` and `icon-names` export subpaths
- Branding unified under Northsoon Studio

> Per-icon imports (`import Heart from ".../icons/Heart.astro"`) remain the recommended default when the name is static - only imported icons end up in your bundle.

### v1.0.1

- Initial public release - 1512 icons, 6 weights, typed props

---

## License

MIT © [Northsoon Studio](https://northsoon.com)
