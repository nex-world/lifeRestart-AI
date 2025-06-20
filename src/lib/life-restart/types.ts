
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Any = any;

// 基础游戏状态类型
export interface GameState {
  [key: string]: unknown;
  AGE?: number;
  LIF?: number;
  TLT?: (string | number)[];
  EVT?: string | number;
  CHR?: number;
  INT?: number;
  STR?: number;
  MNY?: number;
  SPR?: number;
}

// 属性分配类型
export interface PropertyAllocation {
  CHR: number;
  INT: number;
  STR: number;
  MNY: number;
  TLT: (string | number)[];
  EXT: string | number | null;
}

// 生命事件内容类型
export interface LifeEventContent {
  type: string;
  description?: string;
  postEvent?: string;
  grade?: number;
  name?: string; // 天赋专有
}

// 生命故事项类型
export interface LifeStoryItem {
  age: number;
  content: LifeEventContent[];
  isEnd?: boolean;
  output?: string;
}

// 总结项类型
export interface SummaryItem {
  type: string;
  description: string;
  grade?: number;
  name?: string;
}
