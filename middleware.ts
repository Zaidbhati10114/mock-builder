import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublcRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)', '/']);

export default clerkMiddleware((auth, req) => {
    if (!isPublcRoute(req)) auth().protect()
});

export const config = {
    matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};