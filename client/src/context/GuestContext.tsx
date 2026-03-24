import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { apiClient } from "../lib/axios";
import type { GuestSession } from "../types";

interface GuestState {
  guestSession: GuestSession | null;
  trackView: (contactId: string) => Promise<GuestSession>;
  checkStatus: () => Promise<void>;
  isLocked: boolean;
}

const GuestContext = createContext<GuestState | undefined>(undefined);

function getFingerprint(): string {
  let fp = localStorage.getItem("bt_fingerprint");
  if (!fp) {
    fp = crypto.randomUUID();
    localStorage.setItem("bt_fingerprint", fp);
  }
  return fp;
}

export function GuestProvider({ children }: { children: ReactNode }) {
  const [guestSession, setGuestSession] = useState<GuestSession | null>(null);

  const checkStatus = useCallback(async () => {
    const fingerprint = getFingerprint();
    const { data } = await apiClient.get(`/guest/status/${fingerprint}`);
    setGuestSession(data.data);
  }, []);

  const trackView = useCallback(async (contactId: string): Promise<GuestSession> => {
    const fingerprint = getFingerprint();
    const { data } = await apiClient.post("/guest/track", { fingerprint, contactId });
    setGuestSession(data.data);
    return data.data;
  }, []);

  const isLocked = guestSession?.isLocked ?? false;

  return (
    <GuestContext.Provider value={{ guestSession, trackView, checkStatus, isLocked }}>
      {children}
    </GuestContext.Provider>
  );
}

export function useGuest() {
  const context = useContext(GuestContext);
  if (!context) {
    throw new Error("useGuest must be used within a GuestProvider");
  }
  return context;
}
