import { execSync } from "child_process";

export const getPIDbyName = (name: string): number | undefined => {
  // Find the PID of the command launched
  const result = execSync(`pgrep -f -n "echo 'marzian:${name}'"`)
    .toString()
    .trim();

  if (result.length !== 0) {
    return parseInt(result);
  }
};
