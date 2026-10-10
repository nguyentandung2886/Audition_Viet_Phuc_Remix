"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface CharacterCanvas {
  width: number;
  height: number;
}

export interface CharacterAnchors {
  [key: string]: { x: number; y: number };
}

export interface CharacterMetadata {
  characterId: string;
  name: string;
  canvas: CharacterCanvas;
  anchors?: CharacterAnchors;
  assetPath: string;
}

export interface GarmentLayer {
  layerId: string;
  name: string;
  renderOrder: number;
  assetPath: string;
  visible?: boolean;
}

export interface GarmentComponent {
  assetId: string;
  name: string;
  characterId?: string;
  garmentType?: string;
  componentType?: string;
  canvasWidth?: number;
  canvasHeight?: number;
  renderOrder: number;
  anchorReferences?: string[];
  colorVariants?: string[];
  alphaAvailable?: boolean;
  filePath: string;
}

export interface GarmentMetadata {
  garmentId: string;
  name: string;
  characterId: string;
  garmentType?: string;
  dynasty?: string;
  gender?: string;
  description?: string;
  historicalFact?: string;
  canvas?: CharacterCanvas;
  renderOrder?: number;
  layers?: GarmentLayer[];
  components?: GarmentComponent[];
}

export interface OutfitComposerProps {
  characterId: string;
  garmentId?: string | null;
  layerVisibility?: Record<string, boolean>;
  className?: string;
  showLayerBadge?: boolean;
  garmentFilterClassName?: string;
  onGarmentLoaded?: (garment: GarmentMetadata | null) => void;
  onCharacterLoaded?: (character: CharacterMetadata | null) => void;
}

/**
 * OutfitComposer renders an anime mannequin base character and dynamically composites
 * transparent garment layers over it using Framer Motion layer transitions.
 * 
 * Features:
 * - Reads character.json & garment.json from /assets/...
 * - Graceful fallback handling for missing metadata or assets
 * - Framer Motion layer fade-in transitions (initial opacity 0 -> animate 1)
 * - Strict 1024x1536 canonical aspect ratio preservation
 * - High-elegance Vietnamese editorial aesthetic
 */
