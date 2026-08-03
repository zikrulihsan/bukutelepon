import { Link } from "react-router-dom";
import { useI18n } from "../../i18n/LanguageContext";

export function ContributionWall() {
  const { t } = useI18n();

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
      <div className="text-3xl mb-3">🔒</div>
      <h3 className="text-base font-bold text-gray-900 mb-1">{t("wall.title")}</h3>
      <p className="text-xs text-gray-500 mb-5 max-w-xs mx-auto leading-relaxed">
        {t("wall.subtitle")}
      </p>
      <div className="flex gap-2.5 justify-center">
        <Link
          to="/login"
          className="inline-block bg-primary-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-800 active:scale-95 transition-all"
        >
          {t("auth.login")}
        </Link>
        <Link
          to="/register"
          className="inline-block bg-gray-100 text-gray-700 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-200 active:scale-95 transition-all"
        >
          {t("auth.registerFree")}
        </Link>
      </div>
    </div>
  );
}
