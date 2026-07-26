import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

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

  const order = await prisma.order.update({
    where: { id: Number(id) },
    data: {
      ...(status && { status }),
      ...(tanggalExpired && { tanggalExpired: new Date(tanggalExpired) }),
    },
  });

  return NextResponse.json(order);
}
