/* eslint-disable @typescript-eslint/no-explicit-any */

import type { 
  EventData, 
  EventExecutionResult, 
  EventHistoryEntry, 
  EventSystemConfig, 
  IEventSystem, 
  IGameState,
  EventID,
  EventOption
} from './event-types';

import ConditionEngine from './condition-engine';

/**
 * 现代化事件系统
 * 基于P社事件系统设计思想，支持复杂事件链、权重系统和历史追踪
 */
export class EventSystem implements IEventSystem {
  private events: Map<EventID, EventData>;
  private gameState: IGameState;
  private conditionEngine: ConditionEngine;
  private config: EventSystemConfig;
  private eventHistory: EventHistoryEntry[];
  private eventTriggerCounts: Map<EventID, number>;
  private lastTriggerTimes: Map<EventID, number>; // 事件ID -> 游戏时间戳

  constructor(gameState: IGameState, config?: Partial<EventSystemConfig>) {
    this.gameState = gameState;
    this.events = new Map();
    this.conditionEngine = new ConditionEngine(gameState);
    this.eventHistory = [];
    this.eventTriggerCounts = new Map();
    this.lastTriggerTimes = new Map();
    
    // 默认配置
    this.config = {
      debug: {
        enabled: false,
        logTriggers: false,
        logConditions: false,
        logEffects: false
      },
      performance: {
        maxEventHistory: 1000,
        cacheConditionResults: true,
        batchProcessing: false
      },
      randomness: {
        seed: undefined,
        useDeterministicRandom: false
      },
      ...config
    };
  }

  // ==================== 初始化方法 ====================

  initialize(events: Record<string, EventData>, config?: Partial<EventSystemConfig>): void {
    if (config) {
      this.config = { ...this.config, ...config };
    }

    // 清空现有数据
    this.events.clear();
    this.eventHistory = [];
    this.eventTriggerCounts.clear();
    this.lastTriggerTimes.clear();
    this.conditionEngine.clearCache();

    // 加载事件数据
    for (const [eventIdStr, eventData] of Object.entries(events)) {
      const eventId = Number(eventIdStr);
      this.events.set(eventId, eventData);
    }

    if (this.config.debug.enabled) {
      console.log(`事件系统初始化完成，加载了 ${this.events.size} 个事件`);
    }
  }

  // ==================== 事件管理方法 ====================

  getEvent(eventId: EventID): EventData | null {
    return this.events.get(eventId) || null;
  }

  addEvent(event: EventData): void {
    this.events.set(event.id, event);
    
    if (this.config.debug.enabled) {
      console.log(`添加事件: ${event.id} - ${event.title}`);
    }
  }

  removeEvent(eventId: EventID): void {
    this.events.delete(eventId);
    
    if (this.config.debug.enabled) {
      console.log(`移除事件: ${eventId}`);
    }
  }

  updateEvent(eventId: EventID, updates: Partial<EventData>): void {
    const existingEvent = this.events.get(eventId);
    if (existingEvent) {
      this.events.set(eventId, { ...existingEvent, ...updates });
      
      if (this.config.debug.enabled) {
        console.log(`更新事件: ${eventId}`);
      }
    }
  }

  // ==================== 条件检查方法 ====================

  checkConditions(conditions: any): boolean {
    return this.conditionEngine.checkConditionGroup(conditions);
  }

  evaluateEventWeight(eventId: EventID): number {
    const event = this.getEvent(eventId);
    if (!event) return 0;

    let weight = event.baseWeight;

    // 应用权重修饰器
    if (event.weightModifiers) {
      for (const modifier of event.weightModifiers) {
        if (this.conditionEngine.checkConditionGroup(modifier.condition)) {
          weight *= modifier.multiplier;
        }
      }
    }

    // 年龄限制
    const currentAge = this.gameState.getAge();
    if (event.minAge !== undefined && currentAge < event.minAge) {
      return 0;
    }
    if (event.maxAge !== undefined && currentAge > event.maxAge) {
      return 0;
    }

    // 冷却时间检查
    const lastTriggerTime = this.lastTriggerTimes.get(eventId);
    if (event.cooldown && lastTriggerTime) {
      const timeSinceLastTrigger = currentAge - lastTriggerTime;
      if (timeSinceLastTrigger < event.cooldown) {
        return 0;
      }
    }

    // 最大触发次数检查
    const triggerCount = this.eventTriggerCounts.get(eventId) || 0;
    if (event.maxTriggerCount && triggerCount >= event.maxTriggerCount) {
      return 0;
    }

    // 触发条件检查
    if (event.triggerConditions && !this.checkConditions(event.triggerConditions)) {
      return 0;
    }

    return Math.max(0, weight);
  }

  // ==================== 事件执行方法 ====================

  triggerEvent(eventId: EventID): EventExecutionResult | null {
    const event = this.getEvent(eventId);
    if (!event) {
      if (this.config.debug.enabled) {
        console.warn(`尝试触发不存在的事件: ${eventId}`);
      }
      return null;
    }

    // 检查事件是否可用
    const weight = this.evaluateEventWeight(eventId);
    if (weight <= 0) {
      if (this.config.debug.enabled) {
        console.log(`事件 ${eventId} 不可触发，权重: ${weight}`);
      }
      return null;
    }

    // 记录触发
    this.recordEventTrigger(eventId);

    let result: EventExecutionResult;

    if (event.options && event.options.length > 0) {
      // 有选项的事件
      result = this.executeEventWithOptions(event);
    } else {
      // 无选项的事件
      result = this.executeEventWithoutOptions(event);
    }

    // 记录历史
    this.addToEventHistory(result);

    if (this.config.debug.enabled) {
      this.debug.logEventTrigger(eventId, `权重: ${weight}`);
    }

    return result;
  }

