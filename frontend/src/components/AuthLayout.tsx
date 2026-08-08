import type { ReactNode } from "react";

export function AuthLayout({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-card__header">
          <span className="auth-eyebrow">{eyebrow}</span>
          <h1 className="auth-title">{title}</h1>
        </div>
        {children}
      </div>
      <p className="auth-footer">Central de Atendimento de TI · ChatbotIA</p>
    </div>
  );
}
