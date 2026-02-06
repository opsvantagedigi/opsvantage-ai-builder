import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { dataset } = await req.json()

  if (!dataset) {
    return NextResponse.json({ error: "Dataset name required" }, { status: 400 })
  }

  try {
    const response = await fetch(
      `https://${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}.api.sanity.io/v2023-10-01/datasets`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.SANITY_WRITE_TOKEN}`
        },
        body: JSON.stringify({
          name: dataset,
          aclMode: "private"
        })
      }
    )

    if (!response.ok) {
      const error = await response.text()
      return NextResponse.json({ error }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    const e = err as Error
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
