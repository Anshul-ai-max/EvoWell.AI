export default function handler(req: any, res: any) {
  // Vercel serverless function: /api/hello
  if (req.method && req.method !== "GET" && req.method !== "HEAD") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  return res.status(200).json({ message: "Backend is working 🚀" });
}

