const TOKEN_KEY = "delcom_access_token";

export type ApiResult<T = any> = { success: boolean; message: string; data: T };
type ApiOptions = { method?: string; body?: unknown; auth?: boolean };

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function putAccessToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeAccessToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export async function apiRequest<T = any>(
  path: string,
  options: ApiOptions = {}
): Promise<ApiResult<T>> {
  const { method = "GET", body, auth = true } = options;
  const headers: Record<string, string> = { Accept: "application/json" };
  const token = getAccessToken();
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  let payload: BodyInit | undefined;
  if (body instanceof FormData) {
    payload = body;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${DELCOM_BASEURL}${path}`, {
      method,
      headers,
      body: payload,
    });
    const json = await response.json();
    return {
      success: json.status === "success",
      message: json.message ?? "",
      data: json.data,
    };
  } catch {
    return { success: false, message: "Gagal terhubung ke server", data: undefined as T };
  }
}
