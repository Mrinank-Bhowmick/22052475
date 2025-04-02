import express, { Request, Response } from "express";
import { Redis } from "@upstash/redis";

interface AuthRequest {
  email: string;
  name: string;
  rollNo: string;
  accessCode: string;
  clientID: string;
  clientSecret: string;
}

interface AuthResponse {
  token: string;
  expires: string;
}

const app = express();
app.use(express.json());

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL as string,
  token: process.env.UPSTASH_REDIS_TOKEN as string,
});

app.post("/auth", async (req: Request, res: Response) => {
  const { email, name, rollNo, accessCode, clientID, clientSecret } =
    req.body as AuthRequest;

  const response = await fetch("http://20.244.56.144/evaluation-service/auth", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      name,
      rollNo,
      accessCode,
      clientID,
      clientSecret,
    }),
  });

  const authResponse: AuthResponse = await response.json();
  res.status(200).json(authResponse);
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`running ${PORT}`);
});
