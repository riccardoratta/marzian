import { deleteSession, TmuxError } from "@/lib/data";
import { Details, SpawnError } from "@/utils/interfaces";
import { InternalServerError, notFound } from "@/utils/server";
import { type NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/* NOTE this GET only uses capture-pane and it's not interactive
export interface SessionResponse {
  lines: string[];
}

export async function GET(
  _: NextRequest,
  { params }: { params: { name: string } }
): Promise<NextResponse<SessionResponse | SpawnError | {}>> {
  const { name } = params;

  const spawnRes = spawnSync(`tmux capture-pane -p -t ${name}`, {
    shell: true,
  });

  if (spawnRes.status !== 0) {
    // Session not found error
    if (spawnRes.stderr.toString().trim().startsWith("can't find")) {
      return NextResponse.json({}, { status: 404 });
    }

    // General error
    return NextResponse.json(
      {
        exitCode: spawnRes.status ?? -1,
        stderr: spawnRes.stderr.toString(),
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    lines: spawnRes.stdout.toString().split("\n"),
  });
}
*/

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

      return InternalServerError(err);
    }
  }

  return NextResponse.json({
    details: "Session deleted",
  });
}
