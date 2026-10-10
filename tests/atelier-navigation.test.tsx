// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen, cleanup } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import Home from "../app/page";

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

it("opens a fitting room, previews a live color treatment, and returns to the gallery", () => {
  vi.stubGlobal("fetch", () => new Promise(() => {}));
  render(<Home />);
  fireEvent.click(screen.getByRole("button", { name: "Áo dài" }));
  expect(screen.getByRole("heading", { name: "Áo dài" })).toBeTruthy();
  expect(screen.queryByRole("button", { name: "Lam chàm" })).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Sắc lạnh" }));
  expect(screen.getByRole("button", { name: "Sắc lạnh" }).getAttribute("aria-pressed")).toBe("true");
  fireEvent.click(screen.getByRole("button", { name: "Xem bản phối" }));
  expect(screen.getByText("Màu minh họa: Sắc lạnh")).toBeTruthy();
  fireEvent.click(screen.getByText("Về phòng trưng bày"));
  expect(screen.getByRole("region", { name: "Chọn trang phục" })).toBeTruthy();
});
