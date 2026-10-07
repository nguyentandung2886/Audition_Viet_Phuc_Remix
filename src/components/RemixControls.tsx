'use client';

import React from 'react';
import { useOutfitStore } from '../store/useOutfitStore';
import { ColorPicker } from './ColorPicker';
import { TRADITIONAL_PALETTE } from '../data/outfits';

export function RemixControls() {
  const {
    outfits,
    currentOutfitId,
    selectOutfit,
    setLayerColor,
    resetColors,
    getCurrentOutfit,
    getLayerColor,
  } = useOutfitStore();

  const activeOutfit = getCurrentOutfit();

  const handleRandomize = () => {
    if (!activeOutfit) return;
    activeOutfit.layers.forEach((layer) => {
      const randomIndex = Math.floor(Math.random() * TRADITIONAL_PALETTE.length);
      setLayerColor(layer.id, TRADITIONAL_PALETTE[randomIndex].hex);
    });
  };

  return (
    <div className="bg-ivory-light border border-border-editorial rounded-xl p-6 shadow-sm flex flex-col h-full">
      {/* Studio Header */}
      <div className="border-b border-border-editorial pb-4 mb-5">
        <h3 className="text-xl font-serif font-bold text-charcoal tracking-tight">
          Phòng Thử Trang Phục (Remix Studio)
        </h3>
        <p className="text-sm text-charcoal-muted mt-1">
          Chọn cổ phục truyền thống và tuỳ biến sắc màu từng lớp y phục.
        </p>
      </div>

      {/* Outfit Selector */}
      <div className="mb-6">
        <label className="block text-xs uppercase tracking-wider font-semibold text-charcoal-muted mb-2.5">
          Chọn Dáng Cổ Phục
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {outfits.map((outfit) => {
            const isCurrent = outfit.id === currentOutfitId;
            return (
              <button
                key={outfit.id}
                type="button"
                data-testid={`select-outfit-${outfit.id}`}
                onClick={() => selectOutfit(outfit.id)}
                className={`text-left p-3 rounded-lg border transition-all text-xs ${
                  isCurrent
                    ? 'border-son-red bg-son-red/5 font-semibold text-son-red shadow-xs'
                    : 'border-border-editorial bg-ivory/50 text-charcoal hover:border-charcoal-muted/50 hover:bg-ivory'
                }`}
              >
                <div className="truncate font-medium">{outfit.name}</div>
                <div className="text-[10px] text-charcoal-muted mt-0.5 truncate">
                  {outfit.dynasty}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Layer Customization List */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        <label className="block text-xs uppercase tracking-wider font-semibold text-charcoal-muted">
          Tuỳ Phối Màu Sắc Lớp Y Phục
        </label>

        {activeOutfit.layers.map((layer) => {
          const currentColor = getLayerColor(layer.id);
          const colorMeta = TRADITIONAL_PALETTE.find(
            (c) => c.hex.toLowerCase() === currentColor.toLowerCase()
          );

          return (
            <div
              key={layer.id}
              className="p-3.5 bg-ivory/80 border border-border-editorial rounded-lg"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-charcoal">
                  {layer.name}
                </span>
                <span className="text-xs text-charcoal-muted flex items-center gap-1.5 font-mono">
                  <span
                    className="w-3 h-3 rounded-full border border-border-editorial inline-block"
                    style={{ backgroundColor: currentColor }}
                  />
                  {colorMeta ? colorMeta.name : currentColor}
                </span>
              </div>

              <ColorPicker
                layerId={layer.id}
                currentColor={currentColor}
                onSelectColor={(hex) => setLayerColor(layer.id, hex)}
              />
            </div>
          );
        })}
      </div>

      {/* Action Toolbar */}
      <div className="mt-6 pt-4 border-t border-border-editorial flex items-center justify-between gap-3">
        <button
          type="button"
          data-testid="reset-colors-btn"
          onClick={() => resetColors()}
          className="px-4 py-2 text-xs font-medium text-charcoal-muted hover:text-charcoal border border-border-editorial rounded-lg bg-ivory hover:bg-ivory-dark transition-colors"
        >
          Đặt Lại Màu Gốc
        </button>

        <button
          type="button"
          onClick={handleRandomize}
          className="px-4 py-2 text-xs font-semibold text-white bg-son-red hover:bg-son-red-hover rounded-lg transition-colors shadow-xs"
        >
          Phối Màu Ngẫu Nhiên
        </button>
      </div>
    </div>
  );
}
