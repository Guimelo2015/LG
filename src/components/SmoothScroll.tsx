"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

/** Rolagem suave com inércia leve (Lenis). Links "#âncora" também deslizam até a seção. */
export default function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.085, // menor = mais inércia
      wheelMultiplier: 0.95,
      smoothWheel: true,
      anchors: true, // o espaço do menu fixo vem do scroll-padding-top no CSS
      autoRaf: true,
      respectReducedMotion: false, // decisão do autor: animação sempre ligada
    });
    return () => lenis.destroy();
  }, []);
  return null;
}
