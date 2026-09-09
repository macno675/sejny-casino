import { handleRegister } from "@/lib/api-handlers";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  return handleRegister(body);
}
