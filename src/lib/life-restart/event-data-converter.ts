/* eslint-disable @typescript-eslint/no-explicit-any */

import type { EventData, EventOption, ConditionGroup, PropertyEffect } from './event-types';

/**
 * 事件数据转换器
 * 将现有的事件数据格式转换为新的P社风格事件格式
 */
export class EventDataConverter {
  
  /**
   * 转换现有事件数据到新格式
   */
  convertLegacyEvents(legacyEvents: Record<string, any>): Record<string, EventData> {
    const convertedEvents: Record<string, EventData> = {};

    for (const [eventIdStr, legacyEvent] of Object.entries(legacyEvents)) {
      try {
        const eventId = Number(eventIdStr);
        const convertedEvent = this.convertSingleEvent(eventId, legacyEvent);
        convertedEvents[eventId] = convertedEvent;
      } catch (error) {
        console.warn(`转换事件 ${eventIdStr} 时出错:`, error);
      }
    }

    return convertedEvents;
  }

  /**
   * 转换单个事件
   */
  private convertSingleEvent(eventId: number, legacyEvent: any): EventData {
    const baseEvent: EventData = {
      id: eventId,
      title: this.extractTitle(legacyEvent.event),
      description: legacyEvent.event,
      baseWeight: this.calculateBaseWeight(legacyEvent),
      grade: legacyEvent.grade,
      minAge: this.extractMinAge(legacyEvent),
      maxAge: this.extractMaxAge(legacyEvent),
      maxTriggerCount: legacyEvent.NoRandom ? 1 : undefined,
      triggerConditions: this.convertConditions(legacyEvent),
      immediateEffects: this.convertEffects(legacyEvent),
      options: this.convertBranches(legacyEvent)
    };

    return baseEvent;
  }

  /**
   * 从事件描述中提取标题
   */
  private extractTitle(description: string): string {
    // 简单实现：取前20个字符作为标题
    return description.length > 20 ? description.substring(0, 20) + '...' : description;
  }

  /**
   * 计算基础权重
   */
  private calculateBaseWeight(legacyEvent: any): number {
    // 基础权重逻辑
    let weight = 1;
    
    // 有分支的事件权重更高
    if (legacyEvent.branch && legacyEvent.branch.length > 0) {
      weight *= 1.5;
    }
    
    // 高等级事件权重更高
    if (legacyEvent.grade && legacyEvent.grade > 1) {
      weight *= legacyEvent.grade;
    }
    
    // 有排除条件的事件权重更低（更稀有）
    if (legacyEvent.exclude) {
      weight *= 0.7;
    }
    
    return Math.max(0.1, weight);
  }

  /**
   * 提取最小年龄限制
   */
  private extractMinAge(legacyEvent: any): number | undefined {
    // 从条件中提取年龄信息
    if (legacyEvent.include) {
      const ageMatch = legacyEvent.include.match(/AGE[><=]+(\d+)/);
      if (ageMatch) {
        return Number(ageMatch[1]);
      }
    }
    return undefined;
  }

  /**
   * 提取最大年龄限制
   */
  private extractMaxAge(legacyEvent: any): number | undefined {
    // 简化实现，实际应该从条件中解析
    return undefined;
  }

  /**
   * 转换条件系统
   */
  private convertConditions(legacyEvent: any): ConditionGroup | undefined {
    const conditions: any[] = [];

    // 转换包含条件
    if (legacyEvent.include) {
      const includeCondition = this.parseLegacyCondition(legacyEvent.include, true);
      if (includeCondition) {
        conditions.push(includeCondition);
      }
    }

    // 转换排除条件
    if (legacyEvent.exclude) {
      const excludeCondition = this.parseLegacyCondition(legacyEvent.exclude, false);
      if (excludeCondition) {
        conditions.push(excludeCondition);
      }
    }

    if (conditions.length === 0) {
      return undefined;
    }

    return {
      operator: 'and',
      conditions
    };
  }

  /**
   * 解析传统条件格式
   */
  private parseLegacyCondition(conditionStr: string, isInclude: boolean): any {
    // 简化实现，实际应该完整解析传统条件语法
    const conditions: any[] = [];

    // 天赋条件
    const talentMatch = conditionStr.match(/TLT\?\[([\d,]+)\]/);
    if (talentMatch) {
      const talentIds = talentMatch[1].split(',').map(Number);
      conditions.push({
        type: 'talent',
        talentId: talentIds,
        operator: isInclude ? 'exists' : 'not-exists'
      });
    }

    // 属性条件
    const propertyMatches = conditionStr.matchAll(/(CHR|INT|STR|MNY|SPR|LIF|AGE)([><=!]+)(\d+)/g);
    for (const match of propertyMatches) {
      conditions.push({
        type: 'property',
        property: match[1],
        operator: this.convertLegacyOperator(match[2]),
        value: Number(match[3])
      });
    }

    // 事件条件
    const eventMatch = conditionStr.match(/EVT\?\[([\d,]+)\]/);
    if (eventMatch) {
      const eventIds = eventMatch[1].split(',').map(Number);
      conditions.push({
        type: 'event',
        eventId: eventIds,
        operator: isInclude ? 'exists' : 'not-exists'
      });
    }

    if (conditions.length === 0) {
      return null;
    }

    if (conditions.length === 1) {
      return conditions[0];
    }

    return {
      operator: 'and',
      conditions
    };
  }

