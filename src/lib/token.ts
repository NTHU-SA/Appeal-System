import { createHash, randomBytes } from "node:crypto";

export function createCaseToken() {
  return randomBytes(32).toString("base64url");
}

export function hashCaseToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function createPublicCaseId(date = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const stamp = formatter.format(date).replaceAll("-", "");
  const suffix = randomBytes(4).toString("hex").toUpperCase();
  return `CV-${stamp}-${suffix}`;
}
