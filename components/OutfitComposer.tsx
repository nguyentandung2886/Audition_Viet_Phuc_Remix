"use client";

import React, { useEffect, useEffectEvent, useState } from "react";
import Image from "next/image";
import { getGarment } from "@/lib/viet-phuc/catalog";
import { metadataForSelection, normalizeGarmentMetadata } from "@/lib/viet-phuc/garment-metadata";
import type { GarmentLayer, GarmentMetadata } from "@/lib/viet-phuc/types";

export type { GarmentMetadata } from "@/lib/viet-phuc/types";
export interface CharacterMetadata {
  characterId: string; name: string; canvas: { width: number; height: number }; assetPath: string;
}
export interface OutfitComposerProps {
  characterId: string;
  garmentId?: string | null;
  layerVisibility?: Record<string, boolean>;
  className?: string;
  onGarmentLoaded?: (garment: GarmentMetadata | null) => void;
  onCharacterLoaded?: (character: CharacterMetadata | null) => void;
}
interface RetainedPreview { garmentId: string; name: string; characterPath: string; layers: GarmentLayer[] }
interface ImageState {
  key: string; loadedIds: string[]; failedAccessoryIds: string[]; error: boolean;
  retained: RetainedPreview | null;
}

export default function OutfitComposer({ characterId, garmentId, layerVisibility, className = "", onGarmentLoaded, onCharacterLoaded }: OutfitComposerProps) {
  const [retry, setRetry] = useState(0);
  const requestKey = `${characterId}:${garmentId}:${retry}`;
  const [loaded, setLoaded] = useState<{ key: string; metadata: GarmentMetadata | null; error: boolean } | null>(null);
  const [character, setCharacter] = useState<CharacterMetadata | null>(null);
  const [images, setImages] = useState<ImageState>({ key: "", loadedIds: [], failedAccessoryIds: [], error: false, retained: null });
  const notifyGarment = useEffectEvent((value: GarmentMetadata | null) => onGarmentLoaded?.(value));
  const notifyCharacter = useEffectEvent((value: CharacterMetadata) => onCharacterLoaded?.(value));

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    async function load() {
      if (characterId !== "base_01") return;
      // Use the approved direct character image when character metadata is unavailable.
      const value: CharacterMetadata = {
        characterId, name: "Nhân vật minh họa", canvas: { width: 1024, height: 1536 },
        assetPath: `/assets/characters/${characterId}/base.png`,
      };
      try {
        const response = await fetch(`/assets/characters/${characterId}/character.json`, { signal: controller.signal });
        if (!response.ok) throw new Error("unavailable");
        const data: unknown = await response.json();
        if (!data || typeof data !== "object" || !("characterId" in data) || data.characterId !== characterId) throw new Error("invalid");
      } catch {
        if (!active) return;
      }
      if (active) { setCharacter(value); notifyCharacter(value); }
    }
    void load();
    return () => { active = false; controller.abort(); };
  }, [characterId, retry]);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    async function load() {
      try {
        const entry = garmentId ? getGarment(garmentId) : undefined;
        if (!entry) throw new Error("unavailable");
        const response = await fetch(entry.variants[0].metadataPath, { signal: controller.signal });
        if (!response.ok) throw new Error("unavailable");
        const result = normalizeGarmentMetadata(await response.json(), entry.id, characterId);
        if (!result.ok) throw new Error("invalid");
        if (active) {
          setLoaded({ key: requestKey, metadata: result.value, error: false });
          notifyGarment(result.value);
        }
      } catch {
        if (active) {
          setLoaded({ key: requestKey, metadata: null, error: true });
          notifyGarment(null);
        }
      }
    }
    void load();
    return () => { active = false; controller.abort(); };
  }, [characterId, garmentId, requestKey]);

  const metadata = metadataForSelection(loaded?.key === requestKey ? loaded.metadata : null, garmentId);
  const frame: Pick<ImageState, "loadedIds" | "failedAccessoryIds" | "error"> = images.key === requestKey ? images : { loadedIds: [], failedAccessoryIds: [], error: false };
  const activeLayers = (metadata?.layers ?? []).filter((layer) => !layer.isOptional ||
    (layer.visible && layerVisibility?.[layer.layerId] !== false && !frame.failedAccessoryIds.includes(layer.layerId)));
  const characterPath = character?.characterId === characterId ? character.assetPath : null;
  const ready = Boolean(metadata && characterPath && !frame.error && ["character", "pants", "torso"].every((id) => frame.loadedIds.includes(id)));
  const error = (loaded?.key === requestKey && loaded.error) || frame.error || characterId !== "base_01";
  const retained = !ready && images.retained?.characterPath === characterPath ? images.retained : null;

  function imageLoaded(layerId: string) {
    setImages((previous) => {
      const current = previous.key === requestKey ? previous : { key: requestKey, loadedIds: [], failedAccessoryIds: [], error: false, retained: previous.retained };
      const loadedIds = [...new Set([...current.loadedIds, layerId])];
      const complete = !current.error && metadata && characterPath && ["character", "pants", "torso"].every((id) => loadedIds.includes(id));
      return { ...current, loadedIds, retained: complete ? {
        garmentId: metadata.garmentId, name: metadata.name, characterPath,
        layers: activeLayers.filter((layer) => loadedIds.includes(layer.layerId)),
      } : current.retained };
    });
  }

  function imageFailed(layer: GarmentLayer | null) {
    setImages((previous) => {
      const current = previous.key === requestKey ? previous : { key: requestKey, loadedIds: [], failedAccessoryIds: [], error: false, retained: previous.retained };
      if (!layer?.isOptional) return { ...current, error: true };
      return { ...current, failedAccessoryIds: [...new Set([...current.failedAccessoryIds, layer.layerId])],
        retained: current.retained && current.retained.garmentId === garmentId
          ? { ...current.retained, layers: current.retained.layers.filter((item) => item.layerId !== layer.layerId) } : current.retained };
    });
  }

  return (
    <div className={`relative w-full aspect-[1024/1536] max-w-[540px] mx-auto select-none overflow-hidden rounded-2xl bg-zinc-950 border border-amber-500/20 ${className}`} data-testid="outfit-composer-container" aria-busy={!ready && !error}>
      {retained && (
        <div className="absolute inset-0" role="img" aria-label={`Bản phối trước: ${retained.name}`} data-testid="retained-preview">
          <Image src={retained.characterPath} alt="" fill unoptimized sizes="540px" className="object-contain" />
          {retained.layers.map((layer) => <Image key={layer.assetPath} src={layer.assetPath} alt="" fill unoptimized sizes="540px" className="object-contain" style={{ zIndex: layer.renderOrder }} />)}
        </div>
      )}
      <div className="absolute inset-0" style={{ visibility: ready ? "visible" : "hidden" }} aria-hidden={!ready}>
        {characterPath && <Image key={`${requestKey}:character`} src={characterPath} alt="Nhân vật minh họa" fill unoptimized loading="eager" sizes="540px" onLoad={() => imageLoaded("character")} onError={() => imageFailed(null)} className="object-contain" data-testid="base-character-layer" />}
        <div className="absolute inset-0 pointer-events-none" data-testid="garment-layers-container" data-garment-id={metadata?.garmentId}>
          {activeLayers.map((layer) => <Image key={`${requestKey}:${layer.assetPath}`} src={layer.assetPath} alt={layer.name} fill unoptimized loading="eager" sizes="540px" onLoad={() => imageLoaded(layer.layerId)} onError={() => imageFailed(layer)} style={{ zIndex: layer.renderOrder }} className="object-contain" data-testid={`garment-layer-${layer.layerId}`} />)}
        </div>
      </div>
      <div className="absolute inset-x-3 bottom-3 z-[70] rounded-lg bg-zinc-950/95 p-3 text-sm text-zinc-100" role="status" aria-live="polite">
        {ready && frame.failedAccessoryIds.length === 0 && <p>{metadata?.name}</p>}
        {!ready && !error && <p data-testid="composer-loading">Đang chuẩn bị trang phục…{retained ? ` Bản phối trước: ${retained.name}.` : ""}</p>}
        {error && <div data-testid="garment-error-notice"><p>Chưa tải được trang phục.{retained ? ` Đang giữ bản phối trước: ${retained.name}.` : " Vui lòng thử lại."}</p><button type="button" className="mt-2 min-h-11 min-w-11 rounded-lg border border-zinc-300 px-3 focus-visible:outline-2 focus-visible:outline-offset-2" onClick={() => setRetry((value) => value + 1)}>Thử lại trang phục</button></div>}
        {frame.failedAccessoryIds.length > 0 && <div><p>Chưa tải được phụ kiện. Bản phối vẫn giữ đầy đủ áo và phần trang phục bên dưới.</p><button type="button" className="mt-2 min-h-11 min-w-11 rounded-lg border border-zinc-300 px-3 focus-visible:outline-2 focus-visible:outline-offset-2" onClick={() => setRetry((value) => value + 1)}>Thử lại phụ kiện</button></div>}
      </div>
    </div>
  );
}
