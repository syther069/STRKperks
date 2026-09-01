import { NextResponse } from "next/server";
import { INITIAL_CONVERSIONS } from "@/lib/data/initialData";

export async function GET() {
  return NextResponse.json({
    success: true,
    mode: "demo_fixture",
    dataSource: "local static fixture; not chain state",
    conversions: INITIAL_CONVERSIONS,
  });
}
