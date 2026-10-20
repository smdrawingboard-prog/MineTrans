import { useEffect, useState } from "react";

export const ADMIN_LOGIN_PATH = "/certification/admin/login";

/**
 * Asks the server whether the browser holds a valid admin cookie.
 * Redirects to the admin login page when it doesn't.
 */
export function useAdminSession(): { checking: boolean; isAdmin: boolean } {
  const [state, setState] = useState({ checking: true, isAdmin: false });

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/session", { credentials: "same-origin", cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { authenticated: false }))
      .catch(() => ({ authenticated: false }))
      .then((data: { authenticated?: boolean }) => {
        if (cancelled) return;
        if (data.authenticated) setState({ checking: false, isAdmin: true });
        else window.location.href = ADMIN_LOGIN_PATH;
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}

export async function adminLogout(): Promise<void> {
  try {
    await fetch("/api/admin/logout", { method: "POST", credentials: "same-origin" });
  } catch (error) {
    console.error("[Admin] Logout request failed:", error);
  } finally {
    window.location.href = ADMIN_LOGIN_PATH;
  }
}
