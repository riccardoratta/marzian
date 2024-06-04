import { Server } from "socket.io";
import { getSession } from "@/lib/data";

export const setupTmuxSocket = (io: Server) => {
  io.of((name, _, next) => {
    const session = getSession(name);
    if (session) {
      next(null, true);
    } else {
      // Session not found
      next(
        {
          name: "SessionNotFound",
          message: `Session "${name}" not found.`,
        },
        false
      );
    }
  }).on("connection", (socket) => {
    const name = socket.nsp.name;
    console.log(`A client connected to the session ${name}`);
  });
};
