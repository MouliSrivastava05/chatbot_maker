import { removeToken } from "@/app/api/utils";

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const { token } = body;

    if (!token) {
      return new Response(JSON.stringify({ err: "Token is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    await removeToken(token);

    return new Response(
      JSON.stringify({ message: "User logged out successfully" }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error during logout:", error);
    return new Response(JSON.stringify({ err: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
