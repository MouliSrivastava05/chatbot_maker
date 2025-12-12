import { addMessage, verifyToken } from "../../utils";

export async function POST(req) {
  try {
    const authHeader = req.headers.get("authorization");
    const accessToken = authHeader?.split(" ")[1];
    if (!accessToken || !(await verifyToken(accessToken))) {
      return new Response(JSON.stringify({ err: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const email = accessToken.split("#@#")[1];
    const { chatbotName, role, text } = await req.json();
    if (!chatbotName || !role || typeof text !== "string") {
      return new Response(JSON.stringify({ err: "Invalid payload" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const entry = await addMessage({ chatbotName, userEmail: email, role, text });
    return new Response(JSON.stringify(entry), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ err: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}


