"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { refresh, logout } from "@/lib/api/auth";

const REFRESH_HINT_COOKIE = "VX_NEEDS_REFRESH";
let ongoing: Promise<void> | null = null;

export function AuthSync() {
  const router = useRouter();

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (!document.cookie.includes(`${REFRESH_HINT_COOKIE}=1`)) return;

    void ensureSession(router);
  }, [router]);

  return null;
}

async function ensureSession(router: ReturnType<typeof useRouter>) {
  if (!ongoing) {
    ongoing = refresh()
      .then(() => {
        clearHint();
        router.refresh();
      })
      .catch(async () => {
        clearHint();
        try {
          await logout();
        } catch {
          // Ignore logout errors.
        }
        router.replace("/login");
      })
      .finally(() => {
        ongoing = null;
      });
  }

  return ongoing;
}

function clearHint() {
  if (typeof document === "undefined") return;
  document.cookie = `${REFRESH_HINT_COOKIE}=; Max-Age=0; path=/`;
}
