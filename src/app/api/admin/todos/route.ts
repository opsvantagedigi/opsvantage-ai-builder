import { NextResponse } from "next/server";

const TASKS = [
  { id: "visual-cockpit-refactor", title: "Visual Cockpit Refactor", completed: true, priority: "normal" },
  { id: "marz-greeting-fix", title: "MARZ Greeting Fix", completed: false, priority: "high" },
  { id: "neural-link-payload-normalization", title: "Neural Link Payload Normalization", completed: true, priority: "normal" },
  { id: "phase-bar-alignment", title: "Phase Bar Alignment", completed: false, priority: "normal" },
];

export async function GET() {
  return NextResponse.json({ tasks: TASKS }, { status: 200 });
}
