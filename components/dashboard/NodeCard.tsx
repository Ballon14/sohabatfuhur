import Link from "next/link";
import { ResourceGauge } from "./ResourceGauge";

interface NodeCardProps {
  node: string;
  status: string;
  cpu: number;
  maxcpu: number;
  mem: number;
  maxmem: number;
  disk: number;
  maxdisk: number;
  uptime: number;
}

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const parts: string[] = [];
  if (d > 0) parts.push(`${d}h`);
  if (h > 0) parts.push(`${h}j`);
  parts.push(`${m}m`);
  return parts.join(" ");
}

export function NodeCard({
  node,
  status,
  cpu,
  maxcpu,
  mem,
  maxmem,
  disk,
  maxdisk,
  uptime,
}: NodeCardProps) {
  const isOnline = status === "online";

  return (
    <Link href={`/monitoring/node/${node}`} className="block">
      <div
        className={`bg-white rounded-lg shadow-md p-5 border-l-4 ${
          isOnline ? "border-l-green-500" : "border-l-red-500"
        } hover:shadow-lg transition`}
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-lg font-bold">{node}</h2>
            <span
              className={`inline-block px-2 py-0.5 text-xs rounded-full ${
                isOnline
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {isOnline ? "Online" : "Offline"}
            </span>
          </div>
          <div className="text-right text-xs text-gray-400">
            <p>Uptime</p>
            <p className="font-medium text-gray-600">{formatUptime(uptime)}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <ResourceGauge
            label="CPU"
            used={cpu}
            total={maxcpu}
            unit="%"
          />
          <ResourceGauge
            label="RAM"
            used={mem}
            total={maxmem}
            unit="MB"
          />
          <ResourceGauge
            label="Disk"
            used={disk}
            total={maxdisk}
            unit="GB"
          />
        </div>
      </div>
    </Link>
  );
}
