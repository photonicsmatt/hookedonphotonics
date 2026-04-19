import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import {
  createUniqueHandle,
  emailOk,
  getSession,
  hashCode,
  hashEmail,
  isDomainAllowed,
} from "@/lib/auth";
import { domainOf, isEduDomain } from "@/lib/domains";

const schema = z.object({
  email: z.string().email(),
  code: z.string().regex(/^\d{6}$/),
});

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { email, code } = parsed.data;

  const check = emailOk(email);
  if (!check.ok) return NextResponse.json({ error: check.reason }, { status: 400 });
  if (!(await isDomainAllowed(check.domain))) {
    return NextResponse.json({ error: "Domain not allowed" }, { status: 403 });
  }

  const emailHash = hashEmail(email);
  const codeHash = hashCode(code);

  const match = await prisma.loginCode.findFirst({
    where: {
      emailHash,
      codeHash,
      consumedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!match) return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 });

  await prisma.loginCode.update({ where: { id: match.id }, data: { consumedAt: new Date() } });

  let user = await prisma.user.findUnique({ where: { emailHash } });
  if (!user) {
    const handle = await createUniqueHandle();
    const domain = domainOf(email);
    const flair = isEduDomain(domain) ? "Verified • Academic" : "Verified";
    user = await prisma.user.create({
      data: { handle, emailHash, domain, flair },
    });
  }

  const session = await getSession();
  session.userId = user.id;
  session.handle = user.handle;
  session.flair = user.flair;
  await session.save();

  return NextResponse.json({ ok: true, handle: user.handle });
}
