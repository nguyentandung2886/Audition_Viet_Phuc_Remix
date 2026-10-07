'use client';

import React from 'react';
import { useOutfitStore } from '../store/useOutfitStore';
import { LayerShape } from '../types/outfit';

interface ShapeRendererProps {
  shape: LayerShape;
  color: string;
}

function ShapeGraphic({ shape, color }: ShapeRendererProps) {
  switch (shape) {
    case 'hat':
      return (
        <svg viewBox="0 0 300 400" className="w-full h-full absolute inset-0 pointer-events-none">
          {/* Base grayscale silhouette */}
          <path
            d="M 115 50 Q 150 42 185 50 C 195 55 192 68 180 72 Q 150 78 120 72 C 108 68 105 55 115 50 Z"
            fill="#B0AAA0"
          />
          {/* Shading creases */}
          <path
            d="M 125 54 Q 150 50 175 54"
            stroke="#7A746B"
            strokeWidth="2"
            fill="none"
          />
          {/* Multiplied color tint */}
          <path
            d="M 115 50 Q 150 42 185 50 C 195 55 192 68 180 72 Q 150 78 120 72 C 108 68 105 55 115 50 Z"
            fill={color}
            style={{ mixBlendMode: 'multiply' }}
          />
        </svg>
      );

    case 'collar':
      return (
        <svg viewBox="0 0 300 400" className="w-full h-full absolute inset-0 pointer-events-none">
          {/* Rectangular or V-neck collar band */}
          <path
            d="M 132 82 L 150 115 L 168 82 L 164 165 L 136 165 Z"
            fill="#C4BEB4"
          />
          {/* Traditional decorative lines */}
          <line x1="144" y1="88" x2="144" y2="165" stroke="#8E887E" strokeWidth="1.5" />
          <line x1="156" y1="88" x2="156" y2="165" stroke="#8E887E" strokeWidth="1.5" />
          <path
            d="M 132 82 L 150 115 L 168 82 L 164 165 L 136 165 Z"
            fill={color}
            style={{ mixBlendMode: 'multiply' }}
          />
        </svg>
      );

    case 'belt':
      return (
        <svg viewBox="0 0 300 400" className="w-full h-full absolute inset-0 pointer-events-none">
          {/* Belt band */}
          <rect x="118" y="166" width="64" height="14" rx="2" fill="#B5AEA4" />
          {/* Dangling silk ribbons */}
          <path d="M 142 180 L 138 245 L 146 242 L 148 180 Z" fill="#9C958B" />
          <path d="M 152 180 L 154 238 L 160 235 L 156 180 Z" fill="#888177" />
          <rect
            x="118"
            y="166"
            width="64"
            height="14"
            rx="2"
            fill={color}
            style={{ mixBlendMode: 'multiply' }}
          />
          <path
            d="M 142 180 L 138 245 L 146 242 L 148 180 Z M 152 180 L 154 238 L 160 235 L 156 180 Z"
            fill={color}
            style={{ mixBlendMode: 'multiply' }}
          />
        </svg>
      );

    case 'skirt':
      return (
        <svg viewBox="0 0 300 400" className="w-full h-full absolute inset-0 pointer-events-none">
          {/* Long flowing skirt / pants */}
          <path
            d="M 120 180 L 180 180 L 205 375 L 95 375 Z"
            fill="#DDD8CF"
          />
          {/* Pleat shading */}
          <line x1="140" y1="180" x2="135" y2="375" stroke="#ABA498" strokeWidth="1.5" />
          <line x1="160" y1="180" x2="165" y2="375" stroke="#ABA498" strokeWidth="1.5" />
          <path
            d="M 120 180 L 180 180 L 205 375 L 95 375 Z"
            fill={color}
            style={{ mixBlendMode: 'multiply' }}
          />
        </svg>
      );

    case 'robe':
    default:
      return (
        <svg viewBox="0 0 300 400" className="w-full h-full absolute inset-0 pointer-events-none">
          {/* Broad-sleeved traditional robe silhouette */}
          <path
            d="M 130 82 Q 150 90 170 82 L 255 145 C 255 175 240 215 220 230 L 195 195 L 205 325 L 95 325 L 105 195 L 80 230 C 60 215 45 175 45 145 Z"
            fill="#C9C3B8"
          />
          {/* Fold lines */}
          <path d="M 130 82 L 105 195" stroke="#8A8377" strokeWidth="1.5" />
          <path d="M 170 82 L 195 195" stroke="#8A8377" strokeWidth="1.5" />
          <path
            d="M 130 82 Q 150 90 170 82 L 255 145 C 255 175 240 215 220 230 L 195 195 L 205 325 L 95 325 L 105 195 L 80 230 C 60 215 45 175 45 145 Z"
            fill={color}
            style={{ mixBlendMode: 'multiply' }}
          />
        </svg>
      );
  }
}

