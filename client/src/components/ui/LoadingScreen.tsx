import { LogoMark } from "@/components/brand/Logo";

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-ahmedify-bg animate-fadeIn">
      <div className="flex flex-col items-center gap-4">
        <LogoMark size={56} glow />
        <h1 className="text-2xl font-bold tracking-tight text-ahmedify-text">
          Mus<span className="text-ahmedify-green">ify</span>
        </h1>
        <p className="text-sm text-ahmedify-text-secondary">
          Loading your music...
        </p>
        <div className="flex gap-1.5 mt-1" aria-hidden="true">
          <span
            className="h-2 w-2 rounded-full bg-ahmedify-green animate-pulseDot"
            style={{ animationDelay: "0ms" }}
          />
          <span
            className="h-2 w-2 rounded-full bg-ahmedify-green animate-pulseDot"
            style={{ animationDelay: "160ms" }}
          />
          <span
            className="h-2 w-2 rounded-full bg-ahmedify-green animate-pulseDot"
            style={{ animationDelay: "320ms" }}
          />
        </div>
      </div>
    </div>
  );
}
