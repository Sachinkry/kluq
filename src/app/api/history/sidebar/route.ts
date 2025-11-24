export const dynamic = "force-dynamic"; // <--- ADD THIS to disable caching

import { NextResponse } from "next/server";
import { db } from "@/db";
import { chats, papers } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const history = await db
      .select({
        chatId: chats.id,
        title: chats.title,
        paperId: papers.id,
        paperTitle: papers.title,
        createdAt: chats.createdAt
      })
      .from(chats)
      .innerJoin(papers, eq(chats.paperId, papers.id))
      .where(eq(chats.userId, session.user.id))
      .orderBy(desc(chats.createdAt));

    return NextResponse.json({ history });

  } catch (error: any) {
    console.error("[Sidebar History API] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}