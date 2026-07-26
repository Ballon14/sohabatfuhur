import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const pelanggan = await prisma.pelanggan.findUnique({
    where: { id: Number(id) },
    include: { order: { include: { paket: true, invoice: true } } },
  });
  if (!pelanggan) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(pelanggan);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const { nama, email, noTelp, alamat } = body;

  const pelanggan = await prisma.pelanggan.update({
    where: { id: Number(id) },
    data: { nama, email, noTelp, alamat },
  });

  return NextResponse.json(pelanggan);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.pelanggan.delete({ where: { id: Number(id) } });
  return NextResponse.json({ success: true });
}
