import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const paket = await prisma.paketVPS.findUnique({ where: { id: Number(id) } });
  if (!paket) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(paket);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const { nama, deskripsi, vcpu, ramMb, diskGb, bandwidthTb, hargaBulanan, aktif } = body;

  const paket = await prisma.paketVPS.update({
    where: { id: Number(id) },
    data: {
      nama,
      deskripsi,
      vcpu: Number(vcpu),
      ramMb: Number(ramMb),
      diskGb: Number(diskGb),
      bandwidthTb: Number(bandwidthTb),
      hargaBulanan: Number(hargaBulanan),
      aktif,
    },
  });

  return NextResponse.json(paket);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.paketVPS.delete({ where: { id: Number(id) } });
  return NextResponse.json({ success: true });
}
