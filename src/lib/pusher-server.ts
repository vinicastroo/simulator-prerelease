import Pusher from "pusher";

const globalForPusher = globalThis as unknown as { pusherServer: Pusher };

function createPusherServer() {
  const appId = process.env.PUSHER_APP_ID;
  const key = process.env.PUSHER_KEY;
  const secret = process.env.PUSHER_SECRET;
  const cluster = process.env.PUSHER_CLUSTER;

  if (!appId || !key || !secret || !cluster) {
    throw new Error(
      "Missing Pusher env vars: PUSHER_APP_ID, PUSHER_KEY, PUSHER_SECRET, PUSHER_CLUSTER",
    );
  }

  return new Pusher({ appId, key, secret, cluster, useTLS: true });
}

export const pusherServer =
  globalForPusher.pusherServer ?? createPusherServer();

if (process.env.NODE_ENV !== "production")
  globalForPusher.pusherServer = pusherServer;
