export async function POST(req) {
  try {
    const { text, context, conversationHistory } = await req.json();

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
      systemPrompt = `You are a helpful assistant that answers questions STRICTLY based on the following context information. 

CRITICAL RULES:
1. ONLY use information from the provided context to answer questions
2. DO NOT use any general knowledge or information outside the provided context
3. If the answer is not in the provided context, respond with: "I don't have that information in my knowledge base. Please check the context provided."
4. Maintain conversation context from previous messages
5. Be precise and accurate based on the context provided

Context Information:
${context.trim()}`;
    } else {
      systemPrompt = `You are a helpful assistant. However, no specific context has been provided. Please inform users that context is required to provide accurate answers.`;
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
    
    // Add current user message
    messages.push({ role: "user", content: text });

    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: messages,
        temperature: 0.3, // Lower temperature for more deterministic, context-focused responses
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


