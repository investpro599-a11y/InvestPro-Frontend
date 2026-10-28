"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";

export type AppMode = "regular" | "property";

export const MODE_STORAGE_KEY = "investpro_active_mode";
export const PREFERRED_STORAGE_KEY = "investpro_preferred_mode";

export function useAppMode() {
  const pathname = usePathname();
  const router = useRouter();

  // Determine current mode based on pathname first, fallback to storage
  const resolveMode = useCallback((): AppMode => {
    if (typeof window === "undefined") return "regular";
    if (pathname === "/flats" || pathname.startsWith("/flats")) {
      return "property";
    }
    if (
      pathname === "/dashboard" ||
      pathname.startsWith("/investments") ||
      pathname.startsWith("/withdrawals") ||
      pathname.startsWith("/rewards") ||
      pathname.startsWith("/genealogy")
    ) {
      return "regular";
    }
    const stored = (localStorage.getItem(MODE_STORAGE_KEY) || localStorage.getItem(PREFERRED_STORAGE_KEY)) as AppMode | null;
    return stored === "property" ? "property" : "regular";
  }, [pathname]);

  const [mode, setModeState] = useState<AppMode>(resolveMode);

  // Sync mode when pathname changes
  useEffect(() => {
    if (pathname === "/flats" || pathname.startsWith("/flats")) {
      setModeState("property");
      try {
        localStorage.setItem(MODE_STORAGE_KEY, "property");
      } catch (e) {}
    } else if (
      pathname === "/dashboard" ||
      pathname.startsWith("/investments") ||
      pathname.startsWith("/withdrawals") ||
      pathname.startsWith("/rewards") ||
      pathname.startsWith("/genealogy")
    ) {
      setModeState("regular");
      try {
        localStorage.setItem(MODE_STORAGE_KEY, "regular");
      } catch (e) {}
    }
  }, [pathname]);

  // Listen to custom window mode change event
  useEffect(() => {
    const handleModeChange = (e: any) => {
      if (e.detail?.mode) {
        setModeState(e.detail.mode);
      }
    };
    window.addEventListener("investpro:mode-change", handleModeChange as EventListener);
    return () => window.removeEventListener("investpro:mode-change", handleModeChange as EventListener);
  }, []);

  const switchMode = useCallback(
    (newMode: AppMode, redirect: boolean = true) => {
      try {
        localStorage.setItem(MODE_STORAGE_KEY, newMode);
        localStorage.setItem(PREFERRED_STORAGE_KEY, newMode);
      } catch (e) {}
      setModeState(newMode);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("investpro:mode-change", { detail: { mode: newMode } }));
      }
      if (redirect) {
        if (newMode === "property") {
          router.push("/flats");
        } else {
          router.push("/dashboard");
        }
      }
    },
    [router]
  );

  const openSelectModeModal = useCallback(() => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("investpro:open-mode-modal"));
    }
  }, []);

  return {
    mode,
    isPropertyMode: mode === "property",
    isRegularMode: mode === "regular",
    switchMode,
    openSelectModeModal,
  };
}
