"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import {
  TrendingUp,
  Building2,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  X,
  Layers
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

interface PortfolioSelectionModalProps {
  forceOpen?: boolean;
  onClose?: () => void;
}

function PortfolioSelectionModalContent({
  forceOpen = false,
  onClose
}: PortfolioSelectionModalProps) {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);
  const [rememberChoice, setRememberChoice] = useState(true);
  const [hoveredCard, setHoveredCard] = useState<"regular" | "property" | null>(null);

  useEffect(() => {
    if (!isAuthenticated || isAdmin) {
      setIsOpen(false);
      return;
    }

    // Check if modal was explicitly requested via forceOpen, query param, or session flag
    const selectParam = searchParams?.get("select");
    const sessionFlag = typeof window !== "undefined" ? sessionStorage.getItem("investpro_show_mode_modal") : null;

    if (forceOpen || selectParam === "true" || sessionFlag === "true") {
      setIsOpen(true);
    }
  }, [isAuthenticated, isAdmin, searchParams, forceOpen]);

  // Listen to custom window event to open from anywhere (e.g. switcher in navbar)
  useEffect(() => {
    const handleOpenModal = () => setIsOpen(true);
    window.addEventListener("investpro:open-mode-modal", handleOpenModal);
    return () => window.removeEventListener("investpro:open-mode-modal", handleOpenModal);
  }, []);

  const handleSelect = (mode: "regular" | "property") => {
    try {
      sessionStorage.removeItem("investpro_show_mode_modal");
      localStorage.setItem("investpro_active_mode", mode);
      if (rememberChoice) {
        localStorage.setItem("investpro_preferred_mode", mode);
      }
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("investpro:mode-change", { detail: { mode } }));
      }
    } catch (e) {}

    setIsOpen(false);
    if (onClose) onClose();

    // Clean up query param if present
    if (searchParams?.get("select")) {
      const url = new URL(window.location.href);
      url.searchParams.delete("select");
      window.history.replaceState({}, "", url.pathname + (url.search ? url.search : ""));
    }

    if (mode === "regular") {
      if (pathname !== "/dashboard") {
        router.push("/dashboard");
      }
    } else {
      if (pathname !== "/flats") {
        router.push("/flats");
      }
    }
  };

  const handleDismiss = () => {
    try {
      sessionStorage.removeItem("investpro_show_mode_modal");
    } catch (e) {}
    setIsOpen(false);
    if (onClose) onClose();
    if (searchParams?.get("select")) {
      const url = new URL(window.location.href);
      url.searchParams.delete("select");
      window.history.replaceState({}, "", url.pathname + (url.search ? url.search : ""));
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-y-auto animate-in fade-in duration-300"
    >
      {/* Heavy Blur Screen Backdrop */}
      <div
        onClick={handleDismiss}
        className="fixed inset-0 bg-slate-950/75 dark:bg-black/80 backdrop-blur-2xl transition-all duration-500"
      />

      {/* Ambient Lighting Orbs behind the cards */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-[32rem] h-[32rem] bg-blue-500/20 rounded-full blur-[140px] animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-[34rem] h-[34rem] bg-purple-600/20 rounded-full blur-[150px] animate-float" />
      </div>

      {/* Modal Dialog Content Container */}
      <div className="relative z-10 w-full max-w-5xl my-auto flex flex-col items-center">
        {/* Close Button on top right */}
        <button
          onClick={handleDismiss}
          className="absolute -top-12 right-0 sm:-top-10 sm:-right-4 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all backdrop-blur-md border border-white/10"
          title="Dismiss (Continue to Dashboard)"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center max-w-2xl mb-6 sm:mb-8 text-white">
          <Badge className="mb-3 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30 text-xs font-bold tracking-wider uppercase inline-flex items-center gap-1.5 shadow-lg shadow-sky-500/10">
            <Sparkles className="h-3.5 w-3.5 text-sky-400" /> Welcome, {user?.fullName || "Investor"}
          </Badge>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black font-display tracking-tight text-white drop-shadow-md mb-2">
            Choose Your <span className="bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-300 bg-clip-text text-transparent">Investment Track</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300/90 font-medium max-w-xl mx-auto leading-relaxed">
            Select the portfolio stream you want to explore. You can switch between regular yields and property investments anytime.
          </p>
        </div>

        {/* The Two Big Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 w-full">
          {/* BIG CARD 1: Regular Investment */}
          <div
            onMouseEnter={() => setHoveredCard("regular")}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => handleSelect("regular")}
            className={`group relative rounded-3xl p-7 sm:p-9 cursor-pointer transition-all duration-300 transform text-left flex flex-col justify-between ${
              hoveredCard === "regular"
                ? "scale-[1.02] shadow-2xl shadow-sky-500/30 border-sky-400 bg-slate-900/95 dark:bg-[#07192d]/98"
                : "hover:scale-[1.01] border-sky-500/30 bg-slate-900/85 dark:bg-[#07192d]/90 shadow-2xl"
            } border backdrop-blur-3xl overflow-hidden`}
          >
            {/* Top Glowing Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 rounded-t-3xl bg-gradient-to-r from-blue-600 via-sky-400 to-emerald-400" />

            <div>
              {/* Header Icon & Badge */}
              <div className="flex items-start justify-between mb-6">
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-gradient-to-tr from-blue-600 via-sky-500 to-cyan-400 flex items-center justify-center text-white shadow-xl shadow-sky-500/40 group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="h-8 w-8 sm:h-10 sm:w-10" />
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-bold text-xs px-3.5 py-1 rounded-full shadow-sm">
                  Daily Yields & ROI
                </Badge>
              </div>

              {/* Title & Description */}
              <h3 className="text-2xl sm:text-3xl font-extrabold font-display text-white tracking-tight mb-2.5 group-hover:text-sky-400 transition-colors">
                Regular Investment
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
                Automated staking plans, everyday profit tracker, affiliate commissions & flexible multi-currency withdrawals.
              </p>

              {/* Features List */}
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-200 font-medium">
                  <div className="h-5 w-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                  <span>Everyday ROI tracker with automated returns</span>
                </div>
                <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-200 font-medium">
                  <div className="h-5 w-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                  <span>Multi-tier affiliate genealogy commissions</span>
                </div>
                <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-200 font-medium">
                  <div className="h-5 w-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                  <span>Instant TRC20, Bank & Mobile withdrawals</span>
                </div>
                <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-200 font-medium">
                  <div className="h-5 w-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                  <span>Principal lock security & matured payouts</span>
                </div>
              </div>
            </div>

            {/* Bottom CTA Button */}
            <div className="pt-4 border-t border-slate-700/60 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400">
                Dashboard &bull; Vaults &bull; Withdrawals
              </span>
              <Button
                className="rounded-xl px-5 py-2.5 font-bold text-xs sm:text-sm bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-xl shadow-sky-500/30 group-hover:translate-x-1 transition-all flex items-center gap-2"
              >
                Enter Portfolio
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>

          {/* BIG CARD 2: Property Investment */}
          <div
            onMouseEnter={() => setHoveredCard("property")}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => handleSelect("property")}
            className={`group relative rounded-3xl p-7 sm:p-9 cursor-pointer transition-all duration-300 transform text-left flex flex-col justify-between ${
              hoveredCard === "property"
                ? "scale-[1.02] shadow-2xl shadow-indigo-500/30 border-indigo-400 bg-slate-900/95 dark:bg-[#0c1f36]/98"
                : "hover:scale-[1.01] border-indigo-500/30 bg-slate-900/85 dark:bg-[#0c1f36]/90 shadow-2xl"
            } border backdrop-blur-3xl overflow-hidden`}
          >
            {/* Top Glowing Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 rounded-t-3xl bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-400" />

            <div>
              {/* Header Icon & Badge */}
              <div className="flex items-start justify-between mb-6">
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-xl shadow-indigo-500/40 group-hover:scale-110 transition-transform duration-300">
                  <Building2 className="h-8 w-8 sm:h-10 sm:w-10" />
                </div>
                <Badge className="bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 font-bold text-xs px-3.5 py-1 rounded-full shadow-sm">
                  Real Estate & Flats
                </Badge>
              </div>

              {/* Title & Description */}
              <h3 className="text-2xl sm:text-3xl font-extrabold font-display text-white tracking-tight mb-2.5 group-hover:text-indigo-400 transition-colors">
                Property Investment
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
                Premium luxury flats, residential units, installment ownership schedules & high capital appreciation.
              </p>

              {/* Features List */}
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-200 font-medium">
                  <div className="h-5 w-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                  <span>Verified prime location luxury apartments & flats</span>
                </div>
                <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-200 font-medium">
                  <div className="h-5 w-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                  <span>Flexible down payment & installment schedules</span>
                </div>
                <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-200 font-medium">
                  <div className="h-5 w-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                  <span>Tangible asset backing & long-term appreciation</span>
                </div>
                <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-200 font-medium">
                  <div className="h-5 w-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                  <span>Digital flat reservation & ownership contracts</span>
                </div>
              </div>
            </div>

            {/* Bottom CTA Button */}
            <div className="pt-4 border-t border-slate-700/60 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400">
                Flats &bull; Booking &bull; Installments
              </span>
              <Button
                className="rounded-xl px-5 py-2.5 font-bold text-xs sm:text-sm bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white shadow-xl shadow-indigo-500/30 group-hover:translate-x-1 transition-all flex items-center gap-2"
              >
                Explore Flats
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>

        {/* Footer controls & remember choice */}
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-3 sm:gap-6 text-xs text-slate-300">
          <label className="flex items-center gap-2 cursor-pointer bg-slate-900/80 border border-white/10 px-4 py-2 rounded-full backdrop-blur-md">
            <Checkbox
              checked={rememberChoice}
              onCheckedChange={(checked) => setRememberChoice(Boolean(checked))}
              className="data-[state=checked]:bg-sky-500 data-[state=checked]:border-sky-500"
            />
            <span className="font-semibold text-slate-200">
              Remember my choice for future logins
            </span>
          </label>
          <span className="text-slate-400 text-center">
            (You can always change or switch portfolios anytime from the top navigation)
          </span>
        </div>
      </div>
    </div>
  );
}

export function PortfolioSelectionModal(props: PortfolioSelectionModalProps) {
  return (
    <Suspense fallback={null}>
      <PortfolioSelectionModalContent {...props} />
    </Suspense>
  );
}
