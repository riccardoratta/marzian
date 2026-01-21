import { execSync } from "child_process";
import { existsSync, mkdirSync } from "fs";
import path from "path";

export const getPIDbyName = (name: string): number | undefined => {
  const scriptPath = path.join(getMarzianDir(), name);

  console.log(`getPIDbyName: ${scriptPath}`);

  // Find the PID of the command launched
  try {
    const psRes = execSync(
      `ps -eo pid,command | grep -w "${scriptPath}" | grep -v "tmux" | grep -v "grep"`,
      { encoding: "utf8" },
    );

    // Filter PIDs with regex
    const PIDs = psRes.split("\n").map((line) => {
      if (line.length !== 0) {
        const match = /(\d+) (.+)/.exec(line);
        if (match) {
          return parseInt(match[1]);
        }
      }
    });

    console.log("psRes:\n", psRes);
    console.log("Parsed PIDs:", PIDs);

    for (const PID of PIDs) {
      if (PID) {
        return PID;
      }
    }
  } catch (err) {
    // @ts-expect-error catch when exitCode in err
    // The grep returns 1, then it fails, when no match is found
    if ("status" in err && err.status === 1) {
      return undefined;
    }

    console.error("Unable to getPIDbyName", err);

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