export function OutfitPreview() {
  const { getCurrentOutfit, getLayerColor } = useOutfitStore();
  const outfit = getCurrentOutfit();

  if (!outfit) {
    return (
      <div className="p-8 text-center text-charcoal-muted border border-border-editorial rounded-lg">
        Không tìm thấy thông tin trang phục.
      </div>
    );
  }

  return (
    <div className="bg-ivory-light border border-border-editorial rounded-xl p-6 shadow-sm flex flex-col h-full">
      {/* Editorial Header */}
      <div className="border-b border-border-editorial pb-4 mb-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs uppercase tracking-widest font-semibold px-2.5 py-1 rounded bg-ivory-dark text-charcoal-muted">
            {outfit.dynasty}
          </span>
          <span className="text-xs text-charcoal-muted font-medium">
            {outfit.gender === 'nu' ? 'Nữ phục' : outfit.gender === 'nam' ? 'Nam phục' : 'Nam & Nữ'}
          </span>
        </div>
        <h2 className="text-2xl font-serif font-bold text-charcoal mt-2 tracking-tight">
          {outfit.name}
        </h2>
        <p className="text-sm text-charcoal-muted mt-1 leading-relaxed">
          {outfit.description}
        </p>
      </div>

      {/* Silhouette Canvas Container */}
      <div className="relative flex-1 min-h-[380px] w-full bg-ivory border border-border-editorial/60 rounded-lg flex items-center justify-center p-4 overflow-hidden">
        {/* Subtle background mannequin base frame */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <svg viewBox="0 0 300 400" className="w-full h-full">
            {/* Head circle */}
            <circle cx="150" cy="55" r="22" fill="#888" />
            {/* Neck */}
            <rect x="144" y="75" width="12" height="15" fill="#888" />
          </svg>
        </div>

        {/* Dynamic Outfit Layers */}
        <div className="relative w-full h-[380px]">
          {outfit.layers.map((layer) => {
            const currentColor = getLayerColor(layer.id);
            return (
              <div
                key={layer.id}
                data-testid={`outfit-layer-${layer.id}`}
                className="absolute inset-0"
                style={{ zIndex: layer.zIndex }}
              >
                {/* SVG Visual representation with multiply tint */}
                <ShapeGraphic shape={layer.shape} color={currentColor} />

                {/* Color overlay indicator for TDD verification and blend testing */}
                <div
                  data-testid={`color-overlay-${layer.id}`}
                  className="hidden"
                  style={{
                    backgroundColor: currentColor,
                    mixBlendMode: 'multiply',
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Historical Context Footer */}
      <div className="mt-4 pt-3 border-t border-border-editorial/60 bg-ivory/60 p-3 rounded text-xs text-charcoal-muted">
        <span className="font-semibold text-charcoal">Điểm tích lịch sử: </span>
        {outfit.historicalFact}
      </div>
    </div>
  );
}
