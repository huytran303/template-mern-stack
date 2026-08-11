import { type ReactNode } from "react";

import { cn } from "@/utils/cn";

interface AppCardProps {
  children: ReactNode;
  className?: string;
}

export function AppCard({ children, className }: AppCardProps) {
  return <div className={cn("rounded border border-gray-200 p-4", className)}>{children}</div>;
}
