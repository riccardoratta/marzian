import { SpawnError } from "@/utils/interfaces";
import { spawnSync } from "child_process";
import { type NextRequest, NextResponse } from "next/server";
import { spawn } from "node-pty";

export const dynamic = "force-dynamic";

export interface SessionResponse {
  lines: string[];
}

const encoder = new TextEncoder();

export function GET() {
  const p = spawn("tmux", ["attach"], {
    name: "xterm-color",
    cols: 80,
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
): NextResponse<SpawnError | { detail: string }> {
  const { name } = params;

  const spawnRes = spawnSync(`tmux kill-session -t ${name}`, {
    shell: true,
  });

  if (spawnRes.status !== 0) {
    // Session not found error
    if (spawnRes.stderr.toString().trim().startsWith("can't find")) {
      return NextResponse.json(
        { detail: "Session not found" },
        { status: 404 }
      );
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
    detail: "Session deleted",
  });
}
