export function WakingBanner({ attempt, max }: { attempt: number; max: number }) {
  return (
    <div className="waking-banner" role="status">
      <span className="waking-banner__spinner" aria-hidden="true" />
      <div>
        <p className="waking-banner__title">Acordando o servidor…</p>
        <p className="waking-banner__subtitle">
          O backend gratuito hiberna após inatividade — isso pode levar até 1 minuto na primeira
          chamada. Tentativa {attempt} de {max}.
        </p>
      </div>
    </div>
  );
}