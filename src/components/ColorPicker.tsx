'use client';

import React from 'react';
import { TRADITIONAL_PALETTE } from '../data/outfits';

interface ColorPickerProps {
  layerId: string;
  currentColor: string;
  onSelectColor: (hex: string) => void;
}

export function ColorPicker({ layerId, currentColor, onSelectColor }: ColorPickerProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 mt-2">
      {TRADITIONAL_PALETTE.map((color) => {
        const isSelected = currentColor.toLowerCase() === color.hex.toLowerCase();
        return (
          <button
            key={color.hex}
            type="button"
            data-testid={`swatch-${layerId}-${color.hex}`}
            aria-label={`Chọn màu ${color.name}`}
            title={`${color.name} (${color.hex})`}
            onClick={() => onSelectColor(color.hex)}
            className={`w-7 h-7 rounded-full transition-all duration-150 transform hover:scale-110 relative flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-son-red focus:ring-offset-1 ${
              isSelected
                ? 'ring-2 ring-charcoal ring-offset-2 scale-110 shadow-sm'
                : 'border border-border-editorial hover:shadow'
            }`}
            style={{ backgroundColor: color.hex }}
          >
            {isSelected && (
              <span
                className={`w-2 h-2 rounded-full ${
                  color.hex === '#F9F6F0' || color.hex === '#FDFBF7'
                    ? 'bg-charcoal'
                    : 'bg-white'
                }`}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
