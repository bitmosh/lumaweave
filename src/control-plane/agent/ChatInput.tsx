import { useState, useCallback } from "react";
import { t } from "../../i18n";

export function ChatInput({
  onSend,
  disabled,
}: {
  onSend: (text: string) => void;
  disabled: boolean;
}) {
  const [text, setText] = useState("");

  const handleSubmit = useCallback(() => {
    if (!text.trim() || disabled) return;
    onSend(text);
    setText("");
  }, [text, onSend, disabled]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  return (
    <div className="lw-agent-chat-input-row">
      <textarea
        data-testid="agent-chat-input"
        className="lw-agent-chat-textarea"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={t("agents.chat.inputPlaceholder")}
        disabled={disabled}
        rows={2}
      />
      <button
        type="button"
        data-testid="agent-chat-send"
        className="lw-agent-chat-send-btn"
        onClick={handleSubmit}
        disabled={disabled || !text.trim()}
      >
        {t("agents.chat.sendButton")}
      </button>
    </div>
  );
}
