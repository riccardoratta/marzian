import { createSession, getSessions, TmuxError } from "@/lib/session";
import {
  sessionCreateRequestSchema,
  type Details,
  type SessionCreateResponse,
  type SessionsResponse,
} from "@/utils/interfaces";
import { badRequest, internalServerError } from "@/utils/server";
import { type NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET(): NextResponse<SessionsResponse> {
  return NextResponse.json({
    sessions: getSessions(),
  });
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<SessionCreateResponse | Details>> {
  const {
    session: { name, command },
  } = sessionCreateRequestSchema.parse(await request.json());

  try {
    await createSession(name, command);
  } catch (err) {
    if (err instanceof TmuxError) {
      if (err.message) {
        return badRequest(err.message);
      }
    }

    return internalServerError(err);
  }

  return NextResponse.json({ name });
}
