import * as React from "react";
import { cn } from "@/lib/utils";

const variants = {
  default: "border-transparent bg-lavender-wash text-iris",
  secondary: "border-transparent bg-mist text-pencil",
  destructive: "border-transparent bg-blush-whisper text-destructive",
  outline: "border-chalk text-ink",
  success: "border-transparent bg-mint-whisper text-success",
  warning: "border-transparent bg-blush-whisper text-warning",
} as const;

function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  variant?: keyof typeof variants;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
