"use server";

import { redirect } from "next/navigation";
import { generateFullKit } from "@/lib/mtg/engine";
import type { College } from "@prisma/client";

const VALID_COLLEGES = new Set<string>([
  "LOREHOLD",
  "PRISMARI",
  "QUANDRIX",
  "SILVERQUILL",
  "WITHERBLOOM",
]);

/**
 * Server Action — generates a full 85-card prerelease kit for the chosen
 * college and redirects the user to the simulator page.
 *
 * Called from the CollegeGrid client component via useTransition.
 * `redirect()` throws internally — this function never returns normally.
 */
export async function createPrereleaseKit(college: string): Promise<void> {
  if (!VALID_COLLEGES.has(college)) {
    throw new Error(`Invalid college: "${college}"`);
  }

  const kitId = await generateFullKit(college as College);

  // redirect() throws NEXT_REDIRECT — must not be inside try/catch.
  redirect(`/simulator/${kitId}`);
}
