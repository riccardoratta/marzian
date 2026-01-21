import { execSync } from "node:child_process";

export const getTmuxHistoryLimit = () => {
  const res = execSync("tmux show-options -g history-limit", {
    encoding: "utf8",
  });

  return parseInt(res.replace("history-limit ", ""));
};
