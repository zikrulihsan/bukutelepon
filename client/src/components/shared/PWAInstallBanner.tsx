import { useState, useEffect, useRef } from "react";
import { HiXMark, HiOutlinePlusCircle } from "react-icons/hi2";
import { HiOutlineShare } from "react-icons/hi";
import { useI18n } from "../../i18n/LanguageContext";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const DISMISSED_KEY = "pwa_install_dismissed";
const DISMISSED_EXPIRY_DAYS = 7;
const VISIT_COUNT_KEY = "pwa_install_authenticated_home_visit_count_v2";
const MIN_HOME_VISITS_BEFORE_PROMPT = 3;

const IS_DEV = import.meta.env.DEV;

function isDismissed(): boolean {
  // In dev, never treat as dismissed so it's always testable
  if (IS_DEV) return false;
  try {
    const raw = localStorage.getItem(DISMISSED_KEY);
    if (!raw) return false;
    const { ts } = JSON.parse(raw);
    const diffDays = (Date.now() - ts) / (1000 * 60 * 60 * 24);
    return diffDays < DISMISSED_EXPIRY_DAYS;
  } catch {
    return false;
  }
}

function markDismissed() {
  if (IS_DEV) return; // don't persist dismissal in dev
  try {
    localStorage.setItem(DISMISSED_KEY, JSON.stringify({ ts: Date.now() }));
  } catch { /* noop */ }
}

function recordHomeVisit(): boolean {
  try {
    const visits = Number.parseInt(localStorage.getItem(VISIT_COUNT_KEY) ?? "0", 10);
    const nextVisitCount = Number.isFinite(visits) ? visits + 1 : 1;
    localStorage.setItem(VISIT_COUNT_KEY, String(nextVisitCount));
    return nextVisitCount >= MIN_HOME_VISITS_BEFORE_PROMPT;
  } catch {
    return false;
  }
}

