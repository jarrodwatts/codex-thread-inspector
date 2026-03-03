import { NextResponse } from "next/server";
import { discoverSessions } from "@/lib/sessions";

export async function GET(): Promise<NextResponse> {
  try {
    const sessions = await discoverSessions();
    return NextResponse.json(sessions);
  } catch {
    return NextResponse.json([]);
  }
}
