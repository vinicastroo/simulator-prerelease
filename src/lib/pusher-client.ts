import type PusherType from "pusher-js";

type PusherInstance = InstanceType<typeof PusherType>;

const globalForPusher = globalThis as unknown as {
  pusherClient: PusherInstance;
};

export function getPusherClient(): PusherInstance {
  if (typeof window === "undefined") {
    throw new Error("getPusherClient must only be called on the client");
  }

  if (globalForPusher.pusherClient) return globalForPusher.pusherClient;

  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

  if (!key || !cluster) {
    throw new Error(
      "Missing Pusher env vars: NEXT_PUBLIC_PUSHER_KEY, NEXT_PUBLIC_PUSHER_CLUSTER",
    );
  }

  // Dynamic require avoids the ESM/CJS constructor issue at module evaluation time
  // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any
  const PusherJs = (require("pusher-js") as any).default ?? require("pusher-js");
  globalForPusher.pusherClient = new PusherJs(key, { cluster });
  return globalForPusher.pusherClient;
}
