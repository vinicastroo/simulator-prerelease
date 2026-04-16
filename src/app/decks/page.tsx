import { requireSessionUser } from "@/lib/auth-session";
import { DecksClient } from "./DecksClient";

export default async function DecksPage() {
  await requireSessionUser();
  return <DecksClient />;
}
