import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { Plus, Play } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import AreaCard from "@/components/AreaCard";
import LoadPool from "@/components/LoadPool";
import MonitorPanel from "@/components/MonitorPanel";
import DraggableLoadBlock from "@/components/DraggableLoadBlock";
import { useSandboxStore } from "@/store/sandboxStore";
import { DEFAULT_AREAS, DEFAULT_LOADS } from "@shared/initialData";
import { getPoolLoads } from "@shared/loadCalculator";
import { POOL_DROPPABLE_ID } from "@shared/types";
import type { LoadBlock } from "@shared/types";
import { apiClient } from "@/api/client";
import type { OperationLog } from "@shared/types";
import { Link } from "react-router-dom";

export default function SandboxPage() {
  const { areas, loads, assignments, areaLoads, sessionId, readOnly } =
    useSandboxStore();
  const init = useSandboxStore((s) => s.init);
  const moveLoad = useSandboxStore((s) => s.moveLoad);
  const setSessionId = useSandboxStore((s) => s.setSessionId);
  const reset = useSandboxStore((s) => s.reset);

  const [activeLoad, setActiveLoad] = useState<LoadBlock | null>(null);
  const [toast, setToast] = useState<string>("");
  const [creating, setCreating] = useState(false);
  const [logPending, setLogPending] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  );

  useEffect(() => {
    if (areas.length === 0 || loads.length === 0) {
      init(DEFAULT_AREAS, DEFAULT_LOADS, null, false);
    }
  }, [areas.length, loads.length, init]);

  const poolLoads = useMemo(
    () => getPoolLoads(loads, assignments),
    [loads, assignments]
  );

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2400);
  };

  const createNewSession = async () => {
    try {
      setCreating(true);
      reset();
      const ses = await apiClient.createSession({
        name: `演练会话 · ${new Date().toLocaleString("zh-CN", { hour12: false })}`,
        areas: DEFAULT_AREAS,
        initialLoads: DEFAULT_LOADS,
      });
      setSessionId(ses.id);
      showToast(`已创建演练会话：${ses.name}`);
    } catch (e) {
      showToast(`创建会话失败：${e instanceof Error ? e.message : e}`);
    } finally {
      setCreating(false);
    }
  };

  const submitLog = async (
    payload: Omit<OperationLog, "id" | "timestamp">
  ) => {
    try {
      setLogPending(true);
      await apiClient.submitLog(payload);
    } catch (e) {
      console.warn("submit log failed", e);
    } finally {
      setLogPending(false);
    }
  };

  const onDragStart = (e: DragStartEvent) => {
    const data = e.active.data.current;
    if (data?.type === "load") {
      setActiveLoad(data.load as LoadBlock);
    }
  };

  const onDragEnd = (e: DragEndEvent) => {
    setActiveLoad(null);
    const { active, over } = e;
    if (!over) return;
    const loadId = String(active.id);
    const overId = String(over.id);

    const toAreaId = overId === POOL_DROPPABLE_ID ? null : overId;
    const result = moveLoad(loadId, toAreaId);
    if (!result) return;

    const sid = sessionId;
    if (!sid) {
      showToast("操作已记录，但未创建会话（日志不会写入服务端）。点击「新演练会话」创建。");
      return;
    }
    submitLog({
      sessionId: sid,
      loadId: result.load.id,
      loadName: result.load.name,
      power: result.load.power,
      fromAreaId: result.fromAreaId,
      fromAreaName: result.fromAreaName,
      toAreaId: result.toAreaId,
      toAreaName: result.toAreaName,
    });
  };

  const sessionLabel = sessionId
    ? `会话ID: ${sessionId.slice(0, 8)}…`
    : logPending
    ? "日志同步中…"
    : "未开始 · 点击新建会话";

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader
        sessionLabel={sessionLabel}
        onReset={() => {
          reset();
          showToast("沙盘已重置为初始状态");
        }}
        extra={
          <>
            <button
              className="btn-primary"
              onClick={createNewSession}
              disabled={creating}
            >
              <Plus className="w-4 h-4" />
              {creating ? "创建中…" : "新演练会话"}
            </button>
            {sessionId && (
              <Link
                to={`/replay?session=${sessionId}`}
                className="btn-ghost"
              >
                <Play className="w-4 h-4" /> 回放此会话
              </Link>
            )}
          </>
        }
      />

      <main className="flex-1 max-w-[1600px] w-full mx-auto px-6 py-6 grid-bg">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
        >
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
            <div className="xl:col-span-3 space-y-5">
              <LoadPool loads={poolLoads} disabled={readOnly} />
              <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-5">
                {areas.map((area, i) => (
                  <AreaCard
                    key={area.id}
                    area={area}
                    info={areaLoads[i] ?? {
                      areaId: area.id,
                      currentPower: 0,
                      maxPower: area.maxPower,
                      loadRate: 0,
                      status: "ok",
                      loads: [],
                    }}
                    disabled={readOnly}
                  />
                ))}
              </div>
            </div>
            <div>
              <MonitorPanel areas={areas} infos={areaLoads} />
            </div>
          </div>

          <DragOverlay dropAnimation={null}>
            {activeLoad ? (
              <div className="w-72 rotate-2 opacity-95 pointer-events-none">
                <DraggableLoadBlock load={activeLoad} disabled />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </main>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slideIn">
          <div className="panel px-5 py-3 text-sm text-slate-100 border-power-500/60 shadow-glow-blue max-w-lg text-center">
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}
