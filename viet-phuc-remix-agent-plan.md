# Việt Phục Remix — Agent Project Plan

## 1. Project Vision

Build an interactive web experience that helps students and young people discover and remix Vietnamese traditional clothing in a modern Gen Z style while preserving cultural context.

Core concept:

> **“Mặc lại văn hóa” — Turn learning about Vietnamese culture into an interactive fashion experience.**

The product should feel like a premium Vietnamese fashion editorial rather than a conventional educational CRUD website.

---

## 2. Core User Journey

```text
Opening
  ↓
Heritage Discovery
  ↓
Remix Studio
  ↓
Color & Mood
  ↓
Your Look
  ↓
Cultural Story
  ↓
Lookbook
```

The experience should feel continuous. Animations are not decoration only; they should connect sections and reinforce the idea of fabric, clothing, movement, and cultural discovery.

---

## 3. Main Screens

### 01 — Opening

Purpose:
- Create a strong first impression.
- Introduce the concept.
- Establish the visual language.

Visual:
- Full-screen Vietnamese woman wearing traditional clothing.
- Minimal editorial typography.
- Subtle atmospheric background.

Text:

```text
VIỆT PHỤC
REMIX

Mặc lại văn hóa

[BẮT ĐẦU]
```

Animation:
- Character initially stands still.
- On scroll, fabric begins moving.
- Character subtly rotates.
- Camera gradually zooms toward the clothing/pattern.
- Transition into the Heritage section through fabric movement.

Implementation preference:
- Use layered images instead of requiring complex 3D.
- Separate character, clothing/fabric, pattern, and particles when possible.
- Use parallax, transform, opacity, scale, blur, and clip-path.

---

### 02 — Heritage

Purpose:
- Introduce Vietnamese traditional clothing.
- Let users choose a clothing category/context.

Initial categories:
- Áo dài
- Áo tứ thân
- Áo ngũ thân
- Regional/traditional clothing

Interaction:
- Hovering or selecting a category changes the central character/silhouette.
- Use smooth transitions between clothing types.
- Display a very short cultural description.

Important:
- Avoid presenting traditional clothing as interchangeable costumes.
- Cultural information must be concise and respectful.

---

### 03 — Remix Studio

Purpose:
- Main interactive feature.
- Allow users to construct an outfit.

Suggested layout:

```text
┌─────────────────────────────────────────────────────┐
│ VIỆT PHỤC REMIX                         03 / 06      │
├───────────────┬─────────────────────┬───────────────┤
│ TRANG PHỤC    │                     │ PHỤ KIỆN      │
│               │      CHARACTER      │               │
│ Áo dài        │                     │ Khăn          │
│ Tứ thân       │        👩           │ Nón           │
│ Ngũ thân      │                     │ Trang sức     │
├───────────────┴─────────────────────┴───────────────┤
│ COLOR / STYLE                                        │
└─────────────────────────────────────────────────────┘
```

Interactions:
- Select clothing.
- Select color.
- Select accessories.
- Select pattern/style.
- Preview the complete outfit.
- Optional drag-and-drop interaction.

Animation:
- Clothing flies/slides onto the character.
- Accessories appear with physical-feeling motion.
- Patterns animate across the clothing.
- Fabric reacts subtly after selection.

Priority:
- The outfit preview must remain visually stable and readable.
- Animation should never make selection difficult.

---

### 04 — Color & Mood

Purpose:
- Let users choose the personality/style of the outfit.

Mood options:
- Thanh lịch
- Dịu dàng
- Cá tính
- Mộc mạc
- Contemporary

Interaction:
- Selecting a mood updates suggested color palettes.
- Outfit updates with a smooth transition.

Optional feature:
- Color harmony check.

Example:

```text
CULTURAL / COLOR FIT

████████████████░░ 82%

✓ Màu sắc hài hòa
✓ Silhouette được giữ nguyên
⚠ Phối hiện đại hóa cao
```

Do not claim that an outfit is culturally “correct” or “incorrect” in an absolute sense.

---

### 05 — Your Look

Purpose:
- Reward the user with a polished final result.

Interaction:
- Hide most UI temporarily.
- Center the completed character.
- Slowly zoom out.
- Let fabric move subtly.

Example:

```text
YOUR LOOK

VIỆT MỘC

Áo dài • Xanh • Khăn

[LƯU LOOK]
[REMIX]
[CHIA SẺ]
```

Additional feature:
- Before/After slider comparing a more traditional interpretation with the user's remix.

---

### 06 — Cultural Story

Purpose:
- Explain the cultural background of the selected clothing.
- Prevent the app from becoming only a fashion generator.

Content:
- Origin/background
- Historical/cultural context
- Meaning
- Typical context of use
- Notes about modernization

