/**
 * @northsoon/phosphor-icons-astro
 *
 * Astro integration entry point.
 * Enables: npx astro add @northsoon/phosphor-icons-astro
 *
 * The icon components themselves need no build configuration - they are
 * zero-JS `.astro` files imported per icon:
 *
 *   import Heart from "@northsoon/phosphor-icons-astro/icons/Heart.astro";
 *
 * The integration hook below exists so `astro add` can register the package
 * and to surface a friendly status message (including the installed icon
 * count) during `astro dev` / `astro build`.
 *
 * @returns {import('astro').AstroIntegration}
 */
export default function phosphorIconsAstro() {
  return {
    name: "@northsoon/phosphor-icons-astro",
    hooks: {
      "astro:config:setup": ({ logger }) => {
        logger.info(
          "Phosphor icons ready - import per-icon from `@northsoon/phosphor-icons-astro/icons/*.astro` or use the generic `<Icon name=\"...\" />` component.",
        );
      },
    },
  };
}
