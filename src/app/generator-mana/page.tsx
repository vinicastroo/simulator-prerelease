import { requireSessionUser } from "@/lib/auth-session";
import { ManaBaseClient } from "./ManaBaseClient";

export default async function GeneratorManaPage() {
  await requireSessionUser();
  return <ManaBaseClient />;
}
