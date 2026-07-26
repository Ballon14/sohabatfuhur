"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface OrderDetail {
  id: number;
  status: string;
  tanggalMulai: string;
  tanggalExpired: string;
  createdAt: string;
  pelanggan: { id: number; nama: string; email: string; noTelp: string | null };
  paket: { id: number; nama: string; vcpu: number; ramMb: number; diskGb: number; hargaBulanan: string };
  vm: { id: number; vmid: number; nama: string; status: string } | null;
  invoice: {
    id: number;
    nomorInvoice: string;
    jumlah: string;
    status: string;
    tanggalTerbit: string;
    tanggalJatuhTempo: string;
    pembayaran: { id: number; jumlahDibayar: string; metode: string; tanggalBayar: string }[];
  }[];
}

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetch(`/api/order/${params.id}`)
      .then((r) => r.json())
      .then(setOrder);
  }, [params.id]);

  async function updateStatus(status: string) {
    setUpdating(true);
    await fetch(`/api/order/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setUpdating(false);
    router.refresh();
    window.location.reload();
  }

  if (!order) return <div className="p-8">Memuat...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Link href="/admin/order" className="text-blue-600 hover:underline mb-4 inline-block">
        &larr; Kembali
      </Link>
      <h1 className="text-2xl font-bold mb-6">Order #{order.id}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Informasi Pelanggan</h2>
          <div className="space-y-2 text-sm">
            <p><span className="text-gray-500">Nama:</span> {order.pelanggan.nama}</p>
            <p><span className="text-gray-500">Email:</span> {order.pelanggan.email}</p>
            <p><span className="text-gray-500">Telepon:</span> {order.pelanggan.noTelp || "-"}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Informasi Paket</h2>
          <div className="space-y-2 text-sm">
            <p><span className="text-gray-500">Paket:</span> {order.paket.nama}</p>
            <p><span className="text-gray-500">vCPU:</span> {order.paket.vcpu}</p>
            <p><span className="text-gray-500">RAM:</span> {order.paket.ramMb} MB</p>
            <p><span className="text-gray-500">Disk:</span> {order.paket.diskGb} GB</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Status Order</h2>
          <div className="space-y-2 text-sm">
            <p>
              <span className="text-gray-500">Status:</span>{" "}
              <span className="font-medium">{order.status}</span>
            </p>
            <p>
              <span className="text-gray-500">Mulai:</span>{" "}
              {new Date(order.tanggalMulai).toLocaleDateString("id-ID")}
            </p>
            <p>
              <span className="text-gray-500">Expired:</span>{" "}
              {new Date(order.tanggalExpired).toLocaleDateString("id-ID")}
            </p>
            <p>
              <span className="text-gray-500">Dibuat:</span>{" "}
              {new Date(order.createdAt).toLocaleDateString("id-ID")}
            </p>
          </div>

          <div className="mt-4 flex gap-2">
            {order.status === "aktif" && (
              <>
                <button
                  onClick={() => updateStatus("suspended")}
                  disabled={updating}
                  className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                >
                  Suspend
                </button>
                <button
                  onClick={() => updateStatus("expired")}
                  disabled={updating}
                  className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  Tandai Expired
                </button>
              </>
            )}
            {order.status === "suspended" && (
              <button
                onClick={() => updateStatus("aktif")}
                disabled={updating}
                className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
              >
                Aktifkan
              </button>
            )}
          </div>
        </div>

        {order.vm && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">VM Proxmox</h2>
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-500">VMID:</span> {order.vm.vmid}</p>
              <p><span className="text-gray-500">Nama:</span> {order.vm.nama}</p>
              <p><span className="text-gray-500">Status:</span> {order.vm.status}</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Invoice</h2>
        {order.invoice.length === 0 ? (
          <p className="text-gray-500">Belum ada invoice</p>
        ) : (
          <div className="space-y-4">
            {order.invoice.map((inv) => (
              <div key={inv.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{inv.nomorInvoice}</p>
                    <p className="text-sm text-gray-500">
                      Jatuh tempo: {new Date(inv.tanggalJatuhTempo).toLocaleDateString("id-ID")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">
                      Rp {Number(inv.jumlah).toLocaleString("id-ID")}
                    </p>
                    <span
                      className={`inline-block px-2 py-0.5 text-xs rounded-full ${
                        inv.status === "lunas"
                          ? "bg-green-100 text-green-700"
                          : inv.status === "sebagian"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {inv.status}
                    </span>
                  </div>
                </div>
                {inv.pembayaran.length > 0 && (
                  <div className="mt-3 border-t pt-3">
                    <p className="text-xs text-gray-500 mb-1">Riwayat Pembayaran:</p>
                    {inv.pembayaran.map((p) => (
                      <div key={p.id} className="text-xs flex justify-between text-gray-600">
                        <span>{new Date(p.tanggalBayar).toLocaleDateString("id-ID")} - {p.metode}</span>
                        <span>Rp {Number(p.jumlahDibayar).toLocaleString("id-ID")}</span>
                      </div>
                    ))}
                  </div>
                )}
                <Link
                  href={`/admin/invoice/${inv.id}`}
                  className="text-blue-600 text-sm hover:underline mt-2 inline-block"
                >
                  Detail Invoice &rarr;
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
