import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminDashboard() {
  const session = await auth();
  if (!session) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-600">
            Selamat datang, {session.user?.name}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            href="/admin/paket"
            className="p-6 bg-white rounded-lg shadow hover:shadow-md transition"
          >
            <h2 className="text-xl font-semibold mb-2">Paket VPS</h2>
            <p className="text-gray-600">Kelola paket VPS</p>
          </Link>
          <Link
            href="/admin/pelanggan"
            className="p-6 bg-white rounded-lg shadow hover:shadow-md transition"
          >
            <h2 className="text-xl font-semibold mb-2">Pelanggan</h2>
            <p className="text-gray-600">Kelola data pelanggan</p>
          </Link>
          <Link
            href="/admin/order"
            className="p-6 bg-white rounded-lg shadow hover:shadow-md transition"
          >
            <h2 className="text-xl font-semibold mb-2">Order</h2>
            <p className="text-gray-600">Daftar order langganan</p>
          </Link>
          <Link
            href="/admin/invoice"
            className="p-6 bg-white rounded-lg shadow hover:shadow-md transition"
          >
            <h2 className="text-xl font-semibold mb-2">Invoice</h2>
            <p className="text-gray-600">Kelola invoice & pembayaran</p>
          </Link>
          <Link
            href="/"
            className="p-6 bg-white rounded-lg shadow hover:shadow-md transition"
          >
            <h2 className="text-xl font-semibold mb-2">Monitoring</h2>
            <p className="text-gray-600">Dashboard monitoring Proxmox</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
