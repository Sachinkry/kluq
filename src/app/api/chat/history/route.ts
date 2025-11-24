import { NextResponse } from "next/server";
import { db } from "@/db";
import { chats, messages } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { auth } from "@/lib/auth"; // Adjust path if needed
import { headers } from "next/headers";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const paperId = searchParams.get("paperId");

    if (!paperId) {
      return NextResponse.json({ error: "Missing paperId" }, { status: 400 });
    }

    // 1. Get Current User
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Find the Chat ID for this User + Paper
    const chat = await db
      .select()
      .from(chats)
      .where(and(
        eq(chats.userId, session.user.id),
        eq(chats.paperId, paperId)
      ))
      .limit(1);

    if (chat.length === 0) {
      return NextResponse.json({ messages: [] });
    }

    // 3. Fetch Messages
    const history = await db
      .select()
      .from(messages)
      .where(eq(messages.chatId, chat[0].id))
      .orderBy(asc(messages.createdAt));

    return NextResponse.json({ messages: history });

  } catch (error: any) {
    console.error("[History API] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}