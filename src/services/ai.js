export const askGemini = async ({ token, text, context, conversationHistory = [] }) => {
  const headers = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch("/api/ai", {
    method: "POST",
    headers: headers,
    body: JSON.stringify({ text, context, conversationHistory }),
  });

  if (!response.ok) {
    let message = "Failed to fetch response from AI";
    try {
      const data = await response.json();
      message = data?.err || data?.error || message;
    } catch (_) {}
    throw new Error(message);
  }

  return response;
};


