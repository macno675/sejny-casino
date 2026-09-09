import { handleMe } from "@/lib/api-handlers";

export async function GET() {
  return handleMe();
}
