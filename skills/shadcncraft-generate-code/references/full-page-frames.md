# Whole-page frames

Users often select a whole page in Figma ("Home", a full landing) and ask you to build it, not a single component. A shadcncraft page is **not one registry item**. It is a stack of section blocks, and the kit names them for you. Do not regenerate the page from a screenshot. Install the named sections and stack them.

## Detect it

Run `get_metadata` on the selection. If it returns a tall frame whose **direct children are several `… - Pro <Bundle> Block` instances** (e.g. `Hero 8 - Pro Marketing Block`, `Social Proof 5 - Pro Marketing Block`, `FAQ 3 - Pro Marketing Block`), it is a page, not a component. Switch to this flow.

## Resolve each section

Each child instance name encodes a registry block. Resolve every one against `registry-index.json`, the same matching you use for a single frame, applied per section:

1. Drop the ` - Pro Marketing Block` / ` - Pro Application Block` / ` - Pro Ecommerce Block` suffix.
2. Match the remaining name + number against item `name`/`title`. The kit's display names are not always the literal registry slug, so confirm against `registry-index.json`. Common normalisations seen on a real page:
   - `Hero 8` -> `hero-8`
   - `Top Navigation 1` -> `top-navigation-1`
   - `Social Proof 5` -> `social-proof-5`
   - `Benefits 9` -> `benefits-9`
   - `CTA Section 7` -> `cta-7`
   - `Testimonial 9` -> `testimonials-9` (plural)
   - `FAQ 3` -> `faqs-3` (plural)
   - `Banner 9` -> `banner-9`
   - `Footer 3` -> `footer-3`
3. A `get_screenshot` of the page confirms the order and the exact variant.

## Install

- **Preflight first.** A page of pro blocks needs the registry, the license key, and the fonts set up, or it renders as a serif scaffold. See `project-setup.md` and do that before installing.
- **Install every resolved section in one batched command** (project package manager; these are pro blocks, so include the license-key reminder):

  ```
  SHADCNCRAFT_LICENSE_KEY=<key> pnpm dlx shadcn@latest add \
    @shadcncraft/banner-9 @shadcncraft/hero-8 @shadcncraft/social-proof-5 \
    @shadcncraft/benefits-9 @shadcncraft/cta-7 ... @shadcncraft/footer-3
  ```

## Repeated blocks: each instance is its own unit of work

A block can appear **more than once** in a page (a frame with two `CTA Section 7` instances, two banners, a hero and a mid-page hero), and **each instance carries its own overrides**: different heading, body, image, buttons. The trap: you install the block once, drop `<CTA7 />` in twice, and move on, so both render the **default** content, because a single shared component can't hold two different copies and you never adapted either. This is exactly how a page ends up with one section still saying "Acme Inc." while every unique section is correct.

So count instances, not block names. When a block appears N times:

- Pull **each instance's own content and images separately** (`get_design_context` / `download_assets` on that instance's node, not just the first).
- Emit either **one prop-driven component** with per-instance props (`<CTA7 title=… body=… image=… />`) **or a copy per instance** (`cta-7-cashflow`, `cta-7-automate`). Either is fine; what's not fine is one default-content component reused N times.
- Resolve/install the block once (the CLI dedupes); adapt once **per instance**.

Treat "the same block twice" as two sections that happen to share a base, never as one section already handled.

## Copy each block into the page, don't edit the installed block in place

The installed block is your starting point, not the final file. A real frame almost always differs from the block's defaults (copy, images, and often layout), and editing the installed component in place forks the maintained source and collides when two pages use the same block. So for each section, copy the installed block into a page-scoped file, e.g. `components/<page>/<section>.tsx` (`home/hero-8.tsx`) or a `<page>-<section>` prefix, and make every frame-specific edit (the steps below) in that copy. Import the copies into the page; the installed block stays clean and reusable.

(If a block matches the frame as-is, same content, same layout, use it directly. Rare for a real design.)

## Thread the real content (REQUIRED, the step that makes it look like the design)

This is the difference between "the page matches the Figma" and "the page is a generic stock template." Installed blocks ship with their own default sample data (`Acme Inc.`, "Make Better Decisions, With Ease", placeholder logos, lorem testimonials). If you compose without replacing it, every section silently shows kit defaults, structurally correct, but reading nothing like the frame. **This is the single most common reason a whole-page build is rejected. Do not skip it.**

**`get_metadata` is NOT the content. Its layer names are the component _defaults_, not the instance's real text.** A hero text layer is *named* "Make Better Decisions, With Ease" even when the instance on the canvas actually displays "Take control of your cashflow." If you read content from `get_metadata` names, you will ship the defaults and never notice. The real, overridden copy only comes from `get_design_context` (or the screenshot).

So, for the frame, **before composing**, do this for every section:

1. **Call `get_design_context`** on the page frame (or section by section). This returns the actual displayed text, links, list items, and structure, the copy the user sees on the canvas, overrides included.
2. **Open each installed block** and find its sample-data `const`s (heading, body, `items`, `testimonials`, `faqs`, nav links, footer columns, logo list…).
3. **Replace those defaults with the frame's real content**, field for field: hero heading + subhead, every benefit title/description, each testimonial quote + author, the FAQ questions + answers, the nav and footer links, the social-proof logos/labels. Keep the same typed `const` shape so it stays swappable, and tell the user where each lives.
4. **Only fabricate** for fields the frame genuinely leaves blank, and keep them consistent with the rest of the page (same product, brand, tone).

