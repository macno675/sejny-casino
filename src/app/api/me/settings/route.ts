import { handleSettings } from "@/lib/api-handlers";

export async function PATCH(req: Request) {
  const body = await req.json().catch(() => ({}));
  return handleSettings(body);
}
