import { Link, useLocation } from "react-router-dom";
import { Zap, History, RotateCcw, Database } from "lucide-react";

interface Props {
  sessionLabel: string;
  onReset?: () => void;
  extra?: React.ReactNode;
}

export default function AppHeader({ sessionLabel, onReset, extra }: Props) {
  const { pathname } = useLocation();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/70 bg-slate-950/70 backdrop-blur-xl">
      <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center gap-5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-br from-power-500 to-status-alert rounded-xl blur-md opacity-60" />
            <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-power-700 to-power-900 flex items-center justify-center shadow-lg">
              <Zap className="w-6 h-6 text-amber-300" strokeWidth={2.5} />
            </div>
          </div>
          <div>
            <h1 className="font-display font-bold text-xl tracking-wider text-white">
              台区负荷轮换演练沙盘
            </h1>
            <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
              DISTRIBUTION AREA LOAD ROTATION TRAINING SANDBOX
            </p>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 chip bg-slate-800/70 text-slate-300 border border-slate-700/60 px-3 py-1.5">
            <Database className="w-3.5 h-3.5 text-power-400" />
            <span className="font-mono text-[11px]">{sessionLabel}</span>
          </div>

          <nav className="flex items-center gap-1 p-1 rounded-xl bg-slate-800/50 border border-slate-700/60">
            <Link
              to="/sandbox"
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                pathname.startsWith("/sandbox")
                  ? "bg-power-700 text-white shadow-glow-blue"
                  : "text-slate-300 hover:text-white hover:bg-slate-700/60"
              }`}
            >
              <Zap className="w-3.5 h-3.5" /> 演练沙盘
            </Link>
            <Link
              to="/replay"
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                pathname.startsWith("/replay")
                  ? "bg-power-700 text-white shadow-glow-blue"
                  : "text-slate-300 hover:text-white hover:bg-slate-700/60"
              }`}
            >
              <History className="w-3.5 h-3.5" /> 操作回放
            </Link>
          </nav>

          {onReset && (
            <button className="btn-ghost" onClick={onReset} title="重置沙盘">
              <RotateCcw className="w-4 h-4" />
              重置
            </button>
          )}

          {extra}
        </div>
      </div>
    </header>
  );
}
