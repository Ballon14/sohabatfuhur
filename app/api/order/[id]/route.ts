import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { startVM, stopVM, rebootVM } from "@/lib/proxmox";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id: Number(id) },
    include: {
      pelanggan: true,
      paket: true,
      vm: true,
      invoice: { include: { pembayaran: true } },
    },
  });

  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(order);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const { status, tanggalExpired } = body;

  const existing = await prisma.order.findUnique({
    where: { id: Number(id) },
    include: { vm: true },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updateData: Record<string, unknown> = {};
  if (status) updateData.status = status;
  if (tanggalExpired) updateData.tanggalExpired = new Date(tanggalExpired);

  const order = await prisma.order.update({
    where: { id: Number(id) },
    data: updateData,
  });

  if (status && existing.vm?.vmid && existing.vm?.node) {
    try {
      if (status === "suspended" || status === "expired") {
        await stopVM(existing.vm.node, existing.vm.vmid);
      } else if (status === "aktif") {
        await startVM(existing.vm.node, existing.vm.vmid);
      }
    } catch {
      // VM action failure doesn't block order update
    }
  }

  return NextResponse.json(order);
}
