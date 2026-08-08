import type { AuthResponse, Atendimento } from "./types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

class ApiRequestError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!response.ok) {
    let message = `Erro ${response.status}`;
    try {
      const body = await response.json();
      message = body.message ?? body.title ?? message;
    } catch {
      // resposta sem corpo JSON, mantém mensagem genérica
    }
    throw new ApiRequestError(message, response.status);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const api = {
  register: (name: string, email: string, password: string) =>
    request<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }),

  login: (email: string, password: string) =>
    request<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  perguntar: (pergunta: string, token: string) =>
    request<Atendimento>(
      "/api/atendimentos",
      { method: "POST", body: JSON.stringify({ pergunta }) },
      token
    ),

  listarAtendimentos: (token: string) =>
    request<Atendimento[]>("/api/atendimentos", { method: "GET" }, token),
};

export { ApiRequestError };
