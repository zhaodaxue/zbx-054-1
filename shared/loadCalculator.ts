import type {
  TransformerArea,
  LoadBlock,
  LoadAssignment,
  AreaLoadInfo,
  OverloadStatus,
} from "./types";
import { OVERLOAD_WARN, OVERLOAD_DANGER } from "./types";

export function calcStatus(rate: number): OverloadStatus {
  if (rate >= OVERLOAD_DANGER) return "danger";
  if (rate >= OVERLOAD_WARN) return "warn";
  return "ok";
}

export function buildAssignments(loads: LoadBlock[]): LoadAssignment[] {
  return loads.map((l) => ({ loadId: l.id, areaId: null }));
}

export function computeAreaLoads(
  areas: TransformerArea[],
  loads: LoadBlock[],
  assignments: LoadAssignment[]
): AreaLoadInfo[] {
  const loadMap = new Map(loads.map((l) => [l.id, l]));
  return areas.map((area) => {
    const assigned = assignments
      .filter((a) => a.areaId === area.id)
      .map((a) => loadMap.get(a.loadId)!)
      .filter(Boolean);
    const currentPower = assigned.reduce((s, l) => s + l.power, 0);
    const loadRate = area.maxPower > 0 ? currentPower / area.maxPower : 0;
    return {
      areaId: area.id,
      currentPower,
      maxPower: area.maxPower,
      loadRate,
      status: calcStatus(loadRate),
      loads: assigned,
    };
  });
}

export function getPoolLoads(
  loads: LoadBlock[],
  assignments: LoadAssignment[]
): LoadBlock[] {
  const poolIds = new Set(
    assignments.filter((a) => a.areaId === null).map((a) => a.loadId)
  );
  return loads.filter((l) => poolIds.has(l.id));
}

export function getAssignment(
  assignments: LoadAssignment[],
  loadId: string
): LoadAssignment | undefined {
  return assignments.find((a) => a.loadId === loadId);
}

export function applyLogStep(
  assignments: LoadAssignment[],
  log: { loadId: string; toAreaId: string | null }
): LoadAssignment[] {
  return assignments.map((a) =>
    a.loadId === log.loadId ? { ...a, areaId: log.toAreaId } : a
  );
}
