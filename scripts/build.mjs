/**
 * build.mjs - Component generator for @northsoon/phosphor-icons-astro
 *
 * How it works:
 *   1. Reads SVGs from @phosphor-icons/core (all weights: thin/light/regular/bold/fill/duotone)
 *   2. Groups them by icon name
 *   3. Generates ONE .astro file per icon with all weights embedded
 *   4. Weight, size, color and accessibility are typed props on each component
 *
 * Usage: npm run build
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const ASSETS_DIR = path.join(ROOT, "node_modules/@phosphor-icons/core/assets");
const OUTPUT_DIR = path.join(ROOT, "icons");

/** All available weights in Phosphor */
const WEIGHTS = ["thin", "light", "regular", "bold", "fill", "duotone"];

/** Pre-compiled regexes - avoids creating new RegExp() for each of the ~9000 SVG files */
const weightSuffixRegex = Object.fromEntries(WEIGHTS.map((w) => [w, new RegExp(`-${w}$`)]));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Converts "arrow-right" → "ArrowRight" */
function toPascalCase(str) {
  return str
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join("");
}

/**
 * Extracts the inner content of the <svg> element (paths, circles, polylines…).
 * Also removes the decorative rect that Phosphor includes as a bounding box.
 */
function extractSvgInner(rawSvg) {
  const match = rawSvg.match(/<svg[^>]*>([\s\S]*?)<\/svg>/);
  if (!match) return "";
  return match[1]
    .replace(/<rect[^>]*width="256"[^>]*\/?>/g, "") // remove background bounding rect
    .trim();
}

// ---------------------------------------------------------------------------
// 1. Read all SVGs and group by icon
// ---------------------------------------------------------------------------

/** @type {Map<string, Record<string, string>>} kebabName → { weight: svgInnerContent } */
const iconMap = new Map();

for (const weight of WEIGHTS) {
  const weightDir = path.join(ASSETS_DIR, weight);

  if (!fs.existsSync(weightDir)) {
    console.warn(`⚠️  Directory not found for weight "${weight}": ${weightDir}`);
    continue;
  }

  const files = fs.readdirSync(weightDir).filter((f) => f.endsWith(".svg"));

  for (const file of files) {
    // File format is "<kebab-name>-<weight>.svg"
    // Strip the "-<weight>" suffix to get the icon name
    const nameWithWeight = path.basename(file, ".svg");
    const kebabName = nameWithWeight.replace(weightSuffixRegex[weight], "");

    const rawSvg = fs.readFileSync(path.join(weightDir, file), "utf-8");
    const innerContent = extractSvgInner(rawSvg);

    if (!iconMap.has(kebabName)) {
      iconMap.set(kebabName, {});
    }
    iconMap.get(kebabName)[weight] = innerContent;
  }
}

// ---------------------------------------------------------------------------
// 2. Prepare output directory
// ---------------------------------------------------------------------------

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
} else {
  // Remove previously generated .astro files
  for (const file of fs.readdirSync(OUTPUT_DIR)) {
    if (file.endsWith(".astro")) {
      fs.unlinkSync(path.join(OUTPUT_DIR, file));
    }
  }
}

// ---------------------------------------------------------------------------
// 3. Generate one .astro per icon
// ---------------------------------------------------------------------------

let generated = 0;

for (const [kebabName, weightPaths] of iconMap) {
  const pascalName = toPascalCase(kebabName);

  // Serialize each weight's paths as a safe JS object literal
  const pathsLines = WEIGHTS.filter((w) => weightPaths[w] !== undefined)
    .map((w) => `  ${JSON.stringify(w)}: ${JSON.stringify(weightPaths[w])}`)
    .join(",\n");

  const fileContent = `---
// Auto-generated - do not edit manually
// Icon: ${kebabName}  |  Source: @phosphor-icons/core (MIT License - https://phosphoricons.com)
import type { HTMLAttributes } from "astro/types";

export interface Props extends Omit<HTMLAttributes<"svg">, "width" | "height"> {
  /**
   * Icon size. Accepts a number (px) or any CSS value (e.g. "2rem", "24px").
   * @default "1em"
   */
  size?: number | string;
  /**
   * Visual style / weight of the icon.
   * @default "regular"
   */
  weight?: "thin" | "light" | "regular" | "bold" | "fill" | "duotone";
  /**
   * Icon color. Accepts any valid CSS color value.
   * @default "currentColor"
   */
  color?: string;
  /**
   * Flips the icon horizontally (useful for RTL layouts).
   * @default false
   */  mirrored?: boolean;
}

const {
  size = "1em",
  weight = "regular",
  color = "currentColor",
  mirrored = false,
  "aria-label": ariaLabel,
  class: className,
  style: styleProp,
  ...rest
} = Astro.props;

/** SVG inner content for each available weight */
const svgPaths: Record<string, string> = {
${pathsLines}
};

const svgContent = svgPaths[weight] ?? svgPaths["regular"] ?? "";

// Merge mirrored transform with any user-provided style prop.
// String styles are concatenated; object styles get the transform key merged
// (the user transform runs after the mirror flip).
const style = !mirrored
  ? styleProp
  : typeof styleProp === "string"
    ? ["transform: scaleX(-1)", styleProp].filter(Boolean).join("; ")
    : styleProp != null && typeof styleProp === "object"
      ? {
          ...(styleProp as Record<string, unknown>),
          transform: [
            "scaleX(-1)",
            (styleProp as Record<string, unknown>).transform,
          ]
            .filter(Boolean)
            .join(" "),
        }
      : "transform: scaleX(-1)";
---

<!-- role="img" + aria-label when meaningful; role="presentation" + aria-hidden when decorative -->
<svg
  xmlns="http://www.w3.org/2000/svg"
  width={size}
  height={size}
  fill={color}
  viewBox="0 0 256 256"
  role={ariaLabel ? "img" : "presentation"}
  aria-label={ariaLabel}
  aria-hidden={ariaLabel ? undefined : "true"}
  style={style}
  class={className}
  {...rest}
>
  <Fragment set:html={svgContent} />
</svg>
`;

  fs.writeFileSync(path.join(OUTPUT_DIR, `${pascalName}.astro`), fileContent, "utf-8");
  generated++;
}

// ---------------------------------------------------------------------------
// 4. Generate icon-names.ts - IconName union + runtime list for <Icon />
// ---------------------------------------------------------------------------

const sortedNames = [...iconMap.keys()].sort();
const namesUnion = sortedNames.map((n) => `  | "${n}"`).join("\n");
const namesArray = sortedNames.map((n) => `  "${n}",`).join("\n");

const manifestContent = `// Auto-generated - do not edit manually
// ${sortedNames.length} icons from @phosphor-icons/core (MIT License - https://phosphoricons.com)
// Run \`npm run build\` to regenerate after updating @phosphor-icons/core.

/** Kebab-case icon name, e.g. "rocket-launch". Powers <Icon name="..." /> autocomplete. */
export type IconName =
${namesUnion};

/** All icon names at runtime (for validation, search, docs). */
export const iconNames: IconName[] = [
${namesArray}
];

/** Number of icons in this build. */
export const iconCount: number = ${sortedNames.length};
`;

fs.writeFileSync(path.join(ROOT, "icon-names.ts"), manifestContent, "utf-8");

console.log(`✅ ${generated} componentes generados → icons/`);
console.log(`✅ icon-names.ts generado (${sortedNames.length} iconos)`);
