import { useDroppable } from "@dnd-kit/core";
import { Zap, AlertTriangle, XCircle } from "lucide-react";
import type { AreaLoadInfo, TransformerArea, LoadBlock } from "@shared/types";
import { OVERLOAD_DANGER, OVERLOAD_WARN } from "@shared/types";
import { cn } from "@/lib/utils";
import DraggableLoadBlock from "./DraggableLoadBlock";

interface Props {
  area: TransformerArea;
  info: AreaLoadInfo;
  disabled?: boolean;
}

function statusClasses(status: AreaLoadInfo["status"]) {
  switch (status) {
    case "danger":
      return {
        badge: "bg-status-danger/20 text-status-danger border-status-danger/60",
        ring: "animate-flashBorder border-status-danger",
        glow: "",
        topBar: "from-status-danger to-rose-700",
        progress: "bg-status-danger",
        dot: "bg-status-danger",
      };
    case "warn":
      return {
        badge: "bg-status-warn/15 text-status-warn border-status-warn/60",
        ring: "border-status-warn shadow-glow-warn",
        glow: "shadow-glow-warn",
        topBar: "from-status-warn to-orange-600",
        progress: "bg-status-warn",
        dot: "bg-status-warn",
      };
    default:
      return {
        badge: "bg-status-ok/15 text-status-ok border-status-ok/60",
        ring: "border-power-600/70 hover:border-power-400 shadow-glow-blue/40",
        glow: "",
        topBar: "from-power-600 to-power-800",
        progress: "bg-status-ok",
        dot: "bg-status-ok",
      };
  }
}

export default function AreaCard({ area, info, disabled }: Props) {
  const { setNodeRef, isOver } = useDroppable({
    id: area.id,
    data: { type: "area", area },
    disabled,
  });

  const s = statusClasses(info.status);
  const rawPct = info.loadRate * 100;
  const pct = Math.min(100, rawPct);
  const overPct = Math.max(0, rawPct - 100);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "relative panel flex flex-col overflow-hidden transition-all duration-300 border-2",
        s.ring,
        isOver ? "ring-4 ring-amber-300/60 scale-[1.01]" : ""
      )}
    >
      <div className={cn("h-2 w-full bg-gradient-to-r", s.topBar)} />

      <div className="p-4 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display font-bold text-white tracking-wide text-lg">
              {area.name}
            </h3>
            <span className={cn("status-dot", s.dot)} />
          </div>
          <p className="mt-1 text-[11px] text-slate-400 font-mono">
            容量上限 {area.maxPower.toFixed(1)} kW
          </p>
        </div>

        <div className="flex flex-col items-end">
          <div className="relative w-20 h-20">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="rgba(100,116,139,0.25)"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                className={cn(
                  "transition-[stroke-dashoffset] duration-500",
                  info.status === "danger"
                    ? "stroke-status-danger"
                    : info.status === "warn"
                    ? "stroke-status-warn"
                    : "stroke-status-ok"
                )}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${(pct / 100) * 264} 264`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                className={cn(
                  "font-display font-black text-lg",
                  info.status === "danger"
                    ? "text-status-danger"
                    : info.status === "warn"
                    ? "text-status-warn"
                    : "text-status-ok"
                )}
              >
                {pct.toFixed(0)}
              </span>
              <span className="text-[10px] text-slate-400 -mt-0.5">%</span>
            </div>
          </div>
          <span
            className={cn(
              "chip border mt-1.5",
              s.badge
            )}
          >
            {info.status === "danger" ? (
              <>
                <XCircle className="w-3 h-3" /> 超载
              </>
            ) : info.status === "warn" ? (
              <>
                <AlertTriangle className="w-3 h-3" /> 预警
              </>
            ) : (
              <>
                <Zap className="w-3 h-3" /> 正常
              </>
            )}
          </span>
        </div>
      </div>

      <div className="px-4 pb-2">
        <div className="flex items-end justify-between text-[11px] mb-1.5">
          <span className="text-slate-400 font-mono">
            {info.status === "danger" && (
              <span className="text-status-danger font-semibold mr-2">
                ⚠ 超载 {overPct.toFixed(0)}%
              </span>
            )}
            {info.status === "warn" && pct >= OVERLOAD_WARN * 100 && (
              <span className="text-status-warn font-semibold mr-2">
                ⚠ 接近上限
              </span>
            )}
          </span>
          <span className="font-mono text-slate-200">
            <span className="text-white font-bold">
              {info.currentPower.toFixed(1)}
            </span>
            <span className="text-slate-500"> / {info.maxPower.toFixed(1)} kW</span>
          </span>
        </div>
        <div className="h-2 rounded-full bg-slate-800 overflow-hidden border border-slate-700/70">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              s.progress
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="flex-1 min-h-[180px] m-3 mt-1 p-2.5 rounded-xl border border-dashed border-slate-700/70 bg-slate-950/40 flex flex-col gap-2 overflow-y-auto">
        {info.loads.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-center text-slate-500 text-xs px-4 py-8">
            将负荷块拖拽到此处
            <br />
            <span className="text-slate-600 mt-1">Drop loads here</span>
          </div>
        ) : (
          info.loads.map((ld: LoadBlock) => (
            <DraggableLoadBlock key={ld.id} load={ld} disabled={disabled} />
          ))
        )}
      </div>
    </div>
  );
}
