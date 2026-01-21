import { join } from "path";
import { getMarzianDir } from "@/lib/shell";

export const getScriptPath = (name: string) => join(getMarzianDir(), name);

export const getScriptErrorPath = (name: string) =>
  join(getMarzianDir(), ".error", name);

export const getPrevScriptPath = () =>
  join(globalThis.sourceDir, "scripts", "tmux-helpers", "prev");

export const getPostScriptPath = () =>
  join(globalThis.sourceDir, "scripts", "tmux-helpers", "post");
