import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "../components/AuthLayout";
import { WakingBanner } from "../components/WakingBanner";
import { api, ApiRequestError } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export function LoginPage() {
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [acordando, setAcordando] = useState<{ attempt: number; max: number } | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setAcordando(null);
    setLoading(true);
    try {
      const auth = await api.login(email, password, (attempt, max) => setAcordando({ attempt, max }));
      setSession(auth);
      navigate("/chat");
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Não foi possível entrar. Tente novamente.");
    } finally {
      setAcordando(null);
      setLoading(false);
    }
  }

  return (
    <AuthLayout eyebrow="acesso" title="Entrar na sua conta">
      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="field">
          <span className="field__label">E-mail</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@empresa.com"
          />
        </label>

        <label className="field">
          <span className="field__label">Senha</span>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </label>

        {acordando && <WakingBanner attempt={acordando.attempt} max={acordando.max} />}
        {error && <p className="form-error">{error}</p>}

        <button type="submit" className="btn btn--primary" disabled={loading}>
          {loading ? "Entrando…" : "Entrar"}
        </button>

        <p className="auth-switch">
          Ainda não tem conta? <Link to="/registro">Criar conta</Link>
        </p>
      </form>
    </AuthLayout>
  );
}