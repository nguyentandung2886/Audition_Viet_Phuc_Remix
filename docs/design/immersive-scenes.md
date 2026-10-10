# Scene specification: Atelier bên ô cửa

Owner: scene/navigation implementer for layout and state behavior; motion implementer for choreography; asset producer for plates and alignment. [MASTER](../../design-system/viet-phuc-remix/MASTER.md) owns tokens and control states. Scope follows the approved immersive demo plan. This is a design handoff, not evidence of an implemented or browser-tested screen.

## Layout exploration

### A. Open atelier with a stable control sheet — selected

```text
Gallery / desktop
+-------------------------------------------------------------------+
| Viet Phuc Remix                           [Chon theo dip]           |
| Chon mot trang phuc                                               |
|                                                                   |
|  window / wall       layered costume display          cloth edge   |
|   [Ao dai]             [Ao Nhat Binh]          [Ao giao linh]       |
|                                                                   |
| Named controls stay fixed; art supplies the sense of depth.        |
+-------------------------------------------------------------------+
Fitting room / desktop
+-------------------------------------------------------------------+
| [Ve phong trung bay]                  Viet Phuc Remix              |
| +-----------------------------------+  Ao dai                     |
| | window      fixed-pose character   |  Mau sac                    |
| |             in room mirror        |  [Do tham] [Xanh lam]        |
| | sewing table edge / foreground    |  Phu kien                    |
| |                                   |  [ ] Man  [ ] Kieng         |
| +-----------------------------------+  [Xem ban phoi]              |
|                                         Ghi chu van hoa / Nguon   |
+-------------------------------------------------------------------+
Mobile: header > room art > named choices/options > note > actions
```

ASCII labels omit accents for portability only; runtime labels use Vietnamese diacritics. The color labels illustrate contemporary art-direction choices for the áo dài asset pass, not existing approved variants or historical meanings. Exact accessory names come from reviewed metadata.

### B. Horizontal garment corridor with full-screen drawers — rejected

```text
+-------------------------------------------------------------------+
| Viet Phuc Remix                              [Mo tuy chon]          |
|  <- [Ao dai] ---- [Ao Nhat Binh] ---- [Ao giao linh] ->             |
|           horizontal camera follows scrolling                     |
|                 character fills viewport                          |
+-------------------------------------------------------------------+
| bottom drawer overlays outfit: colors / accessories / story        |
+-------------------------------------------------------------------+
Mobile: swipe corridor > open drawer > close drawer > inspect outfit
```

A reveals all three choices immediately and keeps the character visible while styling. It supports a 2–4 minute demo without teaching horizontal navigation or repeatedly covering the outfit. B hides choices outside the viewport, complicates touch/keyboard equivalence and places cultural notes behind a drawer. A concentrates visual novelty in room depth; controls remain predictable.

## Composition and asset handoff

Use a 1600×1000 canonical room canvas with separate background, midground, foreground and optional light plates. Coordinates below are art targets, not descriptions of existing assets. Store percentages in a manifest and apply one shared contain transform to artwork/hotspot coordinates. Never position hotspots relative to an unrelated full viewport. Empty letterbox areas use the surface token.

| Layer | Gallery | Fitting room |
| --- | --- | --- |
| Background, z0 | Blue daylight wall/window, quiet behind labels | Same architecture; clear field behind character |
| Midground, z10 | Three distinct garment-display silhouettes | Mirror surround and worktable outside character bounds |
| Character/garment, z20 | Previews from approved derivatives | Fixed 1024×1536 composite; retain all base/layer anchors |
| Foreground, z30 | Cloth edge in outer 10% of either side | Table corner outside face, collar and controls |
| Light, z35 | Painted window light, no particle loop | Light never changes garment colors or text contrast |
| Controls, separate DOM layer z50 | Named buttons on safe label areas | Sheet outside moving art; notices in document flow |

