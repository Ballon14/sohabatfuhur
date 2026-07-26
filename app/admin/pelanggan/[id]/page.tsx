"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function EditPelanggan() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Record<string, string | number> | null>(null);

  useEffect(() => {
    fetch(`/api/pelanggan/${params.id}`)
      .then((r) => r.json())
      .then(setData);
  }, [params.id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const body = {
      nama: form.get("nama"),
      email: form.get("email"),
      noTelp: form.get("noTelp"),
      alamat: form.get("alamat"),
    };

    const res = await fetch(`/api/pelanggan/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setLoading(false);

    if (res.ok) {
      router.push("/admin/pelanggan");
      router.refresh();
    }
  }

  if (!data) return <div className="p-8">Memuat...</div>;

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Link href="/admin/pelanggan" className="text-blue-600 hover:underline mb-4 inline-block">
        &larr; Kembali
      </Link>
      <h1 className="text-2xl font-bold mb-6">Edit Pelanggan</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nama</label>
          <input name="nama" defaultValue={data.nama as string} required className="w-full px-4 py-2 border rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input name="email" type="email" defaultValue={data.email as string} required className="w-full px-4 py-2 border rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">No. Telepon</label>
          <input name="noTelp" defaultValue={data.noTelp as string} className="w-full px-4 py-2 border rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Alamat</label>
          <textarea name="alamat" defaultValue={data.alamat as string} rows={3} className="w-full px-4 py-2 border rounded-lg" />
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
