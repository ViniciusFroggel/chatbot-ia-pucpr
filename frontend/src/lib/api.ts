import type { AuthResponse, Atendimento } from "./types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

// O backend gratuito "dorme" após inatividade. Quando isso acontece, a primeira
// requisição pode falhar no nível de rede (o proxy do host corta a conexão antes
// do container acordar) — o navegador reporta isso como se fosse erro de CORS,
// mas na real é só o servidor ainda subindo. Por isso re-tentamos algumas vezes
// com espera crescente, dando tempo do serviço acordar sozinho.
const RETRY_DELAYS_MS = [3000, 5000, 8000, 12000, 15000]; // ~43s de tentativas, cobre o cold start

class ApiRequestError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export type RetryHandler = (attempt: number, maxAttempts: number) => void;

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
  onRetry?: RetryHandler
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const maxAttempts = RETRY_DELAYS_MS.length + 1;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch(`${API_URL}${path}`, { ...options, headers });

      if (!response.ok) {
        let message = `Erro ${response.status}`;
        try {
          const body = await response.json();
          message = body.message ?? body.title ?? message;
        } catch {
          // resposta sem corpo JSON, mantém mensagem genérica
        }
        // Erro HTTP de verdade (401, 409, etc.) não é problema de servidor dormindo — não re-tenta.
        throw new ApiRequestError(message, response.status);
      }

      if (response.status === 204) return undefined as T;
      return (await response.json()) as T;
    } catch (err) {
      if (err instanceof ApiRequestError) throw err;

      // Falha de rede (fetch nem completou) — provável cold start. Tenta de novo se sobrar tentativa.
      const isLastAttempt = attempt === maxAttempts;
      if (isLastAttempt) {
        throw new Error(
          "Não foi possível conectar ao servidor. Verifique sua internet e tente novamente."
        );
      }
      onRetry?.(attempt, maxAttempts);
      await sleep(RETRY_DELAYS_MS[attempt - 1]);
    }
  }

  // Inalcançável — o loop sempre retorna ou lança antes disso.
  throw new Error("Não foi possível conectar ao servidor.");
}

export const api = {
  register: (name: string, email: string, password: string, onRetry?: RetryHandler) =>
    request<AuthResponse>(
      "/api/auth/register",
      { method: "POST", body: JSON.stringify({ name, email, password }) },
      undefined,
      onRetry
    ),

  login: (email: string, password: string, onRetry?: RetryHandler) =>
    request<AuthResponse>(
      "/api/auth/login",
      { method: "POST", body: JSON.stringify({ email, password }) },
      undefined,
      onRetry
    ),

  perguntar: (pergunta: string, token: string, onRetry?: RetryHandler) =>
    request<Atendimento>(
      "/api/atendimentos",
      { method: "POST", body: JSON.stringify({ pergunta }) },
      token,
      onRetry
    ),

  listarAtendimentos: (token: string, onRetry?: RetryHandler) =>
    request<Atendimento[]>("/api/atendimentos", { method: "GET" }, token, onRetry),
};

export { ApiRequestError };