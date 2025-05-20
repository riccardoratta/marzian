import { getSavedSessions } from "@/lib/session";
import { SavedSessionsResponse } from "@/utils/interfaces";
import { NextResponse } from "next/server";

export function GET(): NextResponse<SavedSessionsResponse> {
  return NextResponse.json({
    sessions: getSavedSessions(),
  });
}
