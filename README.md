# @northsoon/phosphor-icons-astro

[![npm](https://img.shields.io/npm/v/@northsoon/phosphor-icons-astro)](https://www.npmjs.com/package/@northsoon/phosphor-icons-astro)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Phosphor icons as fully-typed Astro components — 1512 icons, 6 weights, zero client JavaScript.

```astro
<Heart size={24} weight="fill" color="red" aria-label="Add to favorites" />
```

---

## Installation

```bash
npm install @northsoon/phosphor-icons-astro
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

<!-- Change weight with a prop — no need to change the import -->
<RocketLaunch weight="bold" />
<RocketLaunch weight="duotone" />
<RocketLaunch weight="fill" />

<!-- Size as a number (px) or any CSS length string -->
<ArrowRight size={32} />
<ArrowRight size="2rem" />

<!-- Color -->
<Heart color="#e74c3c" weight="fill" />
<Heart color="var(--color-accent)" />

<!-- Decorative icon — aria-hidden="true" applied automatically -->
<RocketLaunch />

<!-- Meaningful icon — pass aria-label to set role="img" -->
<RocketLaunch aria-label="Launch rocket" />

<!-- Horizontal mirror for RTL layouts -->
<ArrowRight mirrored />

<!-- Any standard SVG / HTML attribute is accepted -->
<Heart class="icon icon-heart" data-testid="heart-icon" />
```

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
| `...rest` | `HTMLAttributes<svg>` | — | Any valid SVG attribute (`data-*`, `id`, `style`, etc.) |

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

The `icons/` directory is in `.gitignore` and must be generated locally:

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

- Icons: [Phosphor Icons](https://phosphoricons.com/) — MIT License
- Icon data: [@phosphor-icons/core](https://github.com/phosphor-icons/core)
- Repository: [github.com/northsoon-studio/phosphor-icons-astro](https://github.com/northsoon-studio/phosphor-icons-astro)
- npm: [@northsoon/phosphor-icons-astro](https://www.npmjs.com/package/@northsoon/phosphor-icons-astro)

---

## License

MIT
