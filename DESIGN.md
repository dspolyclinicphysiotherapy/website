# DS Polyclinic — Visual Design System (DESIGN.md)
*Crafted following voltagent/awesome-design-md, pbakaus/impeccable, and leonxlnx/taste-skill*

## 1. Visual Theme & Atmosphere
- **Archetype**: Apple Health / Editorial Medical Minimalist.
- **Tone**: Clinical authority, calm empathy, understated confidence, restorative.
- **Aesthetic Distinction**: High-contrast typography, generous negative space, warm organic stone/foliage undertones (`#447e2d`, `#1d1d1f`, `#f5f5f7`), and authentic documentary-style human imagery.
- **Anti-Slop Guardrails**:
  - No synthetic purple-to-cyan gradients.
  - No cartoon illustrations or generic vector 3D models.
  - No decorative emojis in headings, badges, or buttons.
  - No cards nested inside cards.
  - No fake product dashboards or pill tags labeled `01 // SYSTEM`.
  - No centered long-form text (body text is strictly left-aligned for natural reading cadence).

## 2. Color Palette & Roles
```css
:root {
  /* Brand Accents */
  --green: #447e2d;          /* Primary clinical green (herbaceous, restorative) */
  --green-dark: #2d5a1e;     /* Interactive hover & high-contrast text */
  --green-pale: #f0f7ed;     /* Subtle tinted background fill */
  --green-soft: #8fcf7a;     /* Dark-mode accent & highlight */

  /* Neutral Spectrum */
  --black: #1d1d1f;          /* Apple off-black primary text & dark containers */
  --gray-900: #2e2e30;       /* Secondary dark surface */
  --gray-600: #6e6e73;       /* Subtitles, secondary descriptive copy (passes WCAG AA) */
  --gray-400: #aeaeb2;       /* Borders, muted states, icons */
  --gray-200: #d2d2d7;       /* Hairline structural dividers */
  --gray-100: #f5f5f7;       /* Card background surfaces & container fills */
  --white: #ffffff;          /* Canvas background & high-contrast elements */

  /* Semantic */
  --color-focus: #0071e3;    /* Focus ring outline */
  --color-error: #b3261e;    /* Validation errors */
  --color-success: #1a5e0a;  /* Confirmed bookings & lead success */
}
```

## 3. Typography Rules
- **Display Serif**: `Cormorant Garamond`, Georgia, serif.
  - Role: Headlines (`h1`, `h2`), patient quotes, clinic title marks.
  - Kerning: `-0.5px` to `-1px` on large clamp sizes, never cramped.
- **Primary Sans**: `Jost`, -apple-system, system-ui, sans-serif.
  - Role: Body paragraphs, navigation, form inputs, button CTAs.
  - Line-height: `1.58` for comfortable optical tracking.
- **Monospace / Label**: `Montserrat`, sans-serif.
  - Role: Category overlines, metadata tags, operational hours (e.g. `9:00 AM – 9:30 PM`).
  - Letter-spacing: `1.5px` uppercase.
- **Typographic Polish (Impeccable & Taste standard)**:
  - En-dashes (`–`) for date/time ranges (`9:00 AM – 9:30 PM`).
  - Em-dashes (`—`) for explanatory breaks.
  - Curly quotes (`“` and `”`) on patient testimonials.
  - Balanced headers: `text-wrap: balance;` on all headings.
  - Pretty body text: `text-wrap: pretty;` on editorial summaries.

## 4. Layout & Spacing System
- **Grid & Max Widths**:
  - Container Narrow (`.wrap-sm`): `640px` (forms, quizzes, article reading flow).
  - Container Standard (`.wrap`): `980px` (editorial sections, doctor profile).
  - Container Wide (`.wrap-lg`): `1120px` (navigation, treatment showcases, footer).
- **Spacing Scale**: Base unit `8px` (`8px`, `16px`, `24px`, `32px`, `48px`, `64px`, `96px`, `128px`).
- **Section Padding**: `100px 0` on desktop, `64px 0` on mobile. Generous vertical breathing room.
- **Visual Rhythm**: Alternate sections between pure white (`--white`), calm off-white (`--gray-100`), and dark immersive canvas (`--black`).

## 5. Components & Interactive States
- **Buttons**:
  - Primary CTA: Pill shape (`border-radius: 980px`), padding `14px 28px`, font-size `15px`, font-weight `500`.
  - Secondary CTA: Clean border `1px solid rgba(0,0,0,0.15)` or `1px solid rgba(255,255,255,0.3)`.
  - Hover: Subtle luminance drop (e.g. `--green-dark`), transition `200ms ease`.
  - Active: Scale `0.985` tactile press response.
  - Focus Ring: `outline: 2px solid var(--color-focus); outline-offset: 2px;` via `:focus-visible`.
- **Touch Targets**: Minimum `44px × 44px` across all mobile interactive controls (hamburger, telephone links, pills, tabs).
- **Cards**:
  - Border radius: `16px` consistent radius across all cards.
  - Elevation: Minimal. Favor subtle `1px solid var(--gray-200)` and tonal shifts over heavy dropped shadows.
- **Navigation**:
  - Height: `52px`.
  - Background: `rgba(255, 255, 255, 0.88)` with `backdrop-filter: saturate(180%) blur(20px)`.
  - Bottom border: `1px solid rgba(0, 0, 0, 0.08)`.
  - Links: Desktop standard `<a href="...">` with hover opacity change from `0.8` to `1.0`.

## 6. Imagery Standards
- **Photography Style**: Authentic documentary photography of clinical manual therapy, rehabilitation exercises, and patient mobility.
- **Image Performance**:
  - Explicit `aspect-ratio` or `width`/`height` on all image containers to guarantee Zero Cumulative Layout Shift (`CLS < 0.05`).
  - Native `loading="lazy"` on all below-the-fold imagery.
  - `decoding="async"` for seamless rendering threads.
  - `alt` text describes the exact clinical procedure shown (e.g., "Doctor performing joint mobilization on knee").

## 7. Accessibility (a11y) & SEO Requirements
- Semantic HTML landmarks: `<header role="banner">`, `<nav aria-label="Main Navigation">`, `<main>`, `<section>`, `<footer>`.
- Color contrast: All text exceeds WCAG 2.1 AA (≥ 4.5:1 ratio).
- Reduced Motion: `@media (prefers-reduced-motion: reduce)` disables all non-essential transitions and animations.
- Schema.org Structured Data: `MedicalClinic`, `Physiotherapy`, `FAQPage`, `LocalBusiness` JSON-LD embedded on all entry pages.
