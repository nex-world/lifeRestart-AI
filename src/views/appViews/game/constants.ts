import { i18n } from '@lib/life-restart';
import type { GameDemoData, MainAllocationKey } from './types';
import type { PropertyAllocation } from '@lib/life-restart/types';

// 配置常量
export const DDDD = true;

// 本地化相关
const SD = i18n["zh-cn"];
export function SDT(ss: string) {
  return SD[ss as keyof (typeof SD)] ?? ss;
}

const PropSD = {
  SUM: "总评",
  HAGE: "享年",
  HCHR: "颜值",
  HINT: "智力",
  HSTR: "体质",
  HMNY: "家境",
  HSPR: "快乐",
};

export function PropSDT(ss: string) {
  return PropSD[ss as keyof (typeof PropSD)] ?? ss;
}

// 页面映射
const pageMap = { "": "立即重开" };
export const pageM = (ss: string) => pageMap?.[ss as keyof (typeof pageMap)] ?? ss;

// 初始数据
export const initialDemoData: GameDemoData = {
  processing: false,
  page: "",
  autoPlay: false,
  useAI: false,
  thinking: "",
  output: "",
  talentChoices: [],
  usedPropertyPoints: 0,
  allocation: {
    CHR: 0,
    INT: 0,
    STR: 0,
    MNY: 0,
    TLT: [],
    EXT: null,
  } satisfies PropertyAllocation,
  inheritedTalent: null,
  lifeEnded: false,
  state: {},
  summary: [],
  lifeStory: [],
};

// 属性配置
export const PROPERTY_KEYS: Array<[MainAllocationKey, string]> = [
  ["CHR", "颜值"],
  ["INT", "智力"],
  ["STR", "体质"],
  ["MNY", "家境"]
];

export const PROPERTY_DISPLAY_KEYS: Array<[string, string]> = [
  ["CHR", "颜值"],
  ["INT", "智力"],
  ["STR", "体质"],
  ["MNY", "家境"],
  ["SPR", "快乐"]
];
