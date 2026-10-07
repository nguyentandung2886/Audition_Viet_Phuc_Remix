import { useOutfitStore } from '@/store/useOutfitStore';

describe('Outfit State Management (useOutfitStore)', () => {
  beforeEach(() => {
    // Reset store before each test
    const { outfits, selectOutfit, resetColors } = useOutfitStore.getState();
    if (outfits.length > 0) {
      selectOutfit(outfits[0].id);
      resetColors();
    }
  });

  it('should initialize with available outfits and a default selected outfit', () => {
    const state = useOutfitStore.getState();
    expect(state.outfits.length).toBeGreaterThan(0);
    expect(state.currentOutfitId).toBe(state.outfits[0].id);
    const activeOutfit = state.getCurrentOutfit();
    expect(activeOutfit).toBeDefined();
    expect(activeOutfit.id).toBe(state.outfits[0].id);
  });

  it('should switch selected outfit when selectOutfit is called', () => {
    const { outfits, selectOutfit, getCurrentOutfit } = useOutfitStore.getState();
    expect(outfits.length).toBeGreaterThanOrEqual(2);

    const secondOutfitId = outfits[1].id;
    selectOutfit(secondOutfitId);

    const updatedState = useOutfitStore.getState();
    expect(updatedState.currentOutfitId).toBe(secondOutfitId);
    expect(updatedState.getCurrentOutfit().id).toBe(secondOutfitId);
  });

  it('should update layer color and retrieve it via getLayerColor', () => {
    const { getCurrentOutfit, setLayerColor, getLayerColor } = useOutfitStore.getState();
    const outfit = getCurrentOutfit();
    const firstLayer = outfit.layers[0];
    const newColor = '#B33927';

    expect(getLayerColor(firstLayer.id)).toBe(firstLayer.defaultColor);

    setLayerColor(firstLayer.id, newColor);

    expect(useOutfitStore.getState().getLayerColor(firstLayer.id)).toBe(newColor);
  });

  it('should reset custom colors when resetColors is called', () => {
    const { getCurrentOutfit, setLayerColor, resetColors, getLayerColor } = useOutfitStore.getState();
    const outfit = getCurrentOutfit();
    const firstLayer = outfit.layers[0];

    setLayerColor(firstLayer.id, '#1E4D3E');
    expect(useOutfitStore.getState().getLayerColor(firstLayer.id)).toBe('#1E4D3E');

    resetColors();
    expect(useOutfitStore.getState().getLayerColor(firstLayer.id)).toBe(firstLayer.defaultColor);
  });
});
