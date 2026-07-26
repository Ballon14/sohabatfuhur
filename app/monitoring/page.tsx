import { getNodes } from "@/lib/proxmox";
import { NodeCard } from "@/components/dashboard/NodeCard";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 30;

export default async function MonitoringPage() {
  let nodes: Awaited<ReturnType<typeof getNodes>> = [];
  let error: string | null = null;

  try {
    nodes = await getNodes();
  } catch (e) {
    error = e instanceof Error ? e.message : "Gagal mengambil data dari Proxmox";
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-gray-800">
            Sohabat Fuhur
          </Link>
          <nav className="flex gap-4 text-sm">
            <Link href="/monitoring" className="text-blue-600 font-medium">
              Monitoring
            </Link>
            <Link href="/katalog" className="text-gray-600 hover:text-gray-800">
              Katalog
            </Link>
            <Link href="/admin/dashboard" className="text-gray-600 hover:text-gray-800">
              Admin
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Proxmox Dashboard</h1>
            <p className="text-gray-500 text-sm">Monitoring server secara real-time</p>
          </div>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-700 font-medium">Gagal terhubung ke Proxmox API</p>
            <p className="text-red-500 text-sm mt-1">{error}</p>
            <p className="text-gray-500 text-xs mt-3">
              Pastikan server Proxmox dapat dijangkau dan kredensial API Token sudah benar di .env.local
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {nodes.map((node) => (
              <NodeCard key={node.node} {...node} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
