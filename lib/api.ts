// lib/api.ts
const API_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface ApiOptions {
  method?: HttpMethod;
  body?: any;
  auth?: boolean; // <- if true, attach token automatically
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function setAuthToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem("token", token);
  } else {
    localStorage.removeItem("token");
  }
}

export async function apiRequest<T>(
  path: string,
  options: ApiOptions = {}
): Promise<T> {
  const { method = "GET", body, auth = false } = options;

  const headers: Record<string, string> = {
  };
  
  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  // 🔐 Automatically attach token if auth=true
  if (auth) {
    const token = getAuthToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
  });

  if (!res.ok) {
    let message = "Request failed";
    try {
      const errorData = await res.json();
      if (errorData?.message) message = errorData.message;
    } catch {
      // ignore parse errors
    }
    throw new Error(message);
  }
  // If status is 204, return undefined or an empty object,
  // as the response has no body to parse.
  if (res.status === 204) {
    // We cast to T, assuming T is 'void' or an optional type in this case.
    // For deleteProject, the expected T is 'void' so this is safe.
    return undefined as unknown as T; 
  }

  return (await res.json()) as T;
}
