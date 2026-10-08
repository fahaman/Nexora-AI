import { useEffect, useState } from "react";
import { ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

export function SafeResponsiveChart({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={cn("h-full min-h-0 w-full min-w-0", className)}>
      {mounted ? (
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          {children}
        </ResponsiveContainer>
      ) : (
        <div className="h-full w-full rounded-xl bg-muted/30" aria-hidden="true" />
      )}
    </div>
  );
}
