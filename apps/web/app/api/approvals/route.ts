import { NextResponse } from "next/server";
import { deriveNullifier } from "@/lib/campaign/nullifier";
import { z } from "zod";

const approvalSchema = z.object({
  campaignNamespace: z.string().trim().min(1).max(128),
  conversionId: z.string().trim().min(1).max(256),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = approvalSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "campaignNamespace and conversionId are required" },
        { status: 400 },
      );
    }
    const { campaignNamespace, conversionId } = parsed.data;

    const nullifier = deriveNullifier(campaignNamespace, conversionId);

    return NextResponse.json({
      success: true,
      nullifier,
      message: "Conversion approval payload prepared",
      timestamp: Math.floor(Date.now() / 1000),
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Invalid payload" },
      { status: 400 }
    );
  }
}
