import { useAgentChat } from "./useAgentChat";
import { ChatMessageList } from "./ChatMessageList";
import { ChatInput } from "./ChatInput";
import "./agentChat.css";

export function AgentChatTile() {
  const { messages, send, inFlight, error } = useAgentChat();

  return (
    <div className="lw-agent-chat" data-testid="agent-chat-tile">
      <ChatMessageList messages={messages} inFlight={inFlight} error={error} />
      <ChatInput onSend={send} disabled={inFlight} />
    </div>
  );
}
