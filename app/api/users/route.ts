import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from 'next/server';

export async function DELETE() {
    const { userId } = auth();
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
        await clerkClient.users.deleteUser(userId);
        return NextResponse.json({ message: 'User deleted' });
    }
    catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error deleting user' }, { status: 500 });
    }
}