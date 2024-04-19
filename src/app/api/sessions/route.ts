import { SpawnError } from "@/utils/interfaces";
import { getPIDbyName } from "@/utils/shell";
import { execSync, spawnSync } from "child_process";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const lsRe = /^([^:]+):\s+(\d+)\s+windows\s+\(created\s+(.+)\)$/;

export interface SessionsResponse {
  sessions: Session[];
}

interface Session {
  name: string;
  createdAt: number;
  pid?: number;
}

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse<SessionsResponse>> {
  const spawnRes = spawnSync("tmux ls", { shell: true });

  if (
    spawnRes.status === 1 &&
    spawnRes.stderr.toString().trim().startsWith("no server running on")
  ) {
    return NextResponse.json({ sessions: [] });
  }

  const lsOutput = spawnRes.stdout.toString();

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

  for (const session of sessions) {
    session.pid = getPIDbyName(session.name);
  }

  return NextResponse.json({ sessions });
}

const SessionCreateRequest = z.object({
  name: z.string().regex(/^[a-zA-Z0-9\-\_]+$/, {
    message: "Only letters, numbers, and dashes are allowed.",
  }),
  command: z.string(),
});

export interface SessionCreateResponse {
  name: string;
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<SessionCreateResponse | SpawnError>> {
  const { name, command } = SessionCreateRequest.parse(await request.json());

  console.log(
    `Creating new tmux session with name ${name} and command "${command}"`
  );

  // Add an unique suffix into the command to ensure uniquess with `pgrep`
  const uniqueCommand = `${command} && echo 'marzian:${name}'`;

  const spawnRes = spawnSync(
    `tmux new-session -d -s ${name} "${uniqueCommand}"`,
    {
      shell: true,
    }
  );

  if (spawnRes.status === 0) {
    return NextResponse.json({
      name,
    });
  }

  return NextResponse.json(
    {
      exitCode: spawnRes.status ?? -1,
      stderr: spawnRes.stderr.toString(),
    },
    { status: 500 }
  );
}
