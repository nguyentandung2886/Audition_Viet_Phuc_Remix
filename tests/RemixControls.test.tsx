import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { RemixControls } from '@/components/RemixControls';
import { useOutfitStore } from '@/store/useOutfitStore';

describe('RemixControls Component', () => {
  beforeEach(() => {
    const { outfits, selectOutfit, resetColors } = useOutfitStore.getState();
    selectOutfit(outfits[0].id);
    resetColors();
  });

  it('renders outfit selector buttons and switches outfit on click', () => {
    render(<RemixControls />);
    const outfits = useOutfitStore.getState().outfits;

    // Verify outfit tab buttons exist
    outfits.forEach((outfit) => {
      expect(screen.getByTestId(`select-outfit-${outfit.id}`)).toBeInTheDocument();
    });

    // Click on second outfit
    fireEvent.click(screen.getByTestId(`select-outfit-${outfits[1].id}`));
    expect(useOutfitStore.getState().currentOutfitId).toBe(outfits[1].id);
  });

  it('renders layer sections and updates layer color when a color swatch is clicked', () => {
    render(<RemixControls />);
    const activeOutfit = useOutfitStore.getState().getCurrentOutfit();
    const firstLayer = activeOutfit.layers[0];

    // Check layer header
    expect(screen.getByText(firstLayer.name)).toBeInTheDocument();

    // Click on color swatch for first layer
    const colorSwatch = screen.getByTestId(`swatch-${firstLayer.id}-#1E4D3E`);
    expect(colorSwatch).toBeInTheDocument();

    fireEvent.click(colorSwatch);
    expect(useOutfitStore.getState().getLayerColor(firstLayer.id)).toBe('#1E4D3E');
  });

  it('resets colors to default when clicking reset button', () => {
    render(<RemixControls />);
    const activeOutfit = useOutfitStore.getState().getCurrentOutfit();
    const firstLayer = activeOutfit.layers[0];

    // Change color first
    fireEvent.click(screen.getByTestId(`swatch-${firstLayer.id}-#1E4D3E`));
    expect(useOutfitStore.getState().getLayerColor(firstLayer.id)).toBe('#1E4D3E');

    // Click reset
    const resetButton = screen.getByTestId('reset-colors-btn');
    fireEvent.click(resetButton);

    expect(useOutfitStore.getState().getLayerColor(firstLayer.id)).toBe(firstLayer.defaultColor);
  });
});
