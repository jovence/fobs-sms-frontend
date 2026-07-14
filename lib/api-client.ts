import { ApiError } from "@/types";

/**
 * The mock ↔ live switch. Every feature service imports `API_MODE` and picks its
 * implementation; the UI never knows which is active. Flip via NEXT_PUBLIC_API_MODE.
 */
export const API_MODE: "mock" | "live" =
  process.env.NEXT_PUBLIC_API_MODE === "live" ? "live" : "mock";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

/**
 * Thin typed fetch wrapper the *live* services will use. Centralises auth headers,
 * base URL, and error normalisation so swapping mock→live is a one-file change per feature.
 */
export async function httpRequest<T>(
  path: string,
  init: RequestInit & { token?: string | null } = {},
): Promise<T> {
  const { token, headers, ...rest } = init;
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      ...rest,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
    });
  } catch {
    throw new ApiError("Network request failed", "network", 0);
  }

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    const code =
      res.status === 401
        ? "unauthorized"
        : res.status === 403
          ? "forbidden"
          : res.status === 404
            ? "not_found"
            : res.status === 422
              ? "validation"
              : "unknown";
    throw new ApiError(body?.message ?? "Request failed", code, res.status, body?.errors);
  }

  return body as T;
}
