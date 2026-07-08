import { useMock } from "@/contexts/MockContext";

const roles = [
  { value: 'consumer', label: 'Consumer', emoji: '👤' },
  { value: 'rider', label: 'Rider', emoji: '🏍️' },
  { value: 'admin', label: 'Admin', emoji: '👑' },
] as const;

export function RoleSwitcher() {
  const { role, switchRole } = useMock();

  return (
    <select
      value={role}
      onChange={(e) => switchRole(e.target.value as 'consumer' | 'rider' | 'admin')}
      className="rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground shadow-sm outline-none focus:ring-2 focus:ring-ring"
    >
      {roles.map((r) => (
        <option key={r.value} value={r.value}>
          {r.emoji} {r.label}
        </option>
      ))}
    </select>
  );
}
