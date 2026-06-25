function getMemberRole_(ss, email) {
  const normalized = String(email || "").trim().toLowerCase();
  if (!normalized) return null;
  const row = readObjects_(ss, "Members").find(
    (member) => String(member.email).toLowerCase() === normalized,
  );
  return row && (row.role === "minister" || row.role === "member") ? row.role : null;
}

function upsertMemberRow_(ss, email, role) {
  const normalized = String(email || "").trim().toLowerCase();
  if (!normalized) throw new Error("Missing member email.");
  if (role !== "minister" && role !== "member") throw new Error("Invalid role.");
  const now = nowIso_();
  const existing = findRow_(
    ss,
    "Members",
    (member) => String(member.email).toLowerCase() === normalized,
  );
  const member = {
    id: existing ? existing.object.id : Utilities.getUuid(),
    email: normalized,
    role,
    created_at: existing ? existing.object.created_at : now,
    updated_at: now,
  };
  if (existing) updateObject_(ss, "Members", existing.rowNumber, member);
  else appendObject_(ss, "Members", member);
  return member;
}

function removeMemberRow_(ss, id) {
  const existing = findRow_(ss, "Members", (member) => member.id === id);
  if (!existing) return { ok: true };
  updateObject_(ss, "Members", existing.rowNumber, {
    ...existing.object,
    role: "user",
    updated_at: nowIso_(),
  });
  return { ok: true };
}
