import { useOutfitStore } from './useOutfitStore';

describe('useOutfitStore', () => {
  beforeEach(() => {
    // Reset state before each test if necessary
    useOutfitStore.setState(useOutfitStore.getInitialState());
  });

  test('sets measurements and toggles layers', () => {
    const store = useOutfitStore.getState();
    store.setMeasurements({ height: 170, weight: 60, chest: 90, waist: 70, hips: 95 });
    
    const updatedStore = useOutfitStore.getState();
    expect(updatedStore.measurements.height).toBe(170);
    expect(updatedStore.measurements.weight).toBe(60);
    
    store.toggleLayer('hat');
    expect(useOutfitStore.getState().hiddenLayers).toContain('hat');
    
    store.toggleLayer('hat');
    expect(useOutfitStore.getState().hiddenLayers).not.toContain('hat');
  });

  test('sets mood', () => {
    const store = useOutfitStore.getState();
    store.setMood('thanh-lich');
    expect(useOutfitStore.getState().currentMood).toBe('thanh-lich');
  });
});
