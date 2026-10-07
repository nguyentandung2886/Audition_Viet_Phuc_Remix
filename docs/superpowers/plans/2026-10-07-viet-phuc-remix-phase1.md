# Việt Phục Remix Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the functional core prototype for Việt Phục Remix featuring Grayscale + CSS Blend Mode outfit colorization.

**Architecture:** Next.js application using Tailwind CSS for styling and shadcn/ui. The core mechanism separates character silhouettes (grayscale placeholders) and applies CSS `mix-blend-mode` overlays dynamically controlled by React state.

**Tech Stack:** Next.js, React, Tailwind CSS, Zustand (State Management), Jest/RTL.

**Spec:** c:\Users\MSI\Desktop\MyProducts\My Project\AI Arena\viet-phuc-remix-agent-plan.md

## Global Constraints

- Strict semantic HTML and accessible UI components.
- UI must follow the "Premium Vietnamese Editorial" design token system (ivory backgrounds, serif headers, charcoal text).
- Logic must be covered by unit tests (Jest/React Testing Library) in a TDD workflow.
- No heavy 3D or WebGL dependencies; rely purely on 2D DOM composition and CSS filters for the MVP.

## Review Focus

- Invalid outfit data schema matching: If an outfit definition lacks required layers, it should render safely without crashing.
- CSS Blend mode cross-browser fallback: If the browser mishandles `mix-blend-mode`, the layout shouldn't break the application flow.
- State desynchronization: Rapidly clicking color options should not cause the UI state to hang or lag.

---

### Task 1: Project Setup and Design System Scaffolding

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`
- Modify: `app/globals.css`
- Modify: `tailwind.config.ts`
- Create: `tests/setup.test.tsx`

**Steps:**
- [x] Khởi tạo Next.js App (`npx create-next-app@latest . --typescript --tailwind --eslint --app --use-npm --yes`).
- [x] Cài đặt Jest & React Testing Library.
- [x] Viết test `tests/setup.test.tsx` để xác minh môi trường test chạy thành công.
- [x] Chạy test (đảm bảo môi trường Test Runner hoạt động).
- [x] Cấu hình `tailwind.config.ts` với các Design Tokens (ivory, charcoal, muted red, deep green) và set CSS biến môi trường trong `globals.css`.
- [x] Viết một trang test tạm để verify Tailwind classes và test lại (Green).
- [x] Commit "Task 1: Project setup and design tokens".

### Task 2: Outfit Data Model and State Management

**Files:**
- Create: `src/types/outfit.ts`
- Create: `src/data/outfits.ts`
- Create: `src/store/useOutfitStore.ts`
- Create: `tests/store.test.ts`

**Steps:**
- [x] Viết tests cho schema dữ liệu và các hành động thay đổi state trong `useOutfitStore` (VD: chọn trang phục, đổi màu).
- [x] Chạy tests (Red).
- [x] Cài đặt thư viện `zustand`.
- [x] Implement `src/types/outfit.ts` (Interface) và mock data `src/data/outfits.ts`.
- [x] Implement `src/store/useOutfitStore.ts` bằng Zustand để pass qua các tests.
- [x] Chạy tests (Green).
- [x] Refactor code nếu cần.
- [x] Commit "Task 2: State management and mock data".

### Task 3: Grayscale Silhouette Component (Outfit Preview)

**Files:**
- Create: `src/components/OutfitPreview.tsx`
- Create: `tests/OutfitPreview.test.tsx`

**Steps:**
- [x] Viết test `OutfitPreview.test.tsx` đảm bảo Component nhận state từ Store và render các khối placeholder có style `mix-blend-mode: multiply` với màu chỉ định.
- [x] Chạy test (Red).
- [x] Implement `OutfitPreview.tsx`. Sử dụng các thẻ `div` xám giả lập (grayscale placeholders) xếp đè (absolute layout), phủ một lớp `<div className="mix-blend-multiply">` với backgroundColor từ state.
- [x] Chạy test (Green).
- [x] Refactor component cho đẹp và responsive (Premium styling).
- [x] Commit "Task 3: Grayscale Silhouette Component".

### Task 4: Remix Studio UI Controls

**Files:**
- Create: `src/components/RemixControls.tsx`
- Create: `src/components/ColorPicker.tsx`
- Create: `tests/RemixControls.test.tsx`

**Steps:**
- [x] Viết test kiểm tra tương tác click vào tuỳ chọn trong `RemixControls` sẽ gọi được hàm update state của Store.
- [x] Chạy test (Red).
- [x] Implement `ColorPicker.tsx` và `RemixControls.tsx` với giao diện nút bấm (Tailwind styled buttons).
- [x] Chạy test (Green).
- [x] Refactor UI đảm bảo spacing chuẩn Editorial, font Serif.
- [x] Commit "Task 4: Remix UI Controls".

### Task 5: Main Page Assembly

**Files:**
- Modify: `app/page.tsx`
- Create: `tests/page.test.tsx`

**Steps:**
- [x] Viết test kiểm tra xem Main Page có kết nối và hiển thị đủ `OutfitPreview` cùng `RemixControls` hay không.
- [x] Chạy test (Red).
- [x] Implement layout cho `page.tsx` (dạng 2 cột trên Desktop).
- [x] Chạy test (Green).
- [x] Khởi chạy kiểm tra toàn bộ suite và build production sạch (`npm test`, `npm run build`).
- [x] Kích hoạt rà soát code review theo quy chuẩn superpowers.
- [x] Sửa lỗi và verify không còn cảnh báo.
- [x] Commit "Task 5: Main Page integration and Phase 1 completion".
