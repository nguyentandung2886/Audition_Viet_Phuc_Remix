# Việt Phục Remix: Atelier bên ô cửa

Selected direction, 2026-10-10. Owner: design-system implementer. This file owns visual tokens and control states; [scene specification](../../docs/design/immersive-scenes.md) owns composition and motion; [audit](../../docs/design/current-state-audit.md) owns evidence and the Task 2 content handoff. The approved [implementation plan](../../docs/superpowers/plans/2026-10-10-immersive-viet-phuc-demo.md) owns scope. These documents specify future implementation; Task 1 changes no runtime behavior.

## Intent

An illustrated costume atelier in blue daylight, with one memorable element: a spatial garment display that becomes a fitting room. Students choose áo dài, áo Nhật Bình or áo giao lĩnh, try a curated color and accessory, and read a reviewed cultural note in a 2–4 minute demo. Vietnamese garment names and visible garment construction carry the cultural identity. Room architecture, colors and furnishings are contemporary art direction, not a reconstruction of a historical interior.

Use anime 2D cel shading, restrained linework, flat light/shadow planes and separate room layers. Keep character and garment pose fixed. Reserve decorative cloth for the room edge; never add generic lotus, drum or dragon motifs to controls. Existing garment motifs require asset and cultural review.

## Color tokens

Six primitives; no decorative gradient washes. Text and controls sit on opaque surfaces so contrast does not depend on a room image. Brass is decorative only, never body text on porcelain.

| Primitive | Hex | Semantic alias and purpose |
| --- | --- | --- |
| Ink / `--ink` | `#20334A` | `--color-text`, body, headings, neutral boundaries |
| Porcelain / `--porcelain` | `#F3F7FA` | `--color-surface`, canvas behind text, text on dark actions |
| Indigo / `--indigo` | `#354D80` | `--color-action`, primary action and focus outline |
| Jade / `--jade` | `#356557` | `--color-selected`, selected option marker and reviewed status |
| Lacquer / `--lacquer` | `#8D3D50` | `--color-notice`, error/attention icon with explanatory text |
| Brass / `--brass` | `#B18A46` | `--color-detail`, room fittings and nonessential trim |

Three-layer mapping is mandatory: primitive → semantic → component. Examples: `--indigo` → `--color-action` → `--button-primary-bg`; `--porcelain` → `--color-surface` → `--panel-bg`; `--jade` → `--color-selected` → `--option-selected-border`. Components reference component/semantic tokens, never new hex values. Keep the same surface in light and dark OS modes for this illustrated demo; do not invert art automatically.

## Typography and geometry

Use **Noto Serif** for product and garment headings, regular/medium weight; **Be Vietnam Pro** for controls and explanatory copy, regular/medium/semibold. Include Vietnamese glyphs in bundled font subsets and visually check diacritics. Fallbacks: `Georgia, serif` and `Arial, sans-serif`. Font loading must not hide controls.

| Role | Desktop | Under 768px | Guidance |
| --- | --- | --- | --- |
| Gallery title | 40px / 1.15 | 28px / 1.2 | Sentence case; full title one color |
| Garment heading | 28px / 1.25 | 24px / 1.3 | Left aligned |
| Body and controls | 16px / 1.55 | 16px / 1.55 | Body max 62ch; controls weight 600 |
| Source/status caption | 14px / 1.5 | 14px / 1.5 | No essential information below this size |

Spacing primitives: 4, 8, 12, 16, 24, 32, 48, 64px. Semantic aliases: control gap 8px, panel gap 24px, desktop gutter 32px, mobile gutter 16px, section gap 48px. Control radius 8px; information sheet radius 16px; color chip radius 50%. The scene is an open architectural plane, not a rounded card. Restrict shadows to foreground room depth and an elevated occasion popover: `0 12px 32px rgb(32 51 74 / 0.16)`.

Outer content width 1440px. Header and body share a left edge. Text is left aligned; artwork is centered inside its stage. Desktop fitting layout is a flexible stage plus a 320–360px control sheet with 24px gap. Below 1024px, stack stage, options, cultural note in normal flow. No hidden horizontal carousel or fixed footer covering content. See scene spec for artwork coordinates and mobile framing.

