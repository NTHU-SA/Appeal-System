import { createHash, randomBytes } from "node:crypto";

export function createCaseToken() {
  return randomBytes(32).toString("base64url");
}

export function hashCaseToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function createPublicCaseId() {
  const stamp = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const suffix = randomBytes(4).toString("hex").toUpperCase();
  return `CV-${stamp}-${suffix}`;
}
