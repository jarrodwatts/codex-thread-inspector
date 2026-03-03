import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { findSessionFile } from "@/lib/sessions";
import { parseRollout } from "@/lib/parser";
import { buildViewModel } from "@/lib/viewmodel";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;

  const filePath = await findSessionFile(id);
  if (!filePath) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  try {
    const text = await readFile(filePath, "utf-8");
    const session = parseRollout(text);
    const viewModel = buildViewModel(session);
    return NextResponse.json(viewModel);
  } catch {
    return NextResponse.json(
      { error: "Failed to parse session" },
      { status: 500 },
    );
  }
}
