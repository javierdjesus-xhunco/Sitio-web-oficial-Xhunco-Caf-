import LottieLoader from "./LottieLoader";

export default function LoadingOverlay({ label = "Cargando..." }) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-5">
        <LottieLoader size={160} />

        <p className="text-sm font-medium text-gray-900">
          {label}
        </p>
      </div>
    </div>
  );
}