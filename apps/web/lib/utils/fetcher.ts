// lib/utils/fetcher.ts
export async function apiFetch<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });

  if (!res.ok) {
    let message = `Request failed with status ${res.status}`;
    try {
      const errorJson = await res.clone().json();
      if (errorJson?.message) {
        message = Array.isArray(errorJson.message)
          ? errorJson.message.join(", ")
          : errorJson.message;
      }
    } catch {
      const errorText = await res.text();
      if (errorText) message = errorText;
    }

    throw new Error(message);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json();
}
