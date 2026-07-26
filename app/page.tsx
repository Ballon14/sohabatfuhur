import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">
        Sohabat Fuhur
      </h1>
      <p className="text-lg text-gray-600 mb-8">
        Proxmox Monitoring & VPS Rental Platform
      </p>
      <div className="flex gap-4">
        <Link
          href="/katalog"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Lihat Paket VPS
        </Link>
        <Link
          href="/admin/login"
          className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
        >
          Admin Login
        </Link>
      </div>
    </main>
  );
}
