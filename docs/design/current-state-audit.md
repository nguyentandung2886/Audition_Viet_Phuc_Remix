# Current-state audit and cultural-content handoff

Date: 2026-10-10. Baseline: `c94de369308ef8a83540e2d7c97e594901749d88`. Owner: Task 1 design audit; fixes belong to Task 2 model/content, Task 3 assets, Tasks 4–6 UI/motion/verification. This audit inspects code/local metadata. No browser screenshots were taken; no viewport rendering or composed-outfit alignment pass is claimed.

Read: `app/page.tsx`, `app/globals.css`, `components/OutfitComposer.tsx`, all three `public/assets/garments/*/*/garment.json` files, character metadata, approved immersive plan and original product brief. Ignored `public/assets` is exposed in this worktree through a junction to the original asset directory and was inspected without modification. Historical statements below are claims found in source files, not facts endorsed here. No historical research was performed.

## Code and asset risks

| Evidence | Desktop risk | Mobile/accessibility risk | Handoff |
| --- | --- | --- | --- |
| Page starts at `ao_dai/red`; no gallery/occasion/result or room state | Layer inspector does not provide approved journey | Long inspector stack before cultural story | Tasks 2/4: separate scene/outfit state |
| `lg:flex-row` equal halves; 500px max-width stage; 2:3 composer | Technical panels compete with outfit | At 375px, approximately 343px stage width means 514.5px art height before controls; actions may be below initial viewport | Compact mobile art, normal-flow controls |
| Tracked title/badge row; fixed 600px decorative glows | Pipeline/dimensions/library labels dominate | Header wrapping and decorative overflow need browser check | Remove technical chrome; constrain art overflow |
| Color buttons `w-6 h-6`, title-only, no pressed semantics | Hue filters masquerade as approved named variants | 24px target misses specified 44px size; state lacks explicit accessible semantics | Named curated variants with pressed state |
| Torso/pants visibility toggles; TS `GarmentLayer` omits JSON `isOptional` | Core clothing can disappear despite required metadata | Same failure by any input mode | Protect required layers in state and rendering |
| Old `garment` persists while new ID loads; `effectiveGarment` checks only truthiness | Old outfit/metadata can show under newly selected option | Slow network prolongs mismatch; prior error can suppress loading indicator | Pair loaded metadata with selected ID; explicit request state |
| Effects do use `isMounted` guards | Stale completed callbacks are guarded, but old visible state persists | Do not call this an unguarded response race | Test retained ready state and rapid switching separately |
| JSON fetch has type assertion only; images lack error handlers | Malformed JSON/failed PNG can yield incomplete art | Technical error text has no retry action | Validate manifests; required/optional image recovery |
| `components` fallback uses `assetId` as `layerId`; controls hard-code four simple IDs | Legacy-only data would miss control IDs | Toggle may not affect displayed layer | One normalized schema with stable IDs |
| Inspector hides falsy visibility; composer hides only explicit false | New layer IDs can show in art but not inspector | Conflicting selection feedback | Resolve one outfit state |
| Base uses 0.6s, layers 0.5s, errors default motion, CSS ping/pulse | Uncoordinated motion | No explicit reduced-motion branch in inspected code | Adopt motion map and static loading status |
| Global OS theme/Arial versus hard-coded dark page and font classes | Competing visual systems | Actual contrast/focus still needs browser verification | MASTER semantic tokens and visible focus |
| All sets declare 1024×1536, `base_01`, orders 25/40/50/60 | Shared canvas does not prove pose registration | Small rendering can hide edge defects | Native-resolution alpha/overlap review |
| `.gitignore` excludes all of `/public/assets/` | Current runtime assets and future scene plates are absent from a clean clone/deployment unless supplied out of band | A successful local demo can become an asset-empty deployed build | Task 3: define and document a versioned approved-derivative policy before publishing scene/garment assets |

Controller-supplied direct asset inspection reports large horizontal/vertical streak artifacts around áo dài and giao lĩnh torso PNGs, consistent with extraction/alpha cleanup problems. Nhật Bình is cleaner but silhouette/pose differs substantially from the base character. These are source-image observations, not browser compositing evidence. Task 3 must inspect collar, shoulders, waist, edge and overlap on the stacked character. Inventory includes `base1.png` and Nhật Bình `temp_*_nobg.png` derivatives under `public`; publish approved manifest-referenced derivatives only. No room scene plates appear in the current asset inventory.

## Three garment records