  private executeEventWithOptions(event: EventData): EventExecutionResult {
    const availableOptions = this.getAvailableOptions(event.options!);
    
    if (availableOptions.length === 0) {
      // 没有可用选项，使用默认效果
      return {
        eventId: event.id,
        effects: event.immediateEffects || {},
        triggeredEvents: []
      };
    }

    // 根据权重选择选项
    const selectedOption = this.selectOptionByWeight(availableOptions);
    const optionIndex = event.options!.indexOf(selectedOption);

    // 执行选项效果
    const effects = selectedOption.effects;
    const triggeredEvents: EventID[] = [];

    // 触发后续事件
    if (selectedOption.nextEvent) {
      triggeredEvents.push(selectedOption.nextEvent);
    }

    return {
      eventId: event.id,
      selectedOption: optionIndex,
      effects,
      nextEvent: selectedOption.nextEvent,
      triggeredEvents,
      debug: {
        conditionsMet: true,
        weight: this.evaluateEventWeight(event.id),
        triggerReason: '选项选择'
      }
    };
  }

  private executeEventWithoutOptions(event: EventData): EventExecutionResult {
    const effects = event.immediateEffects || {};
    const triggeredEvents: EventID[] = [];

    // 触发后续事件
    if (effects.triggerEvent) {
      triggeredEvents.push(effects.triggerEvent);
    }

    return {
      eventId: event.id,
      effects,
      triggeredEvents,
      debug: {
        conditionsMet: true,
        weight: this.evaluateEventWeight(event.id),
        triggerReason: '直接触发'
      }
    };
  }

  private getAvailableOptions(options: EventOption[]): EventOption[] {
    return options.filter(option => {
      if (!option.conditions) return true;
      return this.conditionEngine.checkConditionGroup(option.conditions);
    });
  }

  private selectOptionByWeight(options: EventOption[]): EventOption {
    if (options.length === 1) return options[0];

    const weights = options.map(option => option.weight || 1);
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    const randomValue = this.gameState.random() * totalWeight;

    let cumulativeWeight = 0;
    for (let i = 0; i < options.length; i++) {
      cumulativeWeight += weights[i];
      if (randomValue <= cumulativeWeight) {
        return options[i];
      }
    }

    return options[options.length - 1]; // 兜底
  }

  // ==================== 事件历史管理 ====================

  private recordEventTrigger(eventId: EventID): void {
    // 更新触发次数
    const currentCount = this.eventTriggerCounts.get(eventId) || 0;
    this.eventTriggerCounts.set(eventId, currentCount + 1);

    // 记录最后触发时间
    const currentAge = this.gameState.getAge();
    this.lastTriggerTimes.set(eventId, currentAge);
  }

  private addToEventHistory(result: EventExecutionResult): void {
    const historyEntry: EventHistoryEntry = {
      eventId: result.eventId,
      timestamp: this.gameState.getAge(),
      selectedOption: result.selectedOption,
      effects: result.effects,
      context: {
        age: this.gameState.getAge(),
        properties: this.gameState.getProperties(),
        flags: this.getCurrentFlags()
      }
    };

    this.eventHistory.push(historyEntry);

    // 限制历史记录大小
    if (this.eventHistory.length > this.config.performance.maxEventHistory) {
      this.eventHistory = this.eventHistory.slice(-this.config.performance.maxEventHistory);
    }
  }

  getEventHistory(): EventHistoryEntry[] {
    return [...this.eventHistory];
  }

  clearEventHistory(): void {
    this.eventHistory = [];
    this.eventTriggerCounts.clear();
    this.lastTriggerTimes.clear();
  }

  // ==================== 状态查询方法 ====================

  getAvailableEvents(): EventID[] {
    const availableEvents: EventID[] = [];

    for (const eventId of this.events.keys()) {
      if (this.isEventAvailable(eventId)) {
        availableEvents.push(eventId);
      }
    }

    return availableEvents;
  }

  isEventAvailable(eventId: EventID): boolean {
    return this.evaluateEventWeight(eventId) > 0;
  }

  getEventTriggerCount(eventId: EventID): number {
    return this.eventTriggerCounts.get(eventId) || 0;
  }

  // ==================== 调试工具 ====================

  debug = {
    logEventTrigger: (eventId: EventID, reason: string): void => {
      if (this.config.debug.logTriggers) {
        console.log(`[事件触发] ${eventId}: ${reason}`);
      }
    },

    getConditionBreakdown: (conditions: any): any => {
      return this.conditionEngine.analyzeCondition(conditions);
    }
  };

  // ==================== 辅助方法 ====================

  private getCurrentFlags(): Record<string, any> {
    // 这里需要从游戏状态中获取标志
    // 简化实现，返回空对象
    return {};
  }

  // ==================== 性能优化方法 ====================

  /**
   * 批量处理事件触发，提高性能
   */
  batchTriggerEvents(eventIds: EventID[]): EventExecutionResult[] {
    const results: EventExecutionResult[] = [];

    for (const eventId of eventIds) {
      const result = this.triggerEvent(eventId);
      if (result) {
        results.push(result);
      }
    }

    return results;
  }

  /**
   * 预计算可用事件，用于优化性能
   */
  precomputeAvailableEvents(): void {
    // 这里可以预计算并缓存可用事件列表
    // 在实际游戏中，可以在游戏状态变化时调用此方法
  }

  /**
   * 获取系统统计信息
   */
  getStats(): {
    totalEvents: number;
    availableEvents: number;
    eventHistorySize: number;
    cacheStats: any;
  } {
    return {
      totalEvents: this.events.size,
      availableEvents: this.getAvailableEvents().length,
      eventHistorySize: this.eventHistory.length,
      cacheStats: this.conditionEngine.getCacheStats()
    };
  }
}

export default EventSystem;