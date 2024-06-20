import { Server } from "socket.io";
import { getSession } from "../lib/data";
import { spawn } from "node-pty";
import {
  SocketClientToServerEvents,
  SocketServerToClientEvents,
} from "@/utils/interfaces";

const spawnTmux = (sessionName: string) => {
  return spawn("tmux", ["attach", "-t", sessionName], {
    name: "xterm-color",
    cols: 95,
    rows: 30,
    cwd: process.env.HOME,
    env: process.env,
  });
};

export const setupSocketHandler = (
  io: Server<SocketClientToServerEvents, SocketServerToClientEvents>
) => {
  io.of((name, _, next) => {
    const session = getSession(name.substring(1));
    if (session) {
      next(null, true);
    } else {
      // Session not found
      console.warn("Session not found.");
      next(
        {
          name: "SessionNotFound",
          message: `Session "${name}" not found.`,
        },
        false
      );
    }
  }).on("connection", (socket) => {
    const sessionName = socket.nsp.name.substring(1); // always remove "/"
    console.log(`A client connected to the session "${sessionName}"`);

    const p = spawnTmux(sessionName);

    p.onData((data) => {
      socket.emit("data", data);
    });

    socket.on("write", (data) => {
      p.write(data);
    });

    socket.on("disconnect", () => {
      p.kill();
    });
  });
};
