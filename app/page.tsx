"use client";

import React, { useState } from "react";
import OutfitComposer from "@/components/OutfitComposer";
import { garmentCatalog, getGarment, occasionSuggestions, pendingCulturalCopy } from "@/lib/viet-phuc/catalog";
import { createOutfit, selectGarment, selectVariant, toggleAccessory, visibleLayerIds } from "@/lib/viet-phuc/outfit-state";
import type { OutfitState } from "@/lib/viet-phuc/types";

export default function Home() {
  const [outfit, setOutfit] = useState<OutfitState>(() => createOutfit("ao_dai/red")!);
  const garment = getGarment(outfit.garmentId)!;
  const visibleIds = visibleLayerIds(outfit);
  const layerVisibility = Object.fromEntries(garment.optionalAccessories.map((item) => [item.id, visibleIds.includes(item.id)]));
  const buttonClass = "min-h-11 min-w-11 rounded-lg border px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-300";

  return (
    <div className="min-h-screen bg-[#070709] text-zinc-100 flex flex-col font-sans">
      <header className="border-b border-amber-500/15 bg-black/60 px-6 py-4">
        <div className="max-w-7xl mx-auto"><h1 className="text-lg font-semibold">Việt Phục Remix</h1><p className="text-sm text-zinc-300 mt-1">Thử trang phục qua minh họa anime</p></div>
      </header>
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
        <section className="w-full lg:w-1/2 flex flex-col items-center" aria-label="Bản phối trang phục">
          <div className="w-full max-w-[500px]">
            <OutfitComposer characterId="base_01" garmentId={outfit.garmentId} layerVisibility={layerVisibility} />
            <div className="mt-5 p-2 rounded-xl bg-zinc-900/70 border border-white/10 flex flex-wrap gap-2" role="group" aria-label="Chọn trang phục">
              {garmentCatalog.map((item) => <button key={item.id} type="button" aria-pressed={outfit.garmentId === item.id} className={`${buttonClass} flex-1 ${outfit.garmentId === item.id ? "border-amber-300 bg-zinc-800 text-white" : "border-zinc-600 text-zinc-200"}`} onClick={() => setOutfit((current) => selectGarment(current, item.id))}>{item.shortName}</button>)}
            </div>
            <fieldset className="mt-4 p-4 rounded-xl bg-zinc-900/50 border border-amber-500/20">
              <legend className="px-2 text-sm font-semibold">Phụ kiện của {garment.shortName}</legend>
              <div className="flex flex-col gap-2">{garment.optionalAccessories.map((accessory) => <label key={accessory.id} className="flex items-center gap-3 min-h-11 rounded-lg border border-zinc-600 px-3 py-2 cursor-pointer"><input type="checkbox" checked={outfit.accessoryIds.includes(accessory.id)} onChange={() => setOutfit((current) => toggleAccessory(current, accessory.id))} className="h-5 w-5 accent-amber-300" /><span className="text-sm">{accessory.displayName}</span></label>)}</div>
            </fieldset>
            <div className="mt-4 p-4 rounded-xl bg-zinc-900/50 border border-zinc-700" role="group" aria-label="Màu trang phục"><p className="text-sm mb-2">Màu có sẵn</p>{garment.variants.map((variant) => <button key={variant.id} type="button" className={`${buttonClass} border-amber-300`} aria-pressed={outfit.variantId === variant.id} onClick={() => setOutfit((current) => selectVariant(current, variant.id))}>{variant.displayName}</button>)}</div>
          </div>
        </section>
        <section className="w-full lg:w-1/2 flex flex-col gap-6" aria-label="Thông tin trang phục">
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-amber-500/15"><h2 className="text-2xl sm:text-3xl font-serif">{garment.shortName}</h2><p className="mt-3 text-sm leading-relaxed text-zinc-200">{pendingCulturalCopy}</p></div>
          <div className="p-6 rounded-2xl bg-zinc-900/30 border border-zinc-700"><h3 className="text-lg font-semibold">Gợi ý theo dịp</h3><p className="mt-2 text-sm text-zinc-300">Gợi ý phối đồ đương đại</p><ul className="mt-4 space-y-4">{occasionSuggestions.filter((occasion) => occasion.garmentIds.includes(outfit.garmentId)).map((occasion) => <li key={occasion.id}><h4 className="font-medium">{occasion.displayName}</h4><p className="text-sm text-zinc-300 mt-1">{occasion.rationale}</p></li>)}</ul></div>
        </section>
      </main>
      <footer className="border-t border-zinc-800 bg-black/80 px-6 py-6 text-center text-sm text-zinc-300">Việt Phục Remix · Không gian thử trang phục minh họa</footer>
    </div>
  );
}
