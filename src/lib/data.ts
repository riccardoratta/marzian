import { spawn, spawnSync } from "child_process";
import { getMarzianDir, getPIDbyName, stayOpenScript } from "@/lib/shell";
import { writeFileSync, rmSync, existsSync } from "fs";
import path from "path";

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

export const getSession = (name: string): Session | undefined => {
  for (const session of getSessions()) {
    if (session.name === name) {
      return session;
    }
  }
};

export const createSession = (name: string, command: string) => {
  console.log(`Creating new tmux session with name ${name}`);

  const scriptPath = path.join(getMarzianDir(), name);

  writeFileSync(scriptPath, `${command};\n${stayOpenScript}`, { mode: 0o755 });

  const spawnRes = spawn(
    "tmux",
    ["new-session", "-d", "-s", name, scriptPath],
    {
      shell: true,
    }
  );

  let stdout = "";
  let stderr = "";

  spawnRes.stderr.on("data", (data) => {
    stderr += data;
  });

  spawnRes.stdout.on("data", (data) => {
    stdout += data;
  });

  return new Promise<void>((resolve, reject) => {
    spawnRes.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        if (stderr.toString().trim().startsWith("duplicate session")) {
          reject(
            new TmuxError("There is another tmux session with the same name.")
          );
        } else {
          reject(
            new TmuxError(undefined, {
              spawnArgs: spawnRes.spawnargs,
              exitCode: spawnRes.exitCode,
              stdout,
              stderr,
            })
          );
        }
      }
    });
  });
};

export const deleteSession = (name: string) => {
  const scriptPath = path.join(getMarzianDir(), name);
  if (existsSync(scriptPath)) {
    rmSync(scriptPath);
  }

  const spawnRes = spawnSync(`tmux kill-session -t ${name}`, {
    shell: true,
  });

  if (spawnRes.status !== 0) {
    // Session not found error
    if (spawnRes.stderr.toString().trim().startsWith("can't find")) {
      return new TmuxError("Session not found.");
    }

    // General error
    return new TmuxError(undefined, {
      spawnArgs: `tmux kill-session -t ${name}`.split(" "),
      exitCode: spawnRes.status,
      stdout: spawnRes.stdout.toString(),
      stderr: spawnRes.stderr.toString(),
    });
  }
};

interface TmuxErrorContext {
  spawnArgs: string[];
  exitCode: number | null;
  stdout: string;
  stderr: string;
}

export class TmuxError extends Error {
  context: TmuxErrorContext | undefined;

  constructor(message?: string, context?: TmuxErrorContext) {
    super(message);
    // Set the name property to the class name
    this.name = "TmuxError";

    this.context = context;

    // Set the prototype explicitly to ensure `instanceof` works correctly
    Object.setPrototypeOf(this, TmuxError.prototype);

    // Optionally, capture the stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, TmuxError);
    }
  }
}
