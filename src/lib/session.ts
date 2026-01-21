import { spawn, spawnSync } from "child_process";
import { getMarzianDir, getPIDbyName } from "@/lib/shell";
import {
  writeFileSync,
  rmSync,
  existsSync,
  readFileSync,
  readdirSync,
  unlinkSync,
  mkdirSync,
} from "fs";
import { SavedSession, Session } from "@/utils/interfaces";
import {
  getPostScriptPath,
  getPrevScriptPath,
  getScriptErrorPath,
  getScriptPath,
} from "./file";
import { dirname } from "path";

const lsRe = /^([^:]+):\s+(\d+)\s+windows\s+\(created\s+(.+)\)$/;

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

  const sessionsInMarzianDir = getSavedSessions().map(
    (session) => session.name,
  );

  // Loop for all the sessions in the "tmux ls" output
  for (const line of lsOutput.split("\n")) {
    if (line.length !== 0) {
      const match = lsRe.exec(line.trim());
      if (match) {
        // Check if the tmux session has only one window
        if (parseInt(match[2]) === 1) {
          // Check if session has been created by marzian
          if (sessionsInMarzianDir.includes(match[1])) {
            const name = match[1];

            let errorAt = undefined;

            // Check if the session terminated with an error
            const scriptErrorPath = getScriptErrorPath(name);
            if (existsSync(scriptErrorPath)) {
              errorAt = new Date(
                // Parse the termination time
                parseInt(readFileSync(scriptErrorPath, "utf8").trim()) * 1_000,
              );
            }

            console.log(match[3]);

            sessions.push({
              name,
              createdAt: new Date(Date.parse(match[3])),
              errorAt,
            });
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

const EXEC_PERMISSION = {
  mode: 0o755,
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

  if (getSession(name)) {
    throw new TmuxError("There is another session with the same name.");
  }

  const scriptPath = getScriptPath(name);

  if (command) {
    writeFileSync(
      scriptPath,
      `source ${getPrevScriptPath()}\n${command}\nsource ${getPostScriptPath()}\n`,
      EXEC_PERMISSION,
    );
  } else {
    if (!existsSync(scriptPath)) {
      throw new Error(`Unable to write "${scriptPath}".`);
    }
  }

  const scriptErrorPath = getScriptErrorPath(name);

  // Create errors directory, if not present
  if (!existsSync(dirname(scriptErrorPath))) {
    mkdirSync(dirname(scriptErrorPath));
  }

  // Clear any possible past error for this script
  if (existsSync(scriptErrorPath)) {
    unlinkSync(scriptErrorPath);
  }

  if (!process.env.WORKING_DIR) {
    throw Error("Env variable WORKING_DIR not set.");
  }

  const envVariables = [
    `-e "NTFY_CHANNEL=${process.env.NTFY_CHANNEL}"`,
    `-e "SESSION_NAME=${name}"`,
    `-e "SCRIPT_ERROR_PATH=${scriptErrorPath}"`,
  ];

  const spawnRes = spawn(
    `tmux new-session -d -s ${name} -c ${process.env.WORKING_DIR} ${envVariables.join(" ")} ${scriptPath}`,
    {
      shell: true,
    },
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
        if (stderr.trim().startsWith("duplicate session")) {
          reject(
            new TmuxError("There is another tmux session with the same name."),
          );
        } else {
          reject(
            new TmuxError(undefined, {
              spawnArgs: spawnRes.spawnargs,
              exitCode: spawnRes.exitCode,
              stdout,
              stderr,
            }),
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
 * Delete a session from the file system (and its error file) and kill it from
 * tmux (using `killSession`).
 * @param name - The name of the session to delete.
 */
export const deleteSession = (name: string) => {
  const scriptPath = getScriptPath(name);
  if (existsSync(scriptPath)) {
    rmSync(scriptPath);
  }

  const scriptErrorPath = getScriptErrorPath(name);
  if (existsSync(scriptErrorPath)) {
    rmSync(scriptErrorPath);
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
  const spawnRes = spawnSync(`tmux capture-pane -Jp -S - -E - -t ${name}`, {
    shell: true,
  });

  if (spawnRes.status !== 0) {
    // Session not found error
    if (spawnRes.stderr.toString().trim().startsWith("can't find")) {
      throw new TmuxError("Session not found.");
    }

    // General error
    throw new TmuxError(undefined, {
      spawnArgs: `tmux capture-pane -Jp -S - -E - -t ${name}`.split(" "),
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

/**
 * Given a session name return its launch command saved on the marzian dir.
 */
export const getSessionCommand = (name: string) => {
  return readFileSync(getScriptPath(name), "utf8")
    .replace(RegExp(`source .+.prev\n`), "")
    .replace(RegExp(`\nsource .+.post\n`), "");
};

/**
 * Get all session currenty saved on disk in the marzian directory.
 */
export const getSavedSessions = (): SavedSession[] => {
  return readdirSync(getMarzianDir())
    .filter((name) => name !== ".error")
    .map((sessionName) => {
      return {
        name: sessionName,
        command: getSessionCommand(sessionName),
      };
    });
};
