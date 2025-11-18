// lib/utils/fetcher.ts
export interface ApiFetchOptions extends RequestInit {
  skipAuthRetry?: boolean;
}

const REFRESH_HINT_COOKIE = "VX_NEEDS_REFRESH";
let refreshPromise: Promise<void> | null = null;

export async function apiFetch<T>(
  url: string,
  options?: ApiFetchOptions,
): Promise<T> {
  const response = await requestWithRetry(url, options);

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

async function requestWithRetry(
  url: string,
  options: ApiFetchOptions = {},
  hasRetried = false,
): Promise<Response> {
  const { skipAuthRetry, headers, ...init } = options;
  const response = await fetch(url, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(headers || {}),
    },
  });

  if (
    response.status === 401 &&
    !skipAuthRetry &&
    !hasRetried &&
    typeof window !== "undefined"
  ) {
    try {
      await triggerRefresh(url);
      return requestWithRetry(url, { ...options, skipAuthRetry: true }, true);
    } catch {
      await handleSessionExpiration(url);
      throw new Error("Session expired. Please log in again.");
    }
  }

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const errorJson = await response.clone().json();
      if (errorJson?.message) {
        message = Array.isArray(errorJson.message)
          ? errorJson.message.join(", ")
          : errorJson.message;
      }
    } catch {
      const errorText = await response.text();
      if (errorText) message = errorText;
    }

    throw new Error(message);
  }

  return response;
}

async function triggerRefresh(url: string) {
  if (typeof window === "undefined") {
    throw new Error("Refresh unavailable on server");
  }

  if (!refreshPromise) {
    refreshPromise = fetch(withOrigin(url, "/auth/refresh"), {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Unable to refresh session");
        }
        clearRefreshHint();
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

async function handleSessionExpiration(url: string) {
  clearRefreshHint();
  if (typeof window === "undefined") return;

  try {
    await fetch(withOrigin(url, "/auth/logout"), {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    // Ignore logout errors; we're redirecting anyway.
  }

  const redirect = encodeURIComponent(
    `${window.location.pathname}${window.location.search}`,
  );
  window.location.href = `/login?redirect=${redirect}`;
}

function withOrigin(originalUrl: string, pathname: string) {
  const parsed = new URL(originalUrl);
  parsed.pathname = pathname;
  parsed.search = "";
  parsed.hash = "";
  return parsed.toString();
}

function clearRefreshHint() {
  if (typeof document === "undefined") return;
  document.cookie = `${REFRESH_HINT_COOKIE}=; Max-Age=0; path=/`;
}
