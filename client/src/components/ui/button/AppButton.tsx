import { type ButtonHTMLAttributes } from "react";

import { cn } from "@/utils/cn";

interface AppButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
}

export function AppButton({ variant = "primary", className, ...props }: AppButtonProps) {
  return (
    <button
      className={cn(
        "rounded px-3 py-1 disabled:opacity-50",
        {
          "bg-gray-800 text-white": variant === "primary",
          "border border-gray-300 text-text-app": variant === "secondary",
        },
        className,
      )}
      {...props}
    />
  );
}
