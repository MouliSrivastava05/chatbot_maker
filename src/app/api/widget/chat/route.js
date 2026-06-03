import { getChatbotByName, getMessages, addMessage } from "../../utils";

export async function POST(req) {
  try {
    const { chatbotName, text, sessionId } = await req.json();

    if (!chatbotName || !text || !sessionId) {
      return new Response(JSON.stringify({ error: "Missing required fields: chatbotName, text, or sessionId" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 1. Fetch chatbot context
    const chatbot = await getChatbotByName(chatbotName);
    if (!chatbot) {
      return new Response(JSON.stringify({ error: "Chatbot not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const context = chatbot.context || "";
    const anonymousEmail = `anonymous_${sessionId}`;

    // 2. Fetch conversation history
    const serverMsgs = await getMessages({ chatbotName, userEmail: anonymousEmail });

    // 3. Save the new user message to MongoDB (don't await to not block AI response time too much)
    await addMessage({ 
      chatbotName, 
      userEmail: anonymousEmail, 
      role: "user", 
      text: text.trim() 
    });

    // 4. Configure Groq API key
    const apiKey = process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GROQ_API_KEY is not set in environment variables");
      return new Response(JSON.stringify({ error: "Server misconfigured: API key missing" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 5. Build system prompt using chatbot context
    let systemPrompt = "";
    if (context && context.trim().length > 0) {
      systemPrompt = `You are a specialized assistant that answers questions EXCLUSIVELY based on the context information provided below. 

ABSOLUTE REQUIREMENTS - YOU MUST FOLLOW THESE RULES:
1. You MUST ONLY use information from the provided context below to answer any questions
2. You MUST NOT use any general knowledge, common knowledge, or information from outside the provided context
3. If the answer cannot be found in the provided context, you MUST respond with: "I apologize, but I do not have information on that topic as it is outside my provided context. I can only answer questions based on the specific information provided."
4. You are PROHIBITED from answering based on general knowledge - ONLY use the context
5. If asked about something not in the context, politely decline and reference that you can only answer based on the provided context
6. Maintain conversation context from previous messages ONLY if it relates to the provided context

CONTEXT INFORMATION (this is your ONLY source of knowledge):
${context.trim()}

REMEMBER: You can ONLY answer based on the context above. Any information not in this context is unavailable to you.`;
    } else {
      systemPrompt = `You are a helpful assistant. However, no specific context has been provided. Please inform users that context is required to provide accurate answers based on their specific information.`;
    }

    // 6. Build message array
    const messages = [];
    messages.push({ role: "system", content: systemPrompt });

    // Add conversation history
    if (serverMsgs && Array.isArray(serverMsgs)) {
      serverMsgs.forEach(msg => {
        const role = msg.role === "user" ? "user" : "assistant";
        messages.push({ role, content: msg.text || "" });
      });
    }

    // Add current user message
    const userMessage = context && context.trim().length > 0
      ? `Remember: Answer ONLY based on the provided context. Do not use general knowledge.\n\nQuestion: ${text}`
      : text;
    messages.push({ role: "user", content: userMessage });

    // 7. Request Groq Chat Completion
    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: messages,
        temperature: 0.1,
        top_p: 0.9,
        max_tokens: 500,
        stream: true,
      }),
    });

    if (!groqResponse.ok) {
      const err = await groqResponse.text();
      console.error("Groq API error in widget endpoint:", err);
      return new Response(JSON.stringify({ error: "AI request failed", details: err }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      });
    }

    let accumulatedResponse = "";

    const responseStream = new ReadableStream({
      async start(controller) {
        const reader = groqResponse.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              const cleaned = line.trim();
              if (!cleaned) continue;
              if (cleaned === "data: [DONE]") break;

              if (cleaned.startsWith("data: ")) {
                try {
                  const json = JSON.parse(cleaned.substring(6));
                  const content = json.choices?.[0]?.delta?.content || "";
                  if (content) {
                    controller.enqueue(new TextEncoder().encode(content));
                    accumulatedResponse += content;
                  }
                } catch (err) {
                  console.error("Error parsing JSON chunk:", err);
                }
              }
            }
          }

          // 8. Save bot response to MongoDB after consumption is complete
          if (accumulatedResponse.trim()) {
            await addMessage({
              chatbotName,
              userEmail: anonymousEmail,
              role: "bot",
              text: accumulatedResponse.trim()
            });
          }
        } catch (err) {
          console.error("Error reading stream from Groq in widget:", err);
          controller.error(err);
        } finally {
          controller.close();
        }
      }
    });

    return new Response(responseStream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
        "Access-Control-Allow-Origin": "*", // Public route
      },
    });
  } catch (error) {
    console.error("Error in widget chat API:", error);
    return new Response(JSON.stringify({ error: error.message || "Unknown error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
