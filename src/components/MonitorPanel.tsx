import { Activity, Gauge, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import type { AreaLoadInfo, TransformerArea } from "@shared/types";
import { OVERLOAD_DANGER, OVERLOAD_WARN } from "@shared/types";
import { cn } from "@/lib/utils";

interface Props {
  areas: TransformerArea[];
  infos: AreaLoadInfo[];
}

export default function MonitorPanel({ areas, infos }: Props) {
  const totalCurrent = infos.reduce((s, i) => s + i.currentPower, 0);
  const totalMax = areas.reduce((s, a) => s + a.maxPower, 0);
  const overallRate = totalMax > 0 ? totalCurrent / totalMax : 0;
  const dangerCount = infos.filter((i) => i.status === "danger").length;
  const warnCount = infos.filter((i) => i.status === "warn").length;

  return (
    <div className="panel p-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-status-alert to-rose-600 flex items-center justify-center shadow-md">
          <Gauge className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="font-display font-bold text-white tracking-wide">
            实时监控面板
          </h3>
          <p className="text-[11px] text-slate-400 font-mono">
            REAL-TIME LOAD MONITOR
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="flex items-center gap-1 chip bg-status-ok/15 text-status-ok border border-status-ok/50 px-2.5 py-1">
            <CheckCircle2 className="w-3 h-3" />
            <span className="font-mono text-[11px] font-bold">
              {areas.length - dangerCount - warnCount} 正常
            </span>
          </div>
          {warnCount > 0 && (
            <div className="flex items-center gap-1 chip bg-status-warn/15 text-status-warn border border-status-warn/50 px-2.5 py-1">
              <AlertTriangle className="w-3 h-3" />
              <span className="font-mono text-[11px] font-bold">
                {warnCount} 预警
              </span>
            </div>
          )}
          {dangerCount > 0 && (
            <div className="flex items-center gap-1 chip bg-status-danger/15 text-status-danger border border-status-danger/60 px-2.5 py-1 animate-pulse">
              <XCircle className="w-3 h-3" />
              <span className="font-mono text-[11px] font-bold">
                {dangerCount} 超载
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        <StatCard
          title="台区总数"
          value={areas.length}
          unit="台区"
          icon={<Activity className="w-4 h-4" />}
          tone="power"
        />
        <StatCard
          title="总负载"
          value={totalCurrent.toFixed(1)}
          unit="kW"
          tone="power"
        />
        <StatCard
          title="总容量"
          value={totalMax.toFixed(1)}
          unit="kW"
          tone="ok"
        />
        <StatCard
          title="全局负载率"
          value={(overallRate * 100).toFixed(1)}
          unit="%"
          tone={
            overallRate >= OVERLOAD_DANGER
              ? "danger"
              : overallRate >= OVERLOAD_WARN
              ? "warn"
              : "ok"
          }
        />
      </div>

      <div className="space-y-2">
        {areas.map((area, idx) => {
          const info = infos[idx];
          if (!info) return null;
          const pct = Math.min(100, info.loadRate * 100);
          return (
            <div
              key={area.id}
              className="rounded-xl p-3 bg-slate-800/40 border border-slate-700/60"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "w-2 h-2 rounded-full",
                      info.status === "danger"
                        ? "bg-status-danger animate-pulseDot"
                        : info.status === "warn"
                        ? "bg-status-warn animate-pulseDot"
                        : "bg-status-ok"
                    )}
                  />
                  <span className="text-xs font-semibold text-slate-200">
                    {area.name}
                  </span>
                </div>
                <div className="font-mono text-[11px]">
                  <span
                    className={cn(
                      "font-bold",
                      info.status === "danger"
                        ? "text-status-danger"
                        : info.status === "warn"
                        ? "text-status-warn"
                        : "text-status-ok"
                    )}
                  >
                    {info.currentPower.toFixed(1)}
                  </span>
                  <span className="text-slate-500"> / {info.maxPower} kW · </span>
                  <span className="text-slate-300">{pct.toFixed(1)}%</span>
                </div>
              </div>
              <div className="h-1.5 rounded-full bg-slate-900 overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    info.status === "danger"
                      ? "bg-status-danger"
                      : info.status === "warn"
                      ? "bg-status-warn"
                      : "bg-status-ok"
                  )}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  unit,
  icon,
  tone,
}: {
  title: string;
  value: string | number;
  unit?: string;
  icon?: React.ReactNode;
  tone: "power" | "ok" | "warn" | "danger";
}) {
  const tones = {
    power: "from-power-600 to-power-800 text-power-200",
    ok: "from-status-ok to-emerald-700 text-emerald-200",
    warn: "from-status-warn to-orange-700 text-orange-200",
    danger: "from-status-danger to-rose-700 text-rose-200",
  } as const;
  return (
    <div className="relative rounded-xl p-3 bg-slate-800/40 border border-slate-700/60 overflow-hidden">
      <div
        className={cn(
          "absolute -top-10 -right-10 w-28 h-28 rounded-full blur-2xl opacity-30 bg-gradient-to-br",
          tones[tone]
        )}
      />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-[11px] text-slate-400 font-mono">{title}</p>
          <p className="mt-1 font-display font-black text-2xl text-white tracking-wider flex items-baseline gap-1">
            {value}
            {unit && (
              <span className="font-mono text-xs text-slate-400 font-medium">
                {unit}
              </span>
            )}
          </p>
        </div>
        {icon && (
          <div
            className={cn(
              "w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center",
              tones[tone]
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
