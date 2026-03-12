// =============================================================================
// MEDUSA.JS BACKEND CONFIGURATION
// =============================================================================
// Set VITE_MEDUSA_BACKEND_URL in your .env or Vercel Environment Variables.
// When not set, the shop runs in "offline/local" mode with local cart state.
//
// Example .env:
//   VITE_MEDUSA_BACKEND_URL=https://your-medusa-app.onrender.com
//   VITE_MEDUSA_PUBLISHABLE_KEY=pk_xxxxxxxxxxxxxxxxxxxxxxx
// =============================================================================

export const MEDUSA_BACKEND_URL =
  import.meta.env.VITE_MEDUSA_BACKEND_URL || "https://giradi-backend.onrender.com";

export const MEDUSA_PUBLISHABLE_KEY =
  import.meta.env.VITE_MEDUSA_PUBLISHABLE_KEY || "pk_81876fea8407223faf712fc11024c1b75fa767a9d7515519c89d80fd53f9be70";

/** True when backend URL is configured */
export const IS_BACKEND_ENABLED = !!MEDUSA_BACKEND_URL;

/** Render free tier sleeps after 15min – cron-job.org pings this */
export const HEALTH_ENDPOINT = `${MEDUSA_BACKEND_URL}/health`;

/** Store API base */
export const STORE_API = `${MEDUSA_BACKEND_URL}/store`;