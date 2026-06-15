import type { TransformerArea, LoadBlock } from "./types";

export const DEFAULT_AREAS: TransformerArea[] = [
  { id: "area-1", name: "台区A · 东苑", maxPower: 120 },
  { id: "area-2", name: "台区B · 西苑", maxPower: 100 },
  { id: "area-3", name: "台区C · 北苑", maxPower: 150 },
];

export const DEFAULT_LOADS: LoadBlock[] = [
  { id: "load-01", name: "1号楼 · 居民", power: 8.5, color: "from-sky-500 to-sky-700" },
  { id: "load-02", name: "2号楼 · 居民", power: 10.2, color: "from-sky-500 to-sky-700" },
  { id: "load-03", name: "3号楼 · 居民", power: 7.8, color: "from-sky-500 to-sky-700" },
  { id: "load-04", name: "4号楼 · 居民", power: 9.3, color: "from-sky-500 to-sky-700" },
  { id: "load-05", name: "5号楼 · 商服", power: 18.0, color: "from-amber-500 to-amber-700" },
  { id: "load-06", name: "6号楼 · 商服", power: 22.5, color: "from-amber-500 to-amber-700" },
  { id: "load-07", name: "7号楼 · 工业", power: 35.0, color: "from-purple-500 to-purple-700" },
  { id: "load-08", name: "8号楼 · 工业", power: 28.0, color: "from-purple-500 to-purple-700" },
  { id: "load-09", name: "路灯 · 公共", power: 6.0, color: "from-emerald-500 to-emerald-700" },
  { id: "load-10", name: "灌溉 · 农排", power: 15.0, color: "from-emerald-500 to-emerald-700" },
  { id: "load-11", name: "充电桩群", power: 32.0, color: "from-rose-500 to-rose-700" },
  { id: "load-12", name: "换热站", power: 40.0, color: "from-rose-500 to-rose-700" },
];
