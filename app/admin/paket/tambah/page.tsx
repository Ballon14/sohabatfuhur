"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function TambahPaket() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const body = {
      nama: form.get("nama"),
      deskripsi: form.get("deskripsi"),
      vcpu: Number(form.get("vcpu")),
      ramMb: Number(form.get("ramMb")),
      diskGb: Number(form.get("diskGb")),
      bandwidthTb: Number(form.get("bandwidthTb")),
      hargaBulanan: Number(form.get("hargaBulanan")),
    };

    const res = await fetch("/api/paket", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setLoading(false);

    if (res.ok) {
      router.push("/admin/paket");
      router.refresh();
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Link href="/admin/paket" className="text-blue-600 hover:underline mb-4 inline-block">
        &larr; Kembali
      </Link>
      <h1 className="text-2xl font-bold mb-6">Tambah Paket VPS</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nama Paket</label>
          <input name="nama" required className="w-full px-4 py-2 border rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Deskripsi</label>
          <textarea name="deskripsi" rows={3} className="w-full px-4 py-2 border rounded-lg" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">vCPU</label>
            <input name="vcpu" type="number" min={1} required className="w-full px-4 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">RAM (MB)</label>
            <input name="ramMb" type="number" min={1} required className="w-full px-4 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Disk (GB)</label>
            <input name="diskGb" type="number" min={1} required className="w-full px-4 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Bandwidth (TB)</label>
            <input name="bandwidthTb" type="number" min={1} required className="w-full px-4 py-2 border rounded-lg" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Harga/Bulan (Rp)</label>
          <input name="hargaBulanan" type="number" min={1} required className="w-full px-4 py-2 border rounded-lg" />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Menyimpan..." : "Simpan"}
        </button>
      </form>
    </div>
  );
}
