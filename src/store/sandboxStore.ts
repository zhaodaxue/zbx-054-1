import { create } from "zustand";
import type {
  TransformerArea,
  LoadBlock,
  LoadAssignment,
  AreaLoadInfo,
  OperationLog,
} from "@shared/types";
import {
  buildAssignments,
  computeAreaLoads,
  getAssignment,
  applyLogStep,
} from "@shared/loadCalculator";

interface SandboxState {
  sessionId: string | null;
  areas: TransformerArea[];
  loads: LoadBlock[];
  assignments: LoadAssignment[];
  areaLoads: AreaLoadInfo[];
  readOnly: boolean;
  assessed: boolean;

  init: (
    areas: TransformerArea[],
    loads: LoadBlock[],
    sessionId?: string | null,
    readOnly?: boolean
  ) => void;

  setSessionId: (id: string | null) => void;

  moveLoad: (
    loadId: string,
    toAreaId: string | null
  ) => { load: LoadBlock; fromAreaId: string | null; fromAreaName: string | null; toAreaId: string | null; toAreaName: string | null } | null;

  applyLogs: (logs: OperationLog[], stepCount: number) => void;

  submitAssessment: () => void;

  reset: (opts?: { keepSessionId?: boolean }) => void;
}

function recalc(state: Pick<SandboxState, "areas" | "loads" | "assignments">) {
  return { areaLoads: computeAreaLoads(state.areas, state.loads, state.assignments) };
}

export const useSandboxStore = create<SandboxState>((set, get) => ({
  sessionId: null,
  areas: [],
  loads: [],
  assignments: [],
  areaLoads: [],
  readOnly: false,
  assessed: false,

  init: (areas, loads, sessionId = null, readOnly = false) => {
    const assignments = buildAssignments(loads);
    set({
      areas,
      loads,
      assignments,
      sessionId,
      readOnly,
      assessed: false,
      ...recalc({ areas, loads, assignments }),
    });
  },

  setSessionId: (id) => set({ sessionId: id }),

  moveLoad: (loadId, toAreaId) => {
    const { assignments, areas, loads, readOnly } = get();
    if (readOnly) return null;
    const current = getAssignment(assignments, loadId);
    if (!current) return null;
    if (current.areaId === toAreaId) return null;

    const load = loads.find((l) => l.id === loadId);
    if (!load) return null;

    const fromAreaName =
      current.areaId != null
        ? areas.find((a) => a.id === current.areaId)?.name ?? null
        : null;
    const toAreaName =
      toAreaId != null
        ? areas.find((a) => a.id === toAreaId)?.name ?? null
        : null;

    const nextAssignments = assignments.map((a) =>
      a.loadId === loadId ? { ...a, areaId: toAreaId } : a
    );
    set({
      assignments: nextAssignments,
      ...recalc({ areas: get().areas, loads, assignments: nextAssignments }),
    });

    return {
      load,
      fromAreaId: current.areaId,
      fromAreaName,
      toAreaId,
      toAreaName,
    };
  },

  applyLogs: (logs, stepCount) => {
    const { areas, loads } = get();
    let assignments = buildAssignments(loads);
    const steps = logs.slice(0, Math.max(0, stepCount));
    for (const log of steps) {
      assignments = applyLogStep(assignments, {
        loadId: log.loadId,
        toAreaId: log.toAreaId,
      });
    }
    set({
      assignments,
      ...recalc({ areas, loads, assignments }),
    });
  },

  submitAssessment: () => {
    set({ assessed: true, readOnly: true });
  },

  reset: (opts) => {
    const { areas, loads } = get();
    const assignments = buildAssignments(loads);
    set({
      assignments,
      readOnly: false,
      assessed: false,
      sessionId: opts?.keepSessionId ? get().sessionId : null,
      ...recalc({ areas, loads, assignments }),
    });
  },
}));
