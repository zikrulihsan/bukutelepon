import { useGuest } from "../../context/GuestContext";

export function ContributePrompt() {
  const { guestSession } = useGuest();

  if (!guestSession || guestSession.remaining > 0) return null;

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
      <p className="text-yellow-800 text-sm font-medium">
        Anda telah melihat {guestSession.threshold} kontak gratis. Daftar dan
        kontribusi untuk akses penuh!
      </p>
    </div>
  );
}
