import { clearToken, getToken } from "@/lib/auth";

// Agrega el token a las solicitudes protegidas.
export async function apiFetch(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const headers = new Headers(init?.headers);
  const token = getToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(path, { ...init, headers });
  if (response.status === 401) {
    clearToken();
    window.location.assign("/login");
    throw new Error("La sesión venció. Iniciá sesión nuevamente.");
  }

  return response;
}
