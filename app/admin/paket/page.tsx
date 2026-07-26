"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/ui/DataTable";

interface Paket {
  id: number;
  nama: string;
  vcpu: number;
  ramMb: number;
  diskGb: number;
  bandwidthTb: number;
  hargaBulanan: string;
  aktif: boolean;
}

function formatHarga(val: string) {
  const num = Number(val);
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(num);
}

export default function PaketPage() {
  const router = useRouter();
  const [paket, setPaket] = useState<Paket[]>([]);

  useEffect(() => {
    fetch("/api/paket")
      .then((r) => r.json())
      .then(setPaket);
  }, []);

  async function handleDelete(item: Paket) {
    if (!confirm(`Hapus paket "${item.nama}"?`)) return;
    await fetch(`/api/paket/${item.id}`, { method: "DELETE" });
    setPaket((prev) => prev.filter((p) => p.id !== item.id));
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Paket VPS</h1>
        <button
          onClick={() => router.push("/admin/paket/tambah")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Tambah Paket
        </button>
      </div>
      <div className="bg-white rounded-lg shadow">
        <DataTable
          columns={[
            { key: "nama", label: "Nama Paket" },
            { key: "vcpu", label: "vCPU" },
            {
              key: "ramMb",
              label: "RAM",
              render: (item) => `${item.ramMb} MB`,
            },
            {
              key: "diskGb",
              label: "Disk",
              render: (item) => `${item.diskGb} GB`,
            },
            {
              key: "bandwidthTb",
              label: "Bandwidth",
              render: (item) => `${item.bandwidthTb} TB`,
            },
            {
              key: "hargaBulanan",
              label: "Harga/Bulan",
              render: (item) => formatHarga(item.hargaBulanan),
            },
            {
              key: "aktif",
              label: "Status",
              render: (item) =>
                item.aktif ? (
                  <span className="text-green-600 font-medium">Aktif</span>
                ) : (
                  <span className="text-red-600 font-medium">Nonaktif</span>
                ),
            },
          ]}
          data={paket}
          onEdit={(item) => router.push(`/admin/paket/${item.id}`)}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
