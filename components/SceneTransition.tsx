"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export interface SceneDefinition {
  id: string;
  index: number;
  background: string;
  foreground?: string;
}

function loadScene(scene: SceneDefinition) {
  const sources = [scene.background, scene.foreground].filter(Boolean) as string[];
  return Promise.all(sources.map((src) => new Promise<boolean>((resolve) => {
    const image = new window.Image();
    image.onload = () => { void image.decode?.().catch(() => undefined).finally(() => resolve(true)); };
    image.onerror = () => resolve(false);
    image.src = src;
  }))).then((results) => results.every(Boolean));
}

interface SceneTransitionProps {
  scene: SceneDefinition;
  reducedMotion: boolean;
  view: "gallery" | "room" | "result";
  preloadScenes: SceneDefinition[];
}

function ScenePlate({ scene, slot, hidden = false }: { scene: SceneDefinition; slot: "current" | "incoming"; hidden?: boolean }) {
  return <div className="scene-plate" data-scene-plate={slot} aria-hidden="true" style={hidden ? { visibility: "hidden" } : undefined}>
    <div className="scene-art" style={{ backgroundImage: `url(${scene.background})` }} />
    {scene.foreground && <div className="scene-foreground" style={{ backgroundImage: `url(${scene.foreground})` }} />}
  </div>;
}

export default function SceneTransition({ scene, reducedMotion, view, preloadScenes }: SceneTransitionProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const requestRef = useRef(0);
  const previousView = useRef(view);
  const [current, setCurrent] = useState(scene);
  const [incoming, setIncoming] = useState<SceneDefinition | null>(null);

  useEffect(() => {
    preloadScenes.forEach((item) => { void loadScene(item); });
  }, [preloadScenes]);

  useEffect(() => {
    const request = ++requestRef.current;
    timelineRef.current?.kill();
    Promise.resolve().then(() => { if (requestRef.current === request) setIncoming(null); });
    if (scene.id === current.id) {
      return;
    }
    void loadScene(scene).then((ready) => {
      if (ready && requestRef.current === request) setIncoming(scene);
    });
  }, [scene, current.id]);

  useEffect(() => {
    if (!rootRef.current || previousView.current === view || incoming) return;
    const plate = rootRef.current.querySelector('[data-scene-plate="current"]');
    const enteringRoom = previousView.current === "gallery" && view !== "gallery";
    previousView.current = view;
    if (!plate || reducedMotion) return;
    const context = gsap.context(() => {
      gsap.fromTo(plate, { scale: enteringRoom ? 0.965 : 1.035 }, { scale: 1, duration: 0.72, ease: "power3.inOut" });
    }, rootRef);
    return () => context.revert();
  }, [view, incoming, reducedMotion]);

  useEffect(() => {
    if (!incoming || !rootRef.current) return;
    const nextScene = incoming;
    const animationRequest = requestRef.current;
    const currentPlate = rootRef.current.querySelector<HTMLElement>('[data-scene-plate="current"]');
    const incomingPlate = rootRef.current.querySelector<HTMLElement>('[data-scene-plate="incoming"]');
    if (!currentPlate || !incomingPlate) return;
    const direction = incoming.index >= current.index ? 1 : -1;
    const context = gsap.context(() => {
      timelineRef.current?.kill();
      if (reducedMotion) {
        timelineRef.current = gsap.timeline({ onComplete: finish })
          .set(incomingPlate, { visibility: "visible", autoAlpha: 0 })
          .to(currentPlate, { autoAlpha: 0, duration: 0.12 }, 0)
          .to(incomingPlate, { autoAlpha: 1, duration: 0.16 }, 0.04);
        return;
      }
      gsap.set([currentPlate, incomingPlate], { willChange: "transform, opacity" });
      timelineRef.current = gsap.timeline({ defaults: { ease: "power3.inOut" }, onComplete: finish })
        .set(incomingPlate, { visibility: "visible", autoAlpha: 0, xPercent: direction * 7, scale: 1.055 })
        .to(currentPlate, { autoAlpha: 0, xPercent: direction * -5, scale: 0.97, duration: 0.9 }, 0)
        .to(incomingPlate, { autoAlpha: 1, xPercent: 0, scale: 1, duration: 0.9 }, 0);
      const foreground = incomingPlate.querySelector(".scene-foreground");
      if (foreground) timelineRef.current.fromTo(foreground, { xPercent: direction * 4 }, { xPercent: 0, duration: 0.78 }, 0.1);
    }, rootRef);
    function finish() {
      if (requestRef.current !== animationRequest || scene.id !== nextScene.id) return;
      gsap.set([currentPlate, incomingPlate], { clearProps: "willChange" });
      setCurrent(nextScene);
      setIncoming(null);
    }
    return () => context.revert();
  }, [incoming, current.index, reducedMotion, scene.id]);

  return <div className="scene-transition" ref={rootRef}>
    <ScenePlate key={`current:${current.id}`} scene={current} slot="current" />
    <ScenePlate key={`incoming:${incoming?.id ?? current.id}`} scene={incoming ?? current} slot="incoming" hidden={!incoming} />
  </div>;
}
