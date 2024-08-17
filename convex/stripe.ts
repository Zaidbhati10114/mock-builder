"use node";

import { v } from "convex/values";
import Stripe from "stripe";

import { action, internalAction, mutation } from "./_generated/server";
import { internal } from "./_generated/api";

type Metadata = {
    userId: string;
};

export const pay = action({
    args: {},
    handler: async (ctx) => {
        const user = await ctx.auth.getUserIdentity();

        if (!user) {
            throw new Error("you must be logged in to subscribe");
        }

        if (!user.emailVerified) {
            throw new Error("you must have a verified email to subscribe");
        }

        const domain = process.env.HOSTING_URL ?? "https://mock-builder.vercel.app/dashboard";
        const stripe = new Stripe(process.env.STRIPE_KEY!, {
            apiVersion: "2024-06-20",
        });
        const session = await stripe.checkout.sessions.create({
            line_items: [{ price: process.env.PRICE_ID!, quantity: 1 }],
            customer_email: user.email,
            metadata: {
                userId: user.subject,
            },
            mode: "subscription",
            success_url: `${domain}`,
            cancel_url: `${domain}`,
            billing_address_collection: 'required', // Add this line
        });

        return session.url!;
    },
});



export const fulfill = internalAction({
    args: { payload: v.string(), signature: v.string() },
    handler: async (ctx, args) => {
        const stripe = new Stripe(process.env.STRIPE_KEY!, {
            apiVersion: "2024-06-20",
        });

        const webhookSecret = process.env.STRIPE_WEBHOOKS_SECRET!;
        try {
            const event = stripe.webhooks.constructEvent(
                args.payload,
                args.signature,
                webhookSecret
            );

            switch (event.type) {
                case "checkout.session.completed": {
                    const completedEvent = event.data.object as Stripe.Checkout.Session & {
                        metadata: { userId: string };
                    };

                    const userId = completedEvent.metadata.userId;
                    const subscriptionId = completedEvent.subscription as string;

                    // Retrieve the subscription to get the current period end
                    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
                    const subscriptionEndDate = new Date(subscription.current_period_end * 1000);

                    await ctx.runMutation(internal.users.updateSubscription, {
                        clerkId: userId,
                        subscriptionId: subscriptionId,
                        subscriptionEndDate: subscriptionEndDate.getTime(),
                    });
                    break;
                }
                case "invoice.payment_succeeded": {
                    const invoice = event.data.object as Stripe.Invoice;
                    const subscriptionId = invoice.subscription as string;

                    // Retrieve the subscription to get the updated current period end
                    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
                    const subscriptionEndDate = new Date(subscription.current_period_end * 1000);

                    // Find the user by subscriptionId and update
                    await ctx.runMutation(internal.users.updateSubscriptionUsingSubId, {
                        subscriptionId: subscriptionId,
                        subscriptionEndDate: subscriptionEndDate.getTime(),
                    });
                    break;
                }
                case "customer.subscription.deleted": {
                    const subscription = event.data.object as Stripe.Subscription;
                    await ctx.runMutation(internal.users.updateSubscriptionStatus, {
                        clerkId: subscription.customer as string,
                        isPro: false,
                        subscriptionId: null,
                        subscriptionEndDate: null,
                        jsonGenerationCount: 1000,
                    });
                    break;
                }
            }

            return { success: true };
        } catch (err) {
            console.error(err);
            return { success: false, error: (err instanceof Error) ? err.message : String(err) };
        }
    },
});




