import { z } from "zod";

export interface SpawnError {
  exitCode: number;
  stderr: string;
}

export interface Details {
  details: string;
}

export interface SessionResponse extends Session {
  command: string;
}

export interface SessionsResponse {
  sessions: Session[];
}

export interface Session {
  name: string;
  createdAt: number | null;
  pid?: number;
}

export const sessionNameSchema = z.string().regex(/^[a-zA-Z0-9\-_]+$/, {
  message: "Only letters, numbers, and dashes are allowed.",
});

export const SessionCreateRequest = z.object({
  name: sessionNameSchema,
  command: z.string(),
});

export interface SessionCreateResponse {
  name: string;
}

export interface SocketServerToClientEvents {
  data: (data: string) => void;
}

export interface SocketClientToServerEvents {
  write: (data: string) => void;
}

export interface Session {
  name: string;
  createdAt: number | null;
  pid?: number;
}

export interface SessionSkeleton {
  name: string;
  command: string;
}
