import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Bell, ChevronLeft, KeyRound, LogOut, ShieldAlert, UserX } from "lucide-react";
import { useMock } from "@/contexts/MockContext";
import { useAuth } from "@/contexts/AuthContext";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { notificationsEnabled, setNotificationsEnabled } = useMock();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout("consumer");
    navigate({ to: "/" });
    toast.success("Logged out");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link to="/profile" className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors">
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
      </div>

      {/* Notifications */}
      <section className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
        <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-4">
          <Bell className="h-5 w-5 text-emerald-600" />
          <h2 className="text-lg font-semibold text-gray-800">Notifications</h2>
        </div>
        <div className="flex items-center gap-3 px-5 py-4">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-800">Order status notifications</p>
            <p className="mt-0.5 text-xs text-gray-500">
              Show order updates (pending, on the way, delivered, etc.) in the header bell.
            </p>
          </div>
          <Switch
            checked={notificationsEnabled}
            onCheckedChange={setNotificationsEnabled}
            aria-label="Order status notifications"
          />
        </div>
      </section>

      {/* Account */}
      <section className="divide-y divide-gray-100 rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
        <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-4">
          <ShieldAlert className="h-5 w-5 text-emerald-600" />
          <h2 className="text-lg font-semibold text-gray-800">Account</h2>
        </div>

        <button
          type="button"
          disabled
          className="flex w-full items-center gap-3 px-5 py-4 text-left opacity-60"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
            <KeyRound className="h-4 w-4 text-blue-600" />
          </div>
          <span className="flex-1 text-sm font-medium text-gray-700">Change password</span>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500">
            Coming soon
          </span>
        </button>

        <button
          type="button"
          disabled
          className="flex w-full items-center gap-3 px-5 py-4 text-left opacity-60"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50">
            <UserX className="h-4 w-4 text-red-600" />
          </div>
          <span className="flex-1 text-sm font-medium text-gray-700">Delete account</span>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500">
            Coming soon
          </span>
        </button>

        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-5 py-4 text-left transition hover:bg-red-50/60"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50">
            <LogOut className="h-4 w-4 text-red-600" />
          </div>
          <span className="flex-1 text-sm font-medium text-red-600">Log out</span>
        </button>
      </section>
    </div>
  );
}