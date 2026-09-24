import { NextRequest, NextResponse } from "next/server";
import { getSettings, updateSetting } from "@/lib/db";

export async function GET() {
  try {
    const settings = await getSettings();
    const dpPercentage = parseInt(settings["dp_percentage"] || "30", 10);

    return NextResponse.json({
      dpPercentage: isNaN(dpPercentage) ? 30 : dpPercentage,
    });
  } catch (error: any) {
    console.error("Settings GET error:", error);
    return NextResponse.json({ error: error?.message || "Failed to fetch settings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { dpPercentage } = body;

    if (typeof dpPercentage !== "number" || dpPercentage < 0 || dpPercentage > 100) {
      return NextResponse.json(
        { error: "dpPercentage harus berupa angka antara 0 dan 100" },
        { status: 400 }
      );
    }

    await updateSetting("dp_percentage", String(dpPercentage));
    return NextResponse.json({ success: true, dpPercentage });
  } catch (error: any) {
    console.error("Settings POST error:", error);
    return NextResponse.json({ error: error?.message || "Failed to update settings" }, { status: 500 });
  }
}
