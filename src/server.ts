#!/usr/bin/env tsx

import { setupSocketHandler } from "./lib/socket";
import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const port = process.env.PORT ?? 3000;

if (dev) {
  console.log("Development mode");
}

const app = next({
  customServer: true,
  dir: process.argv.length === 3 ? process.argv[2] : undefined,
  dev,
  hostname: "localhost",
  port,
});
const handler = app.getRequestHandler();

void app.prepare().then(() => {
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  const httpServer = createServer(handler);

  const io = new Server(httpServer);

  setupSocketHandler(io);

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`Listening on port ${port}`);
    });
});
