"use client";

import Link from "next/link";
import { ChartLine, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-16 relative z-10 bg-[#040e1a]/95 backdrop-blur-2xl border-t border-sky-500/20 text-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-md opacity-60" />
                <img src="/investpro.png" alt="InvestPro Logo" className="relative h-14 w-14 object-contain" />
              </div>
              <span className="text-2xl font-extrabold font-display tracking-tight gradient-text-primary">
                Invest<span className="text-white">Pro</span>
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-md">
              Your trusted partner in high-yield portfolio opportunities. We provide secure, 
              transparent, and automated investment management solutions for individual and enterprise portfolios.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20 animate-pulse" />
              <span className="text-xs font-semibold text-emerald-400 tracking-wide">System Operational • All Vaults Active</span>
            </div>
            <div className="flex space-x-3 pt-2">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="h-9 w-9 rounded-xl border border-white/10 bg-slate-800/60 flex items-center justify-center text-slate-400 hover:text-white hover:border-blue-500/50 hover:bg-blue-600/20 hover:scale-110 transition-all duration-200"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-base font-bold font-display text-white mb-4 tracking-wide uppercase text-xs text-blue-400">Navigation</h3>
            <ul className="space-y-2.5 text-sm">
              {[
                { name: "Dashboard", href: "/dashboard" },
                { name: "Investments", href: "/investments" },
                { name: "Withdrawals", href: "/withdrawals" },
                { name: "Genealogy Tree", href: "/genealogy" },
                { name: "My Profile", href: "/profile" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-slate-400 hover:text-blue-400 hover:translate-x-1 inline-block transition-all duration-200">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-base font-bold font-display text-white mb-4 tracking-wide uppercase text-xs text-blue-400">Get in Touch</h3>
            <ul className="space-y-3.5 text-sm">
              <li className="flex items-center text-slate-300 gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  <Mail className="h-4 w-4" />
                </div>
                <span className="text-slate-300">support@investpro.com</span>
              </li>
              <li className="flex items-center text-slate-300 gap-3">
                <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  <Phone className="h-4 w-4" />
                </div>
                <span className="text-slate-300">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center text-slate-300 gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
                  <MapPin className="h-4 w-4" />
                </div>
                <span className="text-slate-300">123 Investment St, Finance City</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-400 gap-4">
          <p>© {currentYear} InvestPro Technologies. All rights reserved.</p>
          <div className="flex space-x-6">
            <Link href="/terms" className="hover:text-slate-200 transition-colors">
              Terms of Service
            </Link>
            <Link href="/privacy" className="hover:text-slate-200 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/support" className="hover:text-slate-200 transition-colors">
              Help Center & Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
} 