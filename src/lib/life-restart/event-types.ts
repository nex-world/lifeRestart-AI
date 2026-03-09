/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * 事件系统核心类型定义
 * 基于P社事件系统设计思想，建立完整类型体系
 */

// ==================== 基础类型 ====================

export type EventID = number;
export type PropertyType = 'CHR' | 'INT' | 'STR' | 'MNY' | 'SPR' | 'LIF' | 'AGE' | string;
export type ConditionType = 'property' | 'talent' | 'event' | 'achievement' | 'age' | 'random';

export interface PropertyValue {
  value: number;
  min?: number;
  max?: number;
}

// ==================== 条件系统 ====================

export interface BaseCondition {
  type: ConditionType;
  operator: '>' | '<' | '>=' | '<=' | '==' | '!=' | 'in' | 'not-in' | 'exists' | 'not-exists';
}

export interface PropertyCondition extends BaseCondition {
  type: 'property';
  property: PropertyType;
  value: number | [number, number];
}

export interface TalentCondition extends BaseCondition {
  type: 'talent';
  talentId: number | number[];
  operator: 'exists' | 'not-exists';
}

export interface EventCondition extends BaseCondition {
  type: 'event';
  eventId: EventID | EventID[];
  operator: 'exists' | 'not-exists' | 'count';
  count?: number;
}

export interface AgeCondition extends BaseCondition {
  type: 'age';
  age: number | [number, number];
}

export interface RandomCondition extends BaseCondition {
  type: 'random';
  probability: number; // 0-1 的概率值
}

export type Condition = PropertyCondition | TalentCondition | EventCondition | AgeCondition | RandomCondition;

export interface ConditionGroup {
  operator: 'and' | 'or';
  conditions: (Condition | ConditionGroup)[];
}

// ==================== 事件效果 ====================

export interface PropertyEffect {
  property: PropertyType;
  value: number;
  min?: number;
  max?: number;
}

export interface EventEffect {
  properties?: PropertyEffect[];
  triggerEvent?: EventID;
  modifyWeight?: { eventId: EventID; multiplier: number };
  setFlag?: { flag: string; value: any };
  removeFlag?: string;
}

// ==================== 事件数据 ====================

export interface EventOption {
  text: string;
  conditions?: ConditionGroup;
  effects: EventEffect;
  nextEvent?: EventID;
  weight?: number; // 选项权重，用于随机选择
}

export interface EventData {
  id: EventID;
  title: string;
  description: string;
  
  // 触发条件
  triggerConditions?: ConditionGroup;
  
  // 权重系统
  baseWeight: number;
  weightModifiers?: { condition: ConditionGroup; multiplier: number }[];
  
  // 选项
  options?: EventOption[];
  
  // 直接效果（无选项时使用）
  immediateEffects?: EventEffect;
  
  // 元数据
  grade?: number;
  category?: string;
  tags?: string[];
  
  // 时间限制
  minAge?: number;
  maxAge?: number;
  cooldown?: number; // 冷却时间（年）
  
  // 历史追踪
  maxTriggerCount?: number; // 最大触发次数
  
  // 调试信息
  debug?: {
    source?: string;
    notes?: string;
  };
}

// ==================== 事件结果 ====================

export interface EventExecutionResult {
  eventId: EventID;
  selectedOption?: number;
  effects: EventEffect;
  nextEvent?: EventID;
  triggeredEvents?: EventID[];
  
  // 调试信息
  debug?: {
    conditionsMet: boolean;
    weight: number;
    triggerReason?: string;
  };
}

// ==================== 事件历史 ====================

export interface EventHistoryEntry {
  eventId: EventID;
  timestamp: number; // 游戏时间戳
  selectedOption?: number;
  effects: EventEffect;
  context: {
    age: number;
    properties: Record<PropertyType, number>;
    flags: Record<string, any>;
  };
}

// ==================== 事件系统配置 ====================

export interface EventSystemConfig {
  // 调试设置
  debug: {
    enabled: boolean;
    logTriggers: boolean;
    logConditions: boolean;
    logEffects: boolean;
  };
  
  // 性能设置
  performance: {
    maxEventHistory: number;
    cacheConditionResults: boolean;
    batchProcessing: boolean;
  };
  
  // 随机性设置
  randomness: {
    seed?: number;
    useDeterministicRandom: boolean;
  };
}

// ==================== 事件系统接口 ====================

export interface IEventSystem {
  // 初始化
  initialize(events: Record<string, EventData>, config?: Partial<EventSystemConfig>): void;
  
  // 事件管理
  getEvent(eventId: EventID): EventData | null;
  addEvent(event: EventData): void;
  removeEvent(eventId: EventID): void;
  updateEvent(eventId: EventID, updates: Partial<EventData>): void;
  
  // 条件检查
  checkConditions(conditions: ConditionGroup): boolean;
  evaluateEventWeight(eventId: EventID): number;
  
  // 事件执行
  triggerEvent(eventId: EventID): EventExecutionResult | null;
  getAvailableEvents(): EventID[];
  
  // 历史管理
  getEventHistory(): EventHistoryEntry[];
  clearEventHistory(): void;
  
  // 状态查询
  getEventTriggerCount(eventId: EventID): number;
  isEventAvailable(eventId: EventID): boolean;
  
  // 调试工具
  debug: {
    logEventTrigger(eventId: EventID, reason: string): void;
    getConditionBreakdown(conditions: ConditionGroup): any;
  };
}

// ==================== 游戏状态接口 ====================

export interface IGameState {
  // 属性获取
  getProperty(property: PropertyType): number;
  getProperties(): Record<PropertyType, number>;
  
  // 天赋检查
  hasTalent(talentId: number): boolean;
  getTalents(): number[];
  
  // 事件历史
  hasEventOccurred(eventId: EventID): boolean;
  getEventOccurrenceCount(eventId: EventID): number;
  
  // 成就检查
  hasAchievement(achievementId: string): boolean;
  
  // 年龄信息
  getAge(): number;
  
  // 标志系统
  getFlag(flag: string): any;
  setFlag(flag: string, value: any): void;
  removeFlag(flag: string): void;
  
  // 随机数生成
  random(): number;
  randomInt(min: number, max: number): number;
}

export default {
  EventID,
  PropertyType,
  ConditionType,
  PropertyValue,
  BaseCondition,
  PropertyCondition,
  TalentCondition,
  EventCondition,
  AgeCondition,
  RandomCondition,
  Condition,
  ConditionGroup,
  PropertyEffect,
  EventEffect,
  EventOption,
  EventData,
  EventExecutionResult,
  EventHistoryEntry,
  EventSystemConfig,
  IEventSystem,
  IGameState
};