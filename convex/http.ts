import { httpRouter } from "convex/server";

import { internal } from "./_generated/api";
import { httpAction } from "./_generated/server";
import { auth } from "./auth";
import { withoutReservedKeys } from "./lib/revenueCatEvent";

const http = httpRouter();

auth.addHttpRoutes(http);

http.route({
  path: "/revenuecat/webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }
    const secret = process.env.REVENUECAT_WEBHOOK_SECRET;
    if (secret === undefined || secret.length === 0) {
      return new Response("Webhook secret is not set", { status: 500 });
    }
    const header = request.headers.get("Authorization") ?? "";
    if (header !== secret && header !== `Bearer ${secret}`) {
      return new Response("Unauthorized", { status: 401 });
    }
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return new Response("Bad request", { status: 400 });
    }
    await ctx.runMutation(internal.entitlements.applyWebhook, {
      body: withoutReservedKeys(body),
    });
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

export default http;
