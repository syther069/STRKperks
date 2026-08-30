import { NextResponse } from "next/server";
import { INITIAL_CAMPAIGNS } from "@/lib/data/initialData";

export async function GET() {
  return NextResponse.json({
    success: true,
    campaigns: INITIAL_CAMPAIGNS,
  });
}
