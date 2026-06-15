import { Award, CheckCircle2, XCircle, Send, Lock } from "lucide-react";
import type { AreaLoadInfo, TransformerArea } from "@shared/types";
import { cn } from "@/lib/utils";

interface Props {
  areas: TransformerArea[];
  infos: AreaLoadInfo[];
  assessed: boolean;
  onSubmit: () => void;
}

export interface AssessmentResult {
  noDanger: boolean;
  overallUnder70: boolean;
  spreadUnder15: boolean;
  overallPct: number;
  spreadPct: number;
  allPassed: boolean;
}

export function computeAssessment(
  areas: TransformerArea[],
  infos: AreaLoadInfo[]
): AssessmentResult {
  const noDanger = areas.length > 0 && infos.every((i) => i.status !== "danger");
  const totalCurrent = infos.reduce((s, i) => s + i.currentPower, 0);
  const totalMax = areas.reduce((s, a) => s + a.maxPower, 0);
  const overallRate = totalMax > 0 ? totalCurrent / totalMax : 0;
  const overallPct = overallRate * 100;
  const overallUnder70 = overallPct <= 70;
  const pcts = infos.map((i) => i.loadRate * 100);
  const spreadPct =
    pcts.length > 0 ? Math.max(...pcts) - Math.min(...pcts) : 0;
  const spreadUnder15 = spreadPct <= 15;
  const allPassed = noDanger && overallUnder70 && spreadUnder15;
  return { noDanger, overallUnder70, spreadUnder15, overallPct, spreadPct, allPassed };
}

export default function AssessmentPanel({
  areas,
  infos,
  assessed,
  onSubmit,
}: Props) {
  const r = computeAssessment(areas, infos);

  return (
    <div className="panel p-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-md">
          <Award className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="font-display font-bold text-white tracking-wide">
            考核目标
          </h3>
          <p className="text-[11px] text-slate-400 font-mono">
            ASSESSMENT TARGETS
          </p>
        </div>
        {assessed && (
          <div className="ml-auto flex items-center gap-1 chip bg-status-ok/15 text-status-ok border border-status-ok/50 px-2.5 py-1 animate-pulse">
            <Lock className="w-3 h-3" />
            <span className="font-mono text-[11px] font-bold">已提交</span>
          </div>
        )}
      </div>

      <div className="space-y-2.5 mb-4">
        <TargetRow
          passed={r.noDanger}
          label="无台区超载"
          detail="所有台区状态 ≠ danger"
          actual={
            infos.filter((i) => i.status === "danger").length === 0
              ? "0 个台区超载"
              : `${infos.filter((i) => i.status === "danger").length} 个台区超载`
          }
          threshold={<span>danger = 0</span>}
        />
        <TargetRow
          passed={r.overallUnder70}
          label="全局负载率 ≤ 70%"
          detail="全部台区总负载 / 全部台区总容量"
          actual={<span className="font-mono">{r.overallPct.toFixed(1)}%</span>}
          threshold={<span className="font-mono">≤ 70.0%</span>}
        />
        <TargetRow
          passed={r.spreadUnder15}
          label="三台区负载率极差 ≤ 15%"
          detail="最高负载率 − 最低负载率"
          actual={<span className="font-mono">{r.spreadPct.toFixed(1)}%</span>}
          threshold={<span className="font-mono">≤ 15.0%</span>}
        />
      </div>

      <button
        className={cn(
          "w-full rounded-xl py-2.5 px-4 font-display font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2",
          r.allPassed && !assessed
            ? "bg-gradient-to-r from-status-ok to-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.45)] hover:shadow-[0_0_28px_rgba(16,185,129,0.7)] hover:brightness-110 cursor-pointer"
            : "bg-slate-800/70 text-slate-500 border border-slate-700/70 cursor-not-allowed"
        )}
        disabled={!r.allPassed || assessed}
        onClick={() => {
          if (r.allPassed && !assessed) onSubmit();
        }}
      >
        {assessed ? (
          <>
            <CheckCircle2 className="w-4 h-4" /> 考核已提交
          </>
        ) : r.allPassed ? (
          <>
            <Send className="w-4 h-4" /> 提交考核
          </>
        ) : (
          <>
            <XCircle className="w-4 h-4" /> 全部达标后可提交
          </>
        )}
      </button>
    </div>
  );
}

function TargetRow({
  passed,
  label,
  detail,
  actual,
  threshold,
}: {
  passed: boolean;
  label: string;
  detail: string;
  actual: React.ReactNode;
  threshold: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-xl p-3 border transition-all",
        passed
          ? "bg-status-ok/8 border-status-ok/40"
          : "bg-status-danger/8 border-status-danger/40"
      )}
    >
      <div className="flex items-center gap-2 mb-1">
        {passed ? (
          <CheckCircle2 className="w-4 h-4 text-status-ok flex-shrink-0" />
        ) : (
          <XCircle className="w-4 h-4 text-status-danger flex-shrink-0" />
        )}
        <span
          className={cn(
            "text-sm font-semibold",
            passed ? "text-status-ok" : "text-status-danger"
          )}
        >
          {label}
        </span>
      </div>
      <p className="text-[10px] text-slate-500 font-mono mb-1.5 pl-6">{detail}</p>
      <div className="flex items-center justify-between pl-6 text-[11px] font-mono">
        <span
          className={cn(
            "font-bold",
            passed ? "text-status-ok" : "text-status-danger"
          )}
        >
          实际：{actual}
        </span>
        <span className="text-slate-500">目标：{threshold}</span>
      </div>
    </div>
  );
}
