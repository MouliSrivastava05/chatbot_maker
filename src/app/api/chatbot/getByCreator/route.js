import { getChatbotByCreator, verifyToken } from "../../utils";

export async function GET(req) {
  try {
    const authHeader = req.headers.get("authorization");
    const accessToken = authHeader?.split(" ")[1];

    if (!accessToken) {
      console.error("No access token provided in Authorization header");
      return new Response(JSON.stringify({ err: "Unauthorized: No token provided" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const isValidToken = await verifyToken(accessToken);
    if (!isValidToken) {
      console.error("Token verification failed for token:", accessToken.substring(0, 20) + "...");
      return new Response(JSON.stringify({ err: "Unauthorized: Invalid token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const email = accessToken.split("#@#")[1];
    if (!email) {
      console.error("No email found in token");
      return new Response(JSON.stringify({ err: "Unauthorized: Invalid token format" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const data = await getChatbotByCreator(email);
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error in getByCreator route:", err);
    return new Response(JSON.stringify({ err: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
