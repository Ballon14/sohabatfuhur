import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <h1 className="text-5xl font-bold mb-4">Sohabat Fuhur</h1>
      <p className="text-lg text-gray-300 mb-10">
        Proxmox Monitoring & VPS Rental Platform
      </p>
      <div className="flex flex-wrap gap-4 justify-center">
        <Link
          href="/monitoring"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Dashboard Monitoring
        </Link>
        <Link
          href="/katalog"
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          Lihat Paket VPS
        </Link>
        <Link
          href="/admin/dashboard"
          className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
        >
          Panel Admin
        </Link>
      </div>
    </main>
  );
}
