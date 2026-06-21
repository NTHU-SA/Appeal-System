import { NextResponse } from "next/server";

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { sendCaseEmail } from "@/lib/notifications";
import { shouldAutoCloseCase } from "@/lib/workflow";

export async function GET(request: Request) {
  const expectedSecret = process.env.CRON_SECRET;
  const requestSecret = new URL(request.url).searchParams.get("secret");
  const bearer = request.headers.get("authorization")?.replace("Bearer ", "");

  if (expectedSecret && requestSecret !== expectedSecret && bearer !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = getSupabaseAdmin();
  const { data: cases, error } = await admin
    .from("cases")
    .select("*")
    .eq("status", "in_progress");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const now = new Date();
  const stale = (cases || []).filter((item) =>
    shouldAutoCloseCase({
      status: item.status,
      lastStaffMessageAt: item.last_staff_message_at
        ? new Date(item.last_staff_message_at)
        : null,
      lastStudentMessageAt: item.last_student_message_at
        ? new Date(item.last_student_message_at)
        : null,
      now,
    })
  );

  for (const item of stale) {
    const closedAt = now.toISOString();
    await admin
      .from("cases")
      .update({ status: "closed", closed_at: closedAt, updated_at: closedAt })
      .eq("id", item.id);
    await admin.from("audit_logs").insert({
      case_id: item.id,
      action: "auto_close_stale_case",
      metadata: { staleDays: 14 },
    });
    await sendCaseEmail({
      to: item.student_email,
      subject: `案件 ${item.public_id} 已自動結案`,
      title: "案件已結案",
      preview: `案件 ${item.public_id} 已結案`,
      body: "學權組織回覆後已超過 14 天未收到您的補充回覆，系統已將案件設為已結案。",
      caseId: item.public_id,
      event: "auto-closed",
    });
  }

  return NextResponse.json({ closed: stale.length });
}
