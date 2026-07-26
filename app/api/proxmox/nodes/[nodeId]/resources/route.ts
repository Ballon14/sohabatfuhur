import { NextResponse } from "next/server";
import { getNodeStatus, getVMs } from "@/lib/proxmox";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ nodeId: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { nodeId } = await params;

  try {
    const [node, vms] = await Promise.all([
      getNodeStatus(nodeId),
      getVMs(nodeId),
    ]);
    return NextResponse.json({ node, vms });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal mengambil data resource";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
