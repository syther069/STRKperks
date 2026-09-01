import { NextResponse } from "next/server";
export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error: "Approval generation is disabled until a signed campaign-owner transaction is available",
    },
    { status: 501 },
  );
}