Gallery hotspots: áo dài `(22%, 54%)`, áo Nhật Bình `(50%, 48%)`, áo giao lĩnh `(78%, 54%)`; labels share a `y=84%` baseline. Reserve a 20% wide × 62% high display zone around each center; avoid decoration over that zone. Hit targets are labeled DOM buttons at least 44×44px, not raster text. Illustration clicks may activate the matching choice; labeled controls work independently. Occasion entry stays in header flow.

Fitting character bounds: left 36.5%, top 20%, width 27%, height 64.8% of room canvas, giving a 432×648 box at canonical size and preserving 2:3. All character/garment layers share that box. Foreground must not cover face, neck, hands or defining silhouette. Do not independently stretch torso/accessory PNGs to disguise misalignment; asset production fixes pose/edges first.

At 1024px and above, stage occupies available width beside the 320–360px sheet. Below 1024px, options follow stage in full-width wrapping groups. Below 768px, gallery remains a contained 16:10 overview; its three labeled controls move to a vertical list immediately below, with one set of focusable controls. Fitting art uses a dedicated 4:5 crop centered on the character; fit the full character inside at 2:3 and share its transform across layers. Decorative sides may crop; the complete garment may not. Use a mobile composition manifest if generated room art cannot meet those bounds. Cap stage height at 55svh; controls/text continue in normal flow on short screens.

## Scene storyboard

Target pacing: 20–40 seconds to choose, 60–100 to style, 30–60 to review a sourced note, 10–20 to return: 120–220 seconds total. These are user pacing targets, not timed gates.

| Beat | Visible content/action | Pointer / touch | Keyboard | Reduced motion |
| --- | --- | --- | --- | --- |
| Gallery | “Chọn một trang phục”; áo dài, áo Nhật Bình, áo giao lĩnh; “Chọn theo dịp” | Click/tap label or display; hover emphasizes art only | Tab named controls; Enter/Space selects; Escape closes occasion popover | Final composition immediately; no parallax |
| Open áo dài room | Keep gallery while loading; commit ready room with heading “Áo dài” | No drag; “Hủy” cancels pending load | Origin retains focus while loading; focus heading after commit; Back reachable | Atomic ready-scene swap, same focus handling |
| Style | Named colors and optional accessories; required torso/lower garment remain | Tap choice; checkmark immediate | Pressed buttons; Space toggles accessory checkbox; polite completion announcement | Replace ready affected layer atomically |
| Styled result | “Bản phối của bạn”, outfit summary, sourced note, “Tiếp tục phối”, “Về phòng trưng bày” | “Xem bản phối” opens result; ordinary source link | Focus result heading; Escape or edit button restores prior action focus | Final result layout immediately |
| Gallery return | Restore originating display and retain session outfit | Visible back action even during loading | Back action/browser Back returns a scene step; restore garment-button focus | Immediate gallery with retained state/focus |

“Chọn theo dịp” presents metadata-driven suggestions. Task 2 labels them contemporary styling ideas unless context is sourced/reviewed. Selecting an occasion reveals suggested garment buttons and never silently changes an outfit. This task certifies no occasion/historical association. Refresh starts at gallery; browser Back walks result → room → gallery, with no history entries for colors/accessories.

Loading preserves the last complete scene with “Đang mở phòng…” and “Hủy”. Preload destination plates and required garment layers before commit. Failure retains gallery with “Chưa mở được phòng. Thử lại.” Optional accessory failure preserves outfit. Missing required clothing retains the last complete outfit or a neutral garment placeholder with retry/back actions; never reveal an undressed base as the fallback.

## Motion map

Personality: premium/elegant, no bounce/overshoot. Signature `cubic-bezier(0.4,0,0.2,1)` (“atelier”). Duration palette: quick 120ms, standard 360ms, scene 600ms. Hover/focus/selection semantics update immediately; durations describe visual feedback. GSAP owns room/art transforms; Framer Motion owns affected outfit layers. Never animate the same property with both engines.

