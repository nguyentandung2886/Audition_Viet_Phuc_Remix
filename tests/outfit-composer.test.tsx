// @vitest-environment jsdom
import React from "react";
import { readFileSync } from "node:fs";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import OutfitComposer from "../components/OutfitComposer";
import Home from "../app/page";

const json = (id: string) => JSON.parse(readFileSync(`public/assets/garments/${id}/garment.json`, "utf8"));
const character = JSON.parse(readFileSync("public/assets/characters/base_01/character.json", "utf8"));
const reply = (value: unknown) => ({ ok: true, json: async () => value }) as Response;

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

async function finishImages() {
  await waitFor(() => expect(screen.getByTestId("garment-layer-torso")).toBeTruthy());
  await act(async () => {
    for (const image of screen.getByTestId("outfit-composer-container").querySelectorAll("img")) fireEvent.load(image);
  });
  await waitFor(() => expect(screen.getByTestId("outfit-composer-container").getAttribute("aria-busy")).toBe("false"));
}

it("withholds the previous active metadata while retaining a labeled complete preview during rapid switches", async () => {
  let resolveBlue: (response: Response) => void = () => {};
  let resolveGreen: (response: Response) => void = () => {};
  const blue = new Promise<Response>((resolve) => { resolveBlue = resolve; });
  const green = new Promise<Response>((resolve) => { resolveGreen = resolve; });
  vi.stubGlobal("fetch", (path: string) => {
    if (path.includes("characters")) return Promise.resolve(reply(character));
    if (path.includes("nhat_binh")) return blue;
    if (path.includes("giao_linh")) return green;
    return Promise.resolve(reply(json("ao_dai/red")));
  });
  const view = render(<OutfitComposer characterId="base_01" garmentId="ao_dai/red" />);
  await finishImages();
  view.rerender(<OutfitComposer characterId="base_01" garmentId="nhat_binh/royal_blue" />);
  expect(screen.getByTestId("garment-layers-container").querySelectorAll("img")).toHaveLength(0);
  expect(screen.getByTestId("retained-preview").getAttribute("aria-label")).toContain("Áo dài");
  view.rerender(<OutfitComposer characterId="base_01" garmentId="giao_linh/emerald" />);
  await act(async () => { resolveBlue(reply(json("nhat_binh/royal_blue"))); });
  expect(screen.getByTestId("garment-layers-container").querySelectorAll("img")).toHaveLength(0);
  await act(async () => { resolveGreen(reply(json("giao_linh/emerald"))); });
  await finishImages();
  expect(screen.getByTestId("garment-layer-torso").getAttribute("src")).toContain("giao_linh/emerald");
  expect(screen.queryByTestId("retained-preview")).toBeNull();
});

it("honors clothing visibility flags and removes only a failed accessory", async () => {
  vi.stubGlobal("fetch", async (path: string) => reply(path.includes("characters") ? character : json(path.includes("nhat_binh") ? "nhat_binh/royal_blue" : "ao_dai/red")));
  const view = render(<OutfitComposer characterId="base_01" garmentId="ao_dai/red" layerVisibility={{ pants: false }} />);
  await finishImages();
  fireEvent.error(screen.getByTestId("garment-layer-necklace"));
  expect(screen.queryByTestId("garment-layer-necklace")).toBeNull();
  expect(screen.queryByTestId("garment-layer-pants")).toBeNull();
  expect(screen.getByTestId("garment-layer-torso")).toBeTruthy();
  expect(screen.getByTestId("garment-layer-torso").parentElement?.getAttribute("data-layer-motion")).toBe("torso");
  expect(screen.getByTestId("garment-layer-headpiece")).toBeTruthy();
  expect(screen.getByRole("button", { name: "Thử lại phụ kiện" })).toBeTruthy();
  view.rerender(<OutfitComposer characterId="base_01" garmentId="nhat_binh/royal_blue" />);
  await finishImages();
  expect(screen.getByTestId("garment-layer-necklace").getAttribute("src")).toContain("nhat_binh/royal_blue");
});

it("recovers from a required layer failure when that layer is hidden or loads again", async () => {
  vi.stubGlobal("fetch", async (path: string) => reply(path.includes("characters") ? character : json("ao_dai/red")));
  const view = render(<OutfitComposer characterId="base_01" garmentId="ao_dai/red" />);
  await finishImages();
  fireEvent.error(screen.getByTestId("garment-layer-torso"));
  expect(screen.getByTestId("garment-error-notice")).toBeTruthy();

  view.rerender(<OutfitComposer characterId="base_01" garmentId="ao_dai/red" layerVisibility={{ torso: false }} />);
  await waitFor(() => expect(screen.queryByTestId("garment-error-notice")).toBeNull());
  await waitFor(() => expect(screen.queryByTestId("garment-layer-torso")).toBeNull());

  view.rerender(<OutfitComposer characterId="base_01" garmentId="ao_dai/red" layerVisibility={{ torso: true }} />);
  fireEvent.load(await screen.findByTestId("garment-layer-torso"));
  await waitFor(() => expect(screen.queryByTestId("garment-error-notice")).toBeNull());
});

