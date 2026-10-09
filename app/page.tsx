"use client";

import React, { useState } from "react";
import OutfitComposer, { GarmentMetadata } from "@/components/OutfitComposer";

export default function Home() {
  const [selectedGarment, setSelectedGarment] = useState<string | null>("ao_dai/red");
  const [activeGarmentMeta, setActiveGarmentMeta] = useState<GarmentMetadata | null>(null);

  return (
    <div className="min-h-screen bg-[#070709] text-zinc-100 flex flex-col font-sans selection:bg-red-900 selection:text-white">
      {/* Editorial Ambient Background Glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-red-950/15 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-amber-950/15 rounded-full blur-[140px]" />
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
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-b from-red-600/20 via-amber-500/10 to-transparent blur-xl transition-all duration-700 group-hover:from-red-600/30" />
              
              {/* Core Component Render */}
              <OutfitComposer
                characterId="base_01"
                garmentId={selectedGarment}
                onGarmentLoaded={(meta) => setActiveGarmentMeta(meta)}
                className="relative z-10"
              />
            </div>

            {/* Quick Interactive Switcher Bar */}
            <div className="mt-5 p-2 rounded-xl bg-zinc-900/70 border border-white/5 backdrop-blur-md flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedGarment("ao_dai/red")}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                  selectedGarment === "ao_dai/red"
                    ? "bg-red-950/80 border border-red-500/50 text-red-200 shadow-md shadow-red-950/40"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                }`}
              >
                Áo Dài Đỏ (Đầy đủ)
              </button>
              <button
                type="button"
                onClick={() => setSelectedGarment(null)}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                  selectedGarment === null
                    ? "bg-zinc-800 border border-zinc-600 text-zinc-100 shadow-md"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                }`}
              >
                Base Mannequin
              </button>
              <button
                type="button"
                onClick={() => setSelectedGarment("ao_dai/missing_test")}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                  selectedGarment === "ao_dai/missing_test"
                    ? "bg-amber-950/80 border border-amber-500/50 text-amber-200 shadow-md shadow-amber-950/40"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                }`}
              >
                Test Fallback Lỗi
              </button>
            </div>
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
              {activeGarmentMeta?.name || (selectedGarment === null ? "Mannequin Anime Cơ Sở" : "Thử Nghiệm Ngoại Lệ")}
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-zinc-300">
              {activeGarmentMeta?.description ||
                (selectedGarment === null
                  ? "Nhân vật nữ cơ sở vẽ theo phong cách hoạt hình anime Nhật Bản kết hợp tỷ lệ giải phẫu học chuẩn xác, khớp nối mannequin và mốc neo tọa độ để thử nghiệm trang phục nhiều lớp."
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
              <span className="text-zinc-500 text-[10px]">Z-Index Stack</span>
            </h3>

            <div className="space-y-2">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-black/50 border border-white/5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                  <span className="text-zinc-300">Base Character (base.png)</span>
                </div>
                <span className="text-zinc-500 text-[10px]">renderOrder: 0</span>
              </div>

              {selectedGarment === "ao_dai/red" && (
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-red-950/30 border border-red-500/20">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                    <span className="text-red-200">Áo Dài Torso (torso.png)</span>
                  </div>
                  <span className="text-red-400/80 text-[10px]">renderOrder: 10</span>
                </div>
              )}

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
        <p>VIỆT PHỤC REMIX · AI ASSET PIPELINE & DIGITAL ATELIER MVP</p>
        <p className="mt-1 text-[11px] text-zinc-600">
          Tôn vinh vẻ đẹp truyền thống Việt Nam qua lăng kính đồ họa Anime và Công nghệ Web Hiện đại
        </p>
      </footer>
    </div>
  );
}
