"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SelectModePage() {
  const router = useRouter();

  useEffect(() => {
    try {
      sessionStorage.setItem("investpro_show_mode_modal", "true");
    } catch (e) {}
    router.replace("/dashboard?select=true");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full border-4 border-sky-500/30 border-t-sky-500 animate-spin" />
        <span className="text-xs text-slate-400 font-medium">Opening portfolio gateway...</span>
      </div>
    </div>
  );
}
