import { spawn, spawnSync } from "child_process";
import { getMarzianDir, getPIDbyName, stayOpenScript } from "../lib/shell";
import {
  writeFileSync,
  rmSync,
  existsSync,
  readFileSync,
  readdirSync,
} from "fs";
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

  const sessionsInMarzianDir = readdirSync(getMarzianDir());

  for (const line of lsOutput.split("\n")) {
    if (line.length !== 0) {
      const match = lsRe.exec(line.trim());
      if (match) {
        // Check if the tmux session has only one window
        if (parseInt(match[2]) === 1) {
          // Check if session has been created by marzian
          if (sessionsInMarzianDir.includes(match[1])) {
            sessions.push({ name: match[1], createdAt: Date.parse(match[3]) });
          }
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

export const getSessionWithCommand = (
  name: string
): (Session & { command: string }) | undefined => {
  for (const session of getSessions()) {
    if (session.name === name) {
      return {
        ...session,
        command: readFileSync(path.join(getMarzianDir(), name))
          .toString()
          .replace(`\n${stayOpenScript}`, ""),
      };
    }
  }
};

/**
 * Create a new session.
 * @param name - The name of the session to create.
 * @param command - (Optional) The command sent to the session. If not present,
 * it will be used the command in the `scriptPath`, if `scriptPath` doesn't
 * exist an error will be thrown.
 */
export const createSession = (name: string, command?: string) => {
  console.log(`Creating new tmux session with name ${name}`);

  const scriptPath = path.join(getMarzianDir(), name);

  if (command) {
    writeFileSync(scriptPath, `${command};\n${stayOpenScript}`, {
      mode: 0o755,
    });
  } else {
    // If scriptPath doesn't exists
    if (!existsSync(scriptPath)) {
      // Throw an error
      throw new Error(`File scriptPath "${scriptPath}" doesn't exist.`);
    }
  }

  if (!process.env.WORKING_DIR) {
    throw Error("Env variable WORKING_DIR not set.");
  }

  const spawnRes = spawn(
    "tmux",
    [
      "new-session",
      "-d",
      "-s",
      name,
      "-c",
      process.env.WORKING_DIR,
      scriptPath,
    ],
    {
      shell: true,
    }
  );

  let stdout = "";
  let stderr = "";

  spawnRes.stderr.on("data", (data: unknown) => {
    stderr += String(data);
  });

  spawnRes.stdout.on("data", (data: unknown) => {
    stdout += String(data);
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

/**
 * Kill a session using tmux `kill-session`.
 * @param name - The name of the session to kill.
 */
const killSession = (name: string) => {
  const spawnRes = spawnSync(`tmux kill-session -t ${name}`, {
    shell: true,
  });

  if (spawnRes.status !== 0) {
    // Session not found error
    if (spawnRes.stderr.toString().trim().startsWith("can't find")) {
      throw new TmuxError("Session not found.");
    }

    // General error
    throw new TmuxError(undefined, {
      spawnArgs: `tmux kill-session -t ${name}`.split(" "),
      exitCode: spawnRes.status,
      stdout: spawnRes.stdout.toString(),
      stderr: spawnRes.stderr.toString(),
    });
  }
};

/**
 * Delete a session from the file system and kill it from tmux (using
 * `killSession`).
 * @param name - The name of the session to delete.
 */
export const deleteSession = (name: string) => {
  const scriptPath = path.join(getMarzianDir(), name);
  if (existsSync(scriptPath)) {
    rmSync(scriptPath);
  }

  killSession(name);
};

/**
 * Restart a session. The script in the `scriptPath` will be used to restart the
 * same script.
 * @param name - The name of the session to restart.
 */
export const restartSession = (name: string) => {
  killSession(name);
  return createSession(name);
};

export const captureSession = (name: string) => {
  const spawnRes = spawnSync(`tmux capture-pane -Jp -t ${name}`, {
    shell: true,
  });

  if (spawnRes.status !== 0) {
    // Session not found error
    if (spawnRes.stderr.toString().trim().startsWith("can't find")) {
      throw new TmuxError("Session not found.");
    }

    // General error
    throw new TmuxError(undefined, {
      spawnArgs: `tmux capture-pane -p -t ${name}`.split(" "),
      exitCode: spawnRes.status,
      stdout: spawnRes.stdout.toString(),
      stderr: spawnRes.stderr.toString(),
    });
  }

  return spawnRes.stdout.toString();
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
    if (Object.hasOwn(Error, "captureStackTrace")) {
      Error.captureStackTrace(this, TmuxError);
    }
  }
}
