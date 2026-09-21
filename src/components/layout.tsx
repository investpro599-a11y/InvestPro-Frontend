"use client";

import { ReactNode } from "react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";

interface LayoutProps {
  children: ReactNode;
  showFooter?: boolean;
}

export function Layout({ children, showFooter = true }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col w-full max-w-full overflow-x-hidden animated-moving-gradient text-slate-100 [html.light_&]:text-slate-900 transition-colors duration-300 relative">
      {/* Constantly Moving Fluid Mesh Glow Lighting Orbs contained strictly inside viewport */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-5%] left-[20%] w-[40rem] h-[40rem] bg-sky-500/25 rounded-full blur-[140px] animate-fluid-1" />
        <div className="absolute top-[30%] right-[-5%] w-[38rem] h-[38rem] bg-blue-600/20 rounded-full blur-[130px] animate-fluid-2" />
        <div className="absolute bottom-[-5%] left-[5%] w-[36rem] h-[36rem] bg-indigo-600/20 rounded-full blur-[140px] animate-fluid-3" />
        <div className="absolute top-[60%] right-[30%] w-[32rem] h-[32rem] bg-teal-500/15 rounded-full blur-[120px] animate-fluid-1" />
      </div>

      <Navigation />
      <main className="flex-1 w-full max-w-full overflow-x-hidden relative z-10">
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
} 