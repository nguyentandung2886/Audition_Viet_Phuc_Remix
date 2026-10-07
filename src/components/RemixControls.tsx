'use client';

import React, { useState } from 'react';
import { useOutfitStore } from '../store/useOutfitStore';
import { ColorPicker } from './ColorPicker';
import { TRADITIONAL_PALETTE } from '../data/outfits';
import { MOOD_LIST } from '../data/moods';

type Tab = 'TRANG_PHUC' | 'PHU_KIEN' | 'MOOD';

export function RemixControls() {
  const [activeTab, setActiveTab] = useState<Tab>('TRANG_PHUC');
  
  const {
    outfits,
    currentOutfitId,
    selectOutfit,
    setLayerColor,
    resetColors,
    getCurrentOutfit,
    getLayerColor,
    hiddenLayers,
    toggleLayer,
    currentMood,
    setMood
  } = useOutfitStore();

  const activeOutfit = getCurrentOutfit();

  const handleRandomize = () => {
    if (!activeOutfit) return;
    activeOutfit.layers.forEach((layer) => {
      if (!hiddenLayers.includes(layer.id)) {
        const randomIndex = Math.floor(Math.random() * TRADITIONAL_PALETTE.length);
        setLayerColor(layer.id, TRADITIONAL_PALETTE[randomIndex].hex);
      }
    });
  };

  const applyMood = (moodId: string) => {
    setMood(moodId);
    const mood = MOOD_LIST.find(m => m.id === moodId);
    if (!mood) return;
    
    // Apply palette to all visible layers cyclically
    let colorIndex = 0;
    activeOutfit.layers.forEach((layer) => {
      if (!hiddenLayers.includes(layer.id)) {
        setLayerColor(layer.id, mood.palette[colorIndex % mood.palette.length]);
        colorIndex++;
      }
    });
  };

  return (
    <div className="bg-ivory-light border border-border-editorial rounded-xl shadow-sm flex flex-col h-[600px]">
      {/* Studio Header */}
      <div className="border-b border-border-editorial p-6 pb-4">
        <h3 className="text-xl font-serif font-bold text-charcoal tracking-tight">
          Phòng Thử Trang Phục (Remix Studio)
        </h3>
        <p className="text-sm text-charcoal-muted mt-1">
          Chọn cổ phục truyền thống và tuỳ biến sắc màu từng lớp y phục.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border-editorial px-6">
        {[
          { id: 'TRANG_PHUC', label: 'Trang Phục' },
          { id: 'PHU_KIEN', label: 'Phụ Kiện' },
          { id: 'MOOD', label: 'Tôn Màu (Mood)' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={`py-3 px-4 text-xs font-semibold uppercase tracking-wider transition-colors border-b-2 ${
              activeTab === tab.id 
                ? 'border-son-red text-son-red' 
                : 'border-transparent text-charcoal-muted hover:text-charcoal'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {/* TAB 1: TRANG PHỤC */}
        {activeTab === 'TRANG_PHUC' && (
          <>
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

            <div className="space-y-4">
              <label className="block text-xs uppercase tracking-wider font-semibold text-charcoal-muted">
                Phối Màu Lớp Áo
              </label>
              {activeOutfit.layers.filter(l => !l.isOptional).map((layer) => {
                const currentColor = getLayerColor(layer.id);
                return (
                  <div key={layer.id} className="p-3.5 bg-ivory/80 border border-border-editorial rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-charcoal">{layer.name}</span>
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
          </>
        )}

        {/* TAB 2: PHỤ KIỆN */}
        {activeTab === 'PHU_KIEN' && (
          <div className="space-y-4">
            <label className="block text-xs uppercase tracking-wider font-semibold text-charcoal-muted">
              Quản Lý Phụ Kiện
            </label>
            {activeOutfit.layers.filter(l => l.isOptional).map((layer) => {
              const currentColor = getLayerColor(layer.id);
              const isHidden = hiddenLayers.includes(layer.id);
              return (
                <div key={layer.id} className={`p-3.5 border border-border-editorial rounded-lg transition-colors ${isHidden ? 'bg-ivory/40 opacity-75' : 'bg-ivory/80'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-charcoal">{layer.name}</span>
                    <button 
                      onClick={() => toggleLayer(layer.id)}
                      className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${isHidden ? 'bg-charcoal-muted/20 text-charcoal-muted' : 'bg-son-red/10 text-son-red'}`}
                    >
                      {isHidden ? 'Đang Ẩn' : 'Đang Hiện'}
                    </button>
                  </div>
                  {!isHidden && (
                    <ColorPicker
                      layerId={layer.id}
                      currentColor={currentColor}
                      onSelectColor={(hex) => setLayerColor(layer.id, hex)}
                    />
                  )}
                </div>
              );
            })}
            {activeOutfit.layers.filter(l => l.isOptional).length === 0 && (
              <p className="text-sm text-charcoal-muted text-center py-8">Trang phục này không có phụ kiện đi kèm.</p>
            )}
          </div>
        )}

        {/* TAB 3: MOOD */}
        {activeTab === 'MOOD' && (
          <div className="space-y-4">
            <label className="block text-xs uppercase tracking-wider font-semibold text-charcoal-muted">
              Lựa Chọn Bảng Màu (Preset)
            </label>
            <div className="grid grid-cols-1 gap-3">
              {MOOD_LIST.map((mood) => {
                const isCurrent = currentMood === mood.id;
                return (
                  <button
                    key={mood.id}
                    onClick={() => applyMood(mood.id)}
                    className={`text-left p-4 border rounded-xl transition-all ${isCurrent ? 'border-son-red bg-son-red/5' : 'border-border-editorial hover:border-charcoal-muted/50'}`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className={`font-serif font-bold text-lg ${isCurrent ? 'text-son-red' : 'text-charcoal'}`}>{mood.name}</span>
                      <div className="flex gap-1">
                        {mood.palette.map(color => (
                          <span key={color} className="w-4 h-4 rounded-full border border-border-editorial" style={{ backgroundColor: color }} />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-charcoal-muted">{mood.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* Action Toolbar */}
      <div className="p-6 border-t border-border-editorial flex items-center justify-between gap-3 bg-ivory-light rounded-b-xl">
        <button
          type="button"
          data-testid="reset-colors-btn"
          onClick={() => { resetColors(); setMood(null); }}
          className="px-4 py-2 text-xs font-medium text-charcoal-muted hover:text-charcoal border border-border-editorial rounded-lg bg-ivory hover:bg-ivory-dark transition-colors"
        >
          Đặt Lại Gốc
        </button>

        <button
          type="button"
          onClick={handleRandomize}
          className="px-4 py-2 text-xs font-semibold text-white bg-son-red hover:bg-son-red-hover rounded-lg transition-colors shadow-xs"
        >
          Phối Ngẫu Nhiên
        </button>
      </div>
    </div>
  );
}
