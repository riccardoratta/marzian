import { SpawnError } from "@/utils/interfaces";
import { spawnSync } from "child_process";
import { type NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

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
    if (spawnRes.stderr.toString().trim().startsWith("can't find pane")) {
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
