'use client';

import React, { useState } from 'react';
import { useOutfitStore } from '../store/useOutfitStore';

interface OnboardingFormProps {
  onComplete: () => void;
}

export function OnboardingForm({ onComplete }: OnboardingFormProps) {
  const { measurements, setMeasurements } = useOutfitStore();
  
  // Local state for smooth sliding before committing to store (optional, but good for performance)
  // We can just use the store directly if it's fast enough. Let's use local state for the form.
  const [localMeasurements, setLocalMeasurements] = useState(measurements);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseInt(value, 10);
    setLocalMeasurements(prev => ({ ...prev, [name]: numValue }));
    setMeasurements({ [name]: numValue });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/80 backdrop-blur-sm p-4">
      <div className="bg-ivory w-full max-w-md rounded-2xl p-6 shadow-2xl border border-border-editorial">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-serif font-bold text-charcoal">Định Hình Phong Cách</h2>
          <p className="text-sm text-charcoal-muted mt-2">
            Nhập số đo cơ bản để cá nhân hóa ma nơ canh của riêng bạn.
          </p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="flex justify-between text-xs font-semibold uppercase tracking-wider text-charcoal-muted mb-1">
              <span>Chiều cao</span>
              <span>{localMeasurements.height} cm</span>
            </label>
            <input 
              type="range" name="height" 
              min="140" max="190" 
              value={localMeasurements.height} 
              onChange={handleChange}
              className="w-full accent-son-red"
            />
          </div>
          <div>
            <label className="flex justify-between text-xs font-semibold uppercase tracking-wider text-charcoal-muted mb-1">
              <span>Cân nặng</span>
              <span>{localMeasurements.weight} kg</span>
            </label>
            <input 
              type="range" name="weight" 
              min="35" max="100" 
              value={localMeasurements.weight} 
              onChange={handleChange}
              className="w-full accent-son-red"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-center text-xs font-semibold uppercase tracking-wider text-charcoal-muted mb-1">Vòng 1</label>
              <input type="number" name="chest" value={localMeasurements.chest} onChange={handleChange} className="w-full bg-ivory-dark border border-border-editorial rounded p-1 text-center text-sm text-charcoal" />
            </div>
            <div>
              <label className="block text-center text-xs font-semibold uppercase tracking-wider text-charcoal-muted mb-1">Vòng 2</label>
              <input type="number" name="waist" value={localMeasurements.waist} onChange={handleChange} className="w-full bg-ivory-dark border border-border-editorial rounded p-1 text-center text-sm text-charcoal" />
            </div>
            <div>
              <label className="block text-center text-xs font-semibold uppercase tracking-wider text-charcoal-muted mb-1">Vòng 3</label>
              <input type="number" name="hips" value={localMeasurements.hips} onChange={handleChange} className="w-full bg-ivory-dark border border-border-editorial rounded p-1 text-center text-sm text-charcoal" />
            </div>
          </div>
        </div>

        <div className="mt-8">
          <button 
            onClick={onComplete}
            className="w-full py-3 bg-son-red hover:bg-son-red-hover text-white font-semibold rounded-xl shadow-md transition-all"
          >
            Vào Phòng Thử Đồ
          </button>
        </div>
      </div>
    </div>
  );
}
