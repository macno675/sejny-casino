import { handleLeaderboard } from "@/lib/api-handlers";

export async function GET() {
  return handleLeaderboard();
}
