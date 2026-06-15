export interface TransformerArea {
  id: string;
  name: string;
  maxPower: number;
}

export interface LoadBlock {
  id: string;
  name: string;
  power: number;
  color: string;
}

export interface LoadAssignment {
  loadId: string;
  areaId: string | null;
}

export interface OperationLog {
  id: number;
  sessionId: string;
  timestamp: string;
  loadId: string;
  loadName: string;
  power: number;
  fromAreaId: string | null;
  fromAreaName: string | null;
  toAreaId: string | null;
  toAreaName: string | null;
}

export interface TrainingSession {
  id: string;
  name: string;
  createdAt: string;
  areas: TransformerArea[];
  initialLoads: LoadBlock[];
}

export interface SessionIndexItem {
  id: string;
  name: string;
  createdAt: string;
  logCount: number;
}

export interface SessionFile extends TrainingSession {
  logs: OperationLog[];
}

export type OverloadStatus = "ok" | "warn" | "danger";

export interface AreaLoadInfo {
  areaId: string;
  currentPower: number;
  maxPower: number;
  loadRate: number;
  status: OverloadStatus;
  loads: LoadBlock[];
}

export const OVERLOAD_WARN = 0.75;
export const OVERLOAD_DANGER = 0.9;

export const POOL_DROPPABLE_ID = "load-pool";
