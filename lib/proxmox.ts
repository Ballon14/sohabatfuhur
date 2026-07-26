const PROXMOX_HOST = process.env.PROXMOX_HOST!;
const PROXMOX_TOKEN_ID = process.env.PROXMOX_TOKEN_ID!;
const PROXMOX_TOKEN_SECRET = process.env.PROXMOX_TOKEN_SECRET!;

interface ProxmoxResponse<T> {
  data: T;
}

interface ProxmoxNode {
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

async function fetchProxmox<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${PROXMOX_HOST}/api2/json${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `PVEAPIToken=${PROXMOX_TOKEN_ID}=${PROXMOX_TOKEN_SECRET}`,
      ...init?.headers,
    },
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) {
    throw new Error(`Proxmox API error: ${res.status} ${res.statusText}`);
  }

  const json: ProxmoxResponse<T> = await res.json();
  return json.data;
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
  const nodes = await fetchProxmox<ProxmoxNode[]>("/nodes");
  return nodes.map((n) => ({
    node: n.node,
    status: n.status,
    cpu: n.cpu,
    maxcpu: n.maxcpu,
    mem: n.mem,
    maxmem: n.maxmem,
    disk: n.disk,
    maxdisk: n.maxdisk,
    uptime: n.uptime,
  }));
}

export async function getNodeStatus(node: string) {
  return fetchProxmox<NodeInfo>(`/nodes/${node}/status`);
}

export async function getVMs(node: string): Promise<VMInfo[]> {
  const [qemu, lxc] = await Promise.allSettled([
    fetchProxmox<ProxmoxVM[]>(`/nodes/${node}/qemu`),
    fetchProxmox<ProxmoxVM[]>(`/nodes/${node}/lxc`),
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
  const detail = await fetchProxmox<ProxmoxVMDetail>(
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
  const data = await fetchProxmox<ProxmoxRRD[]>(
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
  await fetchProxmox(`/nodes/${node}/qemu/${vmid}/status/start`, {
    method: "POST",
  });
}

export async function stopVM(node: string, vmid: number): Promise<void> {
  await fetchProxmox(`/nodes/${node}/qemu/${vmid}/status/stop`, {
    method: "POST",
  });
}

export async function rebootVM(node: string, vmid: number): Promise<void> {
  await fetchProxmox(`/nodes/${node}/qemu/${vmid}/status/reboot`, {
    method: "POST",
  });
}
