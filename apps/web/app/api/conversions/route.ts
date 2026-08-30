import { NextResponse } from "next/server";
import { INITIAL_CONVERSIONS } from "@/lib/data/initialData";

export async function GET() {
  return NextResponse.json({
    success: true,
    conversions: INITIAL_CONVERSIONS,
  });
}
