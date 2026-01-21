import { getTmuxHistoryLimit } from "@/lib/settings";
import { getMarzianDir } from "@/lib/shell";
import { SettingsResponse } from "@/utils/interfaces";
import { NextResponse } from "next/server";

export function GET(): NextResponse<SettingsResponse> {
  return NextResponse.json({
    marzianDir: getMarzianDir({ absolute: true }),
    tmuxHistoryLimit: getTmuxHistoryLimit(),
  });
}
