import { spawnSync } from "child_process";
import { NextResponse, type NextRequest } from "next/server";

const lsRe = /^([^:]+):\s+(\d+)\s+windows\s+\(created\s+(.+)\)$/;

export interface SessionsResponse {
  sessions: Session[];
}

interface Session {
  name: string;
  createdAt: number;
}

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse<SessionsResponse>> {
  const ls = spawnSync("tmux ls", { shell: true });

  if (
    ls.status === 1 &&
    ls.stderr.toString().trim().startsWith("no server running on")
  ) {
    return NextResponse.json({ sessions: [] });
  }

  const lsOutput = ls.stdout.toString();

  const sessions: Session[] = [];

  for (const line of lsOutput.split("\n")) {
    if (line.length !== 0) {
      const match = lsRe.exec(line.trim());
      if (match) {
        // Check if the tmux session has only one window
        if (parseInt(match[2]) === 1) {
          sessions.push({ name: match[1], createdAt: Date.parse(match[3]) });
        }
      }
    }
  }

  return NextResponse.json({ sessions });
}
