'use client';

import React, { useState, useEffect } from 'react';
import { OutfitPreview } from '../components/OutfitPreview';
import { RemixControls } from '../components/RemixControls';
import { OnboardingForm } from '../components/OnboardingForm';
import { useOutfitStore } from '../store/useOutfitStore';
import { validateOutfit } from '../utils/culturalGuard';

export default function Home() {
  const [showOnboarding, setShowOnboarding] = useState(true);
  
  const { currentOutfitId, currentMood, customColors } = useOutfitStore();
  const currentOutfitColors = customColors[currentOutfitId] || {};
  
  const { isValid, warnings } = validateOutfit(currentOutfitId, currentOutfitColors, currentMood);

  return (
    <div className="min-h-screen bg-ivory text-charcoal flex flex-col selection:bg-son-red selection:text-white relative">
      {showOnboarding && <OnboardingForm onComplete={() => setShowOnboarding(false)} />}
      
      {/* Editorial Header */}
      <header className="border-b border-border-editorial bg-ivory-light/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-son-red flex items-center justify-center text-white font-serif font-bold text-sm shadow-xs">
              VP
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-charcoal">
                VIỆT PHỤC REMIX
              </h1>
              <p className="text-xs text-charcoal-muted tracking-wide hidden sm:block">
                Không gian Sáng tạo & Phối sắc Cổ phục Việt Nam
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 bg-ivory-dark border border-border-editorial rounded-full font-medium text-charcoal-muted">
              Giai đoạn 1.5 • Tương tác
            </span>
          </div>
        </div>
      </header>

      {/* Main Studio Content */}
      <main className={`flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full transition-opacity duration-500 ${showOnboarding ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>
        <div className="mb-6">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-son-red">
            Phòng Trưng Bày Tương Tác
          </h2>
          <p className="text-charcoal-muted text-sm mt-0.5">
            Khám phá kết cấu đa tầng của trang phục truyền thống và thử nghiệm các bảng màu tự nhiên di sản.
          </p>
        </div>

        {/* Two-column layout on Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Outfit Silhouette Preview */}
          <section
            aria-label="Khu vực hiển thị trang phục"
            className="lg:col-span-5 xl:col-span-5 sticky top-24"
          >
            <OutfitPreview />
          </section>

          {/* Right Column: Remix Studio Controls & Cultural Guard */}
          <section
            aria-label="Khu vực điều khiển phối màu"
            className="lg:col-span-7 xl:col-span-7 flex flex-col gap-6"
          >
            <RemixControls />
            
            {/* Cultural Guard Warnings */}
            {!isValid && warnings.length > 0 && (
              <div className="bg-[#FFF8E7] border-l-4 border-son-red p-4 rounded-r-lg shadow-sm">
                <h4 className="text-son-red font-semibold text-sm uppercase tracking-wider mb-2">Lưu ý Văn Hóa</h4>
                <ul className="list-disc list-inside text-sm text-charcoal-muted space-y-1">
                  {warnings.map((w, idx) => <li key={idx}>{w}</li>)}
                </ul>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Editorial Footer */}
      <footer className="border-t border-border-editorial bg-ivory-light py-6 mt-12 text-center text-xs text-charcoal-muted">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p>
            <strong className="text-charcoal font-medium">Việt Phục Remix</strong> — Dự án số hóa nghệ thuật trang phục truyền thống Việt Nam.
          </p>
          <p className="text-[11px] text-charcoal-muted/80">
            Dữ liệu tham chiếu dựa trên nghiên cứu trang phục thời Nguyễn và cổ phục cung đình Việt Nam.
          </p>
        </div>
      </footer>
    </div>
  );
}
