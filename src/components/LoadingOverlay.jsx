import Image from "next/image";
import LottieLoader from "./LottieLoader";

export default function LoadingOverlay({ label }) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        {/* Logo */}
        <Image
          src="/brand/logo-xhunco.png"
          alt="Xhunco Café"
          width={120}
          height={120}
          priority
        />

        {/* Animación .lottie */}
        <LottieLoader size={180} />

        <p className="text-sm text-black">{label}</p>
      </div>
    </div>
  );
}
