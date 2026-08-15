import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-[1.02] border border-blue-400/30",
        destructive:
          "bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-lg shadow-rose-600/25 hover:shadow-xl hover:shadow-rose-600/40 hover:scale-[1.02] border border-rose-400/30",
        outline:
          "border border-slate-700/60 bg-slate-900/40 backdrop-blur-md text-slate-200 hover:bg-slate-800/60 hover:text-white hover:border-slate-500/60 shadow-sm hover:scale-[1.01]",
        secondary:
          "bg-slate-800/80 backdrop-blur-md text-slate-200 hover:bg-slate-700/80 hover:text-white border border-slate-700/50 hover:scale-[1.01]",
        ghost:
          "text-slate-300 hover:bg-slate-800/60 hover:text-white transition-colors",
        glass:
          "bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 shadow-glass hover:shadow-glass-lg hover:scale-[1.02]",
        gold:
          "bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-slate-950 font-bold shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.02] border border-amber-300/40",
        emerald:
          "bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] border border-emerald-400/30",
        link: "text-blue-400 underline-offset-4 hover:underline hover:text-blue-300",
      },
      size: {
        default: "h-10 px-5 py-2.5",
        sm: "h-9 rounded-lg px-3.5 text-xs",
        lg: "h-12 rounded-2xl px-8 text-base font-bold",
        icon: "h-10 w-10 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
