import { useState, useEffect } from "react";
import { checkBackendHealth } from "./medusa-client";
import { IS_BACKEND_ENABLED } from "./config";

export type BackendStatus = "unconfigured" | "checking" | "online" | "offline";

// Global flag: set to true when any successful Store API call completes
let _backendConfirmedOnline = false;
export function confirmBackendOnline() {
  _backendConfirmedOnline = true;
}

/**
 * Hook that checks backend availability on mount.
 * Returns status + latency for the admin/debug badge.
 */
export function useBackendStatus() {
  const [status, setStatus] = useState<BackendStatus>(
    IS_BACKEND_ENABLED ? "checking" : "unconfigured"
  );
  const [latency, setLatency] = useState(0);

  useEffect(() => {
    if (!IS_BACKEND_ENABLED) return;

    let cancelled = false;

    const check = async () => {
      // If products already loaded successfully, skip health check
      if (_backendConfirmedOnline) {
        setStatus("online");
        return;
      }

      setStatus("checking");
      const result = await checkBackendHealth();
      if (cancelled) return;

      // Re-check global flag (may have been set during health check)
      if (_backendConfirmedOnline) {
        setStatus("online");
        return;
      }

      setStatus(result.online ? "online" : "offline");
      setLatency(result.latency);
    };

    check();

    // Re-check every 60s to detect Render wake-up
    const interval = setInterval(check, 60_000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return { status, latency, isBackendEnabled: IS_BACKEND_ENABLED };
}