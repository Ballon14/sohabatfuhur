import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  const paket = await prisma.paketVPS.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(paket);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { nama, deskripsi, vcpu, ramMb, diskGb, bandwidthTb, hargaBulanan, aktif } = body;

  const paket = await prisma.paketVPS.create({
    data: {
      nama,
      deskripsi,
      vcpu: Number(vcpu),
      ramMb: Number(ramMb),
      diskGb: Number(diskGb),
      bandwidthTb: Number(bandwidthTb),
      hargaBulanan: Number(hargaBulanan),
      aktif: aktif ?? true,
    },
  });

  return NextResponse.json(paket, { status: 201 });
}
