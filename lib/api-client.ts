import { ApiError } from "@/types";
import type { ApiEnvelope, ApiMeta } from "@/types";
import { useAuthStore } from "@/features/auth/store";

/**
 * The mock ↔ live switch. Every feature service picks its implementation with `pickService`;
 * the UI never knows which is active. Flip via NEXT_PUBLIC_API_MODE=live.
 */
export const API_MODE: "mock" | "live" =
  process.env.NEXT_PUBLIC_API_MODE === "live" ? "live" : "mock";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

/**
 * Pick the mock or live implementation of a service based on {@link API_MODE}. Replaces the
 * old `API_MODE === "live" ? mock : mock` idiom — swapping a module to the real API is now a
 * one-line change: `pickService(mockX, httpX)`.
 */
export function pickService<T>(mock: T, live: T): T {
  return API_MODE === "live" ? live : mock;
}

type ApiErrorCode = ApiError["code"];

function codeForStatus(status: number): ApiErrorCode {
  switch (status) {
    case 401:
      return "unauthorized";
    case 403:
      return "forbidden";
    case 404:
      return "not_found";
    case 422:
      return "validation";
    default:
      return "unknown";
  }
}

/** Backend field errors are `{ field: string[] }`; the UI wants `{ field: firstMessage }`. */
function flattenFieldErrors(
  errors: Record<string, string[]> | null | undefined,
): Record<string, string> | undefined {
  if (!errors) return undefined;
  const flat: Record<string, string> = {};
  for (const [field, messages] of Object.entries(errors)) {
    if (Array.isArray(messages) && messages.length > 0) flat[field] = messages[0];
  }
  return Object.keys(flat).length ? flat : undefined;
}

/**
 * Auth + tenancy headers, read live from the auth store so every request carries the current
 * Sanctum bearer token and the active school (the backend's `X-School-Id` tenancy header).
 */
function contextHeaders(explicitToken?: string | null): Record<string, string> {
  const session = useAuthStore.getState().session;
  const token = explicitToken ?? session?.token ?? null;
  const schoolId = session?.activeSchoolId ?? null;
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(schoolId ? { "X-School-Id": schoolId } : {}),
  };
}

export type RequestInitEx = Omit<RequestInit, "body"> & {
  token?: string | null;
  /** Plain object → JSON-encoded; FormData → sent as multipart (for file uploads). */
  body?: BodyInit | Record<string, unknown> | null;
};

/**
 * Core fetch: talks the backend envelope `{ success, message, data, meta, errors }`.
 * Attaches bearer + `X-School-Id`, normalises every failure into a typed {@link ApiError},
 * and auto-clears the session on 401 so a stale token can't strand the UI.
 */
async function requestEnvelope<T>(
  path: string,
  init: RequestInitEx = {},
): Promise<ApiEnvelope<T>> {
  const { token, headers, body, ...rest } = init;

  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  const isPlainObject =
    body != null && !isFormData && typeof body === "object" && !(body instanceof Blob);

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      ...rest,
      headers: {
        Accept: "application/json",
        // Let the browser set the multipart boundary for FormData.
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...contextHeaders(token),
        ...headers,
      },
      body: isFormData
        ? (body as FormData)
        : isPlainObject
          ? JSON.stringify(body)
          : (body as BodyInit | null | undefined),
    });
  } catch {
    throw new ApiError("Network request failed. Check your connection.", "network", 0);
  }

  const envelope = (await res.json().catch(() => null)) as ApiEnvelope<T> | null;

  if (res.status === 401) {
    // Stale/expired token — drop the session so guards redirect to sign-in.
    useAuthStore.getState().clearSession();
  }

  if (!res.ok || !envelope || envelope.success === false) {
    const message =
      envelope?.message ?? (res.ok ? "Unexpected response from the server." : "Request failed.");
    throw new ApiError(
      message,
      codeForStatus(res.status),
      res.status,
      flattenFieldErrors(envelope?.errors),
    );
  }

  return envelope;
}

/** Perform a request and return only the unwrapped `data`. */
export async function apiRequest<T>(path: string, init: RequestInitEx = {}): Promise<T> {
  return (await requestEnvelope<T>(path, init)).data;
}

/** Perform a list request and return `data` plus the pagination `meta` (null if not paginated). */
export async function apiList<T>(
  path: string,
  init: RequestInitEx = {},
): Promise<{ data: T[]; meta: ApiMeta | null }> {
  const envelope = await requestEnvelope<T[]>(path, init);
  return { data: envelope.data ?? [], meta: envelope.meta };
}

/** Ergonomic verb helpers for the live services. Bodies are JSON unless a FormData is passed. */
export const api = {
  get: <T>(path: string, init?: RequestInitEx) => apiRequest<T>(path, { ...init, method: "GET" }),
  post: <T>(path: string, body?: RequestInitEx["body"], init?: RequestInitEx) =>
    apiRequest<T>(path, { ...init, method: "POST", body }),
  put: <T>(path: string, body?: RequestInitEx["body"], init?: RequestInitEx) =>
    apiRequest<T>(path, { ...init, method: "PUT", body }),
  patch: <T>(path: string, body?: RequestInitEx["body"], init?: RequestInitEx) =>
    apiRequest<T>(path, { ...init, method: "PATCH", body }),
  delete: <T>(path: string, init?: RequestInitEx) =>
    apiRequest<T>(path, { ...init, method: "DELETE" }),
  list: apiList,
} as const;
