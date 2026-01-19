import path from "path";
import { getMarzianDir } from "@/lib/shell";

export const getScriptPath = (name: string) => path.join(getMarzianDir(), name);

export const getPrevScriptPath = () =>
  path.join(globalThis.sourceDir, "scripts", "tmux-helpers", "prev");

export const getPostScriptPath = () =>
  path.join(globalThis.sourceDir, "scripts", "tmux-helpers", "post");
