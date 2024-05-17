import { spawnSync } from "child_process";
import { getPIDbyName } from "@/utils/shell";

const lsRe = /^([^:]+):\s+(\d+)\s+windows\s+\(created\s+(.+)\)$/;

export interface Session {
  name: string;
  createdAt: number | null;
  pid?: number;
}

export const getSessions = (): Session[] => {
  const spawnRes = spawnSync("tmux ls", { shell: true });

  if (
    spawnRes.status === 1 &&
    spawnRes.stderr.toString().trim().startsWith("no server running on")
  ) {
    return [];
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

  return sessions;
};
