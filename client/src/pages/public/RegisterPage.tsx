import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../../components/ui/Button";
import { HiExclamationCircle, HiCheckCircle } from "react-icons/hi2";

export default function RegisterPage() {
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
      setError("Password dan konfirmasi password tidak cocok");
      setLoading(false);
      return;
    }

    try {
      await signUp(email, password, name);
      navigate("/");
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        || (err as { message?: string })?.message
        || "Registrasi gagal";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold text-gray-900 text-center mb-8">Daftar</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-400 mt-1">Minimal 8 karakter</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password</label>
          <input
            type="password"
            required
            minLength={8}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:border-transparent transition-colors ${
              !passwordsMatch
                ? "border-red-300 focus:ring-red-400 bg-red-50/50"
                : "border-gray-300 focus:ring-primary-500"
            }`}
          />
          {!passwordsMatch && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <HiExclamationCircle className="h-3 w-3" />
              Password tidak cocok
            </p>
          )}
          {passwordsMatch && confirmPassword.length > 0 && (
            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
              <HiCheckCircle className="h-3 w-3" />
              Password cocok
            </p>
          )}
        </div>

        <Button type="submit" size="lg" loading={loading} disabled={!passwordsMatch} className="w-full">
          Daftar
        </Button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Sudah punya akun?{" "}
        <Link to="/login" className="text-primary-600 hover:underline">
          Masuk
        </Link>
      </p>
    </div>
  );
}
