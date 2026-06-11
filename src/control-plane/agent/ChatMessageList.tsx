import { t } from "../../i18n";
import type { ChatMessage } from "./useAgentChat";

export function ChatMessageList({
  messages,
  inFlight,
  error,
}: {
  messages: ChatMessage[];
  inFlight: boolean;
  error: string | null;
}) {
  if (messages.length === 0 && !inFlight && !error) {
    return (
      <div className="lw-agent-chat-empty" data-testid="agent-chat-empty">
        {t("agents.chat.emptyState")}
      </div>
    );
  }

  return (
    <div className="lw-agent-chat-messages" data-testid="agent-chat-messages">
      {messages.map((msg, i) => (
        <div
          key={i}
          className={`lw-agent-chat-message lw-agent-chat-message--${msg.role}`}
          data-testid={`agent-chat-message-${i}`}
        >
          {msg.content}
        </div>
      ))}
      {inFlight && (
        <div
          className="lw-agent-chat-message lw-agent-chat-message--assistant lw-agent-chat-loading"
          data-testid="agent-chat-loading"
        >
          {t("agents.chat.thinking")}
        </div>
      )}
      {error && (
        <div className="lw-agent-chat-error" data-testid="agent-chat-error">
          {error}
        </div>
      )}
    </div>
  );
}
