import { useState, useEffect, FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabase";
import { Button } from "../../components/ui/Button";
import { HiExclamationCircle, HiCheckCircle } from "react-icons/hi2";
import { useI18n } from "../../i18n/LanguageContext";

type LinkState = "checking" | "valid" | "invalid";

export default function ResetPasswordPage() {
  const { t } = useI18n();
  const { updatePassword } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [linkState, setLinkState] = useState<LinkState>("checking");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const passwordsMatch = confirmPassword.length === 0 || password === confirmPassword;

  // The recovery link either drops tokens in the URL hash (picked up automatically
  // by supabase-js) or passes a `token_hash` we have to exchange ourselves.
  useEffect(() => {
    let cancelled = false;

    async function verifyLink() {
      const errorDescription = searchParams.get("error_description");
      if (errorDescription) {
        if (!cancelled) {
          setError(errorDescription);
          setLinkState("invalid");
        }
        return;
      }

      const tokenHash = searchParams.get("token_hash");
      if (tokenHash) {
        const { error: otpError } = await supabase.auth.verifyOtp({
          type: "recovery",
          token_hash: tokenHash,
        });
        if (!cancelled) {
          if (otpError) {
            setError(otpError.message);
            setLinkState("invalid");
          } else {
            setLinkState("valid");
          }
        }
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!cancelled) {
        setLinkState(session ? "valid" : "invalid");
      }
    }

    verifyLink();
    return () => {
      cancelled = true;
    };
  }, [searchParams]);

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
      await updatePassword(password);
      setDone(true);
      setTimeout(() => navigate("/"), 2000);
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message;
      setError(message || t("auth.resetPasswordFailed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
          {t("auth.resetPasswordTitle")}
        </h1>
        <p className="text-sm text-gray-500 text-center mb-8">{t("auth.resetPasswordSubtitle")}</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {linkState === "checking" && (
          <p className="text-center text-sm text-gray-400">{t("common.loading")}</p>
        )}

        {linkState === "invalid" && (
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">{t("auth.resetLinkInvalid")}</p>
            <Link to="/forgot-password">
              <Button size="lg" className="w-full">
                {t("auth.sendResetLink")}
              </Button>
            </Link>
          </div>
        )}

        {linkState === "valid" && done && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-start gap-2">
            <HiCheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <span>{t("auth.resetPasswordSuccess")}</span>
          </div>
        )}

        {linkState === "valid" && !done && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("auth.newPassword")}
              </label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("auth.confirmPassword")}
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`form-input ${
                  !passwordsMatch ? "border-red-300 focus:ring-red-400 bg-red-50" : ""
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
              {t("auth.savePassword")}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
