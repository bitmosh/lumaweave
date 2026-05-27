import { t } from "../../i18n";

export function AgentChatPlaceholder() {
  return (
    <div className="lw-agent-chat-placeholder" data-testid="agent-chat-placeholder">
      <div className="lw-agent-chat-icon">💬</div>
      <div className="lw-agent-chat-title">{t("agent.chat.title")}</div>
      <div className="lw-agent-chat-desc">{t("agent.chat.placeholder.description")}</div>
      <div className="lw-agent-chat-status">{t("agent.chat.placeholder.status")}</div>
    </div>
  );
}
