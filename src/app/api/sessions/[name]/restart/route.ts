import { restartSession } from "@/lib/data";
import { Details } from "@/utils/interfaces";
import { type NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(
  _: NextRequest,
  { params }: { params: { name: string } }
): Promise<NextResponse<string | Details>> {
  await restartSession(params.name);

  return NextResponse.json({
    details: "Session restarted.",
  });
}
