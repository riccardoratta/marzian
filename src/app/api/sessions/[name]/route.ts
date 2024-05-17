import { deleteSession, getSession, TmuxError } from "@/lib/data";
import { Details, SpawnError } from "@/utils/interfaces";
import { InternalServerError, notFound } from "@/utils/server";
import { type NextRequest, NextResponse } from "next/server";
import { spawn } from "node-pty";

export const dynamic = "force-dynamic";

const encoder = new TextEncoder();

export function GET(
  _: NextRequest,
  { params }: { params: { name: string } }
): NextResponse<Details> {
  const { name } = params;

  const session = getSession(name);

  if (!session) {
    return notFound();
  }

  const p = spawn("tmux", ["attach", "-t", name], {
    name: "xterm-color",
    cols: 95,
    rows: 30,
    cwd: process.env.HOME,
    env: process.env,
  });

  const stream = new ReadableStream({
    start(controller) {
      p.onData((data) => {
        controller.enqueue(
          encoder.encode(
            `event: message\ndata:${Buffer.from(data).toString("base64")}\n\n`
          )
        );
      });
    },
    cancel() {
      p.kill();
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      Connection: "keep-alive",
      "Cache-Control": "no-cache",
    },
  });
}

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
