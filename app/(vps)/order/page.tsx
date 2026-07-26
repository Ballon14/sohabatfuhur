"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

interface Paket {
  id: number;
  nama: string;
  vcpu: number;
  ramMb: number;
  diskGb: number;
  hargaBulanan: string;
}

function OrderForm() {
  const searchParams = useSearchParams();
  const paketId = searchParams.get("paket");

  const [paket, setPaket] = useState<Paket | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (paketId) {
      fetch(`/api/paket/${paketId}`)
        .then((r) => r.json())
        .then(setPaket)
        .catch(() => setError("Paket tidak ditemukan"));
    }
  }, [paketId]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!paketId) return;
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const body = {
      nama: form.get("nama"),
      email: form.get("email"),
      noTelp: form.get("noTelp"),
      alamat: form.get("alamat"),
    };

    const resPelanggan = await fetch("/api/pelanggan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!resPelanggan.ok) {
      const err = await resPelanggan.json();
      setError(err.error || "Gagal mendaftarkan pelanggan");
      setLoading(false);
      return;
    }

    const pelanggan = await resPelanggan.json();

    const resOrder = await fetch("/api/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pelangganId: pelanggan.id,
        paketId: Number(paketId),
      }),
    });

    setLoading(false);

    if (resOrder.ok) {
      setSuccess(true);
    } else {
      const err = await resOrder.json();
      setError(err.error || "Gagal membuat order");
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
          <h1 className="text-2xl font-bold text-green-600 mb-4">Pesanan Berhasil!</h1>
          <p className="text-gray-600 mb-6">Pesanan Anda sedang diproses. Tim kami akan menghubungi Anda segera.</p>
          <Link href="/katalog" className="text-blue-600 hover:underline">
            Kembali ke Katalog
          </Link>
        </div>
      </div>
    );
  }

  if (!paketId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Silakan pilih paket terlebih dahulu.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <Link href="/katalog" className="text-blue-600 hover:underline">
            &larr; Kembali ke Katalog
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-6">Form Pemesanan</h1>

        {paket && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="font-medium">Paket: {paket.nama}</p>
            <p className="text-sm text-gray-600">
              {paket.vcpu} vCPU | {paket.ramMb} MB RAM | {paket.diskGb} GB SSD
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nama Lengkap</label>
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
            {loading ? "Memproses..." : "Pesan Sekarang"}
          </button>
        </form>
      </main>
    </div>
  );
}

export default function OrderPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Memuat...</div>}>
      <OrderForm />
    </Suspense>
  );
}
