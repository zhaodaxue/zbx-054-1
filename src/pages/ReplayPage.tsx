import { useEffect, useMemo, useRef, useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  FastForward,
  SearchX,
  Clock,
  ArrowRightLeft,
  Home,
  RefreshCcw,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import AreaCard from "@/components/AreaCard";
import LoadPool from "@/components/LoadPool";
import MonitorPanel from "@/components/MonitorPanel";
import { useSandboxStore } from "@/store/sandboxStore";
import { getPoolLoads } from "@shared/loadCalculator";
import { apiClient } from "@/api/client";
import type { OperationLog, SessionIndexItem } from "@shared/types";
import { cn } from "@/lib/utils";

const SPEEDS = [0.5, 1, 2, 4] as const;

export default function ReplayPage() {
  const { areas, loads, areaLoads, assignments, init, applyLogs, reset } =
    useSandboxStore();

  const [params] = useSearchParams();
  const initialSession = params.get("session");

  const [sessions, setSessions] = useState<SessionIndexItem[]>([]);
  const [logs, setLogs] = useState<OperationLog[]>([]);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<(typeof SPEEDS)[number]>(1);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(initialSession);
  const [sessionLoaded, setSessionLoaded] = useState(false);

  const timer = useRef<number | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 10000 } })
  );

  const poolLoads = useMemo(
    () => getPoolLoads(loads, assignments),
    [loads, assignments]
  );

  const totalSteps = logs.length;
  const currentLog = step > 0 ? logs[step - 1] : undefined;

  useEffect(() => {
    reset();
    setSessionLoaded(false);
    apiClient.listSessions().then(setSessions).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!initialSession) return;
    loadSession(initialSession);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSession]);

  useEffect(() => {
    if (!playing) return;
    if (step >= totalSteps) {
      setPlaying(false);
      return;
    }
    const delay = 1000 / speed;
    timer.current = window.setTimeout(() => {
      setStep((s) => {
        const next = Math.min(totalSteps, s + 1);
        applyLogs(logs, next);
        return next;
      });
    }, delay);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [playing, step, speed, totalSteps, logs, applyLogs]);

  const loadSession = async (id: string) => {
    try {
      setLoading(true);
      setPlaying(false);
      setSessionLoaded(false);
      const session = await apiClient.getSession(id);
      if (!session) return;
      init(session.areas, session.initialLoads, null, true);
      setSelectedId(id);
      const list = await apiClient.getSessionLogs(id);
      setLogs(list);
      setStep(0);
      applyLogs(list, 0);
      setSessionLoaded(true);
    } finally {
      setLoading(false);
    }
  };

  const goTo = (target: number) => {
    const t = Math.max(0, Math.min(totalSteps, target));
    setStep(t);
    applyLogs(logs, t);
  };

  const togglePlay = () => {
    if (totalSteps === 0) return;
    if (step >= totalSteps) {
      goTo(0);
    }
    setPlaying((p) => !p);
  };

  const fmtTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("zh-CN", { hour12: false });

  const fmtTimeFull = (iso: string) =>
    new Date(iso).toLocaleString("zh-CN", { hour12: false });

  const sessionLabel = selectedId
    ? sessions.find((s) => s.id === selectedId)?.name ||
      `会话 ${selectedId.slice(0, 8)}…`
    : "请选择历史会话";

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader
        sessionLabel={`回放 · ${sessionLabel}`}
        extra={
          totalSteps > 0 ? (
            <button
              className="btn-ghost"
              onClick={() => goTo(0)}
              title="回到起点"
            >
              <RefreshCcw className="w-4 h-4" /> 从头开始
            </button>
          ) : undefined
        }
      />

      <main className="flex-1 max-w-[1600px] w-full mx-auto px-6 py-6 grid-bg">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
          <div className="xl:col-span-3 space-y-5">
            <div className="panel p-4">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-status-alert to-rose-600 flex items-center justify-center shadow-md">
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-white tracking-wide">
                      时间轴控制
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono">
                      共 {totalSteps} 条操作记录
                    </p>
                  </div>
                </div>

                <div className="ml-auto flex items-center gap-2">
                  <label className="text-[11px] text-slate-400 font-mono mr-1">
                    选择会话
                  </label>
                  <select
                    className="bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono"
                    value={selectedId ?? ""}
                    onChange={(e) => e.target.value && loadSession(e.target.value)}
                    disabled={loading}
                  >
                    <option value="">-- 请选择 --</option>
                    {sessions.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} · {s.logCount}条
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <button
                    className="btn-ghost !px-2.5 !py-1.5"
                    title="上一步"
                    disabled={step <= 0 || playing}
                    onClick={() => goTo(step - 1)}
                  >
                    <SkipBack className="w-4 h-4" />
                  </button>
                  <button
                    className={cn(
                      "btn !px-3 !py-1.5 text-white",
                      playing
                        ? "bg-status-danger hover:bg-rose-600 shadow-glow-danger"
                        : "bg-power-700 hover:bg-power-600 shadow-glow-blue"
                    )}
                    title={playing ? "暂停" : "播放"}
                    onClick={togglePlay}
                    disabled={totalSteps === 0}
                  >
                    {playing ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    className="btn-ghost !px-2.5 !py-1.5"
                    title="下一步"
                    disabled={step >= totalSteps || playing}
                    onClick={() => goTo(step + 1)}
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  {SPEEDS.map((sp) => (
                    <button
                      key={sp}
                      className={cn(
                        "px-2.5 py-1.5 rounded-lg text-xs font-bold font-mono transition-all",
                        speed === sp
                          ? "bg-power-700 text-white shadow-glow-blue"
                          : "text-slate-300 hover:text-white hover:bg-slate-700/60"
                      )}
                      onClick={() => setSpeed(sp)}
                      disabled={playing && sp === speed}
                    >
                      <FastForward className="w-3 h-3 inline-block mr-0.5 align-middle" />
                      {sp}x
                    </button>
                  ))}
                </div>

                <div className="flex-1 flex items-center gap-3 px-2">
                  <span className="font-mono text-[11px] text-slate-400 min-w-[36px] text-right">
                    {step}
                  </span>
                  <div className="flex-1 relative h-2 rounded-full bg-slate-800 overflow-hidden border border-slate-700/60">
                    <div
                      className="h-full bg-gradient-to-r from-power-500 to-status-alert transition-all duration-300"
                      style={{
                        width: totalSteps > 0 ? `${(step / totalSteps) * 100}%` : "0%",
                      }}
                    />
                    <input
                      type="range"
                      min={0}
                      max={totalSteps}
                      value={step}
                      onChange={(e) => goTo(Number(e.target.value))}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={totalSteps === 0}
                    />
                  </div>
                  <span className="font-mono text-[11px] text-slate-400 min-w-[36px]">
                    {totalSteps}
                  </span>
                </div>

                {currentLog && (
                  <div className="chip bg-power-700/20 border border-power-500/60 text-power-200 px-3 py-1.5">
                    <Clock className="w-3 h-3" />
                    {fmtTime(currentLog.timestamp)}
                  </div>
                )}
              </div>

              {currentLog && (
                <div className="mt-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 animate-slideIn">
                  <div className="flex items-center gap-3 text-xs text-slate-200">
                    <ArrowRightLeft className="w-4 h-4 text-amber-300 flex-shrink-0" />
                    <span className="font-semibold text-white">
                      步骤 {step}/{totalSteps}：
                    </span>
                    <span>
                      「{currentLog.loadName}」
                      <span className="font-mono text-amber-300 mx-1">
                        ({currentLog.power.toFixed(1)}kW)
                      </span>
                      从
                      <span className="font-semibold text-power-300 mx-1">
                        {currentLog.fromAreaName ?? "负荷池"}
                      </span>
                      转移到
                      <span className="font-semibold text-status-ok mx-1">
                        {currentLog.toAreaName ?? "负荷池"}
                      </span>
                    </span>
                    <span className="ml-auto font-mono text-[11px] text-slate-500">
                      {fmtTimeFull(currentLog.timestamp)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {!sessionLoaded && !loading && totalSteps === 0 && (
              <div className="panel p-12 text-center">
                <SearchX className="w-14 h-14 mx-auto text-slate-500 mb-3" />
                <h3 className="font-display text-xl text-slate-300 mb-2">
                  {selectedId ? "该会话暂无操作日志" : "暂无操作日志可回放"}
                </h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto mb-5">
                  {selectedId
                    ? "当前选中的会话没有产生任何操作记录。"
                    : "请先前往演练沙盘页，点击「新演练会话」开始拖拽操作；完成后返回此处选择对应会话即可回放。"}
                </p>
                <Link to="/sandbox" className="btn-primary inline-flex">
                  <Home className="w-4 h-4" /> 前往演练沙盘
                </Link>
              </div>
            )}

            {sessionLoaded && (
              <DndContext sensors={sensors} collisionDetection={closestCenter}>
                <LoadPool loads={poolLoads} disabled />
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
                      disabled
                    />
                  ))}
                </div>
                <DragOverlay />
              </DndContext>
            )}
          </div>

          <div className="space-y-5">
            <MonitorPanel areas={areas} infos={areaLoads} />

            <div className="panel p-4 max-h-[520px] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display font-bold text-white tracking-wide">
                  操作日志列表
                </h3>
                <span className="chip bg-slate-800/70 border border-slate-700/60 text-slate-300 px-2.5 py-1">
                  {logs.length} 条
                </span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {logs.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-8">
                    暂无日志
                  </p>
                ) : (
                  logs
                    .slice()
                    .reverse()
                    .map((log, i) => {
                      const realIdx = logs.length - 1 - i;
                      const active = realIdx === step - 1;
                      const passed = realIdx < step;
                      return (
                        <button
                          key={log.id}
                          onClick={() => goTo(realIdx + 1)}
                          className={cn(
                            "w-full text-left rounded-lg p-2.5 border transition-all text-xs",
                            active
                              ? "bg-power-700/25 border-power-400/70 shadow-glow-blue"
                              : passed
                              ? "bg-slate-800/40 border-slate-700/60"
                              : "bg-slate-900/40 border-slate-800/70 opacity-70 hover:opacity-100"
                          )}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-mono font-bold text-[11px] text-slate-400">
                              #{String(realIdx + 1).padStart(3, "0")}
                            </span>
                            <span className="font-mono text-[10px] text-slate-500">
                              {fmtTime(log.timestamp)}
                            </span>
                          </div>
                          <div className="text-slate-200 leading-snug line-clamp-2">
                            <span className="text-white font-semibold">
                              {log.loadName}
                            </span>
                            <span className="mx-1 font-mono text-amber-300 text-[10px]">
                              {log.power.toFixed(1)}kW
                            </span>
                          </div>
                          <div className="mt-1 text-[11px] text-slate-400 flex items-center gap-1">
                            <span className="text-power-300 truncate">
                              {log.fromAreaName ?? "负荷池"}
                            </span>
                            <ArrowRightLeft className="w-3 h-3 text-slate-500 flex-shrink-0" />
                            <span className="text-status-ok truncate">
                              {log.toAreaName ?? "负荷池"}
                            </span>
                          </div>
                        </button>
                      );
                    })
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
