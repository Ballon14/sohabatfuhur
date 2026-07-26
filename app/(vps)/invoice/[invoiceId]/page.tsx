import { prisma } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function PublicInvoicePage({
  params,
}: {
  params: Promise<{ invoiceId: string }>;
}) {
  const { invoiceId } = await params;

  const invoice = await prisma.invoice.findUnique({
    where: { id: Number(invoiceId) },
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

  if (!invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Invoice Tidak Ditemukan</h1>
          <Link href="/katalog" className="text-blue-600 hover:underline">
            Kembali ke Katalog
          </Link>
        </div>
      </div>
    );
  }

  const totalDibayar = invoice.pembayaran.reduce(
    (sum, p) => sum + Number(p.jumlahDibayar),
    0
  );
  const sisa = Number(invoice.jumlah) - totalDibayar;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-6">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-2xl font-bold">INVOICE</h1>
              <p className="text-gray-500">{invoice.nomorInvoice}</p>
            </div>
            <span
              className={`px-3 py-1 text-sm rounded-full ${
                invoice.status === "lunas"
                  ? "bg-green-100 text-green-700"
                  : invoice.status === "sebagian"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {invoice.status === "belum_dibayar"
                ? "Belum Dibayar"
                : invoice.status === "lunas"
                ? "Lunas"
                : "Sebagian"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h2 className="text-sm font-semibold text-gray-500 mb-2">Ditagih Kepada</h2>
              <p className="font-medium">{invoice.order.pelanggan.nama}</p>
              <p className="text-sm text-gray-600">{invoice.order.pelanggan.email}</p>
              {invoice.order.pelanggan.noTelp && (
                <p className="text-sm text-gray-600">{invoice.order.pelanggan.noTelp}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">
                Tanggal: {new Date(invoice.tanggalTerbit).toLocaleDateString("id-ID")}
              </p>
              <p className="text-sm text-gray-500">
                Jatuh Tempo: {new Date(invoice.tanggalJatuhTempo).toLocaleDateString("id-ID")}
              </p>
            </div>
          </div>

          <table className="w-full mb-8">
            <thead>
              <tr className="border-b-2">
                <th className="text-left py-3">Layanan</th>
                <th className="text-center py-3">Periode</th>
                <th className="text-right py-3">Jumlah</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-4">
                  <p className="font-medium">{invoice.order.paket.nama}</p>
                  <p className="text-sm text-gray-500">
                    {invoice.order.paket.vcpu} vCPU | {invoice.order.paket.ramMb} MB RAM |{" "}
                    {invoice.order.paket.diskGb} GB SSD
                  </p>
                </td>
                <td className="text-center py-4 text-sm">1 Bulan</td>
                <td className="text-right py-4 font-medium">
                  Rp {Number(invoice.jumlah).toLocaleString("id-ID")}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={2} className="text-right py-3 font-bold">
                  Total
                </td>
                <td className="text-right py-3 font-bold">
                  Rp {Number(invoice.jumlah).toLocaleString("id-ID")}
                </td>
              </tr>
              {totalDibayar > 0 && (
                <tr>
                  <td colSpan={2} className="text-right py-1 text-green-600">
                    Terbayar
                  </td>
                  <td className="text-right py-1 text-green-600">
                    Rp {totalDibayar.toLocaleString("id-ID")}
                  </td>
                </tr>
              )}
              {sisa > 0 && (
                <tr>
                  <td colSpan={2} className="text-right py-1 text-red-600 font-bold">
                    Sisa Tagihan
                  </td>
                  <td className="text-right py-1 text-red-600 font-bold">
                    Rp {sisa.toLocaleString("id-ID")}
                  </td>
                </tr>
              )}
            </tfoot>
          </table>

          {invoice.pembayaran.length > 0 && (
            <div className="border-t pt-6">
              <h3 className="font-semibold mb-3">Riwayat Pembayaran</h3>
              {invoice.pembayaran.map((p) => (
                <div key={p.id} className="flex justify-between text-sm text-gray-600 py-1">
                  <span>
                    {new Date(p.tanggalBayar).toLocaleDateString("id-ID")} — {p.metode}
                  </span>
                  <span>Rp {Number(p.jumlahDibayar).toLocaleString("id-ID")}</span>
                </div>
              ))}
            </div>
          )}

          <div className="border-t pt-6 mt-6 text-center">
            <p className="text-sm text-gray-500">
              Sohabat Fuhur — Proxmox Monitoring & VPS Rental Platform
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link href="/katalog" className="text-blue-600 hover:underline text-sm">
            &larr; Kembali ke Katalog
          </Link>
        </div>
      </div>
    </div>
  );
}
