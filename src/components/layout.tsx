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
    <div className="min-h-screen flex flex-col w-full max-w-full overflow-x-hidden">
      <Navigation />
      <main className="flex-1 w-full max-w-full overflow-x-hidden">
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
} 