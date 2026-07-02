import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db";

const subscribeSchema = z.object({
  email: z.string().trim().email("Format email belum valid. Contoh: nama@email.com"),
  source: z.string().trim().optional()
});

export async function POST(request: NextRequest) {
  try {
    const parsed = subscribeSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Format email belum valid." }, { status: 400 });
    }

    await getDb().emailSubscriber.upsert({
      where: { email: parsed.data.email },
      update: {},
      create: { email: parsed.data.email, source: parsed.data.source || "unknown" }
    });

    return NextResponse.json({ success: true, message: "Subscribed successfully" });
  } catch (error) {
    console.error("Subscribe error:", error);
    return NextResponse.json({ error: "Subscribe gagal karena server bermasalah. Coba ulangi sebentar lagi." }, { status: 500 });
  }
}
