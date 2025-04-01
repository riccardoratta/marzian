#!/usr/bin/env tsx

import { setupSocketHandler } from "./lib/socket";
import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";
import { Option, program } from "commander";
import { parse } from "url";

program
  .option("--path <path>", "project path")
  .addOption(new Option("--port <number>", "port number").default(undefined));

// Parse the command line arguments
program.parse();
const options: { path: string; port?: number } = program.opts();

const dev = process.env.NODE_ENV !== "production";

if (dev) {
  console.log("Development mode");
}

if (!options.port) {
  options.port = dev ? 3000 : 8080;
}

const app = next({
  customServer: true,
  dir: options.path,
  dev,
  hostname: "localhost",
  port: options.port,
});
const handler = app.getRequestHandler();

void app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    if (req.url) void handler(req, res, parse(req.url, true));
  });

  const io = new Server(httpServer);

  setupSocketHandler(io);

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(app.port, () => {
      console.log(`Listening on http://localhost:${String(app.port)}`);
    });
});
