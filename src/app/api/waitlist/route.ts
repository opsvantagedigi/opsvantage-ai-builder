import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function isValidEmail(email: unknown): email is string {
  if (typeof email !== "string") return false;
  const trimmed = email.trim();
  if (!trimmed) return false;
  return /.+@.+\..+/.test(trimmed);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: unknown; source?: unknown };
    const email = body.email;
    const source = typeof body.source === "string" ? body.source.trim().slice(0, 120) : undefined;

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Valid email is required." }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    await prisma.launchLead.upsert({
      where: { email: normalizedEmail },
      update: { notified: false, source },
      create: { email: normalizedEmail, source },
    });

    return NextResponse.json({ message: "You are on the OpsVantage launch waitlist." }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
