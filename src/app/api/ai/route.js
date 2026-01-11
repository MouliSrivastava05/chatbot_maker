export async function POST(req) {
  try {
    const { text, context, conversationHistory } = await req.json();

    // Log context for debugging (remove sensitive data in production)
    console.log("AI Request - Context length:", context ? context.length : 0);
    console.log("AI Request - Has context:", !!context && context.trim().length > 0);
    console.log("AI Request - Text:", text);

    if (!text) {
      return new Response(JSON.stringify({ error: "Missing 'text'" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const apiKey = process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GROQ_API_KEY or GEMINI_API_KEY is not set in environment variables");
      return new Response(JSON.stringify({ error: "Server misconfigured: API key missing. Please set GROQ_API_KEY in .env.local" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Build system prompt that restricts AI to context-only responses
    let systemPrompt = "";
    if (context && context.trim().length > 0) {
      systemPrompt = `You are a specialized assistant that answers questions EXCLUSIVELY based on the context information provided below. 

ABSOLUTE REQUIREMENTS - YOU MUST FOLLOW THESE RULES:
1. You MUST ONLY use information from the provided context below to answer any questions
2. You MUST NOT use any general knowledge, common knowledge, or information from outside the provided context
3. If the answer cannot be found in the provided context, you MUST respond with exactly: "I don't have that information in my knowledge base. Please check the context provided."
4. You are PROHIBITED from answering based on general knowledge - ONLY use the context
5. If asked about something not in the context, politely decline and reference that you can only answer based on the provided context
6. Maintain conversation context from previous messages ONLY if it relates to the provided context

CONTEXT INFORMATION (this is your ONLY source of knowledge):
${context.trim()}

REMEMBER: You can ONLY answer based on the context above. Any information not in this context is unavailable to you.`;
    } else {
      systemPrompt = `You are a helpful assistant. However, no specific context has been provided. Please inform users that context is required to provide accurate answers based on their specific information.`;
    }

    // Build messages array with conversation history
    const messages = [];
    
    // Add system prompt
    messages.push({ role: "system", content: systemPrompt });
    
    // Add conversation history if provided (convert from frontend format to API format)
    if (conversationHistory && Array.isArray(conversationHistory) && conversationHistory.length > 0) {
      conversationHistory.forEach(msg => {
        // Convert "You" to "user" and "Bot" to "assistant"
        const role = msg.role === "You" ? "user" : (msg.role === "Bot" || msg.role === "bot" ? "assistant" : msg.role);
        messages.push({ 
          role: role, 
          content: msg.text || msg.content || "" 
        });
      });
    }
    
    // Add current user message with context reminder if context exists
    const userMessage = context && context.trim().length > 0 
      ? `Remember: Answer ONLY based on the provided context. Do not use general knowledge.\n\nQuestion: ${text}`
      : text;
    messages.push({ role: "user", content: userMessage });

    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: messages,
        temperature: 0.1, // Very low temperature for strict adherence to context
        top_p: 0.9, // Limit randomness
        max_tokens: 500, // Limit response length to stay focused
      }),
    });

    if (!groqResponse.ok) {
      const err = await groqResponse.text();
      let errorDetails;
      try {
        errorDetails = JSON.parse(err);
      } catch {
        errorDetails = err;
      }
      console.error("Groq API error:", {
        status: groqResponse.status,
        statusText: groqResponse.statusText,
        error: errorDetails
      });
      return new Response(JSON.stringify({ 
        error: "AI request failed", 
        details: errorDetails,
        status: groqResponse.status
      }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      });
    }

    const data = await groqResponse.json();
    
    // Map Groq response format to match frontend expectations (Gemini format)
    const botMessage = data?.choices?.[0]?.message?.content || "";
    
    return new Response(JSON.stringify({ 
      response: {
        candidates: [{
          content: {
            parts: [{
              text: botMessage
            }]
          }
        }]
      }
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in AI route:", error);
    return new Response(JSON.stringify({ error: error.message || "Unknown error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}


