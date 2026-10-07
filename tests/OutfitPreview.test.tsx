import React from 'react';
import { render, screen } from '@testing-library/react';
import { OutfitPreview } from '@/components/OutfitPreview';
import { useOutfitStore } from '@/store/useOutfitStore';

describe('OutfitPreview Component', () => {
  beforeEach(() => {
    const { outfits, selectOutfit, resetColors } = useOutfitStore.getState();
    selectOutfit(outfits[0].id);
    resetColors();
  });

  it('renders the active outfit name and dynasty', () => {
    render(<OutfitPreview />);
    const activeOutfit = useOutfitStore.getState().getCurrentOutfit();
    expect(screen.getByText(activeOutfit.name)).toBeInTheDocument();
    expect(screen.getByText(activeOutfit.dynasty)).toBeInTheDocument();
  });

  it('renders all layers with blend mode multiply overlays corresponding to layer colors', () => {
    render(<OutfitPreview />);
    const activeOutfit = useOutfitStore.getState().getCurrentOutfit();

    activeOutfit.layers.forEach((layer) => {
      const layerEl = screen.getByTestId(`outfit-layer-${layer.id}`);
      expect(layerEl).toBeInTheDocument();

      const overlay = screen.getByTestId(`color-overlay-${layer.id}`);
      expect(overlay).toBeInTheDocument();
      // Should have mix-blend-mode multiply applied
      expect(overlay.style.mixBlendMode).toBe('multiply');
    });
  });

  it('updates overlay color dynamically when store state changes', async () => {
    const { rerender } = render(<OutfitPreview />);
    const activeOutfit = useOutfitStore.getState().getCurrentOutfit();
    const testLayer = activeOutfit.layers[0];
    const testColor = '#C69214';

    // Change color in store wrapped in act
    await React.act(async () => {
      useOutfitStore.getState().setLayerColor(testLayer.id, testColor);
    });
    rerender(<OutfitPreview />);

    const overlay = screen.getByTestId(`color-overlay-${testLayer.id}`);
    expect(overlay.style.backgroundColor).toBe('rgb(198, 146, 20)'); // hex #C69214 in rgb
  });
});
