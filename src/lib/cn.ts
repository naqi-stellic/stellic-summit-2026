import { createCn } from "cn/config"

/* The bare `cn` specifier is aliased to this file (vite.config.ts + tsconfig),
 * so every shadcn component — including ones added later by the CLI, which
 * import from "cn" — picks this up without being edited.
 *
 * Why it is needed: our type scale lives in the `--text-*` theme namespace, so
 * it produces utilities like `text-body-md`. Class merging can't tell those
 * apart from colours such as `text-gray-80`, and silently drops the font size
 * whenever a colour follows it in the same call. Registering the scale as a
 * font-size group restores the distinction. Any new `--text-*` token has to be
 * added here too. */

const TYPE_SCALE = [
  "h400",
  "h300",
  "caption-lg",
  "body-md",
  "button-md",
  "label-md",
  "label-sm",
  "overline",
  "field",
]

export const cn = createCn({
  extend: { classGroups: { "font-size": [{ text: TYPE_SCALE }] } },
})