function isIOS(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isInStandaloneMode(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window.navigator as any).standalone === true
  );
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallBanner() {
  const { t } = useI18n();
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIOSHint, setShowIOSHint] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [eligibleByVisitCount, setEligibleByVisitCount] = useState(false);
  const countedHomeVisitRef = useRef(false);

  // Count only authenticated homepage visits. Route changes away from home
  // re-arm the counter so a later return counts as another visit.
  useEffect(() => {
    const isEligiblePage = location.pathname === "/" && !authLoading && Boolean(user);
    if (!isEligiblePage) {
      countedHomeVisitRef.current = false;
      setEligibleByVisitCount(false);
      return;
    }
    if (countedHomeVisitRef.current) return;
    countedHomeVisitRef.current = true;
    setEligibleByVisitCount(recordHomeVisit());
  }, [authLoading, location.pathname, user]);

  // Capture Chrome's one-shot event even when the user has not yet reached the
  // visit threshold. It can be offered later without losing the browser event.
  useEffect(() => {
    function handleBeforeInstall(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    }
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  useEffect(() => {
    const canShow =
      location.pathname === "/" &&
      !authLoading &&
      Boolean(user) &&
      eligibleByVisitCount &&
      !isInStandaloneMode() &&
      !isDismissed();

    if (!canShow) {
      setAnimateIn(false);
      setVisible(false);
      setShowIOSHint(false);
      return;
    }

    if (deferredPrompt) {
      triggerShow();
      return;
    }

    let revealTimer: ReturnType<typeof setTimeout> | undefined;
    if (isIOS()) {
      revealTimer = setTimeout(() => {
        setShowIOSHint(true);
        triggerShow();
      }, 2500);
    } else if (IS_DEV) {
      revealTimer = setTimeout(() => {
        triggerShow();
      }, 2000);
    }

    return () => {
      if (revealTimer) clearTimeout(revealTimer);
    };
  }, [authLoading, deferredPrompt, eligibleByVisitCount, location.pathname, user]);

  function triggerShow() {
    setVisible(true);
    setTimeout(() => setAnimateIn(true), 50);
  }

  function dismiss() {
    setAnimateIn(false);
    markDismissed();
    setTimeout(() => setVisible(false), 350);
  }

  async function handleInstall() {
    if (!deferredPrompt) return;
    setInstalling(true);
    try {
      await deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      if (result.outcome === "accepted") dismiss();
    } finally {
      setInstalling(false);
      setDeferredPrompt(null);
    }
  }

  if (!visible || location.pathname !== "/" || authLoading || !user) return null;

  const isIOSMode = showIOSHint && !deferredPrompt;

  return (
    <div
      className={`fixed bottom-[76px] left-0 right-0 z-50 flex justify-center px-4 pointer-events-none transition-all duration-[350ms] ease-out ${
        animateIn ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      }`}
    >
      <div className="w-full max-w-md pointer-events-auto">
        <div className="relative bg-[#0d3b2e] rounded-2xl shadow-2xl overflow-hidden">
          {/* Decorative ambient glow */}
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-[#6ee7b7] opacity-20 rounded-full blur-2xl pointer-events-none" />

          <div className="relative flex items-center gap-3 px-4 py-3.5">
            {/* App icon */}
            <div className="flex-shrink-0">
              <img
                src="/pwa-192.png"
                alt="CariKontak"
                className="w-11 h-11 rounded-[13px] shadow-md"
                onError={(e) => {
                  // Fallback in dev if icon isn't available yet
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              {isIOSMode ? (
                <>
                  <p className="text-white text-[13px] font-bold leading-tight">
                    {t("pwa.iosTitle")}
                  </p>
                  <p className="text-[#6ee7b7]/80 text-[11px] mt-0.5 leading-tight">
                    {t("pwa.iosTap")} <HiOutlineShare className="inline h-3.5 w-3.5" /> {t("pwa.iosThen")}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-white text-[13px] font-bold leading-tight">
                    {t("pwa.title")}
                  </p>
                  <p className="text-[#6ee7b7]/80 text-[11px] mt-0.5 leading-tight">
                    {t("pwa.subtitle")}
                  </p>
                </>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {deferredPrompt && (
                <button
                  onClick={handleInstall}
                  disabled={installing}
                  className="px-4 py-2 bg-[#6ee7b7] text-[#0d3b2e] text-[12px] font-bold rounded-xl active:scale-95 transition-all disabled:opacity-60 whitespace-nowrap shadow-sm"
                >
                  {installing ? "..." : t("pwa.install")}
                </button>
              )}
              {/* Dev label */}
              {IS_DEV && !deferredPrompt && !isIOSMode && (
                <span className="text-[10px] text-white/30 font-mono mr-1">DEV</span>
              )}
              <button
                onClick={dismiss}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-white/10 text-white/60 hover:bg-white/20 active:scale-90 transition-all"
                aria-label={t("common.close")}
              >
                <HiXMark className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* iOS step-by-step hint bar */}
          {isIOSMode && (
            <div className="px-4 pb-3.5">
              <div className="flex items-center gap-2.5 bg-white/10 rounded-xl px-3 py-2.5">
                <Step number="1" />
                <span className="text-[11px] text-white/70">{t("pwa.iosTap")}</span>
                <HiOutlineShare className="h-3.5 w-3.5 text-white flex-shrink-0" />
                <div className="w-px h-3 bg-white/20 flex-shrink-0" />
                <Step number="2" />
                <span className="text-[11px] text-white/70 truncate">{t("pwa.addToHome")}</span>
                <HiOutlinePlusCircle className="h-3.5 w-3.5 text-[#6ee7b7] flex-shrink-0 ml-auto" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Step({ number }: { number: string }) {
  return (
    <span className="w-4 h-4 rounded-full bg-[#6ee7b7]/20 text-[#6ee7b7] text-[9px] font-bold flex items-center justify-center flex-shrink-0">
      {number}
    </span>
  );
}
