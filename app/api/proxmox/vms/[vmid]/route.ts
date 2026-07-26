import { NextResponse } from "next/server";
import { getVMDetail, getVMResourceHistory, startVM, stopVM, rebootVM } from "@/lib/proxmox";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ vmid: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { vmid } = await params;
  const searchParams = new URL(request.url).searchParams;
  const node = searchParams.get("node");

  if (!node) {
    return NextResponse.json({ error: "Parameter node diperlukan" }, { status: 400 });
  }

  try {
    const [detail, history] = await Promise.all([
      getVMDetail(node, Number(vmid)),
      getVMResourceHistory(node, Number(vmid)),
    ]);
    return NextResponse.json({ detail, history });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal mengambil data VM";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ vmid: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { vmid } = await params;
  const { action, node } = await request.json();
  const vmidNum = Number(vmid);

  if (!node || !action) {
    return NextResponse.json({ error: "Parameter node dan action diperlukan" }, { status: 400 });
  }

  try {
    switch (action) {
      case "start":
        await startVM(node, vmidNum);
        break;
      case "stop":
        await stopVM(node, vmidNum);
        break;
      case "reboot":
        await rebootVM(node, vmidNum);
        break;
      default:
        return NextResponse.json({ error: "Action tidak valid" }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal menjalankan action";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
