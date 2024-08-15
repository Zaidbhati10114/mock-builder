// app/api/logout/route.ts

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST() {
    try {
        const { sessionId } = auth();

        if (!sessionId) {
            return NextResponse.json({ success: false, message: "No active session." }, { status: 401 });
        }

        // Clerk automatically ends the session when you call this endpoint
        await fetch(`https://api.clerk.dev/v1/sessions/${sessionId}/revoke`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.CLERK_API_KEY}`,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
