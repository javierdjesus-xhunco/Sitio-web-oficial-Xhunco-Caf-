"use client";

import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export default function LottieLoader({ size = 180 }) {
  return (
    <DotLottieReact
      src="/animations/coffee-loader.lottie"
      loop
      autoplay
      style={{ width: size, height: size }}
    />
  );
}