it("keeps the previous fully clothed preview on a failed request and allows retry", async () => {
  let failed = true;
  vi.stubGlobal("fetch", async (path: string) => {
    if (path.includes("characters")) return reply(character);
    if (path.includes("nhat_binh") && failed) return { ok: false } as Response;
    return reply(json(path.includes("nhat_binh") ? "nhat_binh/royal_blue" : "ao_dai/red"));
  });
  const view = render(<OutfitComposer characterId="base_01" garmentId="ao_dai/red" />);
  await finishImages();
  view.rerender(<OutfitComposer characterId="base_01" garmentId="nhat_binh/royal_blue" />);
  await screen.findByRole("button", { name: "Thử lại trang phục" });
  expect(screen.getByTestId("retained-preview").querySelectorAll("img")).toHaveLength(5);
  failed = false;
  fireEvent.click(screen.getByRole("button", { name: "Thử lại trang phục" }));
  await finishImages();
  expect(screen.queryByTestId("retained-preview")).toBeNull();
});

it("uses catalog options and publishes only pending cultural context", async () => {
  vi.stubGlobal("fetch", async (path: string) => reply(path.includes("characters") ? character : json(path.includes("giao_linh") ? "giao_linh/emerald" : "ao_dai/red")));
  render(<Home />);
  fireEvent.click(screen.getByRole("button", { name: "Áo giao lĩnh" }));
  expect(screen.getByRole("button", { name: "Áo giao lĩnh" }).getAttribute("aria-pressed")).toBe("true");
  expect(screen.getByRole("checkbox", { name: /Trâm Cài Hoa Sen Ngọc Bích/ })).toBeTruthy();
  expect(screen.getByText("Bản phối minh họa theo phong cách anime. Nội dung văn hóa đang được kiểm chứng.")).toBeTruthy();
  await finishImages();
  expect(screen.queryByText(json("giao_linh/emerald").historicalFact)).toBeNull();
  expect(screen.queryByRole("button", { name: /Base/ })).toBeNull();
  expect(screen.queryByRole("button", { name: /Thân Áo|Quần/ })).toBeNull();
});

it("starts fresh image state when returning to a garment before the intermediate garment loads", async () => {
  const blue = new Promise<Response>(() => {});
  vi.stubGlobal("fetch", (path: string) => {
    if (path.includes("characters")) return Promise.resolve(reply(character));
    if (path.includes("nhat_binh")) return blue;
    return Promise.resolve(reply(json("ao_dai/red")));
  });
  const view = render(<OutfitComposer characterId="base_01" garmentId="ao_dai/red" />);
  await finishImages();
  fireEvent.error(screen.getByTestId("garment-layer-necklace"));
  expect(screen.queryByTestId("garment-layer-necklace")).toBeNull();
  view.rerender(<OutfitComposer characterId="base_01" garmentId="nhat_binh/royal_blue" />);
  view.rerender(<OutfitComposer characterId="base_01" garmentId="ao_dai/red" />);

  // Reusing loaded flags would reveal this returned selection before its images load.
  expect(screen.getByTestId("outfit-composer-container").getAttribute("aria-busy")).toBe("true");
  expect(screen.queryByRole("button", { name: "Thử lại phụ kiện" })).toBeNull();
  await screen.findByTestId("garment-layer-necklace");
  await finishImages();
  expect(screen.getByTestId("garment-layer-necklace").getAttribute("src")).toContain("ao_dai/red");
});

it("retains the last visible complete outfit after an accessory is deselected", async () => {
  const blue = new Promise<Response>(() => {});
  vi.stubGlobal("fetch", (path: string) => path.includes("nhat_binh") ? blue : Promise.resolve(reply(path.includes("characters") ? character : json("ao_dai/red"))));
  const view = render(<OutfitComposer characterId="base_01" garmentId="ao_dai/red" layerVisibility={{ necklace: true, headpiece: true }} />);
  await finishImages();
  view.rerender(<OutfitComposer characterId="base_01" garmentId="ao_dai/red" layerVisibility={{ necklace: true, headpiece: false }} />);
  await waitFor(() => expect(screen.queryByTestId("garment-layer-headpiece")).toBeNull());
  view.rerender(<OutfitComposer characterId="base_01" garmentId="nhat_binh/royal_blue" />);

  const sources = Array.from(screen.getByTestId("retained-preview").querySelectorAll("img"), (image) => image.getAttribute("src"));
  expect(sources.some((src) => src?.endsWith("/headpiece.png"))).toBe(false);
  expect(sources).toHaveLength(4);
  expect(sources.some((src) => src?.endsWith("/pants.png"))).toBe(true);
  expect(sources.some((src) => src?.endsWith("/torso.png"))).toBe(true);
});
