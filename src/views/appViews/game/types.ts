import type { JudgeResult } from '@lib/life-restart/property';
import type { TalentWithSelection } from '@lib/life-restart/talent';
import type { GameState, PropertyAllocation, LifeStoryItem } from '@lib/life-restart/types';
import type { SupplierDict } from "llm-utils";

// 基础类型定义
export type ModelDict = {name?: string, label?: string, id?: string|number};
export type MainAllocationKey = "CHR"|"INT"|"STR"|"MNY";

export const DEFAULT_MODEL = {label:"[[<DEFAULT>]]"};

// 游戏数据类型
export interface GameDemoData {
  processing: boolean;
  page: string;
  autoPlay: boolean;
  useAI: boolean;
  thinking: string;
  output: string;
  talentChoices: TalentWithSelection[];
  usedPropertyPoints: number;
  allocation: PropertyAllocation;
  inheritedTalent: TalentWithSelection | null;
  lifeEnded: boolean;
  state: GameState;
  summary: JudgeResult[];
  lifeStory: LifeStoryItem[];
}

// 供应商表单类型
export interface SupplierForm {
  selectedSupplier: SupplierDict;
  apiKeyDict: Record<string, string>;
  supplierModelsDict: Record<string, ModelDict[]>;
  selectedModelDict: Record<string, ModelDict>;
}

// 页面Props类型
export interface GamePageProps {
  demoData: GameDemoData;
  lifeWrapper: { lifeObj: any };
  selectedTalents: TalentWithSelection[];
  propertyPoints: number;
  restPropertyPoints: number;
  onPageChange: (page: string) => void;
  onStep: () => Promise<void>;
  onToggleAuto: () => void;
  onClearData: () => void;
  onComputeOKVal: (key: MainAllocationKey, val: number) => {val: number, delta: number};
}
