import { cn } from "@/app/utils/helpers";
import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  padding?: boolean;
}

export default function Card({
  className,
  hover,
  padding = true,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl bg-white border border-slate-200 shadow-sm",
        hover && "transition-all hover:shadow-md hover:-translate-y-0.5",
        padding && "p-6",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
