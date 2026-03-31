import { useState, useEffect, useRef } from "react";

const ONBOARDING_KEY = "bukutelepon_onboarding_done";

interface OnboardingTutorialProps {
  /** Trigger the tutorial to show */
  show: boolean;
  onComplete: () => void;
}

export function OnboardingTutorial({ show, onComplete }: OnboardingTutorialProps) {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Steps configuration
  const steps = [
    {
      // Target the "Kontribusi" button in bottom nav (4th button, 0-indexed = 3)
      getTarget: () => {
        const bottomNav = document.querySelector('.fixed.bottom-0 .grid');
        if (!bottomNav) return null;
        return bottomNav.children[3] as HTMLElement;
      },
      title: "Bantu Lengkapi Kontak Di Kotamu! 🤝",
      description: "Kamu bisa menambahkan kontak penting ke portal ini agar bermanfaat bagi warga di kotamu.",
      buttonText: "Mengerti!",
    },
  ];

  useEffect(() => {
    if (show && !hasSeenOnboarding()) {
      // Small delay so the page renders first
      const timer = setTimeout(() => {
        setVisible(true);
        updateSpotlight();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [show]);

  useEffect(() => {
    if (!visible) return;
    updateSpotlight();

    function handleResize() {
      updateSpotlight();
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [visible, step]);

  function updateSpotlight() {
    const currentStep = steps[step];
    if (!currentStep) return;
    const target = currentStep.getTarget();
    if (target) {
      setSpotlightRect(target.getBoundingClientRect());
    }
  }

  function hasSeenOnboarding() {
    try {
      return localStorage.getItem(ONBOARDING_KEY) === "true";
    } catch {
      return false;
    }
  }

  function markOnboardingDone() {
    try {
      localStorage.setItem(ONBOARDING_KEY, "true");
    } catch { /* noop */ }
  }

  function handleNext() {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      markOnboardingDone();
      setVisible(false);
      onComplete();
    }
  }

  function handleSkip() {
    markOnboardingDone();
    setVisible(false);
    onComplete();
  }

  if (!visible || !spotlightRect) return null;

  const currentStep = steps[step];
  const padding = 8;

  return (
    <div className="fixed inset-0 z-[100]" style={{ pointerEvents: "auto" }}>
      {/* Dark overlay with rounded spotlight cutout using SVG mask */}
      <svg
        className="absolute inset-0 w-full h-full transition-all duration-500"
        onClick={handleSkip}
      >
        <defs>
          <mask id="spotlight-mask">
            <rect width="100%" height="100%" fill="white" />
            <rect
              x={spotlightRect.left - padding}
              y={spotlightRect.top - padding}
              width={spotlightRect.width + padding * 2}
              height={spotlightRect.height + padding * 2}
              rx={16}
              ry={16}
              fill="black"
            />
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.75)"
          mask="url(#spotlight-mask)"
        />
      </svg>

      {/* Pulse ring around highlighted element */}
      <div
        className="absolute rounded-2xl animate-onboarding-pulse"
        style={{
          left: spotlightRect.left - padding,
          top: spotlightRect.top - padding,
          width: spotlightRect.width + padding * 2,
          height: spotlightRect.height + padding * 2,
          pointerEvents: "none",
        }}
      />

      {/* Spotlight border glow */}
      <div
        className="absolute rounded-2xl border-2 border-[#6EE7B7] shadow-[0_0_20px_rgba(110,231,183,0.4)]"
        style={{
          left: spotlightRect.left - padding,
          top: spotlightRect.top - padding,
          width: spotlightRect.width + padding * 2,
          height: spotlightRect.height + padding * 2,
          pointerEvents: "none",
        }}
      />

      {/* Tooltip card - positioned above the spotlight */}
      <div
        ref={tooltipRef}
        className="fixed animate-fade-in-up"
        style={{
          left: 16,
          right: 16,
          bottom: `${window.innerHeight - spotlightRect.top + 16}px`,
          maxWidth: 360,
          margin: "0 auto",
        }}
      >
        <div className="bg-white rounded-2xl shadow-2xl p-5 relative">
          {/* Arrow pointing down toward the target */}
          <div
            className="absolute -bottom-2 w-4 h-4 bg-white rotate-45 shadow-lg"
            style={{
              left: `${Math.min(Math.max(spotlightRect.left + spotlightRect.width / 2 - 16, 24), (window.innerWidth - 32 - 24))}px`,
              zIndex: -1,
            }}
          />

          {/* Step indicator dots */}
          {steps.length > 1 && (
            <div className="flex gap-1.5 mb-3">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 rounded-full transition-all duration-300 ${i === step ? "w-5 bg-primary-600" : "w-1.5 bg-gray-200"
                    }`}
                />
              ))}
            </div>
          )}

          {/* Content */}
          <h3 className="text-base font-bold text-gray-900 mb-1.5">
            {currentStep.title}
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            {currentStep.description}
          </p>

          {/* Actions */}
          <div className="flex items-center justify-between">
            {/* <button
              onClick={handleSkip}
              className="text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors"
            >
              Lewati
            </button> */}
            <button
              onClick={handleNext}
              className="px-5 py-2 bg-primary-700 text-white text-sm font-semibold rounded-xl active:scale-95 transition-all hover:bg-primary-800 shadow-sm"
            >
              {currentStep.buttonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Check if onboarding has been completed */
export function hasCompletedOnboarding(): boolean {
  try {
    return localStorage.getItem(ONBOARDING_KEY) === "true";
  } catch {
    return false;
  }
}
