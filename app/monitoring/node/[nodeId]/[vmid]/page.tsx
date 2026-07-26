import { getVMDetail, getVMResourceHistory } from "@/lib/proxmox";
import { ResourceChart } from "@/components/dashboard/ResourceChart";
import { ResourceGauge } from "@/components/dashboard/ResourceGauge";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function VMDetailPage({
  params,
}: {
  params: Promise<{ nodeId: string; vmid: string }>;
}) {
  const { nodeId, vmid } = await params;
  const vmidNum = Number(vmid);

  let detail: Awaited<ReturnType<typeof getVMDetail>> | null = null;
  let history: Awaited<ReturnType<typeof getVMResourceHistory>> = [];
  let error: string | null = null;

  try {
    const [d, h] = await Promise.all([
      getVMDetail(nodeId, vmidNum),
      getVMResourceHistory(nodeId, vmidNum, "hour"),
    ]);
    detail = d;
    history = h;
  } catch (e) {
    error = e instanceof Error ? e.message : "Gagal mengambil data VM";
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <p className="text-red-600">{error}</p>
        <Link href={`/monitoring/node/${nodeId}`} className="text-blue-600 hover:underline text-sm">
          &larr; Kembali
        </Link>
      </div>
    );
  }

  if (!detail) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link href="/" className="text-xl font-bold text-gray-800">
            Sohabat Fuhur
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <Link
          href={`/monitoring/node/${nodeId}`}
          className="text-blue-600 hover:underline text-sm mb-4 inline-block"
        >
          &larr; Kembali ke Node
        </Link>

        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold">{detail.name}</h1>
            <p className="text-gray-500 text-sm">
              {nodeId} / VMID {vmid}
            </p>
          </div>
          <span
            className={`px-3 py-1 text-sm rounded-full ${
              detail.status === "running"
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {detail.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <ResourceGauge label="CPU" used={detail.cpu} total={detail.maxcpu} unit="%" />
          <ResourceGauge label="RAM" used={detail.mem} total={detail.maxmem} unit="MB" />
          <ResourceGauge label="Disk" used={detail.disk} total={detail.maxdisk} unit="GB" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ResourceChart
            data={history}
            dataKey="cpu"
            label="CPU Usage (1 Jam Terakhir)"
            unit="%"
            color="#3b82f6"
          />
          <ResourceChart
            data={history}
            dataKey="mem"
            label="Memory Usage (1 Jam Terakhir)"
            unit="MB"
            color="#10b981"
          />
        </div>
      </main>
    </div>
  );
}
