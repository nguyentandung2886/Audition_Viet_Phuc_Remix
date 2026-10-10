"use client";

import React, { useState } from "react";
import OutfitComposer, { GarmentMetadata } from "@/components/OutfitComposer";

export default function Home() {
  const [selectedGarment, setSelectedGarment] = useState<string | null>("ao_dai/red");
  const [activeGarmentMeta, setActiveGarmentMeta] = useState<GarmentMetadata | null>(null);

  // Individual modular layer visibility states
  const [layerVisibility, setLayerVisibility] = useState<Record<string, boolean>>({
    pants: true,
    torso: true,
    necklace: true,
    headpiece: true,
  });

  // Color Mood / Hue tone filter per garment
  const [activeMood, setActiveMood] = useState<string>("default");

  const toggleLayer = (layerKey: string) => {
    setLayerVisibility((prev) => ({
      ...prev,
      [layerKey]: !prev[layerKey],
    }));
  };

  // Garment-specific color palettes
  const isNhatBinh = selectedGarment === "nhat_binh/royal_blue";
  const isGiaoLinh = selectedGarment === "giao_linh/emerald";

  const colorMoods = isGiaoLinh
    ? [
        { id: "default", name: "Ngọc Lục Bảo Đại Việt", color: "bg-emerald-600", filter: "" },
        { id: "ruby", name: "Hồng Đào Quý Tộc", color: "bg-rose-600", filter: "hue-rotate-[140deg] saturate-125" },
        { id: "sapphire", name: "Lam Sắc Cung Đình", color: "bg-blue-600", filter: "hue-rotate-[45deg] saturate-125" },
        { id: "gold", name: "Hoàng Kim Vương Triều", color: "bg-amber-500", filter: "hue-rotate-[290deg] saturate-140 brightness-105" },
      ]
    : isNhatBinh
    ? [
        { id: "default", name: "Lam Sắc Hoàng Triều", color: "bg-blue-600", filter: "" },
        { id: "purple", name: "Tím Huế Cung Đình", color: "bg-purple-600", filter: "hue-rotate-[45deg] saturate-125" },
        { id: "ruby", name: "Đỏ Thắm Hoàng Gia", color: "bg-red-600", filter: "hue-rotate-[140deg] saturate-130" },
        { id: "emerald", name: "Lục Bảo Thượng Uyển", color: "bg-emerald-600", filter: "hue-rotate-[260deg] saturate-120" },
      ]
    : [
        { id: "default", name: "Đỏ Hoàng Triều", color: "bg-red-600", filter: "" },
        { id: "jade", name: "Ngọc Bích Cung Đình", color: "bg-emerald-600", filter: "hue-rotate-[140deg] saturate-125" },
        { id: "gold", name: "Hoàng Yến Quý Tộc", color: "bg-amber-500", filter: "hue-rotate-[45deg] saturate-150 brightness-110" },
        { id: "blue", name: "Lam Sắc Thùy Mị", color: "bg-blue-600", filter: "hue-rotate-[210deg] saturate-125" },
      ];

  const currentMoodObj = colorMoods.find((m) => m.id === activeMood) || colorMoods[0];
  const moodFilterClass = currentMoodObj.filter;

  return (
    <div className="min-h-screen bg-[#070709] text-zinc-100 flex flex-col font-sans selection:bg-red-900 selection:text-white">
      {/* Editorial Ambient Background Glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-red-950/20 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-amber-950/20 rounded-full blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff05_1px,transparent_1px)] [background-size:32px_32px]" />
      </div>

      {/* Top Editorial Navigation Bar */}
      <header className="relative z-20 border-b border-amber-500/15 bg-black/60 backdrop-blur-xl px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-1 bg-gradient-to-b from-red-600 via-amber-500 to-amber-200 rounded-full" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-[0.25em] text-zinc-100 uppercase">
                  Việt Phục Remix
                </h1>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-red-950/80 border border-red-500/30 text-red-300">
                  Anime Couture
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono tracking-wider">
                Digital Atelier & Heritage Costume Archive
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900/80 border border-zinc-800 text-zinc-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Pipeline: 1024×1536 Canonical
            </span>
            <span className="hidden md:inline-flex px-3 py-1 rounded-full bg-zinc-900/80 border border-zinc-800 text-amber-400/90">
              Framer Motion Layering
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col lg:flex-row gap-8 lg:gap-12 items-start justify-center">

        {/* Left Column: Center Stage & Outfit Composer */}
        <section className="w-full lg:w-1/2 flex flex-col items-center">
          <div className="w-full max-w-[500px]">
            {/* Stage Pedestal Frame */}
            <div className="relative group">
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-b from-red-600/25 via-amber-500/15 to-transparent blur-2xl transition-all duration-700 group-hover:from-red-600/35" />

              {/* Core Component Render with Garment-Only Color Mood (Base character strictly unfiltered) */}
              <OutfitComposer
                characterId="base_01"
                garmentId={selectedGarment}
                layerVisibility={layerVisibility}
                onGarmentLoaded={setActiveGarmentMeta}
                garmentFilterClassName={moodFilterClass}
                className="relative z-10"
              />
            </div>

            {/* Garment Quick Switcher Bar */}
            <div className="mt-5 p-2 rounded-xl bg-zinc-900/70 border border-white/5 backdrop-blur-md flex items-center justify-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setSelectedGarment("ao_dai/red");
                  setActiveMood("default");
                }}
                className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-medium transition-all ${
                  selectedGarment === "ao_dai/red"
                    ? "bg-red-950/80 border border-red-500/50 text-red-200 shadow-md shadow-red-950/40"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                }`}
              >
                Áo Dài
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedGarment("nhat_binh/royal_blue");
                  setActiveMood("default");
                }}
                className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-medium transition-all ${
                  selectedGarment === "nhat_binh/royal_blue"
                    ? "bg-blue-950/80 border border-blue-500/50 text-blue-200 shadow-md shadow-blue-950/40"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                }`}
              >
                Áo Nhật Bình
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedGarment("giao_linh/emerald");
                  setActiveMood("default");
                }}
                className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-medium transition-all ${
                  selectedGarment === "giao_linh/emerald"
                    ? "bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 shadow-md shadow-emerald-950/40"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                }`}
              >
                Áo Giao Lĩnh
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedGarment(null);
                  setActiveMood("default");
                }}
                className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-medium transition-all ${
                  selectedGarment === null
                    ? "bg-zinc-800 border border-zinc-600 text-zinc-100 shadow-md"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                }`}
              >
                Base
              </button>
            </div>

            {/* Modular Component Layer Toggles */}
            {selectedGarment && (
              <div className="mt-4 p-4 rounded-xl bg-zinc-900/50 border border-amber-500/20 backdrop-blur-md">
                <div className="flex items-center justify-between mb-3 text-xs font-mono text-zinc-400 uppercase tracking-wider">
                  <span>Tùy Biến Phân Lớp ({activeGarmentMeta?.name || "Modular Layers"})</span>
                  <span className="text-amber-400 text-[10px]">Framer Motion</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => toggleLayer("headpiece")}
                    className={`py-2 px-3 rounded-lg border text-left flex items-center justify-between transition-all ${
                      layerVisibility.headpiece
                        ? "bg-red-950/60 border-red-500/50 text-red-200"
                        : "bg-black/40 border-zinc-800 text-zinc-500"
                    }`}
                  >
                    <span className="truncate mr-1">
                      👑 {activeGarmentMeta?.layers?.find((l) => l.layerId === "headpiece")?.name || "Mấn / Trâm Cài"}
                    </span>
                    <span className="font-mono text-[10px] shrink-0">
                      {layerVisibility.headpiece ? "ON" : "OFF"}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleLayer("necklace")}
                    className={`py-2 px-3 rounded-lg border text-left flex items-center justify-between transition-all ${
                      layerVisibility.necklace
                        ? "bg-amber-950/60 border-amber-500/50 text-amber-200"
                        : "bg-black/40 border-zinc-800 text-zinc-500"
                    }`}
                  >
                    <span className="truncate mr-1">
                      📿 {activeGarmentMeta?.layers?.find((l) => l.layerId === "necklace")?.name || "Ngọc Bội / Kiềng"}
                    </span>
                    <span className="font-mono text-[10px] shrink-0">
                      {layerVisibility.necklace ? "ON" : "OFF"}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleLayer("torso")}
                    className={`py-2 px-3 rounded-lg border text-left flex items-center justify-between transition-all ${
                      layerVisibility.torso
                        ? "bg-red-950/60 border-red-500/50 text-red-200"
                        : "bg-black/40 border-zinc-800 text-zinc-500"
                    }`}
                  >
                    <span className="truncate mr-1">
                      👘 {activeGarmentMeta?.layers?.find((l) => l.layerId === "torso")?.name || "Thân Áo Lễ Phục"}
                    </span>
                    <span className="font-mono text-[10px] shrink-0">
                      {layerVisibility.torso ? "ON" : "OFF"}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleLayer("pants")}
                    className={`py-2 px-3 rounded-lg border text-left flex items-center justify-between transition-all ${
                      layerVisibility.pants
                        ? "bg-zinc-800/80 border-zinc-500 text-zinc-200"
                        : "bg-black/40 border-zinc-800 text-zinc-500"
                    }`}
                  >
                    <span className="truncate mr-1">
                      👖 {activeGarmentMeta?.layers?.find((l) => l.layerId === "pants")?.name || "Quần / Thường Phiến"}
                    </span>
                    <span className="font-mono text-[10px] shrink-0">
                      {layerVisibility.pants ? "ON" : "OFF"}
                    </span>
                  </button>
                </div>

                {/* Color Mood Selector - Isolated solely to garment layers */}
                <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                      Sắc Thái Trang Phục:
                    </span>
                    <span className="text-[10px] text-amber-400 font-mono">
                      {currentMoodObj.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {colorMoods.map((mood) => (
                      <button
                        key={mood.id}
                        type="button"
                        title={mood.name}
                        onClick={() => setActiveMood(mood.id)}
                        className={`w-6 h-6 rounded-full ${mood.color} transition-all ${activeMood === mood.id
                            ? "ring-2 ring-white scale-110 shadow-md shadow-white/30"
                            : "opacity-60 hover:opacity-100 hover:scale-105"
                          }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Right Column: Editorial Curation & Technical Inspector */}
        <section className="w-full lg:w-1/2 flex flex-col gap-6">

          {/* Garment Editorial Headline Card */}
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-amber-500/15 backdrop-blur-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 rounded-full blur-2xl" />

            <div className="flex items-center gap-2 text-[11px] font-mono tracking-widest text-amber-400 uppercase">
              <span>Sưu Tập Di Sản</span>
              <span>·</span>
              <span>Thời Nguyễn (1802 - 1945)</span>
            </div>

            <h2 className="mt-2 text-2xl sm:text-3xl font-serif tracking-tight text-white font-medium">
              {activeGarmentMeta?.name || (selectedGarment === null ? "Nữ Sinh Anime Việt Nam (Base Mannequin)" : "Thử Nghiệm Ngoại Lệ")}
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-zinc-300">
              {activeGarmentMeta?.description ||
                (selectedGarment === null
                  ? "Nhân vật nữ cơ sở vẽ theo phong cách hoạt hình anime Nhật Bản hiện đại, tỷ lệ giải phẫu học chuẩn xác, tư thế đứng thẳng chính diện với mốc neo tọa độ giải phẫu (head, neck, waist, hips) đảm bảo mọi layer trang phục khớp nối hoàn hảo từng pixel."
                  : "Mô phỏng trường hợp file dữ liệu JSON bị thiếu hoặc đường dẫn tài nguyên không tồn tại, kiểm chứng cơ chế tự phục hồi và hiển thị thông báo an toàn của OutfitComposer.")}
            </p>

            {/* Cultural Fact Callout */}
            {activeGarmentMeta?.historicalFact && (
              <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-red-950/40 to-transparent border-l-2 border-red-500 text-xs text-red-200/90 leading-relaxed">
                <span className="font-semibold text-amber-300 block mb-1">
                  Điểm nhấn văn hóa:
                </span>
                {activeGarmentMeta.historicalFact}
              </div>
            )}
          </div>

          {/* Design System & Art Direction Profile */}
          <div className="p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800 backdrop-blur-md">
            <h3 className="text-xs uppercase font-mono tracking-widest text-zinc-400 mb-4 flex items-center justify-between">
              <span>Đặc Tả Nghệ Thuật & Thiết Kế</span>
              <span className="text-amber-400 text-[10px]">Anime Cel-Shade</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                <p className="text-zinc-500 font-mono text-[10px] uppercase">Phong cách đồ họa</p>
                <p className="text-zinc-200 font-medium mt-1">Hoạt hình Anime 2D</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">Cel-shaded linework, màu sắc tương phản trang nhã.</p>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                <p className="text-zinc-500 font-mono text-[10px] uppercase">Họa tiết truyền thống</p>
                <p className="text-amber-200 font-medium mt-1">Hoa Sen Hoàng Triều</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">Thêu chỉ vàng kim lấp lánh trên nền lụa đỏ thắm.</p>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                <p className="text-zinc-500 font-mono text-[10px] uppercase">Cơ chế Layer</p>
                <p className="text-zinc-200 font-medium mt-1">Alpha PNG Trong Suốt</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">Tách nền tự động bằng AI pipeline (rembg + u2netp).</p>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                <p className="text-zinc-500 font-mono text-[10px] uppercase">Hiệu ứng chuyển động</p>
                <p className="text-emerald-300 font-medium mt-1">Framer Motion</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">Fade-in & Opacity lerp mượt mà khi đổi trang phục.</p>
              </div>
            </div>
          </div>

          {/* Active Layer Inspector */}
          <div className="p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800 backdrop-blur-md font-mono text-xs">
            <h3 className="text-xs uppercase tracking-widest text-zinc-400 mb-3 flex items-center justify-between">
              <span>Trạng Thái Các Lớp Hiển Thị</span>
              <span className="text-zinc-500 text-[10px]">Z-Index Hierarchy</span>
            </h3>

            <div className="space-y-2">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-black/50 border border-white/5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                  <span className="text-zinc-300">Base Character (base.png)</span>
                </div>
                <span className="text-zinc-500 text-[10px]">renderOrder: 0</span>
              </div>

              {/* Dynamic Garment Layers */}
              {activeGarmentMeta?.layers?.map((layer) => {
                if (!layerVisibility[layer.layerId]) return null;
                return (
                  <div
                    key={layer.layerId}
                    className="flex items-center justify-between p-2 rounded-lg bg-zinc-900/60 border border-white/10"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-zinc-300">{layer.name} ({layer.layerId}.png)</span>
                    </div>
                    <span className="text-zinc-400 text-[10px]">renderOrder: {layer.renderOrder}</span>
                  </div>
                );
              })}

              {selectedGarment === "ao_dai/missing_test" && (
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-amber-950/30 border border-amber-500/20">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className="text-amber-200">Garment Missing (Graceful Fallback)</span>
                  </div>
                  <span className="text-amber-400/80 text-[10px]">Bảo vệ UI</span>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Editorial Footer */}
      <footer className="relative z-20 border-t border-zinc-800/80 bg-black/80 px-6 py-6 text-center text-xs text-zinc-500 font-mono">
        <p>VIỆT PHỤC REMIX · AI ASSET PIPELINE & DIGITAL ATELIER</p>
        <p className="mt-1 text-[11px] text-zinc-600">
          Tôn vinh vẻ đẹp truyền thống Việt Nam qua lăng kính đồ họa Anime và Công nghệ Web Hiện đại
        </p>
      </footer>
    </div>
  );
}
