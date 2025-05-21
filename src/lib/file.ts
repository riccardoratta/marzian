import path from "path";
import { getMarzianDir } from "@/lib/shell";

export const getScriptPath = (name: string) => path.join(getMarzianDir(), name);

export const getPrevScriptPath = (name: string) =>
  path.join(getMarzianDir(), `${name}.prev`);

export const getPostScriptPath = (name: string) =>
  path.join(getMarzianDir(), `${name}.post`);
