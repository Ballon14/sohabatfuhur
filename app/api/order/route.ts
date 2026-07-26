import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      pelanggan: true,
      paket: true,
      invoice: true,
    },
  });
  return NextResponse.json(orders);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { pelangganId, paketId } = body;

  const paket = await prisma.paketVPS.findUnique({ where: { id: paketId } });
  if (!paket) {
    return NextResponse.json({ error: "Paket tidak ditemukan" }, { status: 404 });
  }

  const tanggalMulai = new Date();
  const tanggalExpired = new Date();
  tanggalExpired.setMonth(tanggalExpired.getMonth() + 1);

  const order = await prisma.order.create({
    data: {
      pelangganId,
      paketId,
      status: "aktif",
      tanggalMulai,
      tanggalExpired,
    },
  });

  const invoiceNumber = `INV/${String(order.id).padStart(5, "0")}/${tanggalMulai.getFullYear()}`;
  const tanggalJatuhTempo = new Date();
  tanggalJatuhTempo.setDate(tanggalJatuhTempo.getDate() + 7);

  await prisma.invoice.create({
    data: {
      orderId: order.id,
      nomorInvoice: invoiceNumber,
      jumlah: paket.hargaBulanan,
      status: "belum_dibayar",
      tanggalTerbit: tanggalMulai,
      tanggalJatuhTempo,
    },
  });

  const result = await prisma.order.findUnique({
    where: { id: order.id },
    include: { invoice: true, paket: true, pelanggan: true },
  });

  return NextResponse.json(result, { status: 201 });
}
