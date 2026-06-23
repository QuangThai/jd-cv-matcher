import * as React from "react";
import { cn } from "@/lib/utils";

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}) {
  const styleVariants = {
    default:
      "bg-primary text-primary-foreground hover:bg-deep-signal active:bg-deep-signal",
    destructive:
      "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    outline:
      "border border-chalk bg-paper text-ink hover:bg-mist active:bg-ash",
    secondary:
      "bg-mist text-ink hover:bg-ash",
    ghost: "text-signal-blue hover:underline hover:bg-transparent",
    link: "text-signal-blue underline-offset-4 hover:underline",
  };

  const sizes = {
    default: "h-10 px-6 py-2 text-base font-medium",
    sm: "h-8 px-4 text-sm font-medium",
    lg: "h-12 px-8 text-base font-medium",
    icon: "h-10 w-10",
  };

  return (
    <button
      className={cn(
        "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        size === "icon" ? "rounded-[4px]" : "rounded-[var(--radius-button)]",
        styleVariants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}

export { Button };
