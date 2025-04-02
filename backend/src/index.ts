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

interface RegisterRequest {
  email: string;
  name: string;
  mobileNo: string;
  githubUsername: string;
  rollNo: string;
  collegeName: string;
  accessCode: string;
}

interface RegisterResponse {
  email: string;
  name: string;
  rollNo: string;
  accessCode: string;
  clientID: string;
  clientSecret: string;
}

const app = express();
app.use(express.json());

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL as string,
  token: process.env.UPSTASH_REDIS_TOKEN as string,
});

app.post("/register", async (req: Request, res: Response) => {
  const {
    email,
    name,
    mobileNo,
    githubUsername,
    rollNo,
    collegeName,
    accessCode,
  } = req.body as RegisterRequest;

  const response = await fetch(
    "http://20.244.56.144/evaluation-service/register",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        name,
        mobileNo,
        githubUsername,
        rollNo,
        collegeName,
        accessCode,
      }),
    }
  );

  const registerResponse: RegisterResponse = await response.json();

  return res.status(200).json(registerResponse);
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

app.get("/users", async (req: Request, res: Response) => {
  const authToken = req.headers.authorization;

  if (!authToken) {
    return res.status(401).json({ error: "Authorization token is required" });
  }

  const cachedTopUsers = await redis.get("top_users");

  if (cachedTopUsers) {
    return res.status(200).json(cachedTopUsers);
  }

  const response = await fetch(
    "http://20.244.56.144/evaluation-service/users",
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: authToken,
      },
    }
  );

  if (!response.ok) {
    return res.status(response.status).json({ error: response.statusText });
  }

  const usersData = await response.json();

  const userPostCounts = [];

  for (const user of usersData.users) {
    const userPostsResponse = await fetch(
      `http://20.244.56.144/evaluation-service/users/${user.id}/posts`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: authToken,
        },
      }
    );

    if (userPostsResponse.ok) {
      const postsData = await userPostsResponse.json();
      userPostCounts.push({
        ...user,
        postCount: postsData.posts.length,
      });
    }
  }

  const topUsers = userPostCounts
    .sort((a, b) => b.postCount - a.postCount)
    .slice(0, 5);

  await redis.set("top_users", { users: topUsers }, { ex: 3600 });

  res.status(200).json({ users: topUsers });
});

app.get("/users/:userid/posts", async (req: Request, res: Response) => {
  const { userid } = req.params;
  const authToken = req.headers.authorization;

  if (!authToken) {
    return res.status(401).json({ error: "Authorization token is required" });
  }

  const response = await fetch(
    `http://20.244.56.144/evaluation-service/users/${userid}/posts`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: authToken,
      },
    }
  );

  const postsData = await response.json();
  res.status(200).json(postsData);
});

app.get("/posts/:postid/comments", async (req: Request, res: Response) => {
  const { postid } = req.params;
  const authToken = req.headers.authorization;

  if (!authToken) {
    return res.status(401).json({ error: "Authorization token is required" });
  }

  const response = await fetch(
    `http://20.244.56.144/evaluation-service/posts/${postid}/comments`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: authToken,
      },
    }
  );

  if (!response.ok) {
    return res.status(response.status).json({ error: response.statusText });
  }

  const commentsData = await response.json();
  res.status(200).json(commentsData);
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`running ${PORT}`);
});
