function tryParseJson(value: unknown) {
  if (typeof value !== "string") return { ok: true as const, value };

  try {
    return { ok: true as const, value: JSON.parse(value) };
  } catch {
    return { ok: false as const };
  }
}

export default function handler(req: any, res: any) {
  // Vercel serverless function: /api/user
  if (!req.method || req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const rawBody = req.body;
  if (rawBody === undefined) {
    return res.status(400).json({ error: "Missing JSON body" });
  }

  const parsed = tryParseJson(rawBody);
  if (!parsed.ok) {
    return res.status(400).json({ error: "Invalid JSON body" });
  }

  // Echo back whatever the client sent.
  return res.status(200).json(parsed.value);
}

