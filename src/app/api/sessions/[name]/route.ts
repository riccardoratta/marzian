import { deleteSession, getSessionWithCommand, TmuxError } from "@/lib/data";
import { Details, SessionResponse, SpawnError } from "@/utils/interfaces";
import { internalServerError, notFound } from "@/utils/server";
import { type NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET(
  _: NextRequest,
  { params }: { params: { name: string } }
): NextResponse<SessionResponse | Details> {
  const { name } = params;

  const session = getSessionWithCommand(name);

  if (session) {
    return NextResponse.json(session);
  }

  return notFound();
}

export function DELETE(
  _: NextRequest,
  { params }: { params: { name: string } }
): NextResponse<SpawnError | Details> {
  const { name } = params;

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
