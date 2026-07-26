import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const invoices = await prisma.invoice.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      order: {
        include: {
          pelanggan: true,
          paket: true,
        },
      },
      pembayaran: true,
    },
  });

  return NextResponse.json(invoices);
}
