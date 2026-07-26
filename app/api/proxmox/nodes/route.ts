import { NextResponse } from "next/server";
import { getNodes } from "@/lib/proxmox";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const nodes = await getNodes();
    return NextResponse.json(nodes);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal mengambil data node";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
