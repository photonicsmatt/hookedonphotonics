import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { emailOk, generateCode, hashCode, hashEmail, isDomainAllowed } from "@/lib/auth";
import { sendLoginCode } from "@/lib/email";

const schema = z.object({ email: z.string().email() });

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }
  const email = parsed.data.email.trim().toLowerCase();
  const check = emailOk(email);
  if (!check.ok) {
    return NextResponse.json({ error: check.reason }, { status: 400 });
  }
  const allowed = await isDomainAllowed(check.domain);
  if (!allowed) {
    return NextResponse.json(
      { error: `We don't recognize ${check.domain} yet. Email mods@ to request it.` },
      { status: 403 }
    );
  }

  const emailHash = hashEmail(email);

  // Rate limit: one code per email per 60s.
  const recent = await prisma.loginCode.findFirst({
    where: { emailHash, createdAt: { gt: new Date(Date.now() - 60_000) } },
  });
  if (recent) {
    return NextResponse.json({ error: "Slow down — check your inbox." }, { status: 429 });
  }

  const code = generateCode();
  const codeHash = hashCode(code);
  const expiresAt = new Date(Date.now() + 10 * 60_000);

  await prisma.loginCode.create({
    data: {
      emailHash,
      codeHash,
      expiresAt,
      ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null,
    },
  });

  const { delivered, dev } = await sendLoginCode(email, code);
  return NextResponse.json({ ok: true, delivered, dev });
}
