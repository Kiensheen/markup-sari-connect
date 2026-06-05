import { ORDER_STAGES, ORDER_STATUS_STEP } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function OrderProgressBar({ status }: { status: string }) {
  const step = ORDER_STATUS_STEP[status] ?? 0;
  if (step < 0) return null;

  return (
    <div className="mt-4 space-y-2">
      <div className="flex gap-1">
        {ORDER_STAGES.map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              i <= step ? "bg-primary" : "bg-muted",
            )}
          />
        ))}
      </div>
      <div className="flex justify-between gap-1">
        {ORDER_STAGES.map((label, i) => (
          <span
            key={label}
            className={cn(
              "max-w-[4.5rem] text-center text-[10px] leading-tight",
              i <= step ? "font-semibold text-primary" : "text-muted-foreground",
            )}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
