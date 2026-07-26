import { getNodeStatus, getVMs } from "@/lib/proxmox";
import { NodeCard } from "@/components/dashboard/NodeCard";
import { VMList } from "./VMList";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 30;

export default async function NodeDetailPage({
  params,
}: {
  params: Promise<{ nodeId: string }>;
}) {
  const { nodeId } = await params;
  let node: Awaited<ReturnType<typeof getNodeStatus>> | null = null;
  let vms: Awaited<ReturnType<typeof getVMs>> = [];
  let error: string | null = null;

  try {
    const [nodeData, vmData] = await Promise.all([
      getNodeStatus(nodeId),
      getVMs(nodeId),
    ]);
    node = nodeData;
    vms = vmData;
  } catch (e) {
    error = e instanceof Error ? e.message : "Gagal mengambil data node";
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
        <Link href="/monitoring" className="text-blue-600 hover:underline text-sm mb-4 inline-block">
          &larr; Kembali ke Dashboard
        </Link>

        <div className="mb-6">
          <h1 className="text-2xl font-bold">Node: {nodeId}</h1>
          <p className="text-gray-500 text-sm">Detail node dan daftar VM/CT</p>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-700 font-medium">Gagal mengambil data</p>
            <p className="text-red-500 text-sm mt-1">{error}</p>
          </div>
        ) : (
          <>
            {node && (
              <div className="mb-8">
                <NodeCard {...node} node={nodeId} />
              </div>
            )}
            <VMList node={nodeId} vms={vms} />
          </>
        )}
      </main>
    </div>
  );
}
