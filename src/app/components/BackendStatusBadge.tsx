import { useBackendStatus, type BackendStatus } from "./api/use-backend-status";
import { IS_BACKEND_ENABLED } from "./api/config";

const statusConfig: Record<
  BackendStatus,
  { color: string; bg: string; label: string }
> = {
  unconfigured: {
    color: "text-muted-foreground",
    bg: "bg-gray-200",
    label: "Lokal",
  },
  checking: {
    color: "text-yellow-600",
    bg: "bg-yellow-200",
    label: "Prüfe...",
  },
  online: {
    color: "text-emerald-600",
    bg: "bg-emerald-200",
    label: "Backend online",
  },
  offline: {
    color: "text-red-600",
    bg: "bg-red-200",
    label: "Backend offline",
  },
};

/**
 * Small floating badge (bottom-left) showing backend connection status.
 * Only visible in development or when ?debug=1 is in the URL.
 */
export function BackendStatusBadge() {
  const { status, latency } = useBackendStatus();

  // Only show in dev or with ?debug query
  const isDev = import.meta.env.DEV;
  const isDebug =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).has("debug");

  if (!isDev && !isDebug) return null;

  const cfg = statusConfig[status];

  return (
    <div className="fixed bottom-4 left-4 z-[90]">
      <div
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs shadow-lg border border-border bg-white/90 backdrop-blur-sm ${cfg.color}`}
      >
        <span
          className={`w-2 h-2 rounded-full ${cfg.bg} ${
            status === "checking" ? "animate-pulse" : ""
          }`}
        />
        <span>{cfg.label}</span>
        {status === "online" && (
          <span className="text-muted-foreground">{latency}ms</span>
        )}
        {!IS_BACKEND_ENABLED && (
          <span className="text-muted-foreground">Kein Backend</span>
        )}
      </div>
    </div>
  );
}
