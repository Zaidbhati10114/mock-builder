// ===== reference links =====
// https://www.convex.dev/templates (open the link and choose for clerk than you will get the github link mentioned below)
// https://github.dev/webdevcody/thumbnail-critique/blob/6637671d72513cfe13d00cb7a2990b23801eb327/convex/schema.ts

import type { WebhookEvent } from "@clerk/nextjs/server";
import { httpRouter } from "convex/server";
import { Webhook } from "svix";

import { internal } from "./_generated/api";
import { httpAction } from "./_generated/server";
import { getResourceByIdHttp } from "./resources";
import { deleteUser } from './users';

const handleClerkWebhook = httpAction(async (ctx, request) => {
    const event = await validateRequest(request);
    if (!event) {
        return new Response("Invalid request", { status: 400 });
    }
    switch (event.type) {
        case "user.created":

            const existingUser = await ctx.runQuery(internal.users.getUserByEmail, {
                email: event.data.email_addresses[0].email_address,
            });

            if (existingUser) {
                // User already exists, return an error response
                return new Response("User with this email already exists", { status: 409 });
            }
            await ctx.runMutation(internal.users.createUser, {
                clerkId: event.data.id,
                email: event.data.email_addresses[0].email_address,
                imageUrl: event.data.image_url,
                name: event.data.first_name!,
                isPro: false,
                projectCount: 0,
                resourceCount: 0,
                jsonGenerationCount: 1000,
                // Initialize API tracking fields
                apiRequestsThisMonth: 0,
                apiRequestsResetDate: `${new Date().getFullYear()}-${new Date().getMonth() + 1}`,
            });
            break;
        case "user.updated":
            await ctx.runMutation(internal.users.updateUser, {
                clerkId: event.data.id,
                imageUrl: event.data.image_url,
                email: event.data.email_addresses[0].email_address,
            });
            break;
        case "user.deleted":
            await ctx.runMutation(internal.users.deleteUserFor, {
                clerkId: event.data.id as string,
            });
            break;
    }
    return new Response(null, {
        status: 200,
    });
});

const http = httpRouter();

http.route({
    path: "/clerk",
    method: "POST",
    handler: handleClerkWebhook,
});

http.route({
    path: "/stripe",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
        const signature = request.headers.get("stripe-signature");
        if (!signature) {
            return new Response("Missing stripe-signature header", {
                status: 400
            });
        }

        const payload = await request.text();

        const result = await ctx.runAction(internal.stripe.fulfill, {
            payload,
            signature
        });

        if (result.success) {
            return new Response(null, {
                status: 200
            });
        } else {
            return new Response(result.error, {
                status: 400
            });
        }
    })
});

const validateRequest = async (
    req: Request
): Promise<WebhookEvent | undefined> => {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET!;
    if (!webhookSecret) {
        throw new Error("CLERK_WEBHOOK_SECRET is not defined");
    }
    const payloadString = await req.text();
    const headerPayload = req.headers;
    const svixHeaders = {
        "svix-id": headerPayload.get("svix-id")!,
        "svix-timestamp": headerPayload.get("svix-timestamp")!,
        "svix-signature": headerPayload.get("svix-signature")!,
    };
    const wh = new Webhook(webhookSecret);
    const event = wh.verify(payloadString, svixHeaders);
    return event as unknown as WebhookEvent;
};

http.route({
    path: "/get-resource",
    method: "GET",
    handler: getResourceByIdHttp
})

export default http;