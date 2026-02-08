'use client'

import * as React from "react"
import { motion, HTMLMotionProps } from "framer-motion"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility for merging tailwind classes in a cinematic way.
 */
function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export interface ButtonProps extends HTMLMotionProps<"button"> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'outline'
    size?: 'sm' | 'md' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', ...props }, ref) => {

        const variants = {
            primary: "bg-white text-black hover:bg-slate-100 shadow-[0_0_30px_rgba(255,255,255,0.1)]",
            secondary: "bg-slate-900 text-white border border-white/10 hover:bg-slate-800",
            ghost: "bg-transparent text-slate-400 hover:text-white hover:bg-white/5",
            outline: "bg-transparent text-white border border-white/20 hover:border-white/40"
        }

        const sizes = {
            sm: "h-9 px-4 text-[10px]",
            md: "h-12 px-8 text-xs",
            lg: "h-14 px-10 text-sm",
            icon: "h-12 w-12"
        }

        return (
            <motion.button
                whileTap={{ scale: 0.98 }}
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center rounded-xl font-black uppercase tracking-[0.2em] transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none active:scale-95",
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button }
