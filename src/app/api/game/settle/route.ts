import { handleSettle } from "@/lib/api-handlers";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  return handleSettle(body);
}
