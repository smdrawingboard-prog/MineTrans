import { useEffect, useState } from "react";

interface CriticalFailureAnimationProps {
  /** Called once the animation has finished playing. */
  onComplete: () => void;
  durationMs?: number;
}

/**
 * Full-screen "critical failure" sequence shown when a learner fails a quiz
 * or the final exam. Intentionally has no skip/dismiss control — onComplete
 * only fires when the animation timeline finishes, so callers can gate
 * navigation on it.
 */
export default function CriticalFailureAnimation({
  onComplete,
  durationMs = 2800,
}: CriticalFailureAnimationProps) {
  const [stage, setStage] = useState<"impact" | "alarm" | "resolve">("impact");

  useEffect(() => {
    const toAlarm = setTimeout(() => setStage("alarm"), 400);
    const toResolve = setTimeout(() => setStage("resolve"), durationMs - 500);
    const finish = setTimeout(onComplete, durationMs);
    return () => {
      clearTimeout(toAlarm);
      clearTimeout(toResolve);
      clearTimeout(finish);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [durationMs]);

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black overflow-hidden ${
        stage === "impact" ? "cf-flash" : ""
      }`}
    >
      <div className="cf-scanlines" />
      <div
        className={`absolute inset-0 border-[10px] border-red-600/80 transition-opacity duration-500 ${
          stage === "resolve" ? "opacity-0" : "opacity-100 cf-pulse-border"
        }`}
      />

      <div
        style={{ fontFamily: "'Inter', sans-serif" }}
        className={`relative text-center px-6 transition-all duration-500 ${
          stage === "resolve" ? "opacity-0 scale-95" : "opacity-100 scale-100 cf-shake"
        }`}
      >
        <div className="text-red-500 text-7xl mb-4 cf-pulse">⚠</div>
        <p className="tracking-[0.4em] text-red-500 text-sm mb-2">
          MINETRANS RISK SIMULATION
        </p>
        <h2 className="text-4xl md:text-5xl font-extrabold text-red-500 uppercase tracking-wide cf-pulse">
          Critical Failure
        </h2>
        <p className="mt-4 text-red-300 text-sm max-w-md mx-auto">
          Insufficient risk assessment detected. Review the methodology before
          re-attempting.
        </p>
      </div>

      <style>{`
        @keyframes cf-flash-kf {
          0%, 100% { background-color: #000; }
          10%, 30%, 50% { background-color: #7f1d1d; }
          20%, 40% { background-color: #000; }
        }
        .cf-flash { animation: cf-flash-kf 0.4s steps(1, end) 1; }

        @keyframes cf-pulse-border-kf {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        .cf-pulse-border { animation: cf-pulse-border-kf 0.6s ease-in-out infinite; }

        @keyframes cf-pulse-kf {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.55; }
        }
        .cf-pulse { animation: cf-pulse-kf 0.7s ease-in-out infinite; }

        @keyframes cf-shake-kf {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        .cf-shake { animation: cf-shake-kf 0.5s ease-in-out 2; }

        .cf-scanlines {
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            to bottom,
            rgba(255, 0, 0, 0.06) 0px,
            rgba(255, 0, 0, 0.06) 1px,
            transparent 1px,
            transparent 3px
          );
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
