/**
 * build.mjs — Generador de componentes Astro para @northsoon/phosphor-icons-astro
 *
 * Cómo funciona:
 *   1. Lee los SVGs de @phosphor-icons/core (todos los pesos: thin/light/regular/bold/fill/duotone)
 *   2. Agrupa por nombre de icono
 *   3. Genera UN archivo .astro por icono con todos los pesos embebidos
 *   4. El peso, tamaño, color y accesibilidad son props tipadas en cada componente
 *
 * Uso: npm run build
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const ASSETS_DIR = path.join(ROOT, "node_modules/@phosphor-icons/core/assets");
const OUTPUT_DIR = path.join(ROOT, "icons");

/** Todos los pesos disponibles en Phosphor */
const WEIGHTS = ["thin", "light", "regular", "bold", "fill", "duotone"];

/** Regexes pre-compiladas — evita crear new RegExp() por cada uno de los ~9000 archivos SVG */
const weightSuffixRegex = Object.fromEntries(WEIGHTS.map((w) => [w, new RegExp(`-${w}$`)]));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Convierte "arrow-right" → "ArrowRight" */
function toPascalCase(str) {
  return str
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join("");
}

/**
 * Extrae el contenido interior del <svg> (paths, circles, polylines…).
 * También elimina el rect decorativo que Phosphor incluye como bounding box.
 */
function extractSvgInner(rawSvg) {
  const match = rawSvg.match(/<svg[^>]*>([\s\S]*?)<\/svg>/);
  if (!match) return "";
  return match[1]
    .replace(/<rect[^>]*width="256"[^>]*\/?>/g, "") // quita el rect de fondo
    .trim();
}

// ---------------------------------------------------------------------------
// 1. Leer todos los SVGs y agrupar por icono
// ---------------------------------------------------------------------------

/** @type {Map<string, Record<string, string>>} kebabName → { weight: svgInnerContent } */
const iconMap = new Map();

for (const weight of WEIGHTS) {
  const weightDir = path.join(ASSETS_DIR, weight);

  if (!fs.existsSync(weightDir)) {
    console.warn(`⚠️  Directorio no encontrado para peso "${weight}": ${weightDir}`);
    continue;
  }

  const files = fs.readdirSync(weightDir).filter((f) => f.endsWith(".svg"));

  for (const file of files) {
    // El formato del archivo es "<kebab-name>-<weight>.svg"
    // Quitamos el sufijo "-<weight>" para obtener el nombre del icono
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
// 2. Preparar carpeta de salida
// ---------------------------------------------------------------------------

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
} else {
  // Limpiar archivos .astro anteriores
  for (const file of fs.readdirSync(OUTPUT_DIR)) {
    if (file.endsWith(".astro")) {
      fs.unlinkSync(path.join(OUTPUT_DIR, file));
    }
  }
}

// ---------------------------------------------------------------------------
// 3. Generar un .astro por icono
// ---------------------------------------------------------------------------

let generated = 0;

for (const [kebabName, weightPaths] of iconMap) {
  const pascalName = toPascalCase(kebabName);

  // Serializar los paths de cada peso como objeto JS literal seguro
  const pathsLines = WEIGHTS.filter((w) => weightPaths[w] !== undefined)
    .map((w) => `  ${JSON.stringify(w)}: ${JSON.stringify(weightPaths[w])}`)
    .join(",\n");

  const fileContent = `---
// Auto-generated — do not edit manually
// Icon: ${kebabName}  |  Source: @phosphor-icons/core (MIT License — https://phosphoricons.com)
import type { HTMLAttributes } from "astro/types";

export interface Props extends Omit<HTMLAttributes<"svg">, "width" | "height"> {
  /**
   * Tamaño del icono. Acepta número (px) o cualquier valor CSS (e.g. "2rem", "24px").
   * @default "1em"
   */
  size?: number | string;
  /**
   * Peso / estilo visual del icono.
   * @default "regular"
   */
  weight?: "thin" | "light" | "regular" | "bold" | "fill" | "duotone";
  /**
   * Color del icono. Acepta cualquier valor CSS válido.
   * @default "currentColor"
   */
  color?: string;
  /**
   * Voltea el icono horizontalmente (útil para layouts RTL).
   * @default false
   */
  mirrored?: boolean;
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

/** SVG interior por cada peso disponible */
const svgPaths: Record<string, string> = {
${pathsLines}
};

const svgContent = svgPaths[weight] ?? svgPaths["regular"] ?? "";

// Merge mirrored transform with any user-provided style prop
const style = mirrored
  ? ["transform: scaleX(-1)", typeof styleProp === "string" ? styleProp : ""].filter(Boolean).join("; ")
  : styleProp;
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

console.log(`✅ ${generated} componentes generados → icons/`);