Presentation:
- Editorial/card-based layout.
- Text can reveal progressively like opening a book.

---

### 07 — Lookbook

Optional final screen.

Purpose:
- Store and present created outfits.
- Make the experience shareable.

Features:
- Saved outfit cards.
- Outfit name.
- Clothing type.
- Mood.
- Short cultural note.
- Share/export action.

---

## 4. Cultural Guard

This is an important feature because the challenge explicitly asks for culturally appropriate representation.

Instead of:

```text
ERROR: WRONG OUTFIT
```

Use:

```text
⚠ GỢI Ý VĂN HÓA

Cách phối này mang tính hiện đại hóa mạnh
và có thể làm mờ một số đặc trưng của trang phục.

[XEM CÁCH PHỐI THAM KHẢO]
```

Principles:
- Inform, do not shame.
- Explain why a combination may be culturally sensitive.
- Offer a more contextually appropriate alternative.
- Avoid claiming absolute cultural authority when the subject has variation.

---

## 5. Animation System

Animation should have a coherent visual motif.

### Main motif: Fabric

Use fabric as the visual connector between screens.

```text
Opening
  → flowing áo dài fabric

Heritage
  → fabric becomes transition

Remix
  → fabric becomes clothing layer

Mood
  → fabric/pattern becomes color palette

Your Look
  → fabric becomes final visual composition

Story
  → zoom into fabric/pattern → cultural information
```

### Navigation

Use a subtle moving “thread” or fabric-like active indicator.

Example:

```text
01 INTRO
02 HERITAGE
03 REMIX
04 MOOD
05 LOOK
06 STORY
```

The active section can have a flowing line/cloth transition rather than a generic underline.

---

## 6. Page Transitions

Avoid generic:

```text
fade out → fade in
```

Prefer object-based transitions.

### Opening → Heritage
Flowing fabric carries the transition.

### Heritage → Remix
Character/silhouette morphs or slides into the customization character.

### Remix → Mood
Pattern expands into a color palette.

### Mood → Your Look
Selected colors converge into the final outfit.

### Your Look → Story
Camera zooms into the clothing/pattern and reveals cultural information.

---

## 7. Visual Direction

Style:

> Vietnamese Editorial + Modern Gen Z

Avoid:
- Excessive red/yellow national symbolism.
- Too many drums, lotus icons, traditional patterns, or decorative clichés.
- Making the interface look like a history textbook.

Prefer:
- Editorial composition.
- Large typography.
- Generous whitespace.
- Warm white / ivory backgrounds.
- Charcoal/dark neutral text.
- Deep green, muted blue, muted red, or subtle gold as accents.
- Serif display typography combined with modern sans-serif body text.

The visual language should feel closer to a premium fashion/editorial site.

---

## 8. Recommended Technology

Primary:

```text
Next.js
Tailwind CSS
Framer Motion
GSAP + ScrollTrigger
```

Optional:

```text
React Three Fiber / Three.js
```

Use Three.js only if it clearly improves the result. Do not introduce unnecessary complexity.

### Framer Motion

Use for:
- UI transitions
- Hover states
- Cards
- Modal/dialog animation
- Layout transitions
- Component-level interactions

### GSAP + ScrollTrigger

Use for:
- Scroll storytelling
- Pinned sections
- Parallax
- Long-form timelines
- Cinematic transitions

---

## 9. Suggested Project Structure

```text
app/
├── page.tsx
├── heritage/
│   └── page.tsx
├── remix/
│   └── page.tsx
├── mood/
│   └── page.tsx
├── look/
│   └── page.tsx
├── story/
│   └── page.tsx
└── lookbook/
    └── page.tsx

components/
├── Navbar
├── PageTransition
├── Character
├── DressLayer
├── AccessoryLayer
├── FabricAnimation
├── ColorPicker
├── OutfitPreview
├── CulturalCard
├── CulturalWarning
├── LookbookCard
└── BeforeAfterSlider

data/
├── outfits.ts
├── accessories.ts
├── colors.ts
├── moods.ts
├── events.ts
└── culturalInfo.ts
```

Keep content/data separate from UI components.

---

## 10. Feature Priorities

### MVP — Must Have

- Clothing selection
- Color selection
- Accessory selection
- Outfit preview
- Cultural information
- Cultural warning/context
- Responsive UI
- Page transitions

### Strong Demo

- Scroll storytelling
- Parallax
- Animated character
- Animated clothing layers
- Drag-and-drop outfit
- Color harmony
- Before/After comparison
- Save look

### WOW Features

Only implement if time remains:
- AI-generated outfit suggestions
- Image upload
- Virtual try-on
- 3D fabric
- Particle effects
- Weather-based recommendations
- Shareable public lookbook

Do not start with WOW features.

---

## 11. Development Strategy & Superpowers Workflow

