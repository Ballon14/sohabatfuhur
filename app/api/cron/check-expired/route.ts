import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { stopVM } from "@/lib/proxmox";

export async function GET(request: NextRequest) {
  const apiKey = process.env.CRON_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "CRON_API_KEY not configured" }, { status: 500 });
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${apiKey}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: { orderId: number; action: string; status: string }[] = [];

  const expired = await prisma.order.findMany({
    where: {
      status: "aktif",
      tanggalExpired: { lt: new Date() },
    },
    include: { vm: true },
  });

  for (const order of expired) {
    try {
      if (order.vm?.vmid && order.vm?.node) {
        await stopVM(order.vm.node, order.vm.vmid);
      }

      await prisma.order.update({
        where: { id: order.id },
        data: { status: "suspended" },
      });

      results.push({ orderId: order.id, action: "suspend", status: "ok" });
    } catch {
      results.push({ orderId: order.id, action: "suspend", status: "error" });
    }
  }

  return NextResponse.json({ processed: expired.length, results });
}
