import { getCloudflareContext } from "@opennextjs/cloudflare";

import { callGas } from "@/lib/gas";
import {
  appealRequestId,
  maxAppealFiles,
  publicAppealSubmissionSchema,
  validateAppealFile,
} from "@/lib/public-appeal";
import { maxUploadBytes } from "@/lib/validation";

const maxUploadRequestBytes = maxUploadBytes + 16 * 1024;
const maxSubmissionRequestBytes = 128 * 1024;

type AppealRateLimit = { limit(options: { key: string }): Promise<{ success: boolean }> };

function failure(message: string, status: number) {
  return Response.json({ ok: false, message }, { status });
}

async function checkRequest(request: Request, expectedType: string) {
  const origin = request.headers.get("origin");
  if (request.headers.get("sec-fetch-site") === "cross-site" ||
      (origin && origin !== new URL(request.url).origin)) {
    return failure("請從申訴系統重新開啟表單。", 403);
  }

  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== expectedType) {
    return failure("無法讀取送件格式。", 415);
  }

  const ip = request.headers.get("cf-connecting-ip");
  if (ip) {
    const { env } = await getCloudflareContext({ async: true });
    const limiter = (env as { PUBLIC_APPEAL_RATE_LIMIT?: AppealRateLimit }).PUBLIC_APPEAL_RATE_LIMIT;
    if (limiter && !(await limiter.limit({ key: ip })).success) {
      return failure("送件請求過於頻繁，請稍後重試。", 429);
    }
  }
}

class BodyTooLarge extends Error {}

function cappedBody(request: Request, maxBytes: number) {
  if (Number(request.headers.get("content-length")) > maxBytes) throw new BodyTooLarge();

  let bytesRead = 0;
  const stream = request.body?.pipeThrough(new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, controller) {
      bytesRead += chunk.byteLength;
      if (bytesRead > maxBytes) throw new BodyTooLarge();
      controller.enqueue(chunk);
    },
  }));
  return new Response(stream, { headers: { "Content-Type": request.headers.get("content-type")! } });
}

export async function PUT(request: Request) {
  const blocked = await checkRequest(request, "multipart/form-data");
  if (blocked) return blocked;

  let body: FormData;
  try {
    body = await cappedBody(request, maxUploadRequestBytes).formData();
  } catch (error) {
    return error instanceof BodyTooLarge
      ? failure("單一附件不可超過 8 MB。", 413)
      : failure("無法讀取附件。", 400);
  }

  const requestId = appealRequestId.safeParse(body.get("requestId"));
  const slot = body.get("slot");
  const file = body.get("file");
  if (!requestId.success || typeof slot !== "string" || !/^\d$/.test(slot) ||
      Number(slot) >= maxAppealFiles || !file || typeof file === "string" || body.getAll("file").length !== 1) {
    return failure("附件資料不完整。", 400);
  }

  const validated = validateAppealFile(file);
  if (validated.error) return failure(validated.error, 400);

  try {
    const data = await callGas<{ fileId: string }>("uploadPublicCaseFile", {
      requestId: requestId.data,
      slot: Number(slot),
      file: { name: file.name, mimeType: validated.mimeType, data: Buffer.from(await file.arrayBuffer()).toString("base64") },
    });
    if (!data || typeof data.fileId !== "string" || !data.fileId) throw new Error("Missing upload receipt");
    return Response.json({ ok: true, data: { fileId: data.fileId } });
  } catch {
    return failure("附件上傳暫時失敗，請重試送件。", 502);
  }
}

export async function POST(request: Request) {
  const blocked = await checkRequest(request, "application/json");
  if (blocked) return blocked;

  let body: unknown;
  try {
    body = await cappedBody(request, maxSubmissionRequestBytes).json();
  } catch (error) {
    return error instanceof BodyTooLarge
      ? failure("申訴內容超過長度限制。", 413)
      : failure("無法讀取申訴資料。", 400);
  }
  const parsed = publicAppealSubmissionSchema.safeParse(body);
  if (!parsed.success) return failure(parsed.error.issues[0].message, 400);

  const { department, departmentOther, ...fields } = parsed.data;
  try {
    const data = await callGas<{ publicId: string }>("submitPublicCase", {
      ...fields,
      department: department === "其他" ? `其他, ${departmentOther}` : department,
    });
    if (!data || typeof data.publicId !== "string" || !data.publicId) throw new Error("Missing case number");
    return Response.json({ ok: true, data: { publicId: data.publicId } });
  } catch {
    return failure("暫時無法確認送件，請重試送件以確認案件是否建立。", 502);
  }
}