## Components and states

Every control has a minimum 44×44px target and 8px gap. Label swatches with visible color names, not title attributes alone. Use one outlined SVG icon family with text labels; no emoji icons. Decorative images use empty alternative text.

| Component | Default | Hover / press | Selected / focus | Busy / unavailable / error |
| --- | --- | --- | --- | --- |
| Primary button | Indigo fill, porcelain text, 8px radius | Immediate ink hover fill; quick press emphasis on inner icon only | 3px indigo outline with 2px porcelain moat; immediate focus | Keep width; “Đang mở phòng…” and `aria-busy`; cancel remains active |
| Secondary/back | Porcelain fill, ink text and 1px ink border | Immediate indigo boundary | Same visible focus ring | “Về phòng trưng bày” remains available during loading |
| Garment hotspot | Opaque porcelain label, ink text | Underline label; art responds per motion map | Stable DOM target; no selection on focus | “Chưa mở được phòng. Thử lại.” beside destination; retain gallery |
| Color option | Named chip in 44px minimum button | Indigo boundary; no control movement | Jade 2px border, checkmark, `aria-pressed=true` | Retain unavailable option name and reason |
| Accessory option | Checkbox and metadata name | Indigo boundary | Native checked state and “Đang dùng” | “Chưa tải được phụ kiện. Thử lại.”; preserve complete outfit |
| Occasion chooser | “Chọn theo dịp” | Same as secondary | Ordinary buttons in popover; Escape closes | Reviewed or explicitly contemporary suggestions only |
| Cultural note | Porcelain sheet, ink copy, visible source link | Link underline | Link focus ring; review status in words | “Nội dung đang được kiểm chứng.” for pending content |
| Result action | “Xem bản phối” | Same as primary | Result heading receives focus | “Tiếp tục phối” restores selected options; back stays visible |

Never clip focus by a stage mask. Test the complete focus boundary against actual surroundings; use the porcelain moat to separate the ring from dark art. Selection, warning and review status include words or symbols as well as color. Disabled labels remain readable with an adjacent reason. No animation is necessary to understand state.

## Accessibility and verification contract

Use native buttons/checkboxes, logical heading levels and a skip link to active scene controls. Tab follows garment labels → occasion chooser → active room controls → cultural source → result/back actions. Enter/Space activates buttons; Escape closes popovers and exits result review. Move focus to the room heading after destination commit; return to the originating garment control on exit. Announce completed outfit changes with concise polite status, never every animation frame or decorative layer.

Target text contrast at least 4.5:1 and focus/control boundaries at least 3:1. Verify 375, 768, 1024 and 1440px, plus 320px reflow and 200% zoom. Respect safe-area insets, wrapping, keyboard reachability and reduced motion. Complete the demo without hovering, dragging, scroll pinning or precise image targeting. Ordinary document scrolling remains available.

## Critique of the generated starting point

The UI/UX query proposed generic Minimalism, black/white colors, Outfit + Work Sans, identical lifted cards, Hero + Features + CTA and a 500–800ms route Flip. Replace those with the six named colors, Vietnamese-first typography, open layered art, stable control sheets and the single scene transition in the motion map. The approved architecture is one route. Preserve the query's useful contrast, focus, responsive and reduced-motion guidance.

Against frontend-design anti-patterns: remove tracked uppercase eyebrows, numbered collection cards, monospace metadata, uniform card grids, tint-glow backdrops, button arrow suffixes and repeated slide-up entrances. Avoid the common cream/terracotta serif template through blue porcelain and indigo architecture; serif is restricted to meaningful headings. Replace the near-black technical stage. Garments receive names rather than sequence numbers. Pipeline labels and decorative status pills disappear from the proposed interface.

Motion is premium/elegant: controlled travel, zero overshoot, one room entrance rather than scattered flourishes. Numeric timings and interruption rules live only in the [motion map](../../docs/design/immersive-scenes.md#motion-map). Instant reduced-motion outcomes replace the query's blanket rule that every state change must animate.