Rows name primary (P), secondary (S), ambient (A) treatment. Static ambience is intentional: richness does not require a perpetual loop. Move one principal art group with subordinate depth layers, not many independent items. Stage travel stays below one third of the viewport. Interactive controls and body text never move during continuous scroll.

| Trigger / purpose | P / S / A | Timing/easing | Interruption | Reduced-motion result |
| --- | --- | --- | --- | --- |
| Gallery ready / calm invitation | P: art scale 1.025→1; S: window shadow settles 4px→0; A: light opacity 0.85→1 once; controls usable and fixed | 600ms atelier; all tracks end at 600ms | Selection finishes intro at final state then loads destination; unmount kills tracks | Final composition immediately |
| Optional intro scroll / depth | P: midground translates at most 8px; S: foreground at most 12px opposite; A: wall static; all labels fixed | Direct progress over first 240px natural scroll; atelier maps progress, no smoothing delay or pinning | Navigation kills effect/resets art; resize remaps; touch/narrow mode static | Static room, every action available without scroll |
| Hotspot hover/focus / identify destination | P: illustration outline emphasis; S: label underline; A: static room | Immediate, no displacement | Clear prior emphasis immediately; focus never selects | Identical emphasis |
| Enter ready room / feel invited inside | P: camera scale 1→1.08 toward display, translation max 8% stage width; S: foreground follows at 25% displacement; A: static light | Total 600ms atelier; old controls opacity + 4px exit 0–120ms; plate blend 180–420ms; new controls opacity + 4px entry 480–600ms | Latest valid navigation wins; cancel old timeline/load token; one scene commit; Back targets gallery from current visual state | Atomic ready-room swap, no camera/stagger |
| Variant/accessory / see personal choice | P: affected layers crossfade, base fixed; S: inner checkmark scale 0.96→1; A: static room | Layers 360ms atelier; checkmark 120ms atelier; semantics immediate | Decode new image first; newest choice wins; cancel prior layer motion; core clothing never fades to empty | Atomic ready-layer replacement, immediate checkmark |
| “Xem bản phối” / give outfit space | P: art scale 1.03→1; S: result sheet opacity + 4px settle; A: static light | 360ms atelier, same total for sheet | Edit targets editing from current state; Back supersedes result | Final result immediately |
| Return / restore orientation | P: camera scale 1.08→1 toward gallery; S: foreground follows at 25%; A: static light | 600ms atelier; controls exit 0–120ms, plate blend 180–420ms, controls enter 480–600ms | Cancel room loads and previous timeline; resolve gallery once; restore focus | Immediate gallery |
| Occasion popover / reveal choices | P: opacity with y 4px→0 on open, reversed close; S: disclosure icon turns 90 degrees; A: static room | 360ms atelier; semantics/focus update on activation | Escape/outside click cancels entry and closes; focus opener | Immediate show/hide |
| Loading/error / preserve trust | P: fixed status text; S: static icon; A: static room | Immediate; no pulse, spinner or shake | Clear only for matching completed request; preserve retry/cancel | Identical behavior |

Layer crossfade intentionally overrides the motion skill's general spatial-state preference: translating registered garment images would misalign clothing. The separate checkmark confirms action without moving the garment. No scroll text reveals, rotating outfits, perpetual particles or hover-only features.

If reduced-motion preference changes, terminate scene/scroll/layer animation and resolve to the latest valid ready state; loading remains pending until ready. Unmount/breakpoint changes clean up GSAP contexts/listeners and reset transforms. No surviving timeline may mutate a removed scene. Incoming controls stay inert/out of tab order until committed; never focus a hidden heading. Cancel/back stays outside animated/inert subtrees.

## Later review ownership

Task 2 validates identity, required clothing and rapid changes. Task 3 produces assets for fixed pose and mobile/desktop bounds. Tasks 4–5 verify keyboard, touch, browser Back and reduced-motion paths. Task 6 records screenshots at MASTER breakpoints and a timed demo. These are future gates; this specification does not claim they passed.
