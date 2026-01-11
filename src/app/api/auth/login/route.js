import { getUserByEmail, registerToken } from "@/app/api/utils";

export async function POST(req) {
  try {
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      return new Response(
        JSON.stringify({ err: "Invalid request format" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    
    const { email, password } = body;
    console.log("Login request received for email:", email);

    // Validate input
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return new Response(
        JSON.stringify({ err: "Valid email is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (!password || typeof password !== 'string') {
      return new Response(
        JSON.stringify({ err: "Password is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const existingUser = await getUserByEmail(email);
    
    if (!existingUser) {
      return new Response(JSON.stringify({ err: "User does not exist" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    if (existingUser.password !== password) {
      return new Response(JSON.stringify({ err: "Password does not match" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    console.log("Password verified, generating token...");
    const token = await registerToken(email);
    console.log("Token generated successfully");
    
    return new Response(
      JSON.stringify({ token, message: "User logged in successfully" }),
      {
        status: 201,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err) {
    console.error("Error during login:", err);
    console.error("Error stack:", err.stack);
    
    // Return specific error messages for known errors
    if (err.message && err.message.includes('MONGODB_URI')) {
      return new Response(
        JSON.stringify({ err: "Database connection error. Please contact support." }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    
    // For unknown errors, return a more helpful message
    return new Response(
      JSON.stringify({ 
        err: err.message || "Failed to login. Please try again." 
      }), 
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
