import { handleLogout } from "@/lib/api-handlers";

export async function POST() {
  return handleLogout();
}
