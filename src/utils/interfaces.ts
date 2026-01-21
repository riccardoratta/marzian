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
  createdAt?: Date;
  pid?: number;
  errorAt?: Date;
}

export const sessionNameSchema = z.string().regex(/^[a-zA-Z0-9\-_]+$/, {
  message: "Only letters, numbers, and dashes are allowed.",
});

export const sessionCreateSchema = z.object({
  name: sessionNameSchema,
  command: z.string(),
});

type SessionCreate = z.infer<typeof sessionCreateSchema>;

export const sessionCreateRequestSchema = z.object({
  session: sessionCreateSchema,
});

export type SessionCreateRequest = z.infer<typeof sessionCreateRequestSchema>;

export interface SessionCreateResponse {
  name: string;
}

export interface SocketServerToClientEvents {
  data: (data: string) => void;
}

export interface SocketClientToServerEvents {
  write: (data: string) => void;
}

export type SavedSession = SessionCreate;

export interface SavedSessionsResponse {
  sessions: SavedSession[];
}
