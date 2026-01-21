import { Server } from "socket.io";
import { getSession } from "@/lib/session";
import { spawn } from "node-pty";
import {
  SocketClientToServerEvents,
  SocketServerToClientEvents,
} from "@/utils/interfaces";
import { TMUX_DEFAULT_COLS, TMUX_DEFAULT_ROWS } from "@/utils/misc";

const attachTmux = (sessionName: string) => {
  return spawn("tmux", ["attach", "-t", sessionName], {
    name: "xterm-color",
    cols: TMUX_DEFAULT_COLS,
    rows: TMUX_DEFAULT_ROWS,
    cwd: process.env.HOME,
    env: process.env,
  });
};

export const setupSocketHandler = (
  io: Server<SocketClientToServerEvents, SocketServerToClientEvents>,
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
        false,
      );
    }
  }).on("connection", (socket) => {
    const sessionName = socket.nsp.name.substring(1); // always remove "/"
    console.log(`A client connected to the session "${sessionName}"`);

    const p = attachTmux(sessionName);

    p.onData((data) => {
      socket.emit("data", data);
    });

    // This is when we receive any command from the user
    socket.on("write", (data) => {
      p.write(data);
    });

    // This is when we receive a resize event from the user
    socket.on("resize", (data) => {
      p.resize(data.cols, data.rows);
    });

    socket.on("disconnect", () => {
      p.kill();
    });
  });
};
