import { createSession, getSessions } from "@/lib/data";
import {
  Details,
  SessionCreateRequest,
  SessionCreateResponse,
  SessionsResponse,
} from "@/utils/interfaces";
import { InternalServerError } from "@/utils/server";
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
  const { name, command } = SessionCreateRequest.parse(await request.json());

  try {
    await createSession(name, command);
  } catch (err) {
    return InternalServerError(err);
  }

  return NextResponse.json({ name });
}
