import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../../components/ui/Button";
import { HiExclamationCircle, HiCheckCircle } from "react-icons/hi2";
import { useI18n } from "../../i18n/LanguageContext";

export default function RegisterPage() {
  const { t } = useI18n();
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const passwordsMatch = confirmPassword.length === 0 || password === confirmPassword;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError(t("auth.passwordMismatchError"));
      setLoading(false);
      return;
    }

    try {
      await signUp(email, password, name);
      navigate("/");
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        || (err as { message?: string })?.message
        || t("auth.registerFailed");
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-8">{t("auth.registerTitle")}</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("auth.fullName")}</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("auth.email")}</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("auth.password")}</label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
            />
            <p className="text-xs text-gray-400 mt-1">{t("auth.minChars")}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("auth.confirmPassword")}</label>
            <input
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`form-input ${
                !passwordsMatch
                  ? "border-red-300 focus:ring-red-400 bg-red-50"
                  : ""
              }`}
            />
            {!passwordsMatch && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <HiExclamationCircle className="h-3 w-3" />
                {t("auth.passwordMismatch")}
              </p>
            )}
            {passwordsMatch && confirmPassword.length > 0 && (
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <HiCheckCircle className="h-3 w-3" />
                {t("auth.passwordMatch")}
              </p>
            )}
          </div>

          <Button type="submit" size="lg" loading={loading} disabled={!passwordsMatch} className="w-full">
            {t("auth.register")}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          {t("auth.haveAccount")}{" "}
          <Link to="/login" className="text-primary-700 hover:underline">
            {t("auth.login")}
          </Link>
        </p>
      </div>
    </div>
  );
}
