import { getMessages } from "../../utils";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const chatbotName = searchParams.get("chatbotName");
    const sessionId = searchParams.get("sessionId");

    if (!chatbotName || !sessionId) {
      return new Response(JSON.stringify({ err: "chatbotName and sessionId are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const email = `anonymous_${sessionId}`;
    const data = await getMessages({ chatbotName, userEmail: email });

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", // Public route
      },
    });
  } catch (err) {
    console.error("Error in public widget messages API:", err);
    return new Response(JSON.stringify({ err: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
