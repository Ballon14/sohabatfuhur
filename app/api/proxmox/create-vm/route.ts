import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getNextVMID, cloneVM, setVMConfig, startVM, resizeDisk } from "@/lib/proxmox";

export async function POST(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { node, name, cpuCores, ramMb, diskGb, orderId } = await request.json();

  const targetNode = node || process.env.PROXMOX_NODE;
  if (!targetNode) {
    return NextResponse.json({ error: "Node Proxmox tidak dikonfigurasi" }, { status: 500 });
  }

  if (!name || !cpuCores || !ramMb) {
    return NextResponse.json({ error: "Parameter name, cpuCores, ramMb diperlukan" }, { status: 400 });
  }

  const templateVmid = Number(process.env.PROXMOX_TEMPLATE_VMID);
  if (!templateVmid) {
    return NextResponse.json({ error: "PROXMOX_TEMPLATE_VMID belum dikonfigurasi" }, { status: 500 });
  }

  try {
    const newVmid = await getNextVMID();

    await cloneVM(targetNode, templateVmid, newVmid, name);
    await setVMConfig(targetNode, newVmid, {
      memory: Number(ramMb),
      cores: Number(cpuCores),
      description: orderId ? `Order #${orderId}` : undefined,
    });

    if (diskGb) {
      try {
        await resizeDisk(targetNode, newVmid, Number(diskGb));
      } catch {
        // resize may fail if template is already sized correctly
      }
    }

    await startVM(targetNode, newVmid);

    if (orderId) {
      await prisma.vMProxmox.create({
        data: {
          orderId: Number(orderId),
          vmid: newVmid,
          node: targetNode,
          nama: name,
          status: "running",
          cpuCores: Number(cpuCores),
          ramMb: Number(ramMb),
          diskGb: Number(diskGb || 0),
        },
      });
    }

    return NextResponse.json({
      vmid: newVmid,
      node: targetNode,
      name,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal membuat VM";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
