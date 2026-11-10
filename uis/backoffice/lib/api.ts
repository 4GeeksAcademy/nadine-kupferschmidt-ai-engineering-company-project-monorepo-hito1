import { clearToken, getToken } from "@/lib/auth";

export const SESSION_EXPIRED_MESSAGE = "Tu sesión expiró. Inicia sesión de nuevo.";

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

  let response: Response;
  try {
    response = await fetch(path, { ...init, headers });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error("No pudimos conectar con el servidor. Revisa tu conexión e intenta de nuevo.");
    }
    throw error;
  }

  if (response.status === 401) {
    clearToken();
    window.location.assign("/login");
    throw new Error(SESSION_EXPIRED_MESSAGE);
  }

  return response;
}