| File / actual current name | Claims requiring cultural review | Data/name issues |
| --- | --- | --- |
| `ao_dai/red/garment.json`: “Áo Dài Đỏ Hoa Sen Hoàng Triều” | Nguyễn (1802–1945); description identifies this red lotus garment, mấn and silver kiềng as period/traditional; fact asserts descent from áo ngũ thân lập lĩnh and assigns modesty/feminine character to wearers. Review form, dating and accessories separately; remove value judgments about women from fact copy. | `layers` says “Kiềng Bạc Chạm Hoa Sen” / “Mấn Đội Đầu Hoàng Kim”; `components` says “Kiềng Bạc Cổ Truyền” / “Mấn Đội Đầu Hoàng Gia”. Resolve one reviewed name per accessory; royalty wording has no source. |
| `nhat_binh/royal_blue/garment.json`: “Áo Nhật Bình Sắc Lam Hoàng Triều” | Nguyễn date range; usage/status for Hoàng hậu, Công chúa, mệnh phụ; neckline/name explanation; five sleeve colors and ngũ hành symbolism; lotus/phoenix/wave decoration, headwrap and jade attribution. Review each claim and color term separately. | `necklace` is “Thẻ Bài Ngọc Bội Hoa Sen”, headpiece “Khăn Vành Hoàng Gia”; generic kiềng/mấn labels mislead. `componentType` differs between `accessory` and `necklace`. `base_01` compatibility remains visually unproven. |
| `giao_linh/emerald/garment.json`: “Áo Giao Lĩnh Ngọc Lục Bảo (Đại Việt Cổ Phong)” | Hậu Lê (1428–1789) field versus Lý/Trần/Lê prose; alternate “Giao Lãnh Y”; antiquity/nobility superlatives; wide sleeves, sash, pleated lower garment, lotus hairpin and waves as a historical ensemble. Verify features in context; broad prose does not certify one era. | `pants` means “Thường Phiến Xếp Ly Trắng”; torso includes “Đại Đái”, which cannot be a separate toggle without separate art. Headpiece is “Trâm Cài Hoa Sen Ngọc Bích”. Use short “Áo giao lĩnh” until long title reviewed. |

Every record duplicates `layers` and `components`, has optional flags only in `layers`, and lacks `sources`, review status, structured cultural notes and caution rules. Existing dynasty/description/fact content enters Task 2 as unreviewed legacy copy. Presence in JSON is not approval.

`page.tsx` always displays “Thời Nguyễn (1802 - 1945)”, contradicting even the giao lĩnh record's era. Its art panel always says “Hoa Sen Hoàng Triều” and red silk/gold embroidery for blue/green selections too. Mood names including “Ngọc Bích Cung Đình”, “Hoàng Yến Quý Tộc”, “Hoàng Kim Vương Triều” imply unsourced associations while merely rotating hue. Replace with reviewed garment-specific copy and plain visual color names. “Base”, “ON/OFF”, “Modular Layers”, “Framer Motion” and pipeline specifications expose implementation language.

## Encoding finding

Explicit UTF-8 reads of all three JSON records and inspected TSX show intact Vietnamese diacritics. Initial default Windows PowerShell output of the task brief showed mojibake in “Việt Phục”; that is a decoding/display warning, not evidence of corrupt garment bytes. Task 2 preserves UTF-8, parses each JSON, rejects replacement characters and checks Vietnamese glyph coverage. Do not repair correct source strings based on misdecoded terminal text.

## Task 2 content contract

Model/content implementer owns schema migration; a qualified cultural reviewer approves claims. Asset producer separately approves visual interpretation. Keep historical and asset review distinct.

| Required field | Shape/rule | Publication behavior |
| --- | --- | --- |
| `sources` | `{ id, title, authorOrInstitution, url, locator, accessedAt }[]`; stable IDs, retrievable sources and page/section locators supporting precise claims; no invented citations | Empty allowed in draft; historical publication requires support |
| `review` | `{ status: "pending" \| "approved" \| "rejected", reviewer: string \| null, reviewedAt: string \| null, scope: string }`; approval needs reviewer/date/current-revision scope | Current cultural content starts pending; revision invalidates approval |
| `culturalNotes` | `{ id, text, claimKind: "historical" \| "visual-interpretation", sourceIds, review }[]`; references must resolve | Publish approved historical notes only; clearly label the demo's contemporary interpretation |
| `cautionText` | `{ text, affectedFeature, sourceIds, review }` on a specific compatibility rule; empty/no rule absent documented mismatch | Specific non-blocking explanation and reference option; never infer harm from hue or score |
| `periodLabel` | Optional reviewed label with source references, separate from ID/artwork title | Omit until approved; no universal dynasty fallback |
| `displayName` / `shortName` | Vietnamese garment/accessory-specific names from one source | Gallery: “Áo dài”, “Áo Nhật Bình”, “Áo giao lĩnh”; no unsourced royal attribution |
| `variants`, `optionalAccessories`, `requiredLayerIds` | Stable IDs, approved paths, compatibility; required torso/lower garment | Curated available assets only; base unfiltered; core clothing protected |
| `occasionSuggestions` | Occasion ID, garment IDs, rationale, claim kind, historical source/review references where applicable | Explicit contemporary suggestion unless historical association reviewed |

Pending-state copy: “Bản phối minh họa theo phong cách anime. Nội dung văn hóa đang được kiểm chứng.” This describes demo/review status, not a historical conclusion. The public demo still requires a sourced approved cultural note per released garment; a pending placeholder is a development state, not a passed release gate.

## Limits and next ownership

Task 1 has not verified browser overlap, device performance, computed contrast, font delivery or historical truth, and makes no new historical claims. Task 2 owns model validation, naming and review fields; Task 3 owns image cleanup/alignment; Tasks 4–6 own focus, load interruption, responsive composition, screenshots and demo evidence. No runtime code or asset bytes change in this audit.
