// Client-side wrapper for LLM API calls

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

// 90 second timeout for all LLM calls
const FETCH_TIMEOUT_MS = 90_000;

export async function chat(
  messages: ChatMessage[],
  options?: {
    maxTokens?: number;
    temperature?: number;
  }
): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        messages,
        maxTokens: options?.maxTokens || 4096,
        temperature: options?.temperature || 0.7,
      }),
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorMsg = "LLM request failed";
      try {
        const error = await response.json();
        errorMsg = error.error || errorMsg;
      } catch {
        // response wasn't JSON
      }
      throw new Error(errorMsg);
    }

    const data = await response.json();
    return data.content;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("LLM request timed out after 90s. The model may be overloaded — try again.");
    }
    throw error;
  }
}

/**
 * Simple helper for calling LLM with system and user prompts
 */
export async function callLLM(options: {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
}): Promise<string> {
  const messages: ChatMessage[] = [
    { role: "system", content: options.systemPrompt },
    { role: "user", content: options.userPrompt },
  ];

  return chat(messages, {
    temperature: options.temperature ?? 0.7,
    maxTokens: options.maxTokens ?? 4096,
  });
}
