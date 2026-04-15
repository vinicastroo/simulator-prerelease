import PusherJs from "pusher-js";

const globalForPusher = globalThis as unknown as { pusherClient: PusherJs };

function createPusherClient() {
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

  if (!key || !cluster) {
    throw new Error(
      "Missing Pusher env vars: NEXT_PUBLIC_PUSHER_KEY, NEXT_PUBLIC_PUSHER_CLUSTER",
    );
  }

  return new PusherJs(key, { cluster });
}

export const pusherClient =
  globalForPusher.pusherClient ?? createPusherClient();

if (typeof window !== "undefined")
  globalForPusher.pusherClient = pusherClient;
