import { getTmuxHistoryLimit } from "@/lib/settings";
import { getMarzianDir } from "@/lib/shell";
import { SettingsResponse } from "@/utils/interfaces";
import { NextResponse } from "next/server";
import { dirname } from "path";

export function GET(): NextResponse<SettingsResponse> {
  return NextResponse.json({
    projectDir: dirname(getMarzianDir({ absolute: true })),
    tmuxHistoryLimit: getTmuxHistoryLimit(),
  });
}
