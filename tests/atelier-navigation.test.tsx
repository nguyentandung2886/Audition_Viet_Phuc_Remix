// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen, cleanup } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import Home from "../app/page";

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

it("opens a fitting room, changes the áo dài color, and returns to the gallery", () => {
  vi.stubGlobal("fetch", () => new Promise(() => {}));
  render(<Home />);
  fireEvent.click(screen.getByRole("button", { name: "Áo dài" }));
  expect(screen.getByRole("heading", { name: "Áo dài" })).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Lam chàm" }));
  expect(screen.getByRole("button", { name: "Lam chàm" }).getAttribute("aria-pressed")).toBe("true");
  fireEvent.click(screen.getByRole("button", { name: "Xem bản phối" }));
  expect(screen.getByText("Màu: Lam chàm")).toBeTruthy();
  fireEvent.click(screen.getByText("Về phòng trưng bày"));
  expect(screen.getByRole("region", { name: "Chọn trang phục" })).toBeTruthy();
});
