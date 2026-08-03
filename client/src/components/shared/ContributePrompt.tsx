import { useGuest } from "../../context/GuestContext";
import { useI18n } from "../../i18n/LanguageContext";

export function ContributePrompt() {
  const { guestSession } = useGuest();
  const { t } = useI18n();

  if (!guestSession || guestSession.remaining > 0) return null;

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
      <p className="text-yellow-800 text-sm font-medium">
        {t("guest.limitReached", { count: guestSession.threshold })}
      </p>
    </div>
  );
}
