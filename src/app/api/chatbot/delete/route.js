import { verifyToken } from "../../utils";
import path from "path";
import { getData, putData } from "../../utils";
import dbAddress from "@/db";

export async function DELETE(req) {
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

    const { name } = await req.json();
    if (!name) {
      return new Response(JSON.stringify({ err: "Chatbot name is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Delete from server
    const filePath = path.join(dbAddress, "chatbots.json");
    let data = await getData(filePath);
    
    // Filter out empty or invalid chatbot objects
    data = data.filter(chatbot => chatbot && chatbot.name && chatbot.creator);
    
    // Find and remove the chatbot (only if it belongs to this user)
    const initialLength = data.length;
    data = data.filter(chatbot => !(chatbot.name === name && chatbot.creator === email));
    
    if (data.length === initialLength) {
      return new Response(JSON.stringify({ err: "Chatbot not found or you don't have permission to delete it" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    await putData(filePath, data);
    
    return new Response(
      JSON.stringify({ message: "Chatbot deleted successfully" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error in delete chatbot route:", err);
    return new Response(JSON.stringify({ err: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

