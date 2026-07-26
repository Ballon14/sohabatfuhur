import { NextResponse } from "next/server";
import { getNodes } from "@/lib/proxmox";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const nodes = await getNodes();
    return NextResponse.json(nodes);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal mengambil data node";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
