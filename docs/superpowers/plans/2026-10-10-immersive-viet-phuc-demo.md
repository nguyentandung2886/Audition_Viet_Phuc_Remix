# Việt Phục Remix — Immersive Demo Implementation Plan

**Goal:** A 2–4 minute playable demo in which a student enters a Việt phục gallery, selects a garment or occasion, moves into its fitting room, changes a curated color and accessory, and reads a sourced cultural note.

**Baseline:** The repository already renders one anime character and three layered garments (`ao_dai/red`, `nhat_binh/royal_blue`, `giao_linh/emerald`). It has no room backgrounds, occasion selector, verified sources, or spatial navigation. The existing 2026-10-09 MVP plan describes work already present but its unchecked boxes are not a reliable progress record; this plan starts from the current code.

**Architecture:** Keep one Next.js route and one stable 2D stage. A typed scene manifest drives the gallery and fitting-room layers; a separate outfit state drives `OutfitComposer`. GSAP owns room/camera and scroll sequences; Framer Motion owns garment and accessory changes. AI assets are generated offline, validated, and published as static files with metadata. Cultural copy is reviewed before it appears in the demo.

**Tech stack:** Next.js 16.4, React 19, Tailwind 4, GSAP 3, Framer Motion, Python/Pillow asset tooling already installed in the project.

**References:** `docs/superpowers/specs/2026-10-09-viet-phuc-remix-architecture-design.md` and `viet-phuc-remix-agent-plan.md`; this plan supersedes their old dependency/version assumptions and prioritization where they differ.

## Scope and decisions

- Demo garments: the three existing sets. Use **áo dài** as the fully polished vertical slice, then apply the same room template to Nhật Bình and giao lĩnh.
- Routes: one interactive route; rooms are application states, not separate page loads. The user can always return to the gallery.
- Occasions: a small curated mapping to existing garments. Avoid pretending that every combination has a documented historical precedent.
- Colors: publish approved visual variants per garment rather than using `hue-rotate` as the final product behavior.
- Accessories: selectable optional assets. Core torso and lower garment layers cannot be disabled.
- Aesthetic: anime 2D cel shading with a Vietnamese costume atelier setting. Depth comes from background, midground, foreground, lighting and camera transforms rather than 3D modeling.
- Cultural guard: explain which garment feature a choice obscures or changes; allow a creative remix without labeling it inherently wrong.
- Deferred: photo upload, weather, automatic color scoring, full lookbook sharing and 3D avatars. A local saved look can follow the core demo if time permits.

## Asset contract

- `public/assets/scenes/gallery/` and `public/assets/scenes/<garment>/` hold separate background, midground, foreground and optional light/texture assets. Each scene has a manifest with intrinsic dimensions and hotspot coordinates expressed as percentages.
- Character and garment variants use the existing 1024×1536 canvas and one fixed pose. Each layer has stable `layerId`, `renderOrder`, `assetPath`, optional status and a garment/variant ID. No asset may depend on the current browser viewport for alignment.
- The AI production pass starts with an art-direction sheet and reference pose, then generates one canonical character, room plates and garment/accessory layers. Processing includes transparency, crop/alignment, edge cleanup, filename/metadata export and a human visual review of overlap and cultural details. Keep raw/generated files outside the shipped `public` tree; publish only approved derivatives.
- Acceptance for each set: no opaque background on garment layers, no visible misalignment at the collar/shoulders/waist, no missing referenced files, and a clear visual difference between approved color options.

## UI/UX and motion system

Use installed skills as working tools, not as a list to cite after the fact:

| Decision or review | Skill | Required artifact/check |
| --- | --- | --- |
| Product-wide direction, navigation, responsive behavior and accessibility | `ui-ux-pro-max` | Query its design-system mode for this product and focused UX/Next.js guidance; record choices and rejected patterns in the design notes |
| Art direction, visual hierarchy, typography and scene composition | `frontend-design` | Gallery and fitting-room mockups using actual garment names and imagery |
| Shared palette, type, spacing, overlays and control states | `design-system`, `ui-styling` | Semantic tokens and reusable controls; keyboard focus and touch targets are visible |
| Choreography | `motion-design`, `gsap-core`, `gsap-timeline`, `gsap-scrolltrigger`, `gsap-react`, `gsap-performance` | Motion map with trigger, duration, easing, focal element, reduced-motion result and cleanup behavior |

Motion choreography: gallery establishes the room with subtle parallax; selecting a hotspot moves the camera toward that garment while the old controls exit and the fitting controls enter; changing a variant crossfades only affected garment layers; saving/reviewing the look moves attention to the result and cultural card. Scroll may drive the introduction, but garment selection and exit are explicit controls and work by touch, keyboard and reduced-motion settings. No hover-only interaction.

## Superpowers agent workflow

