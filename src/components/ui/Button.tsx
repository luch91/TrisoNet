"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "destructive" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  children?: ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, children, className, disabled, onClick, type }, ref) => {
    const base = "inline-flex items-center justify-center gap-2 font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
      primary: "bg-primary text-ink hover:bg-primary-400 focus:ring-primary shadow-btn",
      secondary: "bg-secondary text-white hover:bg-secondary-500 focus:ring-secondary",
      ghost: "bg-transparent text-ink hover:bg-primary-50 focus:ring-primary-200",
      destructive: "bg-error text-white hover:bg-error-600 focus:ring-error",
      outline: "border border-primary-300 text-ink bg-surface hover:bg-primary-50 focus:ring-primary-200",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-small",
      md: "px-4 py-2.5 text-body",
      lg: "px-6 py-3 text-body font-semibold",
    };

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.97 }}
        className={cn(base, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        onClick={onClick as React.MouseEventHandler<HTMLButtonElement>}
        type={type}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </motion.button>
    );
  }
);
Button.displayName = "Button";
export default Button;
