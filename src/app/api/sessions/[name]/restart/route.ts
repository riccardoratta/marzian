import { restartSession } from "@/lib/session";
import { Details } from "@/utils/interfaces";
import { type NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(
  _: NextRequest,
  { params }: { params: Promise<{ name: string }> }
): Promise<NextResponse<string | Details>> {
  await restartSession((await params).name);

  return NextResponse.json({
    details: "Session restarted.",
  });
}
