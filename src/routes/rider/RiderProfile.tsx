import { Star, Truck } from "lucide-react";
import { useMock } from "@/contexts/MockContext";

export function RiderProfile() {
  const { currentUser, orders } = useMock();

  const completedCount = orders.filter(
    (o) => o.rider_id === currentUser.id && o.status === "delivered"
  ).length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Profile</h1>

      <div className="rounded-xl border border-border bg-card p-6 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
          {currentUser.name.charAt(0).toUpperCase()}
        </div>
        <h2 className="mt-4 text-xl font-bold">{currentUser.name}</h2>
        <p className="text-sm text-muted-foreground">{currentUser.email}</p>
        {currentUser.phone && <p className="mt-1 text-sm text-muted-foreground">{currentUser.phone}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <Truck className="mx-auto h-6 w-6 text-primary" />
          <p className="mt-2 text-2xl font-bold">{completedCount}</p>
          <p className="text-xs text-muted-foreground">Deliveries completed</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <div className="flex justify-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-5 w-5 fill-primary text-primary" />
            ))}
          </div>
          <p className="mt-2 text-2xl font-bold">5.0</p>
          <p className="text-xs text-muted-foreground">Rating</p>
        </div>
      </div>
    </div>
  );
}