export default function OutfitComposer({
  characterId,
  garmentId,
  layerVisibility,
  className = "",
  showLayerBadge = true,
  garmentFilterClassName = "",
  onGarmentLoaded,
  onCharacterLoaded,
}: OutfitComposerProps) {
  const [character, setCharacter] = useState<CharacterMetadata | null>(null);
  const [characterError, setCharacterError] = useState<string | null>(null);
  const [loadedCharacterId, setLoadedCharacterId] = useState<string | null>(null);

  const [garment, setGarment] = useState<GarmentMetadata | null>(null);
  const [garmentError, setGarmentError] = useState<string | null>(null);
  const [loadedGarmentId, setLoadedGarmentId] = useState<string | null | undefined>(undefined);

  // Keep latest callback references in refs to break infinite render loops
  const onGarmentLoadedRef = useRef(onGarmentLoaded);
  useEffect(() => {
    onGarmentLoadedRef.current = onGarmentLoaded;
  });

  const onCharacterLoadedRef = useRef(onCharacterLoaded);
  useEffect(() => {
    onCharacterLoadedRef.current = onCharacterLoaded;
  });

  // Derive loading status idiomatically
  const characterLoading = Boolean(characterId && loadedCharacterId !== characterId && !characterError);
  const garmentLoading = Boolean(garmentId && loadedGarmentId !== garmentId && !garmentError);

  // 1. Load Base Character metadata
  useEffect(() => {
    let isMounted = true;

    async function fetchCharacter() {
      try {
        const res = await fetch(`/assets/characters/${characterId}/character.json`);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: Không tìm thấy character.json tại /assets/characters/${characterId}/`);
        }
        const data: CharacterMetadata = await res.json();
        if (isMounted) {
          setCharacter(data);
          setCharacterError(null);
          setLoadedCharacterId(characterId);
          onCharacterLoadedRef.current?.(data);
        }
      } catch (err: unknown) {
        if (isMounted) {
          const errMsg = err instanceof Error ? err.message : "Lỗi không xác định khi tải nhân vật";
          const fallbackData: CharacterMetadata = {
            characterId,
            name: `Base Character (${characterId})`,
            canvas: { width: 1024, height: 1536 },
            assetPath: `/assets/characters/${characterId}/base.png`,
          };
          setCharacter(fallbackData);
          setCharacterError(errMsg);
          setLoadedCharacterId(characterId);
          onCharacterLoadedRef.current?.(fallbackData);
        }
      }
    }

    if (characterId) {
      void fetchCharacter();
    }

    return () => {
      isMounted = false;
    };
  }, [characterId]);

  // 2. Load Garment metadata
  useEffect(() => {
    let isMounted = true;

    if (!garmentId) {
      queueMicrotask(() => {
        if (!isMounted) return;
        setGarment(null);
        setGarmentError(null);
        setLoadedGarmentId(null);
        onGarmentLoadedRef.current?.(null);
      });
      return;
    }

    async function fetchGarment() {
      try {
        const res = await fetch(`/assets/garments/${garmentId}/garment.json`);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: Không tìm thấy garment.json cho '${garmentId}'`);
        }
        const data: GarmentMetadata = await res.json();

        // Normalize layers from either 'layers' or 'components' array
        let layersList: GarmentLayer[] = [];
        if (Array.isArray(data.layers) && data.layers.length > 0) {
          layersList = data.layers;
        } else if (Array.isArray(data.components) && data.components.length > 0) {
          layersList = data.components.map((c) => ({
            layerId: c.assetId,
            name: c.name,
            renderOrder: c.renderOrder ?? 10,
            assetPath: c.filePath,
            visible: true,
          }));
        }

        const normalizedGarment: GarmentMetadata = {
          ...data,
          layers: layersList,
        };

        if (isMounted) {
          setGarment(normalizedGarment);
          setGarmentError(null);
          setLoadedGarmentId(garmentId);
          onGarmentLoadedRef.current?.(normalizedGarment);
        }
      } catch (err: unknown) {
        if (isMounted) {
          const errMsg = err instanceof Error ? err.message : `Lỗi tải trang phục '${garmentId}'`;
          setGarment(null);
          setGarmentError(errMsg);
          setLoadedGarmentId(garmentId);
          onGarmentLoadedRef.current?.(null);
        }
      }
    }

    void fetchGarment();

    return () => {
      isMounted = false;
    };
  }, [garmentId]);

  // If garmentId was set to null/empty, clear garment state when active
  const effectiveGarment = garmentId ? garment : null;

  // Filter and sort active garment layers by renderOrder and layerVisibility
  const activeLayers = (effectiveGarment?.layers || [])
    .filter((layer) => {
      if (layer.visible === false) return false;
      if (layerVisibility && layerVisibility[layer.layerId] === false) return false;
      return true;
    })
    .sort((a, b) => (a.renderOrder ?? 10) - (b.renderOrder ?? 10));

  return (
    <div
      className={`relative w-full aspect-[1024/1536] max-w-[540px] mx-auto select-none overflow-hidden rounded-2xl bg-gradient-to-b from-zinc-900/90 via-black to-zinc-950 border border-amber-500/20 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_40px_rgba(217,119,6,0.08)] ${className}`}
      data-testid="outfit-composer-container"
    >
      {/* Editorial Decorative Grid & Pedestal Glow */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:24px_24px]" />
      <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-amber-900/20 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-red-600/10 blur-3xl pointer-events-none" />

      {/* Top Editorial Corner Badges */}
      <div className="absolute top-3 inset-x-3 flex items-center justify-between z-40 text-[10px] tracking-widest uppercase font-mono">
        <span className="px-2.5 py-1 rounded-full bg-black/60 border border-white/10 text-zinc-300 backdrop-blur-md">
          {character?.name || characterId}
        </span>
        {effectiveGarment && (
          <span className="px-2.5 py-1 rounded-full bg-red-950/80 border border-red-500/40 text-red-200 backdrop-blur-md">
            {effectiveGarment.name}
          </span>
        )}
      </div>

      {/* Character Base Layer */}
      {character?.assetPath && (
        <motion.img
          key={`base-${character.characterId}`}
          src={character.assetPath}
          alt={character.name}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full object-contain pointer-events-none z-0"
          data-testid="base-character-layer"
        />
      )}

      {/* Garment Layers with Framer Motion transitions & Isolated Garment Color Filter */}
      <div
        className={`absolute inset-0 w-full h-full pointer-events-none transition-all duration-500 ${garmentFilterClassName}`}
        data-testid="garment-layers-container"
      >
        <AnimatePresence mode="popLayout">
          {activeLayers.map((layer) => (
            <motion.img
              key={`layer-${layer.layerId}-${layer.assetPath}`}
              src={layer.assetPath}
              alt={layer.name}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              style={{ zIndex: layer.renderOrder }}
              className="absolute inset-0 w-full h-full object-contain pointer-events-none"
              data-testid={`garment-layer-${layer.layerId}`}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Loading Indicator */}
      {(characterLoading || garmentLoading) && (
        <div
          className="absolute top-4 right-4 z-50 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/80 border border-amber-500/30 text-[10px] font-mono text-amber-300 backdrop-blur-md"
          data-testid="composer-loading"
        >
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span>Đang nạp layer...</span>
        </div>
      )}

      {/* Graceful Error Notice for Missing Garment Metadata */}
      {garmentId && garmentError && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 15 }}
          className="absolute bottom-4 inset-x-4 z-50 rounded-xl border border-amber-500/30 bg-zinc-950/90 p-3.5 backdrop-blur-lg shadow-2xl"
          data-testid="garment-error-notice"
        >
          <div className="flex items-start gap-2.5">
            <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold">
              !
            </div>
            <div className="flex-1 text-xs">
              <p className="font-semibold text-amber-200 tracking-wide">
                Thông báo dữ liệu trang phục
              </p>
              <p className="mt-0.5 font-mono text-[11px] text-zinc-400 break-words">
                {garmentError}
              </p>
              <p className="mt-1 text-[10px] text-zinc-500">
                Fallback: Hệ thống vẫn hiển thị Base Character nguyên bản để đảm bảo trải nghiệm liên tục.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Graceful Warning Notice for Character Loading Fallback */}
      {characterError && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 15 }}
          className="absolute top-12 inset-x-4 z-50 rounded-xl border border-red-500/30 bg-zinc-950/90 p-3.5 backdrop-blur-lg shadow-2xl"
          data-testid="character-error-notice"
        >
          <div className="flex items-start gap-2.5">
            <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500/20 text-red-400 text-xs font-bold">
              !
            </div>
            <div className="flex-1 text-xs">
              <p className="font-semibold text-red-200 tracking-wide">
                Thông báo dữ liệu nhân vật
              </p>
              <p className="mt-0.5 font-mono text-[11px] text-zinc-400 break-words">
                {characterError}
              </p>
              <p className="mt-1 text-[10px] text-zinc-500">
                Fallback: Đang sử dụng hình ảnh base trực tiếp từ đường dẫn mặc định.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Bottom Layer Status & Technical Spec Badge */}
      {showLayerBadge && (
        <div className="absolute bottom-3 inset-x-3 flex items-center justify-between z-30 pointer-events-none text-[10px] text-zinc-400 font-mono">
          <span className="px-2 py-0.5 rounded bg-black/60 border border-white/5 backdrop-blur-sm">
            Canvas 1024×1536 · 2:3
          </span>
          <span className="px-2 py-0.5 rounded bg-black/60 border border-white/5 backdrop-blur-sm text-zinc-300">
            {activeLayers.length > 0
              ? `Layers active: 1 + ${activeLayers.length}`
              : "Base layer only"}
          </span>
        </div>
      )}
    </div>
  );
}
