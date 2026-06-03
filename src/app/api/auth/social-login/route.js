import * as jose from 'jose';
import { registerToken, getUserByEmail, createUser } from "../../utils";

const FIREBASE_JWKS_URL = 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';
const JWKS = jose.createRemoteJWKSet(new URL(FIREBASE_JWKS_URL));

export async function POST(req) {
  try {
    const { idToken } = await req.json();
    if (!idToken || typeof idToken !== "string") {
      return new Response(JSON.stringify({ err: "Invalid token" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Verify Firebase ID Token using Google's JWKS
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'chatbot-d8bcd';
    let payload;
    try {
      const { payload: verifiedPayload } = await jose.jwtVerify(idToken, JWKS, {
        issuer: `https://securetoken.google.com/${projectId}`,
        audience: projectId,
      });
      payload = verifiedPayload;
    } catch (verifyErr) {
      console.error("Firebase token verification failed:", verifyErr);
      return new Response(JSON.stringify({ err: "Unauthorized: Invalid Firebase token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const email = payload.email;
    if (!email) {
      return new Response(JSON.stringify({ err: "No email found in token" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check if user exists in MongoDB, register if they don't
    const existingUser = await getUserByEmail(email);
    if (!existingUser) {
      console.log(`Creating new MongoDB user for social login: ${email}`);
      await createUser({ email, password: "" }); // password not used for Google logins
    }

    const token = await registerToken(email);
    return new Response(JSON.stringify({ token }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error in social-login route:", err);
    return new Response(JSON.stringify({ err: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}



