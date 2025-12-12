import { getMessages, verifyToken } from "../../utils";

export async function GET(req) {
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
    const { searchParams } = new URL(req.url);
    const chatbotName = searchParams.get("chatbotName");
    if (!chatbotName) {
      return new Response(JSON.stringify({ err: "chatbotName is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const data = await getMessages({ chatbotName, userEmail: email });

    return new Response(JSON.stringify(data), {
      status: 200,
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