1. **Before a task:** `brainstorming` keeps the agreed journey and design constraints explicit. `writing-plans` turns each milestone below into checkable, small tasks. Read the relevant guide in `node_modules/next/dist/docs/` before writing Next.js code, as required by `AGENTS.md`.
2. **Workspace:** inspect git state; use `using-git-worktrees` when implementation needs isolation. Do not overwrite the current clean checkout or mix raw generated images with code changes.
3. **Execution:** use `executing-plans` for tightly coupled scene/state work. Use `subagent-driven-development` only for genuinely independent tasks, such as cultural content review and asset-manifest validation, with clear file ownership; do not run parallel agents that edit the same scene or composer files.
4. **Per task:** specify inputs, output files, acceptance checks and a rollback point. Use `test-driven-development` for state transitions, manifest validation and cultural rules; use visual/browser checks for animation and layout. Use `systematic-debugging` for unexpected behavior rather than patching by guesswork.
5. **Gate:** review task output against the brief, run `requesting-code-review` for substantial changes, then `verification-before-completion` with fresh command output and a desktop/mobile/reduced-motion demo pass. Record what passed and any remaining limitation. Continue to the next task after a passing gate.

## Implementation milestones

### 1. Audit and UI specification

- [ ] Record the current screen and all three outfits at desktop and mobile sizes; note layering failures, loading behavior and visual inconsistencies.
- [ ] Run the `ui-ux-pro-max` design-system query and focused accessibility/Next.js queries. Apply `frontend-design` to two layouts: gallery and fitting room. Choose one visual direction and create semantic tokens for color, type, spacing and interactive states.
- [ ] Produce a scene storyboard and motion map showing gallery → chosen room → styled result → gallery, including click, scroll, touch, keyboard and reduced-motion paths.
- [ ] Review the cultural text for each existing garment. Replace unsupported era-wide labels and add source fields and a review status to the content model.

**Done when:** the design notes identify one selected layout, scene layers, hotspot positions, navigation and source requirements; there is a clear visual reference for asset production.

### 2. Stable outfit and content model

- [ ] Create typed garment, color variant, accessory, occasion and scene manifests. Validate IDs, asset paths, compatible character and required layers before rendering.
- [ ] Move hard-coded options from `app/page.tsx` to data. Separate outfit state from room-navigation state. Keep garment metadata paired with the selected ID so an old response cannot display on a newly selected outfit.
- [ ] Update `OutfitComposer` so required layers stay visible, optional accessories can be selected independently, missing assets show an actionable fallback, and variant changes preserve character alignment.
- [ ] Add focused tests for fast switching, missing metadata/assets, required-layer protection and occasion-to-garment mapping.

**Done when:** the existing three garments can be selected without stale content or disappearing core clothing; the preview remains usable if an optional asset fails.

### 3. AI asset vertical slice: áo dài

- [ ] Write an art-direction sheet for the canonical pose, áo dài room, foreground objects, two approved garment colors and two accessory choices.
- [ ] Generate and process layered AI assets. Use the existing Python pipeline where useful, add manifest export/validation for scene assets, and visually inspect edges and overlap at native resolution.
- [ ] Publish only approved assets and metadata. Record each asset's prompt/reference, version and reviewer so variants can be regenerated consistently.

**Done when:** the áo dài room and two color options are visually coherent, aligned and complete without runtime AI calls.

### 4. Gallery and room navigation

- [ ] Build the gallery stage with three visible garment hotspots and an occasion entry point. Keep controls in the DOM, labeled and reachable by keyboard.
- [ ] Build a reusable fitting-room scene driven by the scene manifest; display the character, controls, garment description and a route back to the gallery.
- [ ] Implement one state-driven GSAP timeline for entering/leaving a room, with cleanup on scene change and a no-motion equivalent. Preload the destination room before transition.
- [ ] Check desktop and mobile composition, loading, direct refresh, back navigation and interrupted rapid clicks.

**Done when:** the user can enter and exit the áo dài room without page reload, broken layers or stranded controls.

### 5. Polished styling interaction

- [ ] Add curated color variant buttons and optional accessory choices; animate the affected layers only. Keep the visible option labels in Vietnamese.
- [ ] Add short occasion/style suggestions and a contextual cultural note with source attribution. Add a non-blocking cultural guard message for specific documented mismatches.
- [ ] Apply the same room template and interaction model to Nhật Bình and giao lĩnh after their scene assets pass visual review.
- [ ] Verify focus, contrast, touch size, reduced motion and meaningful image text; test on narrow and wide viewports.

**Done when:** all three outfits can be entered and styled, while the áo dài path is presentation-ready and every result exposes a sourced cultural note.

### 6. Demo polish and optional saved look

- [ ] Add an opening scroll vignette only if it does not delay the first usable action; keep a visible skip/enter control.
- [ ] Optimize shipped images, preload only the first scene and likely next scene, and check transition smoothness on a mid-range phone.
- [ ] If the core demo is stable, add a locally saved look card and a simple before/after view. Sharing/upload/weather remain separate follow-up work.
- [ ] Run build, scoped lint, relevant Python/TypeScript tests and a manual 2–4 minute demo at desktop, mobile and reduced motion. Review the final branch and record any limitations.

**Done when:** a first-time viewer can choose a garment or occasion, enter a room, change color and accessory, see a smooth result and read its cultural context within 2–4 minutes.

## Review focus

- Fast repeated room or garment selection must not show stale metadata or overlapping timelines.
- Missing or late-loading room/garment assets must not expose an empty or misaligned stage.
- Required garment pieces must never be removed by an optional-accessory control.
- Mobile and reduced-motion users must complete the same journey without scroll pinning or hover.
- Cultural facts and period labels must match the selected garment and show a source/review status before release.
