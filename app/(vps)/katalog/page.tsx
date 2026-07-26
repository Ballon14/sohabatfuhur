import { prisma } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

function formatHarga(val: { toNumber: () => number } | string | number) {
  const num = typeof val === "object" ? val.toNumber() : Number(val);
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(num);
}

export default async function KatalogPage() {
  const paket = await prisma.paketVPS.findMany({
    where: { aktif: true },
    orderBy: { hargaBulanan: "asc" },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-gray-800">
            Sohabat Fuhur
          </Link>
          <Link href="/admin/login" className="text-sm text-gray-600 hover:text-gray-800">
            Admin
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-center mb-2">Paket VPS</h1>
        <p className="text-gray-600 text-center mb-10">
          Pilih paket VPS yang sesuai dengan kebutuhan Anda
        </p>

        {paket.length === 0 ? (
          <p className="text-center text-gray-500">Belum ada paket tersedia</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paket.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-lg shadow-md p-6 flex flex-col"
              >
                <h2 className="text-xl font-bold mb-2">{p.nama}</h2>
                {p.deskripsi && (
                  <p className="text-gray-600 text-sm mb-4">{p.deskripsi}</p>
                )}

                <div className="space-y-2 mb-6 flex-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">vCPU</span>
                    <span className="font-medium">{p.vcpu} Core</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">RAM</span>
                    <span className="font-medium">{p.ramMb} MB</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Disk</span>
                    <span className="font-medium">{p.diskGb} GB</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Bandwidth</span>
                    <span className="font-medium">{p.bandwidthTb} TB</span>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600 mb-4">
                    {formatHarga(p.hargaBulanan)}
                    <span className="text-sm font-normal text-gray-500">/bulan</span>
                  </p>
                  <Link
                    href={`/order?paket=${p.id}`}
                    className="block w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-center"
                  >
                    Pesan Sekarang
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
