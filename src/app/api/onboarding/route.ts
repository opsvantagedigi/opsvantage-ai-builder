import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const { businessName, industry, goal } = body

  // TODO: later – look up real User by email and create Project + AiTask
  console.log("Onboarding received:", { businessName, industry, goal })

  return NextResponse.json({ ok: true })
}