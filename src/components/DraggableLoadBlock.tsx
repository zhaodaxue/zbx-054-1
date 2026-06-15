import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Zap } from "lucide-react";
import type { LoadBlock } from "@shared/types";
import { cn } from "@/lib/utils";

interface Props {
  load: LoadBlock;
  disabled?: boolean;
}

export default function DraggableLoadBlock({ load, disabled }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: load.id,
      disabled,
      data: { type: "load", load },
    });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative rounded-xl border border-slate-600/60 bg-gradient-to-br",
        load.color,
        "shadow-md hover:shadow-xl transition-all duration-200",
        isDragging ? "scale-105 ring-2 ring-amber-300/80 shadow-2xl" : "",
        disabled ? "opacity-70 cursor-not-allowed" : "cursor-grab active:cursor-grabbing"
      )}
      {...listeners}
      {...attributes}
    >
      <div className="px-3 py-2 flex items-center gap-2">
        <GripVertical className="w-3.5 h-3.5 text-white/70 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-white truncate drop-shadow">
            {load.name}
          </div>
        </div>
        <div className="flex items-center gap-1 bg-black/35 rounded-lg px-2 py-0.5 border border-white/15">
          <Zap className="w-3 h-3 text-amber-300" />
          <span className="font-mono font-bold text-[11px] text-white">
            {load.power.toFixed(1)}
            <span className="text-white/70 font-normal ml-0.5">kW</span>
          </span>
        </div>
      </div>
      <div className="absolute left-0 right-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-60" />
    </div>
  );
}
