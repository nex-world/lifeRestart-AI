/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import EventSystem from '../event-system';
import ConditionEngine from '../condition-engine';
import type { EventData, IGameState, EventID } from '../event-types';

/**
 * 事件系统单元测试
 * 确保核心功能正确性和稳定性
 */

describe('EventSystem', () => {
  let eventSystem: EventSystem;
  let mockGameState: IGameState;

  beforeEach(() => {
    // 创建模拟游戏状态
    mockGameState = {
      getProperty: vi.fn().mockReturnValue(5),
      getProperties: vi.fn().mockReturnValue({
        CHR: 5, INT: 5, STR: 5, MNY: 5, SPR: 5, LIF: 5, AGE: 10
      }),
      hasTalent: vi.fn().mockReturnValue(true),
      getTalents: vi.fn().mockReturnValue([1001, 1002]),
      hasEventOccurred: vi.fn().mockReturnValue(false),
      getEventOccurrenceCount: vi.fn().mockReturnValue(0),
      hasAchievement: vi.fn().mockReturnValue(false),
      getAge: vi.fn().mockReturnValue(10),
      getFlag: vi.fn().mockReturnValue(undefined),
      setFlag: vi.fn(),
      removeFlag: vi.fn(),
      random: vi.fn().mockReturnValue(0.5),
      randomInt: vi.fn().mockReturnValue(5)
    };

    eventSystem = new EventSystem(mockGameState, {
      debug: { enabled: true, logTriggers: true, logConditions: true, logEffects: true }
    });
  });

  describe('初始化', () => {
    it('应该正确初始化事件系统', () => {
      const events: Record<string, EventData> = {
        '10001': {
          id: 10001,
          title: '测试事件',
          description: '这是一个测试事件',
          baseWeight: 1
        }
      };

      eventSystem.initialize(events);

      expect(eventSystem.getEvent(10001)).toBeTruthy();
      expect(eventSystem.getAvailableEvents()).toHaveLength(1);
    });

    it('应该处理空事件数据', () => {
      eventSystem.initialize({});
      expect(eventSystem.getAvailableEvents()).toHaveLength(0);
    });
  });

  describe('事件管理', () => {
    beforeEach(() => {
      eventSystem.initialize({
        '10001': {
          id: 10001,
          title: '基础事件',
          description: '基础测试事件',
          baseWeight: 1
        }
      });
    });

    it('应该正确添加事件', () => {
      const newEvent: EventData = {
        id: 10002,
        title: '新事件',
        description: '新添加的事件',
        baseWeight: 1
      };

      eventSystem.addEvent(newEvent);
      expect(eventSystem.getEvent(10002)).toEqual(newEvent);
    });

    it('应该正确移除事件', () => {
      eventSystem.removeEvent(10001);
      expect(eventSystem.getEvent(10001)).toBeNull();
    });

    it('应该正确更新事件', () => {
      eventSystem.updateEvent(10001, { title: '更新后的事件' });
      expect(eventSystem.getEvent(10001)?.title).toBe('更新后的事件');
    });
  });

  describe('条件检查', () => {
    it('应该正确评估属性条件', () => {
      const condition = {
        operator: 'and' as const,
        conditions: [
          {
            type: 'property' as const,
            property: 'INT',
            operator: '>',
            value: 3
          }
        ]
      };

      (mockGameState.getProperty as any).mockReturnValue(5);
      expect(eventSystem.checkConditions(condition)).toBe(true);

      (mockGameState.getProperty as any).mockReturnValue(2);
      expect(eventSystem.checkConditions(condition)).toBe(false);
    });

    it('应该正确评估天赋条件', () => {
      const condition = {
        operator: 'and' as const,
        conditions: [
          {
            type: 'talent' as const,
            talentId: 1001,
            operator: 'exists' as const
          }
        ]
      };

      (mockGameState.hasTalent as any).mockReturnValue(true);
      expect(eventSystem.checkConditions(condition)).toBe(true);

      (mockGameState.hasTalent as any).mockReturnValue(false);
      expect(eventSystem.checkConditions(condition)).toBe(false);
    });
  });

  describe('事件权重评估', () => {
    it('应该正确计算基础权重', () => {
      eventSystem.initialize({
        '10001': {
          id: 10001,
          title: '权重测试',
          description: '权重测试事件',
          baseWeight: 2
        }
      });

      expect(eventSystem.evaluateEventWeight(10001)).toBe(2);
    });

    it('应该应用权重修饰器', () => {
      eventSystem.initialize({
        '10001': {
          id: 10001,
          title: '修饰器测试',
          description: '权重修饰器测试',
          baseWeight: 1,
          weightModifiers: [
            {
              condition: {
                operator: 'and' as const,
                conditions: [
                  {
                    type: 'property' as const,
                    property: 'INT',
                    operator: '>',
                    value: 3
                  }
                ]
              },
              multiplier: 2
            }
          ]
        }
      });

      (mockGameState.getProperty as any).mockReturnValue(5);
      expect(eventSystem.evaluateEventWeight(10001)).toBe(2);
    });

    it('应该处理年龄限制', () => {
      eventSystem.initialize({
        '10001': {
          id: 10001,
          title: '年龄测试',
          description: '年龄限制测试',
          baseWeight: 1,
          minAge: 15,
          maxAge: 20
        }
      });

      (mockGameState.getAge as any).mockReturnValue(10);
      expect(eventSystem.evaluateEventWeight(10001)).toBe(0);

      (mockGameState.getAge as any).mockReturnValue(18);
      expect(eventSystem.evaluateEventWeight(10001)).toBe(1);

      (mockGameState.getAge as any).mockReturnValue(25);
      expect(eventSystem.evaluateEventWeight(10001)).toBe(0);
    });
  });

  describe('事件触发', () => {
    it('应该正确触发无选项事件', () => {
      eventSystem.initialize({
        '10001': {
          id: 10001,
          title: '无选项事件',
          description: '无选项测试事件',
          baseWeight: 1,
          immediateEffects: {
            properties: [
              { property: 'INT', value: 1 }
            ]
          }
        }
      });

      const result = eventSystem.triggerEvent(10001);
      expect(result).toBeTruthy();
      expect(result?.eventId).toBe(10001);
      expect(result?.effects.properties).toHaveLength(1);
    });

    it('应该正确触发有选项事件', () => {
      eventSystem.initialize({
        '10001': {
          id: 10001,
          title: '有选项事件',
          description: '有选项测试事件',
          baseWeight: 1,
          options: [
            {
              text: '选项A',
              effects: {
                properties: [{ property: 'INT', value: 1 }]
              },
              weight: 1
            },
            {
              text: '选项B',
              effects: {
                properties: [{ property: 'STR', value: 1 }]
              },
              weight: 1
            }
          ]
        }
      });

      const result = eventSystem.triggerEvent(10001);
      expect(result).toBeTruthy();
      expect(result?.selectedOption).toBeDefined();
      expect(result?.effects.properties).toBeDefined();
    });

    it('应该处理不可用事件', () => {
      eventSystem.initialize({
        '10001': {
          id: 10001,
          title: '不可用事件',
          description: '权重为0的事件',
          baseWeight: 0
        }
      });

      const result = eventSystem.triggerEvent(10001);
      expect(result).toBeNull();
    });
  });

  describe('事件历史', () => {
    it('应该正确记录事件历史', () => {
      eventSystem.initialize({
        '10001': {
          id: 10001,
          title: '历史测试',
          description: '历史记录测试',
          baseWeight: 1,
          immediateEffects: {}
        }
      });

      eventSystem.triggerEvent(10001);
      const history = eventSystem.getEventHistory();
      
      expect(history).toHaveLength(1);
      expect(history[0].eventId).toBe(10001);
    });

    it('应该正确清除历史', () => {
      eventSystem.initialize({
        '10001': {
          id: 10001,
          title: '清除测试',
          description: '历史清除测试',
          baseWeight: 1,
          immediateEffects: {}
        }
      });

      eventSystem.triggerEvent(10001);
      eventSystem.clearEventHistory();
      
      expect(eventSystem.getEventHistory()).toHaveLength(0);
    });
  });

  describe('性能优化', () => {
    it('应该支持批量事件触发', () => {
      eventSystem.initialize({
        '10001': {
          id: 10001,
          title: '批量测试1',
          description: '批量测试事件1',
          baseWeight: 1,
          immediateEffects: {}
        },
        '10002': {
          id: 10002,
          title: '批量测试2',
          description: '批量测试事件2',
          baseWeight: 1,
          immediateEffects: {}
        }
      });

      const results = eventSystem.batchTriggerEvents([10001, 10002]);
      expect(results).toHaveLength(2);
    });

    it('应该提供系统统计信息', () => {
      eventSystem.initialize({
        '10001': {
          id: 10001,
          title: '统计测试',
          description: '统计信息测试',
          baseWeight: 1
        }
      });

      const stats = eventSystem.getStats();
      expect(stats.totalEvents).toBe(1);
      expect(stats.availableEvents).toBe(1);
    });
  });

  describe('错误处理', () => {
    it('应该处理不存在的事件', () => {
      eventSystem.initialize({});
      
      const result = eventSystem.triggerEvent(99999);
      expect(result).toBeNull();
    });

    it('应该处理无效的事件数据', () => {
      // 测试无效数据时的健壮性
      expect(() => {
        eventSystem.initialize({
          'invalid': {} as any
        });
      }).not.toThrow();
    });
  });
});

