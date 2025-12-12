export async function POST(req) {
  try {
    const { text, context } = await req.json();

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

    // Use Groq API (fast, free tier available)
    const messages = [];
    if (context && context.trim()) {
      // Add system message with context - this instructs the AI to only respond based on context
      messages.push({ 
        role: "system", 
        content: `${context}\n\nIMPORTANT: You must ONLY answer questions based on the context provided above. If a question is outside this context, politely decline and explain that you can only help with topics related to your defined role/context.`
      });
    }
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
        temperature: 0.7,
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


