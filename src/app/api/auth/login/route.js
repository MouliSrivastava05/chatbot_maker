import path from "path";

import { getData, postData, registerToken } from "@/app/api/utils";
import dbAddress from "@/db";

const filePath = path.join(dbAddress, "users.json");

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    const users = await getData(filePath);
    const existingUser = users.find((user) => user.email === email);
    if (!existingUser) {
      return new Response(JSON.stringify({ err: "User does not exists" }), {
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
    const token = await registerToken(email);
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
    console.log(err);
    return new Response(JSON.stringify({ err: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

