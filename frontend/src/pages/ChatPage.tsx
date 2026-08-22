import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api, ApiRequestError } from "../lib/api";
import type { Atendimento } from "../lib/types";
import { AiBubble, TypingBubble, UserBubble } from "../components/ChatBubble";
import { CategoryBadge } from "../components/CategoryBadge";
import { WakingBanner } from "../components/WakingBanner";

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function formatDay(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export function ChatPage() {
  const navigate = useNavigate();
  const { token, name, logout } = useAuth();

  const [historico, setHistorico] = useState<Atendimento[]>([]);
  const [pergunta, setPergunta] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [carregandoHistorico, setCarregandoHistorico] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, setPendente] = useState<string | null>(null);
  const [acordando, setAcordando] = useState<{ attempt: number; max: number } | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    api
      .listarAtendimentos(token, (attempt, max) => setAcordando({ attempt, max }))
      .then((data) => {
        setHistorico([...data].reverse());
        setAcordando(null);
      })
      .catch(() => {
        setErro("Não foi possível carregar o histórico.");
        setAcordando(null);
      })
      .finally(() => setCarregandoHistorico(false));
  }, [token, navigate]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [historico, pendente, enviando]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pergunta.trim() || !token || enviando) return;

    const perguntaEnviada = pergunta.trim();
    setPergunta("");
    setPendente(perguntaEnviada);
    setEnviando(true);
    setErro(null);
    setAcordando(null);

    try {
      const atendimento = await api.perguntar(perguntaEnviada, token, (attempt, max) =>
        setAcordando({ attempt, max })
      );
      setHistorico((prev) => [...prev, atendimento]);
    } catch (err) {
      setErro(
        err instanceof ApiRequestError
          ? err.message
          : "A IA não respondeu. Verifique sua conexão e tente novamente."
      );
      setPergunta(perguntaEnviada);
    } finally {
      setAcordando(null);
      setPendente(null);
      setEnviando(false);
    }
  }

  const categoriasUsadas = Array.from(new Set(historico.map((a) => a.categoria)));

  return (
    <div className="chat-screen">
      <aside className="sidebar">
        <div className="sidebar__header">
          <span className="brand-mark">▤</span>
          <div>
            <p className="brand-name">ChatbotIA</p>
            <p className="brand-sub">Central de Atendimento de TI</p>
          </div>
        </div>

        <div className="sidebar__section">
          <p className="sidebar__label">Sessão</p>
          <p className="sidebar__user">{name ?? "Usuário"}</p>
          <button className="btn btn--ghost btn--small" onClick={logout}>
            Sair
          </button>
        </div>

        <div className="sidebar__section sidebar__section--grow">
          <p className="sidebar__label">
            Histórico {historico.length > 0 && <span>· {historico.length}</span>}
          </p>

          {carregandoHistorico && !acordando && <p className="sidebar__empty">Carregando…</p>}

          {!carregandoHistorico && historico.length === 0 && (
            <p className="sidebar__empty">
              Nenhum atendimento ainda. Envie sua primeira pergunta ao lado.
            </p>
          )}

          <ul className="ticket-list">
            {historico
              .slice()
              .reverse()
              .map((item) => (
                <li key={item.id} className="ticket-item">
                  <div className="ticket-item__top">
                    <CategoryBadge categoria={item.categoria} />
                    <span className="ticket-item__date">{formatDay(item.criadoEm)}</span>
                  </div>
                  <p className="ticket-item__question">{item.pergunta}</p>
                </li>
              ))}
          </ul>
        </div>

        {categoriasUsadas.length > 0 && (
          <div className="sidebar__section">
            <p className="sidebar__label">Categorias</p>
            <div className="sidebar__badges">
              {categoriasUsadas.map((c) => (
                <CategoryBadge key={c} categoria={c} />
              ))}
            </div>
          </div>
        )}
      </aside>

      <main className="chat-main">
        {acordando && <WakingBanner attempt={acordando.attempt} max={acordando.max} />}

        <div className="chat-scroll" ref={scrollRef}>
          {!carregandoHistorico && historico.length === 0 && !pendente && !acordando && (
            <div className="chat-empty">
              <span className="chat-empty__icon">▤</span>
              <h2>Como posso ajudar hoje?</h2>
              <p>
                Descreva um problema técnico — rede, impressora, acesso, hardware ou software —
                e eu classifico e respondo na hora.
              </p>
            </div>
          )}

          {historico.map((item) => (
            <div key={item.id}>
              <UserBubble text={item.pergunta} />
              <AiBubble text={item.resposta} categoria={item.categoria} timestamp={formatTime(item.criadoEm)} />
            </div>
          ))}

          {pendente && (
            <div>
              <UserBubble text={pendente} />
              <TypingBubble />
            </div>
          )}
        </div>

        {erro && <p className="chat-error">{erro}</p>}

        <form className="chat-input" onSubmit={handleSubmit}>
          <input
            type="text"
            value={pergunta}
            onChange={(e) => setPergunta(e.target.value)}
            placeholder="Descreva o problema técnico…"
            disabled={enviando}
          />
          <button type="submit" className="btn btn--primary" disabled={enviando || !pergunta.trim()}>
            {enviando ? "Enviando…" : "Enviar"}
          </button>
        </form>
      </main>
    </div>
  );
}