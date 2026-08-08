export interface AuthResponse {
  token: string;
  name: string;
  email: string;
  expiresAt: string;
}

export type Categoria =
  | "Rede"
  | "Impressora"
  | "AcessoMfa"
  | "Hardware"
  | "Software"
  | "Outros";

export interface Atendimento {
  id: number;
  pergunta: string;
  resposta: string;
  categoria: Categoria;
  criadoEm: string;
}

export interface ApiError {
  message: string;
}
