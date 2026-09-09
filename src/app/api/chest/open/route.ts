import { handleChestOpen } from "@/lib/api-handlers";

export async function POST() {
  return handleChestOpen();
}