**Self-check before composing:** grep the installed blocks for the kit's default strings: `Acme Inc`, `Make Better Decisions`, `lorem`, the placeholder logo names. If any survive, you skipped this step for that section. A page that still says "Acme Inc." is not done.

## Bring over the real images (REQUIRED)

The same trap as the copy, and the one most easily missed: a block installs with its **default image** (the kit's stock photography and mockups), which is almost never the image the frame actually shows. A Social Proof section whose frame displays a hands-holding-a-tablet product photo will render the kit's abstract orange gradient until you replace it. **Installing a block does not bring the design's images. You have to pull them from the frame.** (`get_metadata` won't reveal them either; image fills are not in its output.)

**Get image URLs from `get_design_context`, not `download_assets`.** When you call `get_design_context` on a section, every image comes back as a single flattened asset: `const imgX = "https://figma…/asset/…"` used as `<img src={imgX} />`. That is the image exactly as the design renders it, **including composed UI mockups** (a dashboard, a notifications panel, a "UI showcase"), which Figma flattens into one PNG for you. `download_assets` is the **wrong tool** here: it returns the *source fills inside* a panel (the individual avatars, logos, chart bits), so a dashboard or showcase comes back as a pile of unusable fragments, not the one panel image. (Use `download_assets` only when you specifically want an original source photo that is itself a single fill.)

For every section that contains an image, before composing:

1. **Read the section's `get_design_context`** and collect each `<img>` asset URL, the `const img… = "https://figma…/asset/…"` constants. They are live for ~7 days, so download promptly.
2. **Download each into the project**, e.g. `public/images/<section>-<n>.png`.
3. **Rewrite the block's image `src`** to the saved path, matching by order and by the section screenshot: a block with one showcase image takes the section's one asset; a logo strip takes the set.
4. **Flag, don't fake.** If a slot has no asset you can resolve, leave the block default and tell the user which section needs an image; never invent or substitute one.

**Self-check:** look at the rendered page. Any section still showing the kit's stock art (the orange gradient, the generic "Acme" dashboard mockup) where the frame showed a different image means you skipped this, most often by reaching for `download_assets` and getting fragments instead of using the `get_design_context` image URL.

## Match the layout, not just the content (REQUIRED)

Copy and images aren't enough when the frame changed the block's structure. Compare each copy against the section screenshot / `get_design_context` and apply the deltas the frame shows: **drop what it removed** (a hidden tagline, a heading, a whole column), **change what it restyled** (a `bg-muted` section, a different button variant, tighter spacing), and match its columns and alignment. `get_metadata` flags omitted parts as `hidden="true"`; honour those literally (e.g. a hero whose `Tagline` and `List` are `hidden="true"` should render neither).

**Match the typography precisely; it's the most visible miss.** `get_design_context` gives you the exact values; don't approximate from the screenshot:

- **Alignment**: left vs centered heading/body. The block's default is often centered where the frame is left-aligned (or vice versa); copy the frame's alignment.
- **Heading scale**: the frame's text size token (`text-4xl` / `text-5xl` …) and weight. Match it rather than keeping the block's default size.
- **Two-tone / coloured headings**: when a heading has a muted or accent second clause (e.g. "Automate every repetitive process **so your team can focus on real impact**" with the tail in `text-muted-foreground`), reproduce it with a `<span>`, not one flat colour.
- **Body width and leading**: `max-w-*` and line-height the frame uses for the supporting copy.

## Honour overrides, but don't reproduce design debt (REQUIRED)

`get_design_context` already returns each section in its **overridden** state, so reading overrides costs nothing extra. The judgment is which to apply:

- **Meaningful overrides → apply them.** Content, images, hidden layers, which variant, alignment, sizing: these are the design's intent. They're the whole reason the section differs from the block default.
- **Ad-hoc style overrides → normalise or flag, never hardcode.** Teams sometimes hand-restyle in Figma instead of using a variant: a section's fill flipped to black, an off-token colour, a one-off margin. Reproducing those faithfully means hardcoding off-token values, which breaks the tokens-only rule and bakes the design debt into the build. Map them to the nearest token or proper variant (a black section → the kit's dark/`bg-foreground` treatment, not `#000`), and **flag the ones that don't map** so the user can decide. Faithful-to-the-hack is the wrong goal; on-token-and-close is right.

## Compose

- **Compose the adapted copies into a page** in the frame's top-to-bottom order, exactly as `shadcncraft-compose-page` assembles a recipe (one `page.tsx`, sections in order, the style wrapper class if the project uses scoped styles), now carrying the real content, images, and layout you adapted above.

## When a section does not resolve

If a child instance does not map to any registry item (a detached instance, or a one-off the kit does not ship), generate just that one section from its frame using the normal single-frame flow, and flag it to the user. Do not let one unmatched section push you into regenerating the whole page from scratch.

This is the same job as `shadcncraft-compose-page`, driven by the frame's actual sections instead of an intent. If the user only wants the page assembled by intent (no Figma frame), point them at that skill instead.
