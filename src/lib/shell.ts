import { execSync } from "child_process";
import { existsSync, mkdirSync } from "fs";
import path from "path";

export const getPIDbyName = (name: string): number | undefined => {
  const scriptPath = path.join(getMarzianDir(), name);

  // Find the PID of the command launched
  try {
    const psRes = execSync(
      `ps -eo pid,command | grep -w "${scriptPath}" | grep -v "tmux" | grep -v "grep"`
    );

    // Filter PIDs with regex
    const PIDs = psRes
      .toString()
      .split("\n")
      .map((line) => {
        if (line.length !== 0) {
          const match = /(\d+ )(.+)/.exec(line);
          if (match) {
            return parseInt(match[1].trim());
          }
        }
      });

    for (const PID of PIDs) {
      if (PID) {
        return PID;
      }
    }
  } catch (err) {
    // console.log(err, "status" in err, err.status === 1);
    // @ts-expect-error catch when exitCode in err
    if ("status" in err && err.status === 1) {
      return undefined;
    }

    throw err;
  }
};

export const getMarzianDir = () => {
  const marzianDir = path.join(process.env.WORKING_DIR, ".marzian");
  if (!existsSync(marzianDir)) {
    mkdirSync(marzianDir);
  }

  return marzianDir;
};
