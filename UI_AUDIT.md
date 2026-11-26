# AlgoJava — UI/UX Visual Audit

**Scope:** Full inspection of all pages (`DashboardPage`, `ProblemsPage`, `ProblemSolverPage`, `ProgressPage`, `SettingsPage`, `AboutPage`), layout shell (`AppShell`, `Sidebar`, `TitleBar`), design tokens (`tokens.css`, `themes.css`, `globals.css`), and shared UI primitives (`src/components/ui/*`, `src/components/shared/*`) against the original AlgoJava visual identity.

---

## 1. Color & Theme System
- **Light Theme Contrast Failures**: `:root[data-theme="light"]` did not override `--accent-light` (`#a78bfa` on `#ffffff` fails WCAG AA contrast at ~2.8:1) or semantic status tokens (`--status-success`, `--status-warning`, `--status-info`, `--status-danger` remained bright dark-mode hues on light surfaces).
- **Missing Surface Hierarchy Tokens**: Only `--bg-surface` and `--bg-surface-elevated` existed, lacking a dedicated secondary recessed surface (`--bg-surface-secondary`), subtle inner top-edge highlight (`--surface-highlight`), theme-aware gradient text (`--accent-gradient-text`), and theme-aware code preview syntax tokens (`--code-*`).
- **Hardcoded Colors**:
  - `index.html` hardcoded `bg-[#0b0b14] text-[#f8fafc]` on `<body>`, causing a dark flash in Light mode.
  - `DashboardPage.tsx` used `text-orange-400` on the streak flame icon instead of a semantic token.
  - `AppearanceCard.tsx` used `ring-white` on the active accent swatch (invisible on Light theme surfaces).
  - `EditorSettingsCard.tsx` used hardcoded `text-purple-400`, `text-amber-300`, `text-sky-400` on `--bg-editor`, reducing readability in Light mode.
  - `JavaCupEmblem` in `Illustrations.tsx` used fixed light slate fills (`#e2e8f0`, `#cbd5e1`) that blended into white Light-mode backgrounds.

## 2. Typography & Control Alignment
- **Overuse of Tiny Text**: All 6 Settings cards and `AboutPage` defaulted entire control blocks to `text-xs` (`12px`), while badges/captions dropped to `text-[10px]`/`text-[11px]`, weakening hierarchy and desktop scannability.
- **Inconsistent Control Heights**: `Input` (`py-2` -> ~38px), `Select` (`py-1.5` -> ~34px), `SegmentedControl` (~30px), and `Button` (`sm: h-8`, `md: h-9.5`) did not share a unified height scale, creating jagged alignment when placed side-by-side in toolbars and settings rows.
- **Missing `tabular-nums`**: Progress counters, percentages, runtimes, and problem indices lacked `font-variant-numeric: tabular-nums`, causing horizontal jitter as numbers changed.

## 3. Application Shell (`Sidebar` & `TitleBar`)
- **Header Alignment**: `Sidebar` top brand block (`pt-5 pb-6`) did not align cleanly with the `h-10` `TitleBar` seam.
- **Active Nav Indicator**: Active sidebar items used a heavy full-border box without a crisp left accent indicator pill.
- **Misleading Breadcrumbs**: `TitleBar` rendered a back-arrow button (`← Settings`, `← Problems`, etc.) on top-level sidebar destinations instead of a contextual breadcrumb, whereas back navigation only belongs on detail routes (`/problems/:slug`).
- **System Theme Toggle Bug**: `TitleBar` checked `theme === "dark"` directly; when `theme === "system"` on a light OS preference, the toggle icon and action were inverted.

## 4. Dashboard (`DashboardPage`)
- **Cramped Category Grid at 1366×768**: `lg:col-span-7` combined with `xl:grid-cols-3` compressed each category card to ~186px wide with minimal breathing room.
- **Hero Artwork Polish**: `DashboardHeroArtwork` and `ProgressHeroArtwork` used basic flat shapes that felt disconnected from the typography and surface quality.
- **Empty State Utility**: Recent Activity empty state showed an icon and text with no direct CTA to start practicing.

## 5. Settings Page (`SettingsPage` & 6 Cards — High Priority)
- **Double-Nested Narrow Columns**: `xl:grid-cols-2` paired with 4-column decorative preview boxes inside `AppearanceCard`, `EditorSettingsCard`, `JavaRuntimeCard`, and `PracticePreferencesCard` squeezed the actual controls into 150–320px strips.
  - `Bracket Pair Colorization` wrapped onto two lines in `EditorSettingsCard`.
  - `Theme` segmented controls and `JDK Location` / `Storage Location` inputs were excessively narrow.
  - `AboutSummaryCard` forced 3 columns (`3+5+4`) inside a half-width card, cramping metadata and links.
- **Destructive Action Hierarchy Inversion**: In `DataStorageCard`, `Reset Progress` (permanently wipes SQLite submissions, drafts, and notes) used `variant="secondary"`, while `Clear Cache` (safe temp folder cleanup) used `variant="danger"`.
- **Navigation**: Long 6-card vertical scroll lacked quick-jump section anchors.

## 6. Remaining Pages & Micro-Interactions
- **Narrow Viewport Clipping**: `ProblemSolverPage` applied `overflow-hidden` on its root container at all breakpoints, clipping stacked panes below `lg`. `ProblemsPage` stacked categories lacked a `max-h` cap on narrow widths.
- **Tooltip Edge Overflow**: `Tooltip` used `whitespace-nowrap` and `hidden group-hover:block`, allowing wide descriptions (e.g. `Code Overview`) to overflow right edges without transition.
- **Missing Motion & Reduced-Motion Support**: `Dialog`, `Dropdown`, `Toast`, and `Tooltip` lacked subtle entrance transitions, and `tokens.css` did not honor `@media (prefers-reduced-motion: reduce)`.
