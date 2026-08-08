import type { Categoria } from "../lib/types";

const CATEGORIA_CONFIG: Record<Categoria, { label: string; icon: string; color: string }> = {
  Rede: { label: "Rede", icon: "◉", color: "#5B9DE8" },
  Impressora: { label: "Impressora", icon: "▤", color: "#E8A33D" },
  AcessoMfa: { label: "Acesso / MFA", icon: "◈", color: "#C77DE0" },
  Hardware: { label: "Hardware", icon: "▣", color: "#E8735D" },
  Software: { label: "Software", icon: "▦", color: "#4FD1AE" },
  Outros: { label: "Outros", icon: "○", color: "#8A90A3" },
};

export function CategoryBadge({ categoria }: { categoria: Categoria }) {
  const config = CATEGORIA_CONFIG[categoria] ?? CATEGORIA_CONFIG.Outros;

  return (
    <span
      className="category-badge"
      style={{
        color: config.color,
        borderColor: `${config.color}55`,
        background: `${config.color}14`,
      }}
    >
      <span aria-hidden="true">{config.icon}</span>
      {config.label}
    </span>
  );
}
