import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST() {
    try {
        const { sessionId } = auth();

        if (!sessionId) {
            return NextResponse.json(
                { success: false, message: "No active session." },
                { status: 401 }
            );
        }

        // Clerk automatically handles session revocation with the Clerk SDK.
        // No need to manually revoke the session via API.

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}
