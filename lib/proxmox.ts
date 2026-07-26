import https from "node:https";
import { URL } from "node:url";

const PROXMOX_HOST = process.env.PROXMOX_HOST!;
const PROXMOX_TOKEN_ID = process.env.PROXMOX_TOKEN_ID!;
const PROXMOX_TOKEN_SECRET = process.env.PROXMOX_TOKEN_SECRET!;

async function proxmoxFetch<T>(
  path: string,
  options?: { method?: string; body?: string }
): Promise<T> {
  const url = new URL(`${PROXMOX_HOST}/api2/json${path}`);
  const auth = `PVEAPIToken=${PROXMOX_TOKEN_ID}=${PROXMOX_TOKEN_SECRET}`;

  return new Promise((resolve, reject) => {
    const req = https.request(
      url,
      {
        method: options?.method ?? "GET",
        headers: {
          Authorization: auth,
          ...(options?.body ? { "Content-Type": "application/json" } : {}),
        },
        rejectUnauthorized: false,
        timeout: 10000,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => {
          const raw = Buffer.concat(chunks).toString();
          if (!res.statusCode || res.statusCode < 200 || res.statusCode >= 300) {
            reject(new Error(`Proxmox API error: ${res.statusCode} ${res.statusMessage}`));
            return;
          }
          try {
            const json = JSON.parse(raw);
            resolve(json.data as T);
          } catch {
            reject(new Error("Proxmox API error: invalid JSON response"));
          }
        });
      }
    );

    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Proxmox API error: request timeout"));
    });

    if (options?.body) req.write(options.body);
    req.end();
  });
}

interface ProxmoxClusterResource {
  id: string;
  type: string;
  node: string;
  status?: string;
  cpu?: number;
  maxcpu?: number;
  mem?: number;
  maxmem?: number;
  disk?: number;
  maxdisk?: number;
  uptime?: number;
  vmid?: number;
  name?: string;
  content?: string;
}

interface ProxmoxVM {
  vmid: number;
  name: string;
  status: string;
  cpu: number;
  maxcpu: number;
  mem: number;
  maxmem: number;
  disk: number;
  maxdisk: number;
  uptime: number;
  pid?: number;
  cpus?: number;
  diskwrite?: number;
  diskread?: number;
  netout?: number;
  netin?: number;
}

interface ProxmoxVMDetail {
  status: string;
  cpu: number;
  maxcpu: number;
  mem: number;
  maxmem: number;
  disk: number;
  maxdisk: number;
  uptime: number;
  name: string;
  qmpstatus?: string;
  pid?: number;
}

interface ProxmoxRRD {
  time: number;
  cpu?: number;
  mem?: number;
  netin?: number;
  netout?: number;
  diskwrite?: number;
  diskread?: number;
}

