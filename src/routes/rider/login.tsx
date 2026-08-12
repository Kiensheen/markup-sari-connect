import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Lock, LogIn } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { AuthLayout } from "@/components/auth/AuthLayout";

export const Route = createFileRoute("/rider/login")({
  component: RiderLoginPage,
});

function RiderLoginPage() {
  const { login, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);

  // Already logged in as rider → dashboard
  if (isLoggedIn("rider")) {
    navigate({ to: "/rider/dashboard", replace: true });
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 300));
    login("rider", email || "rider", remember);
    setLoading(false);
    navigate({ to: "/rider/dashboard" });
  };

  const inputCls =
    "w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/30";

  return (
    <AuthLayout variant="rider">
      <form onSubmit={handleLogin} className="space-y-4">
        {/* Email / username */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Email or username
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="rider@marketup.com"
              className={inputCls}
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Password
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className={inputCls}
            />
          </div>
        </div>

        {/* Remember me */}
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 accent-blue-600"
          />
          <span className="text-sm text-gray-600">Remember me</span>
        </label>

        <p className="text-center text-[11px] text-gray-400">
          Use any email and password to continue
        </p>

        {/* Login */}
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700 active:scale-[0.99] disabled:opacity-60"
        >
          {loading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <>
              <LogIn className="h-4 w-4" /> Log in
            </>
          )}
        </button>
      </form>
    </AuthLayout>
  );
}
