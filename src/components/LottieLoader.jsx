"use client";

import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export default function LottieLoader({ size = 180 }) {
  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {/* Fallback inmediato mientras carga la animación */}
      <div className="absolute h-10 w-10 animate-spin rounded-full border-2 border-[#31572c]/20 border-t-[#31572c]" />

      <DotLottieReact
        src="/animations/coffee-loader.lottie"
        loop
        autoplay
        style={{
          width: size,
          height: size,
          position: "relative",
          zIndex: 1,
        }}
      />
    </div>
  );
}