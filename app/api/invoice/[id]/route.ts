import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const invoice = await prisma.invoice.findUnique({
    where: { id: Number(id) },
    include: {
      order: {
        include: {
          pelanggan: true,
          paket: true,
        },
      },
      pembayaran: { orderBy: { tanggalBayar: "desc" } },
    },
  });

  if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(invoice);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { jumlahDibayar, metode, referensi } = await request.json();

  const invoice = await prisma.invoice.findUnique({
    where: { id: Number(id) },
    include: { pembayaran: true },
  });

  if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

  await prisma.pembayaran.create({
    data: {
      invoiceId: Number(id),
      jumlahDibayar: Number(jumlahDibayar),
      metode,
      referensi,
    },
  });

  const totalDibayar =
    (await prisma.pembayaran.aggregate({
      where: { invoiceId: Number(id) },
      _sum: { jumlahDibayar: true },
    }))._sum.jumlahDibayar ?? 0;

  const statusBaru =
    Number(totalDibayar) >= Number(invoice.jumlah) ? "lunas" : "sebagian";

  await prisma.invoice.update({
    where: { id: Number(id) },
    data: { status: statusBaru },
  });

  const updated = await prisma.invoice.findUnique({
    where: { id: Number(id) },
    include: { pembayaran: { orderBy: { tanggalBayar: "desc" } } },
  });

  return NextResponse.json(updated);
}
