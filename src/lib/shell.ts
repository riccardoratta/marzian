import { execSync, spawnSync } from "child_process";
import { existsSync, mkdirSync } from "fs";
import { homedir } from "os";
import path from "path";

export const getPIDbyName = (name: string): number | undefined => {
  // Find the PID of the command launched
  const spawnRes = spawnSync(`pgrep -f -n "${name}"`, {
    shell: true,
  });

  const result = spawnRes.stdout.toString().trim();

  if (result.length !== 0) {
    const pid = parseInt(result);

    // Check if the PID is acually from the script inside tmux
    if (
      !execSync(`ps -p ${pid} -o command=`).toString().trim().startsWith("tmux")
    ) {
      return pid;
    }
  }
};

// export const stayOpenScript = `while true; do ${
//   process.env.DEFAULT_SHELL ?? "bash"
// }; done`;

export const stayOpenScript = `exec ${process.env.DEFAULT_SHELL ?? "bash"}`;

export const getMarzianDir = () => {
  const marzianDir = path.join(homedir(), ".marzian");
  if (!existsSync(marzianDir)) {
    mkdirSync(marzianDir);
  }

  return marzianDir;
};
