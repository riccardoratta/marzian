import { promises as fs } from "fs";
import path from "node:path";
import { exec } from "child_process";

const silentUnlink = async (...srcPath: string[]): Promise<boolean> => {
  try {
    await fs.rm(path.join(process.cwd(), ...srcPath), {
      recursive: true,
      force: true,
    });
  } catch (error) {
    console.log(error);
    return false;
  }

  return true;
};

const installApp = async () => {
  // Bust node_modules cache
  const nodeModulesCache = await silentUnlink("node_modules");

  if (!nodeModulesCache) {
    return console.log("Could not bust node_modules");
  }

  // Bust Next.js cache
  const nextEnv = await silentUnlink("next-env.d.ts");

  if (!nextEnv) {
    return console.log("Could not bust Next.js' environment module");
  }

  const nextCache = await silentUnlink(".next");

  if (!nextCache) {
    return console.log("Could not bust Next.js' cache");
  }

  // Install package
  try {
    exec("npm i", (exc, stdout, stderr) => {
      console.log(stdout);
      console.log(stderr);

      if (exc) {
        console.log(exc);
      }
    });
  } catch (error) {
    console.log(error);
    console.log("Could not install package");
  }
};

void installApp();
