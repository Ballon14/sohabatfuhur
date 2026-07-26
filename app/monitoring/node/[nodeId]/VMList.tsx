"use client";

import { useState } from "react";
import { VMCard } from "@/components/dashboard/VMCard";
import type { VMInfo } from "@/lib/proxmox";

interface VMListProps {
  node: string;
  vms: VMInfo[];
}

export function VMList({ node, vms }: VMListProps) {
  const [loading, setLoading] = useState<number | null>(null);

  async function handleAction(vmid: number, action: "start" | "stop" | "reboot") {
    setLoading(vmid);
    try {
      await fetch(`/api/proxmox/vms/${vmid}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ node, action }),
      });
      window.location.reload();
    } catch {
      alert("Gagal menjalankan action");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">
        Virtual Machines & Containers ({vms.length})
      </h2>

      {vms.length === 0 ? (
        <p className="text-gray-500">Tidak ada VM/CT pada node ini.</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {vms.map((vm) => (
            <div key={vm.vmid} className={loading === vm.vmid ? "opacity-50 pointer-events-none" : ""}>
              <VMCard {...vm} onAction={handleAction} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
