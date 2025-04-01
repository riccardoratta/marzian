import { captureSession, TmuxError } from "@/lib/session";
import { Details } from "@/utils/interfaces";
import { internalServerError, notFound } from "@/utils/server";
import { type NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ name: string }> }
): Promise<NextResponse<string | Details>> {
  const { name } = await params;

  try {
    return new NextResponse(captureSession(name), {
      headers: {
        "content-type": "image/txt",
        "content-disposition": `attachment; filename="${name}.txt"`,
      },
    });
  } catch (err) {
    if (err instanceof TmuxError) {
      if (err.message === "Session not found.") {
        return notFound();
      }
    }

    return internalServerError(err);
  }
}
