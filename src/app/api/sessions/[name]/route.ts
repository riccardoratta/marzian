import { deleteSession, getSessionWithCommand, TmuxError } from "@/lib/data";
import { Details, SessionResponse, SpawnError } from "@/utils/interfaces";
import { internalServerError, notFound } from "@/utils/server";
import { type NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ name: string }> }
): Promise<NextResponse<SessionResponse | Details>> {
  const { name } = await params;

  const session = getSessionWithCommand(name);

  if (session) {
    return NextResponse.json(session);
  }

  return notFound();
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ name: string }> }
): Promise<NextResponse<SpawnError | Details>> {
  const { name } = await params;

  try {
    deleteSession(name);
  } catch (err) {
    if (err instanceof TmuxError) {
      if (err.message === "Session not found.") {
        return notFound();
      }

      return internalServerError(err);
    }
  }

  return NextResponse.json({
    details: "Session deleted.",
  });
}
