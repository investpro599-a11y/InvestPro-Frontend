import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold tracking-wide transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 backdrop-blur-md shadow-sm",
  {
    variants: {
      variant: {
        default:
          "border-blue-400/30 bg-blue-500/15 text-blue-300 shadow-blue-500/10",
        secondary:
          "border-slate-700/60 bg-slate-800/60 text-slate-300",
        destructive:
          "border-rose-500/30 bg-rose-500/15 text-rose-300 shadow-rose-500/10",
        success:
          "border-emerald-500/30 bg-emerald-500/15 text-emerald-300 shadow-emerald-500/10",
        warning:
          "border-amber-500/30 bg-amber-500/15 text-amber-300 shadow-amber-500/10",
        purple:
          "border-purple-500/30 bg-purple-500/15 text-purple-300 shadow-purple-500/10",
        outline: "border-slate-600/60 text-slate-300 bg-slate-900/40",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
