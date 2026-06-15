import { useDroppable } from "@dnd-kit/core";
import { Package2, Zap } from "lucide-react";
import type { LoadBlock } from "@shared/types";
import { cn } from "@/lib/utils";
import DraggableLoadBlock from "./DraggableLoadBlock";
import { POOL_DROPPABLE_ID } from "@shared/types";

interface Props {
  loads: LoadBlock[];
  disabled?: boolean;
}

export default function LoadPool({ loads, disabled }: Props) {
  const { setNodeRef, isOver } = useDroppable({
    id: POOL_DROPPABLE_ID,
    data: { type: "pool" },
    disabled,
  });

  const totalPower = loads.reduce((s, l) => s + l.power, 0);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "panel p-4 transition-all duration-200",
        isOver ? "ring-4 ring-power-400/60 scale-[1.005]" : ""
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-power-600 to-power-800 flex items-center justify-center shadow-md">
            <Package2 className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-display font-bold text-white tracking-wide">
              负荷池 · Load Pool
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              拖拽负荷块到台区进行分配
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 chip bg-slate-800/70 border border-slate-700/60 px-3 py-1.5 text-slate-200">
          <Zap className="w-3.5 h-3.5 text-amber-300" />
          <span className="font-mono font-bold text-xs">
            {loads.length} 项
          </span>
          <span className="text-slate-500">|</span>
          <span className="font-mono font-bold text-xs">
            {totalPower.toFixed(1)} kW
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-2.5 min-h-[120px] p-3 rounded-xl border border-dashed border-slate-700/70 bg-slate-950/40">
        {loads.length === 0 ? (
          <div className="col-span-full flex items-center justify-center text-center text-slate-500 text-xs py-8">
            所有负荷已分配完毕 · 可从台区拖回此处
          </div>
        ) : (
          loads.map((l) => (
            <DraggableLoadBlock key={l.id} load={l} disabled={disabled} />
          ))
        )}
      </div>
    </div>
  );
}
