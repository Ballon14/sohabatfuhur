"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/ui/DataTable";

interface Pelanggan {
  id: number;
  nama: string;
  email: string;
  noTelp: string | null;
  createdAt: string;
  _count: { order: number };
}

export default function PelangganPage() {
  const router = useRouter();
  const [data, setData] = useState<Pelanggan[]>([]);

  useEffect(() => {
    fetch("/api/pelanggan")
      .then((r) => r.json())
      .then(setData);
  }, []);

  async function handleDelete(item: Pelanggan) {
    if (!confirm(`Hapus pelanggan "${item.nama}"?`)) return;
    await fetch(`/api/pelanggan/${item.id}`, { method: "DELETE" });
    setData((prev) => prev.filter((p) => p.id !== item.id));
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Pelanggan</h1>
        <button
          onClick={() => router.push("/admin/pelanggan/tambah")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Tambah Pelanggan
        </button>
      </div>
      <div className="bg-white rounded-lg shadow">
        <DataTable
          columns={[
            { key: "nama", label: "Nama" },
            { key: "email", label: "Email" },
            { key: "noTelp", label: "No. Telepon" },
            {
              key: "createdAt",
              label: "Terdaftar",
              render: (item) => new Date(item.createdAt).toLocaleDateString("id-ID"),
            },
            {
              key: "_count",
              label: "Total Order",
              render: (item) => String(item._count.order),
            },
          ]}
          data={data}
          onEdit={(item) => router.push(`/admin/pelanggan/${item.id}`)}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