describe('ConditionEngine', () => {
  let conditionEngine: ConditionEngine;
  let mockGameState: IGameState;

  beforeEach(() => {
    mockGameState = {
      getProperty: vi.fn().mockReturnValue(5),
      getProperties: vi.fn().mockReturnValue({}),
      hasTalent: vi.fn().mockReturnValue(true),
      getTalents: vi.fn().mockReturnValue([]),
      hasEventOccurred: vi.fn().mockReturnValue(false),
      getEventOccurrenceCount: vi.fn().mockReturnValue(0),
      hasAchievement: vi.fn().mockReturnValue(false),
      getAge: vi.fn().mockReturnValue(10),
      getFlag: vi.fn().mockReturnValue(undefined),
      setFlag: vi.fn(),
      removeFlag: vi.fn(),
      random: vi.fn().mockReturnValue(0.3),
      randomInt: vi.fn().mockReturnValue(5)
    };

    conditionEngine = new ConditionEngine(mockGameState);
  });

  it('应该正确评估复杂条件组', () => {
    const complexCondition = {
      operator: 'and' as const,
      conditions: [
        {
          type: 'property' as const,
          property: 'INT',
          operator: '>',
          value: 3
        },
        {
          operator: 'or' as const,
          conditions: [
            {
              type: 'talent' as const,
              talentId: 1001,
              operator: 'exists' as const
            },
            {
              type: 'property' as const,
              property: 'CHR',
              operator: '>',
              value: 7
            }
          ]
        }
      ]
    };

    expect(conditionEngine.checkConditionGroup(complexCondition)).toBe(true);
  });

  it('应该支持条件缓存', () => {
    const condition = {
      operator: 'and' as const,
      conditions: [
        {
          type: 'property' as const,
          property: 'INT',
          operator: '>',
          value: 3
        }
      ]
    };

    // 第一次调用
    const result1 = conditionEngine.checkConditionGroup(condition);
    
    // 第二次调用应该使用缓存
    const result2 = conditionEngine.checkConditionGroup(condition);
    
    expect(result1).toBe(result2);
    expect(mockGameState.getProperty).toHaveBeenCalledTimes(1);
  });
});