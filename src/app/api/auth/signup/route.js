import { getUserByEmail, createUser } from "@/app/api/utils";

export async function POST(req) {
  try {
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      return new Response(
        JSON.stringify({ message: "Invalid request format" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    
    const { email, password } = body;
    console.log("Signup request received for email:", email);

    // Validate input
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      console.log("Invalid email format:", email);
      return new Response(
        JSON.stringify({ message: "Valid email is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (!password || typeof password !== 'string' || password.length < 3) {
      console.log("Invalid password");
      return new Response(
        JSON.stringify({ message: "Password must be at least 3 characters long" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    console.log("Checking if user exists...");
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      console.log("User already exists:", email);
      return new Response(
        JSON.stringify({ message: "User already exists" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    console.log("Creating new user...");
    await createUser({ email, password });
    console.log("User created successfully:", email);

    return new Response(
      JSON.stringify({ message: "User created successfully" }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error during user registration:", err);
    
    // Return specific error messages for known errors
    if (err.message === 'User already exists') {
      return new Response(
        JSON.stringify({ message: "User already exists" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    
    if (err.message && err.message.includes('MONGODB_URI')) {
      return new Response(
        JSON.stringify({ message: "Database connection error. Please contact support." }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    
    if (err.message && (err.message.includes('Valid email') || err.message.includes('Password'))) {
      return new Response(
        JSON.stringify({ message: err.message }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    
    // For unknown errors, return a more helpful message
    return new Response(
      JSON.stringify({ 
        message: err.message || "Failed to create account. Please try again." 
      }), 
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
