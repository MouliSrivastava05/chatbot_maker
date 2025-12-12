export const askGemini = async ({ text, context }) => {
  const response = await fetch("/api/ai", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text, context }),
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


