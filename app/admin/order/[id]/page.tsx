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
  const [creatingVm, setCreatingVm] = useState(false);
  const [vmError, setVmError] = useState("");

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

  async function createVM() {
    if (!order) return;
    setCreatingVm(true);
    setVmError("");
    const res = await fetch("/api/proxmox/create-vm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
      orderId: order.id,
      name: `vps-${order.id}-${order.paket.nama.toLowerCase().replace(/\s+/g, "-")}`,
        cpuCores: order.paket.vcpu,
        ramMb: order.paket.ramMb,
        diskGb: order.paket.diskGb,
      }),
    });
    setCreatingVm(false);
    if (res.ok) {
      router.refresh();
      window.location.reload();
    } else {
      const err = await res.json();
      setVmError(err.error || "Gagal membuat VM");
    }
  }

  if (!order) return <div className="text-dark-400 p-8">Memuat...</div>;

  return (
    <div>
      <Link href="/admin/order" className="inline-flex items-center gap-1.5 text-sm text-dark-400 hover:text-brand-400 transition mb-6">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Kembali
      </Link>

      <h1 className="font-heading text-2xl font-bold text-white mb-6">Order #{order.id}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="rounded-2xl bg-dark-800 border border-dark-700/50 p-6">
          <h2 className="font-heading text-lg font-semibold text-white mb-4">Informasi Pelanggan</h2>
          <div className="space-y-2 text-sm">
            <p className="text-dark-300"><span className="text-dark-500">Nama:</span> {order.pelanggan.nama}</p>
            <p className="text-dark-300"><span className="text-dark-500">Email:</span> {order.pelanggan.email}</p>
            <p className="text-dark-300"><span className="text-dark-500">Telepon:</span> {order.pelanggan.noTelp || "-"}</p>
          </div>
        </div>

        <div className="rounded-2xl bg-dark-800 border border-dark-700/50 p-6">
          <h2 className="font-heading text-lg font-semibold text-white mb-4">Informasi Paket</h2>
          <div className="space-y-2 text-sm">
            <p className="text-dark-300"><span className="text-dark-500">Paket:</span> {order.paket.nama}</p>
            <p className="text-dark-300"><span className="text-dark-500">vCPU:</span> {order.paket.vcpu}</p>
            <p className="text-dark-300"><span className="text-dark-500">RAM:</span> {order.paket.ramMb} MB</p>
            <p className="text-dark-300"><span className="text-dark-500">Disk:</span> {order.paket.diskGb} GB</p>
          </div>
        </div>

        <div className="rounded-2xl bg-dark-800 border border-dark-700/50 p-6">
          <h2 className="font-heading text-lg font-semibold text-white mb-4">Status Order</h2>
          <div className="space-y-2 text-sm mb-4">
            <p className="text-dark-300">
              <span className="text-dark-500">Status:</span>{" "}
              <span className={`font-medium ${
                order.status === "aktif" ? "text-green-400" :
                order.status === "suspended" ? "text-yellow-400" :
                order.status === "expired" ? "text-red-400" : "text-dark-300"
              }`}>{order.status}</span>
            </p>
            <p className="text-dark-300">
              <span className="text-dark-500">Mulai:</span>{" "}
              {new Date(order.tanggalMulai).toLocaleDateString("id-ID")}
            </p>
            <p className="text-dark-300">
              <span className="text-dark-500">Expired:</span>{" "}
              {new Date(order.tanggalExpired).toLocaleDateString("id-ID")}
            </p>
            <p className="text-dark-300">
              <span className="text-dark-500">Dibuat:</span>{" "}
              {new Date(order.createdAt).toLocaleDateString("id-ID")}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {order.status === "aktif" && (
              <>
                <button onClick={() => updateStatus("suspended")} disabled={updating}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 transition disabled:opacity-50">
                  Suspend
                </button>
                <button onClick={() => updateStatus("expired")} disabled={updating}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 transition disabled:opacity-50">
                  Tandai Expired
                </button>
              </>
            )}
            {order.status === "suspended" && (
              <button onClick={() => updateStatus("aktif")} disabled={updating}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-green-500/10 text-green-400 hover:bg-green-500/20 transition disabled:opacity-50">
                Aktifkan
              </button>
            )}
          </div>
        </div>

        {order.vm ? (
          <div className="rounded-2xl bg-dark-800 border border-dark-700/50 p-6">
            <h2 className="font-heading text-lg font-semibold text-white mb-4">VM Proxmox</h2>
            <div className="space-y-2 text-sm">
              <p className="text-dark-300"><span className="text-dark-500">VMID:</span> {order.vm.vmid}</p>
              <p className="text-dark-300"><span className="text-dark-500">Nama:</span> {order.vm.nama}</p>
              <p className="text-dark-300">
                <span className="text-dark-500">Status:</span>{" "}
                <span className={`font-medium ${order.vm.status === "running" ? "text-green-400" : "text-red-400"}`}>
                  {order.vm.status}
                </span>
              </p>
            </div>
            <Link href={`/admin/vm/${order.vm.vmid}?node=pam`}
              className="inline-block mt-4 text-sm text-brand-400 hover:text-brand-300 transition">
              Kelola VM &rarr;
            </Link>
          </div>
        ) : (
          <div className="rounded-2xl bg-dark-800 border border-dark-700/50 p-6">
            <h2 className="font-heading text-lg font-semibold text-white mb-4">VM Proxmox</h2>
            <p className="text-dark-400 text-sm mb-4">Belum ada VM untuk order ini.</p>
            <button onClick={createVM} disabled={creatingVm}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-brand-500 to-brand-600 text-white hover:from-brand-600 hover:to-brand-700 transition disabled:opacity-50 shadow-lg shadow-brand-500/20">
              {creatingVm ? "Membuat VM..." : "Buat VM"}
            </button>
            {vmError && <p className="text-red-400 text-xs mt-2">{vmError}</p>}
          </div>
        )}
      </div>

      <div className="mt-8">
        <h2 className="font-heading text-xl font-bold text-white mb-4">Invoice</h2>
        {order.invoice.length === 0 ? (
          <p className="text-dark-400">Belum ada invoice</p>
        ) : (
          <div className="space-y-4">
            {order.invoice.map((inv) => (
              <div key={inv.id} className="rounded-2xl bg-dark-800 border border-dark-700/50 p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-white">{inv.nomorInvoice}</p>
                    <p className="text-sm text-dark-400">
                      Jatuh tempo: {new Date(inv.tanggalJatuhTempo).toLocaleDateString("id-ID")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-white">Rp {Number(inv.jumlah).toLocaleString("id-ID")}</p>
                    <span className={`inline-block px-2 py-0.5 text-xs rounded-full font-medium ${
                      inv.status === "lunas" ? "bg-green-500/10 text-green-400" :
                      inv.status === "sebagian" ? "bg-yellow-500/10 text-yellow-400" :
                      "bg-red-500/10 text-red-400"
                    }`}>
                      {inv.status === "belum_dibayar" ? "Belum Dibayar" :
                       inv.status === "lunas" ? "Lunas" : "Sebagian"}
                    </span>
                  </div>
                </div>
                {inv.pembayaran.length > 0 && (
                  <div className="mt-3 border-t border-dark-700/50 pt-3">
                    <p className="text-xs text-dark-500 mb-1">Riwayat Pembayaran:</p>
                    {inv.pembayaran.map((p) => (
                      <div key={p.id} className="text-xs flex justify-between text-dark-400 py-1">
                        <span>{new Date(p.tanggalBayar).toLocaleDateString("id-ID")} - {p.metode}</span>
                        <span>Rp {Number(p.jumlahDibayar).toLocaleString("id-ID")}</span>
                      </div>
                    ))}
                  </div>
                )}
                <Link href={`/admin/invoice/${inv.id}`}
                  className="text-brand-400 text-sm hover:text-brand-300 transition mt-2 inline-block">
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
