import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const pelanggan = await prisma.pelanggan.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { order: true } } },
  });
  return NextResponse.json(pelanggan);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { nama, email, noTelp, alamat } = body;

  const exists = await prisma.pelanggan.findUnique({ where: { email } });
  if (exists) {
    return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 400 });
  }

  const pelanggan = await prisma.pelanggan.create({
    data: { nama, email, noTelp, alamat },
  });

  return NextResponse.json(pelanggan, { status: 201 });
}
