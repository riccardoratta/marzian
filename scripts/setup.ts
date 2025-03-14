import { promises as fs } from "fs";
import path from "path";
import { exit } from "process";
import { execSync } from "child_process";

const BUST_LIST: readonly (string | string[])[] = [
  "node_modules",
  "next-env.d.ts",
  ".next",
];

const rm = async (...srcPath: string[]): Promise<void> => {
  const target = path.join(process.cwd(), ...srcPath);

  try {
    await fs.rm(target, { recursive: true, force: true });
  } catch (error) {
    console.log(error);
    console.log("Could not remove path", target);
    exit(10);
  }
};

const setup = async (): Promise<void> => {
  const skipEnv = process.argv.includes("--noenv");

  console.log("Beginning setup...\n");

  if (BUST_LIST.length) {
    console.log("Busting cache...");
    for (const bust of BUST_LIST) {
      const b = Array.isArray(bust) ? bust : [bust];
      console.log("Target:\t", path.join(process.cwd(), ...b));
      await rm(...b);
    }
  }

  console.log("\nInstalling packages...");

  try {
    execSync("npm install", { stdio: [0, 1, 2] });
  } catch (error) {
    console.log(error);
    console.log("Could not install packages.");
    exit(10);
  }

  if (skipEnv) {
    console.log(
      "\nEnvironment file will not be handled, as per launch options."
    );
  } else {
    console.log("\nHandling .env file...");
    const envPath = path.join(process.cwd(), ".env");
    const envTemplatePath = path.join(process.cwd(), ".env.template");

    let needsTemplate = true;

    try {
      await fs.access(envPath);
      console.log(".env file already exists, template copy skipped.");
      needsTemplate = false;
    } catch (error) {
      if (
        typeof error === "object" &&
        error &&
        "code" in error &&
        error.code === "ENOENT"
      ) {
        console.log(".env file was not detected. Template will be copied.");
      } else {
        console.log(error);
        console.log("Error in checking the .env file.");
        exit(11);
      }
    }

    if (needsTemplate) {
      try {
        await fs.copyFile(envTemplatePath, envPath);
        console.log("Template copied successfully.");
      } catch (error) {
        console.log(error);
        console.log("Could not copy the template file.");
        exit(11);
      }
    }
  }

  console.log("\nSetup completed.");
};

void setup();