  /**
   * 转换传统操作符
   */
  private convertLegacyOperator(operator: string): string {
    switch (operator) {
      case '>': return '>';
      case '<': return '<';
      case '>=': return '>=';
      case '<=': return '<=';
      case '==': return '==';
      case '!=': return '!=';
      default: return '==';
    }
  }

  /**
   * 转换效果
   */
  private convertEffects(legacyEvent: any): any {
    if (!legacyEvent.effect) {
      return undefined;
    }

    const properties: PropertyEffect[] = [];

    for (const [property, value] of Object.entries(legacyEvent.effect)) {
      if (typeof value === 'number') {
        properties.push({
          property,
          value: value as number
        });
      }
    }

    return {
      properties
    };
  }

  /**
   * 转换分支为选项
   */
  private convertBranches(legacyEvent: any): EventOption[] | undefined {
    if (!legacyEvent.branch || legacyEvent.branch.length === 0) {
      return undefined;
    }

    const options: EventOption[] = [];

    for (const branch of legacyEvent.branch) {
      if (typeof branch === 'string') {
        // 传统格式："条件:事件ID"
        const [conditionStr, nextEventIdStr] = branch.split(':');
        const nextEventId = Number(nextEventIdStr);

        const option: EventOption = {
          text: `分支选项 ${nextEventId}`,
          conditions: this.parseLegacyCondition(conditionStr, true),
          effects: {},
          nextEvent: nextEventId,
          weight: 1
        };

        options.push(option);
      } else if (Array.isArray(branch)) {
        // 新格式：[条件, 事件ID]
        const [conditionStr, nextEventId] = branch;
        
        const option: EventOption = {
          text: `分支选项 ${nextEventId}`,
          conditions: this.parseLegacyCondition(conditionStr, true),
          effects: {},
          nextEvent: nextEventId,
          weight: 1
        };

        options.push(option);
      }
    }

    // 添加默认选项
    if (legacyEvent.postEvent) {
      options.push({
        text: '继续',
        effects: {},
        weight: 1
      });
    }

    return options.length > 0 ? options : undefined;
  }

  /**
   * 生成事件数据验证报告
   */
  generateValidationReport(convertedEvents: Record<string, EventData>): {
    totalEvents: number;
    validEvents: number;
    eventsWithOptions: number;
    eventsWithConditions: number;
    warnings: string[];
  } {
    const warnings: string[] = [];
    let validEvents = 0;
    let eventsWithOptions = 0;
    let eventsWithConditions = 0;

    for (const [eventId, event] of Object.entries(convertedEvents)) {
      // 基本验证
      if (!event.title || !event.description) {
        warnings.push(`事件 ${eventId} 缺少标题或描述`);
        continue;
      }

      if (event.baseWeight <= 0) {
        warnings.push(`事件 ${eventId} 权重为0或负数`);
      }

      validEvents++;

      if (event.options && event.options.length > 0) {
        eventsWithOptions++;
      }

      if (event.triggerConditions) {
        eventsWithConditions++;
      }
    }

    return {
      totalEvents: Object.keys(convertedEvents).length,
      validEvents,
      eventsWithOptions,
      eventsWithConditions,
      warnings
    };
  }

  /**
   * 创建示例P社风格事件
   */
  createParadoxStyleExample(): EventData {
    return {
      id: 99999,
      title: 'P社风格事件示例',
      description: '这是一个展示P社事件系统特性的示例事件',
      baseWeight: 2,
      grade: 2,
      minAge: 10,
      maxAge: 50,
      triggerConditions: {
        operator: 'and',
        conditions: [
          {
            type: 'property',
            property: 'INT',
            operator: '>',
            value: 5
          },
          {
            type: 'talent',
            talentId: [1001, 1002],
            operator: 'exists'
          }
        ]
      },
      weightModifiers: [
        {
          condition: {
            operator: 'and',
            conditions: [
              {
                type: 'property',
                property: 'CHR',
                operator: '>',
                value: 7
              }
            ]
          },
          multiplier: 1.5
        }
      ],
      options: [
        {
          text: '选择选项A',
          conditions: {
            operator: 'and',
            conditions: [
              {
                type: 'property',
                property: 'STR',
                operator: '>',
                value: 3
              }
            ]
          },
          effects: {
            properties: [
              { property: 'STR', value: 1 },
              { property: 'SPR', value: -1 }
            ]
          },
          weight: 2
        },
        {
          text: '选择选项B',
          effects: {
            properties: [
              { property: 'INT', value: 1 }
            ],
            triggerEvent: 10001
          },
          weight: 1
        }
      ]
    };
  }
}

export default EventDataConverter;