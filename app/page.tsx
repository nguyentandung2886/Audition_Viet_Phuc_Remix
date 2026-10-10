"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import OutfitComposer from "@/components/OutfitComposer";
import { garmentCatalog, getGarment, occasionSuggestions, pendingCulturalCopy } from "@/lib/viet-phuc/catalog";
import { createOutfit, selectGarment, toggleAccessory, toggleRequiredLayer, visibleLayerIds } from "@/lib/viet-phuc/outfit-state";
import type { OutfitState } from "@/lib/viet-phuc/types";

type View = "gallery" | "room" | "result";
const roomImages: Record<string, string> = {
  "ao_dai/red": "/assets/approved/scenes/ao_dai/background.png",
  "nhat_binh/royal_blue": "/assets/approved/scenes/nhat_binh/background.png",
  "giao_linh/emerald": "/assets/approved/scenes/giao_linh/background.png",
};
const foregroundImage = "/assets/approved/scenes/ao_dai/foreground.png";
const previews: Record<string, string> = {
  "ao_dai/red": "/assets/garments/ao_dai/red/torso.png",
  "nhat_binh/royal_blue": "/assets/garments/nhat_binh/royal_blue/torso.png",
  "giao_linh/emerald": "/assets/garments/giao_linh/emerald/torso.png",
};
const originalSwatches: Record<string, string> = {
  "ao_dai/red": "linear-gradient(135deg,#963e50,#d99076)",
  "nhat_binh/royal_blue": "linear-gradient(135deg,#354d80,#7388ad)",
  "giao_linh/emerald": "linear-gradient(135deg,#356557,#70a08b)",
};
const numbers = ["01", "02", "03"];
const colorPresets = [
  { id: "original", label: "Nguyên bản", filter: "none" },
  { id: "warm", label: "Sắc ấm", filter: "sepia(.22) saturate(1.28) hue-rotate(-12deg) brightness(1.03)" },
  { id: "cool", label: "Sắc lạnh", filter: "sepia(.16) saturate(1.18) hue-rotate(38deg) brightness(1.01)" },
] as const;
type ColorPresetId = (typeof colorPresets)[number]["id"];

