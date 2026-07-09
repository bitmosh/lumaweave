// SPDX-License-Identifier: Apache-2.0
import { useState, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useSettingsStore } from "../settings/settings.store";

export type ChatRole = "user" | "assistant" | "system";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

interface ChatResponse {
  message: ChatMessage;
  finish_reason: string;
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
}

export function useAgentChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inFlight, setInFlight] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const config = useSettingsStore((s) => s.settings.agents?.inference);

  const send = useCallback(async (userText: string) => {
    if (!userText.trim() || inFlight || !config) return;
    setError(null);

    const userMessage: ChatMessage = { role: "user", content: userText };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInFlight(true);

    try {
      const response = await invoke<ChatResponse>("chat", {
        messages: nextMessages,
        config: {
          endpoint: config.endpoint,
          model: config.model,
          api_key: config.byokKey || undefined,
          temperature: config.temperature,
          max_tokens: config.maxTokens,
        },
      });
      setMessages((prev) => [...prev, response.message]);
    } catch (e: unknown) {
      const msg =
        typeof e === "string"
          ? e
          : (e as { message?: string })?.message ?? "Unknown error";
      setError(msg);
    } finally {
      setInFlight(false);
    }
  }, [messages, inFlight, config]);

  const clear = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return { messages, send, clear, inFlight, error };
}