This project is built using the **Superpowers** discipline and our comprehensive suite of UI/UX & Motion Design skills. To execute this plan, the agent MUST trigger the corresponding skills at each step.

### Core Workflow (Execute these skills)
- **Before ANY phase/feature:** Use `brainstorming` to clarify UI/UX and requirements. Apply `ui-ux-pro-max` and `frontend-design` to craft a premium, Gen Z-focused aesthetic without clichés. Then use `writing-plans` to generate a detailed step-by-step checklist artifact.
- **During execution:** Use `subagent-driven-development` or `executing-plans` to run tasks. Follow `test-driven-development` (Red -> Green -> Refactor) for all logic. Apply `ui-styling` and `design-system` when implementing components.
- **When bugs occur:** Immediately halt and invoke `systematic-debugging`. Do not guess.
- **Code Review:** Before completing a phase, use `requesting-code-review`.
- **Verification:** Finally, use `verification-before-completion` to ensure tests pass and the UI looks correct before claiming the phase is done.

### Phase 1 — Functional Core

Build:
1. Project setup (React/Next.js setup).
2. Main pages & routing.
3. Outfit data model.
4. Clothing/color/accessory selection UI.
5. Outfit preview component.

**Skills Trigger:** Invoke `brainstorming` + `design-system` on the data model, design tokens, and UI structure. Use `ui-styling` to build components (Tailwind CSS) and `writing-plans` to split Phase 1 into granular tasks. Use `subagent-driven-development` to execute.

Goal:
- A fully functional prototype with a solid, accessible component foundation.

### Phase 2 — Signature Animation

Build:
1. Opening cinematic.
2. Scroll-driven fabric animation.
3. Page transitions.
4. Animated clothing/accessory changes.
5. Navigation animation.

**Skills Trigger:** Invoke `motion-design` + `brainstorming` to map out animation choreography. Heavily rely on `gsap-core`, `gsap-react`, `gsap-scrolltrigger`, and `gsap-timeline` for complex sequences. Use `writing-plans` and `executing-plans`. Rely on `systematic-debugging` for any GSAP lifecycle/animation glitches.

Goal:
- Make the project visually memorable with premium, smooth motion.

### Phase 3 — Cultural Layer

Build:
1. Cultural Story.
2. Cultural Guard.
3. Contextual information layout.
4. Color harmony/context feedback algorithms.

**Skills Trigger:** Invoke `brainstorming` and `frontend-design` on how to present the data respectfully via an editorial layout. Build using `test-driven-development` for the color harmony logic.

Goal:
- Directly satisfy the cultural requirements with a premium editorial feel.

### Phase 4 — Polish

Build:
1. Lookbook.
2. Responsive layouts (mobile-first optimizations).
3. Loading states & Micro-interactions.
4. Accessibility pass.
5. Performance optimization.

**Skills Trigger:** Apply `gsap-performance` to ensure 60fps animations, `ui-ux-pro-max` for micro-interaction polish, and `ui-styling` for accessibility. Finally, use `requesting-code-review` and `verification-before-completion` to ensure the site matches the original vision perfectly.

### Phase 5 — Optional WOW

Only after the core experience is stable.

---

## 12. Demo Story

The live demo should take approximately 2–4 minutes.

Recommended flow:

```text
1. Open website
2. Show cinematic opening
3. Scroll through Heritage
4. Select Áo dài
5. Enter Remix Studio
6. Select clothing/color/accessories
7. Show animated outfit assembly
8. Select mood
9. Show color/context feedback
10. Generate final look
11. Show Before/After
12. Open Cultural Story
13. Show Cultural Guard/context
14. Save to Lookbook
```

The demo should emphasize:

> **The user does not simply choose clothes. They explore culture, make a modern interpretation, and understand the cultural context behind the result.**

---

## 13. Product Principles

1. Animation must support the story.
2. UI must remain usable even when animation is disabled.
3. Cultural information must be respectful and concise.
4. Never present modernization as automatically wrong.
5. Avoid cultural stereotypes and decorative clichés.
6. Keep the primary interaction simple.
7. Prioritize visual polish over excessive features.
8. Build the functional core before advanced AI/3D features.
9. Maintain a consistent fabric/motion motif across pages.
10. The final experience should feel like a continuous journey rather than separate web pages.

---

## 14. Core Pitch

Short pitch:

> **Việt Phục Remix biến việc tìm hiểu văn hóa Việt Nam thành một trải nghiệm thời trang tương tác — nơi người dùng khám phá, phối lại và hiểu sâu hơn về Việt phục theo phong cách của riêng mình.**

Key journey:

```text
NHÌN
 ↓
HIỂU
 ↓
CHỌN
 ↓
REMIX
 ↓
MẶC
 ↓
HIỂU SÂU HƠN
```