export interface NodeInfo {
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

export interface VMInfo {
  vmid: number;
  name: string;
  status: string;
  cpu: number;
  maxcpu: number;
  mem: number;
  maxmem: number;
  disk: number;
  maxdisk: number;
  uptime: number;
  type: "qemu" | "lxc";
}

export interface VMDetail {
  status: string;
  cpu: number;
  maxcpu: number;
  mem: number;
  maxmem: number;
  disk: number;
  maxdisk: number;
  name: string;
  uptime: number;
}

export interface RRDData {
  time: number;
  cpu?: number;
  mem?: number;
  netin?: number;
  netout?: number;
}

export async function getNodes(): Promise<NodeInfo[]> {
  const resources = await proxmoxFetch<ProxmoxClusterResource[]>("/cluster/resources");
  return resources
    .filter((r) => r.type === "node")
    .map((n) => ({
      node: n.node,
      status: n.status ?? "unknown",
      cpu: n.cpu ?? 0,
      maxcpu: n.maxcpu ?? 1,
      mem: n.mem ?? 0,
      maxmem: n.maxmem ?? 0,
      disk: n.disk ?? 0,
      maxdisk: n.maxdisk ?? 0,
      uptime: n.uptime ?? 0,
    }));
}

interface ProxmoxNodeStatus {
  cpu: number;
  memory: { used: number; total: number; free: number };
  swap: { used: number; total: number; free: number };
  rootfs: { used: number; total: number; avail: number };
  uptime: number;
  status?: string;
  pveversion?: string;
  kversion?: string;
}

export async function getNodeStatus(node: string): Promise<NodeInfo> {
  const data = await proxmoxFetch<ProxmoxNodeStatus>(`/nodes/${node}/status`);
  return {
    node,
    status: data.status ?? "unknown",
    cpu: data.cpu,
    maxcpu: 1,
    mem: data.memory?.used ?? 0,
    maxmem: data.memory?.total ?? 0,
    disk: data.rootfs?.used ?? 0,
    maxdisk: data.rootfs?.total ?? 0,
    uptime: data.uptime ?? 0,
  };
}

export async function getVMs(node: string): Promise<VMInfo[]> {
  const [qemu, lxc] = await Promise.allSettled([
    proxmoxFetch<ProxmoxVM[]>(`/nodes/${node}/qemu`),
    proxmoxFetch<ProxmoxVM[]>(`/nodes/${node}/lxc`),
  ]);

  const vms: VMInfo[] = [];

  if (qemu.status === "fulfilled") {
    vms.push(
      ...qemu.value.map((v) => ({
        vmid: v.vmid,
        name: v.name,
        status: v.status,
        cpu: v.cpu ?? 0,
        maxcpu: v.maxcpu ?? v.cpus ?? 1,
        mem: v.mem ?? 0,
        maxmem: v.maxmem ?? 0,
        disk: v.disk ?? 0,
        maxdisk: v.maxdisk ?? 0,
        uptime: v.uptime ?? 0,
        type: "qemu" as const,
      }))
    );
  }

  if (lxc.status === "fulfilled") {
    vms.push(
      ...lxc.value.map((v) => ({
        vmid: v.vmid,
        name: v.name,
        status: v.status,
        cpu: v.cpu ?? 0,
        maxcpu: v.maxcpu ?? v.cpus ?? 1,
        mem: v.mem ?? 0,
        maxmem: v.maxmem ?? 0,
        disk: v.disk ?? 0,
        maxdisk: v.maxdisk ?? 0,
        uptime: v.uptime ?? 0,
        type: "lxc" as const,
      }))
    );
  }

  return vms;
}

export async function getVMDetail(node: string, vmid: number): Promise<VMDetail> {
  const detail = await proxmoxFetch<ProxmoxVMDetail>(
    `/nodes/${node}/qemu/${vmid}/status/current`
  );
  return {
    status: detail.status,
    cpu: detail.cpu,
    maxcpu: detail.maxcpu,
    mem: detail.mem,
    maxmem: detail.maxmem,
    disk: detail.disk ?? 0,
    maxdisk: detail.maxdisk ?? 0,
    name: detail.name,
    uptime: detail.uptime,
  };
}

export async function getVMResourceHistory(
  node: string,
  vmid: number,
  timeframe: "hour" | "day" | "week" = "hour"
): Promise<RRDData[]> {
  const data = await proxmoxFetch<ProxmoxRRD[]>(
    `/nodes/${node}/qemu/${vmid}/rrddata?timeframe=${timeframe}`
  );
  return data.map((d) => ({
    time: d.time,
    cpu: d.cpu,
    mem: d.mem,
    netin: d.netin,
    netout: d.netout,
  }));
}

export async function startVM(node: string, vmid: number): Promise<void> {
  await proxmoxFetch(`/nodes/${node}/qemu/${vmid}/status/start`, {
    method: "POST",
  });
}

export async function stopVM(node: string, vmid: number): Promise<void> {
  await proxmoxFetch(`/nodes/${node}/qemu/${vmid}/status/stop`, {
    method: "POST",
  });
}

export async function rebootVM(node: string, vmid: number): Promise<void> {
  await proxmoxFetch(`/nodes/${node}/qemu/${vmid}/status/reboot`, {
    method: "POST",
  });
}

export async function getNextVMID(): Promise<number> {
  const data = await proxmoxFetch<{ data?: string }>("/cluster/nextid");
  return Number(data);
}

export async function cloneVM(
  node: string,
  templateVmid: number,
  newVmid: number,
  name: string
): Promise<string> {
  const data = await proxmoxFetch<{ data?: string }>(
    `/nodes/${node}/qemu/${templateVmid}/clone`,
    {
      method: "POST",
      body: JSON.stringify({ newid: newVmid, name }),
    }
  );
  return String(data ?? "");
}

export async function setVMConfig(
  node: string,
  vmid: number,
  config: { cores?: number; memory?: number; description?: string }
): Promise<void> {
  await proxmoxFetch(`/nodes/${node}/qemu/${vmid}/config`, {
    method: "PUT",
    body: JSON.stringify(config),
  });
}

export async function resizeDisk(
  node: string,
  vmid: number,
  diskSizeGb: number
): Promise<void> {
  await proxmoxFetch(`/nodes/${node}/qemu/${vmid}/resize`, {
    method: "PUT",
    body: JSON.stringify({ disk: "virtio0", size: `${diskSizeGb}G` }),
  });
}

export async function waitForTask(node: string, upid: string): Promise<void> {
  const poll = async (): Promise<void> => {
    const data = await proxmoxFetch<{ status: string; exitstatus?: string }>(
      `/nodes/${node}/tasks/${encodeURIComponent(upid)}/status`
    );
    if (data.status === "running") {
      await new Promise((r) => setTimeout(r, 2000));
      return poll();
    }
    if (data.exitstatus !== "OK") {
      throw new Error(`Task failed: ${data.exitstatus}`);
    }
  };
  await poll();
}
