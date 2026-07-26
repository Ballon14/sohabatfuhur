"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function TambahPelanggan() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const body = {
      nama: form.get("nama"),
      email: form.get("email"),
      noTelp: form.get("noTelp"),
      alamat: form.get("alamat"),
    };

    const res = await fetch("/api/pelanggan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setLoading(false);

    if (res.ok) {
      router.push("/admin/pelanggan");
      router.refresh();
    } else {
      const err = await res.json();
      setError(err.error || "Gagal menyimpan");
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Link href="/admin/pelanggan" className="text-blue-600 hover:underline mb-4 inline-block">
        &larr; Kembali
      </Link>
      <h1 className="text-2xl font-bold mb-6">Tambah Pelanggan</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nama</label>
          <input name="nama" required className="w-full px-4 py-2 border rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input name="email" type="email" required className="w-full px-4 py-2 border rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">No. Telepon</label>
          <input name="noTelp" className="w-full px-4 py-2 border rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Alamat</label>
          <textarea name="alamat" rows={3} className="w-full px-4 py-2 border rounded-lg" />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
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
