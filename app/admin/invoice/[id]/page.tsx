"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface InvoiceDetail {
  id: number;
  nomorInvoice: string;
  jumlah: string;
  status: string;
  tanggalTerbit: string;
  tanggalJatuhTempo: string;
  createdAt: string;
  order: {
    id: number;
    status: string;
    pelanggan: { nama: string; email: string; noTelp: string | null };
    paket: { nama: string; vcpu: number; ramMb: number; diskGb: number; hargaBulanan: string };
  };
  pembayaran: {
    id: number;
    jumlahDibayar: string;
    metode: string;
    referensi: string | null;
    tanggalBayar: string;
  }[];
}

export default function InvoiceDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);

  useEffect(() => {
    fetch(`/api/invoice/${params.id}`)
      .then((r) => r.json())
      .then(setInvoice);
  }, [params.id]);

  async function handleBayar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    const res = await fetch(`/api/invoice/${params.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jumlahDibayar: form.get("jumlahDibayar"),
        metode: form.get("metode"),
        referensi: form.get("referensi"),
      }),
    });

    if (res.ok) {
      const updated = await res.json();
      setInvoice(updated);
      router.refresh();
    }
  }

  if (!invoice) return <div className="p-8">Memuat...</div>;

  const totalDibayar = invoice.pembayaran.reduce(
    (sum, p) => sum + Number(p.jumlahDibayar),
    0
  );
  const sisa = Number(invoice.jumlah) - totalDibayar;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Link href="/admin/invoice" className="text-blue-600 hover:underline mb-4 inline-block">
        &larr; Kembali
      </Link>

      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold">{invoice.nomorInvoice}</h1>
          <p className="text-gray-500 text-sm">
            Dibuat: {new Date(invoice.createdAt).toLocaleDateString("id-ID")}
          </p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Detail Invoice</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Jumlah Tagihan</span>
              <span className="font-bold">Rp {Number(invoice.jumlah).toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Total Dibayar</span>
              <span className="font-medium text-green-600">
                Rp {totalDibayar.toLocaleString("id-ID")}
              </span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-gray-500">Sisa</span>
              <span className={`font-bold ${sisa > 0 ? "text-red-600" : "text-green-600"}`}>
                Rp {sisa.toLocaleString("id-ID")}
              </span>
            </div>
            <p className="pt-2">
              <span className="text-gray-500">Jatuh tempo:</span>{" "}
              {new Date(invoice.tanggalJatuhTempo).toLocaleDateString("id-ID")}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Pelanggan</h2>
          <div className="space-y-2 text-sm">
            <p><span className="text-gray-500">Nama:</span> {invoice.order.pelanggan.nama}</p>
            <p><span className="text-gray-500">Email:</span> {invoice.order.pelanggan.email}</p>
            <p><span className="text-gray-500">Telepon:</span> {invoice.order.pelanggan.noTelp || "-"}</p>
          </div>
          <div className="mt-4 pt-4 border-t">
            <h3 className="text-sm font-semibold mb-2">Paket</h3>
            <p className="text-sm">{invoice.order.paket.nama}</p>
            <p className="text-xs text-gray-500">
              {invoice.order.paket.vcpu} vCPU | {invoice.order.paket.ramMb} MB RAM | {invoice.order.paket.diskGb} GB
            </p>
          </div>
        </div>
      </div>

      {sisa > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Catat Pembayaran</h2>
          <form onSubmit={handleBayar} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Jumlah Dibayar</label>
              <input
                name="jumlahDibayar"
                type="number"
                required
                max={sisa}
                defaultValue={sisa}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Metode</label>
              <select name="metode" required className="w-full px-3 py-2 border rounded-lg text-sm">
                <option value="transfer">Transfer</option>
                <option value="tunai">Tunai</option>
                <option value="kartu">Kartu</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Referensi</label>
              <input name="referensi" className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                Bayar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Riwayat Pembayaran</h2>
        {invoice.pembayaran.length === 0 ? (
          <p className="text-gray-500 text-sm">Belum ada pembayaran</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-4 py-2">Tanggal</th>
                <th className="text-left px-4 py-2">Metode</th>
                <th className="text-left px-4 py-2">Referensi</th>
                <th className="text-right px-4 py-2">Jumlah</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {invoice.pembayaran.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-2">
                    {new Date(p.tanggalBayar).toLocaleDateString("id-ID")}
                  </td>
                  <td className="px-4 py-2">{p.metode}</td>
                  <td className="px-4 py-2">{p.referensi || "-"}</td>
                  <td className="px-4 py-2 text-right font-medium">
                    Rp {Number(p.jumlahDibayar).toLocaleString("id-ID")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