export default function Home() {
  const [view, setView] = useState<View>("gallery");
  const [outfit, setOutfit] = useState<OutfitState>(() => createOutfit("ao_dai/red")!);
  const [occasionOpen, setOccasionOpen] = useState(false);
  const [occasionId, setOccasionId] = useState<string | null>(null);
  const [colorPresetId, setColorPresetId] = useState<ColorPresetId>("original");
  const [motionReduced, setMotionReduced] = useState(false);
  const sceneRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const foregroundRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!window.matchMedia) return;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setMotionReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!sceneRef.current || motionReduced) return;
    const context = gsap.context(() => {
      const timeline = gsap.timeline({ defaults: { ease: "power2.inOut" } });
      timeline.fromTo(stageRef.current, { opacity: 0.55, scale: view === "gallery" ? 1.055 : 0.94, xPercent: view === "gallery" ? 2 : -3 }, { opacity: 1, scale: 1, xPercent: 0, duration: 0.6 }, 0);
      timeline.fromTo(foregroundRef.current, { opacity: 0, xPercent: view === "gallery" ? -3 : 3 }, { opacity: 1, xPercent: 0, duration: 0.6 }, 0.1);
      timeline.fromTo(".scene-enter", { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.36, stagger: 0.055 }, 0.3);
    }, sceneRef);
    return () => context.revert();
  }, [view, outfit.garmentId, motionReduced]);

  useEffect(() => {
    if (view !== "gallery") headingRef.current?.focus();
  }, [view]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (occasionOpen) setOccasionOpen(false);
      else if (view === "result") setView("room");
      else if (view === "room") setView("gallery");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [occasionOpen, view]);

  const garment = getGarment(outfit.garmentId)!;
  const roomImage = roomImages[outfit.garmentId];
  const visibleIds = visibleLayerIds(outfit);
  const layerVisibility = Object.fromEntries(["pants", "torso", ...garment.optionalAccessories.map((item) => item.id)].map((id) => [id, visibleIds.includes(id as typeof visibleIds[number])]));
  const visibleRequiredNames = [
    visibleIds.includes("torso") ? "Áo" : null,
    visibleIds.includes("pants") ? "Quần" : null,
  ].filter(Boolean).join(", ") || "Không chọn";
  const filtered = occasionId ? garmentCatalog.filter((item) => occasionSuggestions.find((occasion) => occasion.id === occasionId)?.garmentIds.includes(item.id)) : garmentCatalog;
  const occasionName = occasionSuggestions.find((occasion) => occasion.id === occasionId)?.displayName;

  function openRoom(id: string) {
    setOutfit((current) => selectGarment(current, id));
    setColorPresetId("original");
    setOccasionOpen(false);
    setView("room");
  }

  function changeGarment(id: string) {
    setOutfit((current) => selectGarment(current, id));
    setColorPresetId("original");
  }

  const colorPreset = colorPresets.find((preset) => preset.id === colorPresetId)!;

  return (
    <div className="atelier-app">
      <header className="site-header">
        <button className="brand" type="button" onClick={() => setView("gallery")} aria-label="Về phòng trưng bày">
          <span className="brand-mark">V<span>•</span>P</span>
          <span className="brand-name">VIỆT PHỤC <em>REMIX</em></span>
        </button>
        <nav className="top-nav" aria-label="Điều hướng chính">
          <span className="top-nav-label">TRẢI NGHIỆM TƯƠNG TÁC</span>
          <button className="top-nav-button" type="button" onClick={() => setView("gallery")}>Bộ sưu tập</button>
          <button className="top-nav-button occasion-trigger" type="button" aria-expanded={occasionOpen} onClick={() => setOccasionOpen((open) => !open)}>Chọn theo dịp <span aria-hidden="true">⌄</span></button>
        </nav>
      </header>
      {occasionOpen && <div className="occasion-menu" role="group" aria-label="Chọn theo dịp">
        <p>GỢI Ý PHỐI ĐỒ ĐƯƠNG ĐẠI</p>
        {occasionSuggestions.map((occasion) => <button key={occasion.id} type="button" onClick={() => { setOccasionId(occasion.id); setOccasionOpen(false); setView("gallery"); }}>{occasion.displayName}<span aria-hidden="true">↗</span></button>)}
        {occasionId && <button type="button" onClick={() => { setOccasionId(null); setOccasionOpen(false); }}>Xem tất cả trang phục <span aria-hidden="true">×</span></button>}
      </div>}
      <main ref={sceneRef} className={`main-scene view-${view}`}>
        <div className="scene-art" ref={stageRef} style={{ backgroundImage: `url(${roomImage})` }} aria-hidden="true" />
        <div className="scene-tint" aria-hidden="true" />
        <div className="scene-foreground" ref={foregroundRef} style={{ backgroundImage: `url(${foregroundImage})` }} aria-hidden="true" />
        {view === "gallery" ? <>
          <section className="gallery-intro scene-enter">
            <span className="eyebrow"><i /> KHÔNG GIAN VIỆT PHỤC · 2026</span>
            <h1 ref={headingRef}>Di sản trong<br /><em>nhịp sống mới.</em></h1>
            <p>Khám phá, thử phối và kể câu chuyện của bạn qua những dáng áo Việt.</p>
            {occasionName && <button className="occasion-chip" type="button" onClick={() => setOccasionId(null)}>Dịp: {occasionName} <span aria-hidden="true">×</span></button>}
          </section>
          <section className="gallery-grid" aria-label="Chọn trang phục">
            {filtered.map((item) => <button className="garment-card scene-enter" key={item.id} type="button" aria-label={item.shortName} onClick={() => openRoom(item.id)}>
              <span className="card-index">{numbers[garmentCatalog.findIndex((entry) => entry.id === item.id)]}</span>
              <span className="card-figure" style={{ backgroundImage: `url(${previews[item.id]})` }} aria-hidden="true" />
              <span className="card-content"><span className="card-caption">KHÁM PHÁ TRANG PHỤC</span><strong>{item.shortName}</strong><span className="card-link">Bước vào phòng thử <b aria-hidden="true">↗</b></span></span>
            </button>)}
          </section>
          <div className="gallery-foot scene-enter"><span>CHẠM VÀO TRANG PHỤC ĐỂ BẮT ĐẦU</span><span>CUỘN ĐỂ KHÁM PHÁ ↓</span></div>
        </> : <div className="room-layout">
          <div className="room-visual scene-enter">
            <button className="back-button" type="button" onClick={() => setView("gallery")}>← <span>Về phòng trưng bày</span></button>
            <span className="room-number">PHÒNG THỬ / {numbers[garmentCatalog.findIndex((item) => item.id === garment.id)]}</span>
            <div className="character-stage"><OutfitComposer characterId="base_01" garmentId={outfit.garmentId} garmentFilter={colorPreset.filter} layerVisibility={layerVisibility} className="atelier-composer" /></div>
            <span className="stage-caption">MINH HỌA PHỐI ĐỒ · PHONG CÁCH ANIME</span>
          </div>
          <section className="style-panel scene-enter" aria-label="Điều chỉnh bản phối">
            <span className="eyebrow"><i /> XƯỞNG PHỐI ĐỒ VIỆT</span>
            <h1 ref={headingRef} tabIndex={-1}>{view === "result" ? "Bản phối của bạn" : garment.shortName}</h1>
            <p className="panel-lead">{view === "result" ? "Một góc nhìn mới, được phối theo phong cách của riêng bạn." : "Chọn chi tiết bạn thích và xem trang phục thay đổi ngay trên nhân vật."}</p>
            {view === "room" ? <>
              <div className="control-section"><div className="section-heading"><span>01</span><h2>Trang phục</h2></div><div className="garment-switch" role="group" aria-label="Loại trang phục">{garmentCatalog.map((item) => <button key={item.id} type="button" aria-pressed={item.id === outfit.garmentId} onClick={() => changeGarment(item.id)}>{item.shortName}</button>)}</div><div className="accessory-options layer-options" role="group" aria-label="Lớp trang phục">{([{"id":"torso","label":"Áo"},{"id":"pants","label":"Quần"}] as const).map((layer) => <label key={layer.id}><input type="checkbox" checked={visibleIds.includes(layer.id)} onChange={() => setOutfit((current) => toggleRequiredLayer(current, layer.id))} /><span className="accessory-check" aria-hidden="true">✓</span><span>{layer.label}</span></label>)}</div></div>
              <div className="control-section"><div className="section-heading"><span>02</span><h2>Màu sắc</h2></div><div className="color-options" role="group" aria-label="Màu trang phục">{colorPresets.map((preset) => <button key={preset.id} className={`color-option color-${preset.id}`} type="button" aria-pressed={preset.id === colorPresetId} onClick={() => setColorPresetId(preset.id)}><span className="color-swatch" style={preset.id === "original" ? { background: originalSwatches[outfit.garmentId] } : undefined} aria-hidden="true" />{preset.label}</button>)}</div><p className="color-note">Màu phối minh họa trực tiếp, không thay đổi hoa văn gốc.</p></div>
              <div className="control-section"><div className="section-heading"><span>03</span><h2>Phụ kiện</h2></div><div className="accessory-options">{garment.optionalAccessories.map((accessory) => <label key={accessory.id}><input type="checkbox" checked={outfit.accessoryIds.includes(accessory.id)} onChange={() => setOutfit((current) => toggleAccessory(current, accessory.id))} /><span className="accessory-check" aria-hidden="true">✓</span><span>{accessory.displayName}</span></label>)}</div></div>
              <button className="primary-action" type="button" onClick={() => setView("result")}>Xem bản phối <span aria-hidden="true">↗</span></button>
            </> : <>
              <div className="result-summary"><span className="summary-kicker">BẢN PHỐI HIỆN TẠI</span><strong>{garment.shortName}</strong><p>Lớp trang phục: {visibleRequiredNames}</p><p>Màu minh họa: {colorPreset.label}</p><p>Phụ kiện: {outfit.accessoryIds.length ? garment.optionalAccessories.filter((item) => outfit.accessoryIds.includes(item.id)).map((item) => item.displayName).join(", ") : "Không chọn"}</p></div>
              <button className="primary-action" type="button" onClick={() => setView("room")}>Tiếp tục phối <span aria-hidden="true">↗</span></button>
            </>}
            <aside className="culture-note"><span>GHI CHÚ VĂN HÓA</span><p>{pendingCulturalCopy}</p></aside>
          </section>
        </div>}
      </main>
      <footer className="site-footer"><span>VIỆT PHỤC REMIX</span><span>Khám phá vẻ đẹp Việt qua góc nhìn mới</span><span>© 2026</span></footer>
    </div>
  );
}
