# Project preflight: is this a shadcncraft project?

Generated code only looks right if the project is actually set up for shadcncraft. In an empty or plain shadcn project, installed blocks render with the wrong font (a serif fallback) and the wrong colors, and pro blocks fail to install at all, at which point the agent quietly "falls back" to generating a generic approximation that looks nothing like the design. **Run this preflight before you generate or install anything.** A missing font or registry config is the difference between a pixel-correct page and a serif scaffold.

## Check, then set up what is missing

### 1. `components.json` + the `@shadcncraft` registry

- No `components.json`? Initialise shadcn first: `npx shadcn@latest init`.
- Ensure the `@shadcncraft` registry is configured, with a shadcncraft `style` and the license header:

  ```json
  {
    "style": "radix-nova",
    "registries": {
      "@shadcncraft": {
        "url": "https://shadcncraft.com/r/{style}/{name}",
        "headers": { "X-License-Key": "${SHADCNCRAFT_LICENSE_KEY}" }
      }
    }
  }
  ```

  The `{style}` URL token uses the `"style"` field (e.g. `radix-nova`, `radix-vega`, `base-mira`, …). Team/Single licenses also need an `X-Instance-Name` header and `SHADCNCRAFT_INSTANCE_NAME`.

### 2. License key (required for pro blocks)

Pro blocks need `SHADCNCRAFT_LICENSE_KEY` in the project's `.env` / `.env.local`. Without it the registry returns 403 and nothing installs. **If the key is missing, stop and ask the user for it.** Do not silently generate a lookalike, which is what produces a bad result.

### 3. Fonts (the usual reason output is serif)

shadcncraft blocks use Geist through `--font-sans`, `--font-heading`, and `--font-mono`. If those variables and the font files are not wired up, every block falls back to the browser serif. This is what "fonts didn't load" looks like. Set them up in the root layout:

```tsx
// app/layout.tsx
import { Geist, Geist_Mono } from "next/font/google";
import { cn } from "@/lib/utils";

const fontSans = Geist({ variable: "--font-sans", subsets: ["latin"] });
const fontHeading = Geist({ variable: "--font-heading", subsets: ["latin"] });
const fontMono = Geist_Mono({ variable: "--font-mono", subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={cn(fontSans.variable, fontHeading.variable, fontMono.variable)}
    >
      <body>{children}</body>
    </html>
  );
}
```

Then bridge those variables into Tailwind in `globals.css` so the `font-sans` / `font-heading` / `font-mono` utilities resolve:

```css
@theme inline {
  --font-sans: var(--font-sans);
  --font-heading: var(--font-heading);
  --font-mono: var(--font-mono);
}
```

(If the project deliberately uses a different font, wire that one instead; the point is the `--font-*` variables must exist and point at a real loaded font.)

### 4. Tokens / base style

Installing your first `@shadcncraft/*` block automatically pulls the style + `semantic-tokens` items, which write the `:root`/`.dark` color tokens, `--radius`, and the `body { @apply font-sans … }` base rule. So once steps 1 to 3 are done, installing a block fills in the rest. To set tokens up front (or to apply the user's own theme), use `shadcncraft-import-variables`.

## After setup

A single installed block should now render with Geist and the correct colors. If it still looks like a serif scaffold, fonts (step 3) are not wired. Fix that before doing anything else. Never paper over a broken setup by generating components from scratch; that is how you get a page that looks nothing like the design.
