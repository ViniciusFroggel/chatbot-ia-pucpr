import type { Categoria } from "../lib/types";
import { CategoryBadge } from "./CategoryBadge";

export function UserBubble({ text }: { text: string }) {
  return (
    <div className="bubble-row bubble-row--user">
      <div className="bubble bubble--user">{text}</div>
    </div>
  );
}

export function AiBubble({
  text,
  categoria,
  timestamp,
}: {
  text: string;
  categoria: Categoria;
  timestamp?: string;
}) {
  return (
    <div className="bubble-row bubble-row--ai">
      <div className="bubble bubble--ai">
        <div className="bubble__meta">
          <CategoryBadge categoria={categoria} />
          {timestamp && <span className="bubble__time">{timestamp}</span>}
        </div>
        <p className="bubble__text">{text}</p>
      </div>
    </div>
  );
}

export function TypingBubble() {
  return (
    <div className="bubble-row bubble-row--ai">
      <div className="bubble bubble--ai bubble--typing">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </div>
  );
}
