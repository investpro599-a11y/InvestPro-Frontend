import React from "react";
import { TrendingUp, Users, ShieldCheck, Trophy, Sparkles } from "lucide-react";

export function AuthPitch() {
  const authFeatures = [
    {
      icon: TrendingUp,
      iconColor: "text-emerald-500 dark:text-emerald-400",
      bgColor: "bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500/25",
      title: "Automated Profit Distributions",
      description: "Consistent portfolio ROI credited directly to your balance, fully transparent and trackable in real-time.",
    },
    {
      icon: Users,
      iconColor: "text-sky-500 dark:text-sky-400",
      bgColor: "bg-sky-500/10 dark:bg-sky-500/15 border-sky-500/25",
      title: "Binary & Referral Network",
      description: "Earn passive multi-tier commissions from your entire left and right leg network with live genealogy.",
    },
    {
      icon: ShieldCheck,
      iconColor: "text-indigo-500 dark:text-indigo-400",
      bgColor: "bg-indigo-500/10 dark:bg-indigo-500/15 border-indigo-500/25",
      title: "Verified TRC20/USDT Vaults",
      description: "Every capital deposit and withdrawal is verified with transparent on-chain blockchain proofs.",
    },
    {
      icon: Trophy,
      iconColor: "text-amber-500 dark:text-amber-400",
      bgColor: "bg-amber-500/10 dark:bg-amber-500/15 border-amber-500/25",
      title: "Tiered Milestone Rewards",
      description: "Unlock cash bonuses, electronic assets, motorbikes, and premium incentives as your volume scales.",
    },
  ];

  return (
    <div className="flex flex-col justify-start pt-1 sm:pt-2 pb-6 lg:pb-10 lg:pr-8">
      {/* Glowy Logo & Brand Heading */}
      <div className="flex items-center gap-3.5 mb-6">
        <div className="relative inline-flex items-center justify-center shrink-0">
          <div className="absolute -inset-2.5 bg-gradient-to-r from-sky-400 via-blue-600 to-purple-600 rounded-full blur-xl opacity-75 dark:opacity-90 animate-pulse" />
          <img 
            src="/investpro.png" 
            alt="InvestPro Logo" 
            className="relative h-12 w-12 sm:h-14 sm:w-14 object-contain drop-shadow-[0_8px_20px_rgba(14,165,233,0.4)] transition-transform duration-300 hover:scale-105" 
          />
        </div>
        <span className="font-black font-display text-2xl sm:text-3xl text-slate-900 dark:text-white tracking-tight leading-none">
          Invest<span className="gradient-text-primary">Pro</span>
        </span>
      </div>

      {/* Main Headline */}
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display tracking-tight text-slate-900 dark:text-white leading-[1.15] mb-4">
        Your Capital. <br />
        <span className="bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-500 bg-clip-text text-transparent">
          Intelligently Grown.
        </span>
      </h1>

      {/* Pitch description */}
      <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-medium leading-relaxed max-w-xl mb-7">
        A premium high-yield investment portal featuring automated ROI distribution, secured crypto vaults, and personal administrative verification.
      </p>

      {/* Feature Value Propositions */}
      <div className="space-y-3.5 max-w-xl">
        {authFeatures.map((item, idx) => (
          <div 
            key={idx} 
            className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/70 dark:bg-[#0c1e34]/70 border border-slate-200/80 dark:border-sky-500/20 backdrop-blur-md shadow-sm transition-all duration-300 hover:border-sky-400/40 hover:bg-white/95 dark:hover:bg-[#0f2540]/90"
          >
            <div className={`p-2.5 rounded-xl border shrink-0 ${item.bgColor} ${item.iconColor}`}>
              <item.icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-0.5">{item.title}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
