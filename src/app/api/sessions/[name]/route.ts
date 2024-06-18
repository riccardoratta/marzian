import { captureSession, deleteSession, TmuxError } from "@/lib/data";
import { Details, SpawnError } from "@/utils/interfaces";
import { internalServerError, notFound } from "@/utils/server";
import { type NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export interface SessionResponse {
  lines: string[];
}

export function GET(
  _: NextRequest,
  { params }: { params: { name: string } }
): NextResponse<string | Details> {
  const { name } = params;

  try {
    return new NextResponse(captureSession(name), {
      headers: {
        "content-type": "image/txt",
        "content-disposition": `attachment; filename="${name}.txt"`,
      },
    });
  } catch (err) {
    if (err instanceof TmuxError) {
      if (err.message === "Session not found") {
        return notFound();
      }
    }

    return internalServerError(err);
  }
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
      if (err.message === "Session not found") {
        return notFound();
      }

      return internalServerError(err);
    }
  }

  return NextResponse.json({
    details: "Session deleted",
  });
}
