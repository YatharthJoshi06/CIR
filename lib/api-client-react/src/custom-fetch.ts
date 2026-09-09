let baseUrl = "/api";
let authTokenGetter: (() => string | null) | null = null;

export type AuthTokenGetter = () => string | null;

export function setBaseUrl(url: string) { baseUrl = url.replace(/\/+$/, ""); }
export function setAuthTokenGetter(getter: AuthTokenGetter) { authTokenGetter = getter; }

export class ApiError extends Error {
  constructor(public status: number, public body: unknown, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

export class ResponseParseError extends Error {
  constructor(public cause: unknown) {
    super("Failed to parse response");
    this.name = "ResponseParseError";
  }
}

export async function customFetch<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const token = authTokenGetter?.();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> ?? {}),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const cleanBase = baseUrl.replace(/\/+$/, "");
  const cleanPath = url.startsWith("/") ? url : `/${url}`;
  const targetUrl = cleanBase ? `${cleanBase}${cleanPath}` : cleanPath;

  const response = await fetch(targetUrl, {
    ...options,
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    let body: unknown;
    try { body = await response.json(); } catch { body = null; }
    throw new ApiError(response.status, body, `HTTP ${response.status}`);
  }

  if (response.status === 204) return undefined as T;

  try {
    return await response.json() as T;
  } catch (e) {
    throw new ResponseParseError(e);
  }
}