import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { requireSessionUser } from "@/lib/auth-session";
import { DecksClient, DECKS_QUERY_KEY } from "./DecksClient";
import { getDecksForUser } from "./queries";

export default async function DecksPage() {
  const user = await requireSessionUser();

  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: DECKS_QUERY_KEY,
    queryFn: () => getDecksForUser(user.id),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DecksClient />
    </HydrationBoundary>
  );
}
