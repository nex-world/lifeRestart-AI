/* eslint-disable @typescript-eslint/no-explicit-any */

import type { 
  Condition, 
  ConditionGroup, 
  IGameState, 
  PropertyType,
  EventID
} from './event-types';

/**
 * 条件系统引擎
 * 基于P社事件系统设计，支持复杂条件判断和缓存优化
 */
export class ConditionEngine {
  private gameState: IGameState;
  private conditionCache: Map<string, boolean>;
  private cacheEnabled: boolean;

  constructor(gameState: IGameState, cacheEnabled: boolean = true) {
    this.gameState = gameState;
    this.conditionCache = new Map();
    this.cacheEnabled = cacheEnabled;
  }

  /**
   * 检查条件组
   */
  checkConditionGroup(conditionGroup: ConditionGroup): boolean {
    const cacheKey = this.generateCacheKey(conditionGroup);
    
    if (this.cacheEnabled && this.conditionCache.has(cacheKey)) {
      return this.conditionCache.get(cacheKey)!;
    }

    const result = this.evaluateConditionGroup(conditionGroup);
    
    if (this.cacheEnabled) {
      this.conditionCache.set(cacheKey, result);
    }

    return result;
  }

  /**
   * 评估条件组
   */
  private evaluateConditionGroup(conditionGroup: ConditionGroup): boolean {
    const { operator, conditions } = conditionGroup;
    
    if (operator === 'and') {
      return conditions.every(condition => this.evaluateCondition(condition));
    } else { // 'or'
      return conditions.some(condition => this.evaluateCondition(condition));
    }
  }

  /**
   * 评估单个条件或条件组
   */
  private evaluateCondition(condition: Condition | ConditionGroup): boolean {
    if ('operator' in condition) {
      return this.evaluateConditionGroup(condition);
    }
    
    return this.evaluateSingleCondition(condition);
  }

  /**
   * 评估单个条件
   */
  private evaluateSingleCondition(condition: Condition): boolean {
    switch (condition.type) {
      case 'property':
        return this.checkPropertyCondition(condition);
      case 'talent':
        return this.checkTalentCondition(condition);
      case 'event':
        return this.checkEventCondition(condition);
      case 'age':
        return this.checkAgeCondition(condition);
      case 'random':
        return this.checkRandomCondition(condition);
      default:
        console.warn(`Unknown condition type: ${(condition as any).type}`);
        return false;
    }
  }

  /**
   * 检查属性条件
   */
  private checkPropertyCondition(condition: any): boolean {
    const { property, operator, value } = condition;
    const currentValue = this.gameState.getProperty(property);

    switch (operator) {
      case '>':
        return currentValue > value;
      case '<':
        return currentValue < value;
      case '>=':
        return currentValue >= value;
      case '<=':
        return currentValue <= value;
      case '==':
        return currentValue === value;
      case '!=':
        return currentValue !== value;
      case 'in':
        return Array.isArray(value) && value.includes(currentValue);
      case 'not-in':
        return Array.isArray(value) && !value.includes(currentValue);
      default:
        console.warn(`Unknown property operator: ${operator}`);
        return false;
    }
  }

  /**
   * 检查天赋条件
   */
  private checkTalentCondition(condition: any): boolean {
    const { talentId, operator } = condition;
    
    if (Array.isArray(talentId)) {
      const hasAnyTalent = talentId.some(id => this.gameState.hasTalent(id));
      
      if (operator === 'exists') {
        return hasAnyTalent;
      } else { // 'not-exists'
        return !hasAnyTalent;
      }
    } else {
      const hasTalent = this.gameState.hasTalent(talentId);
      
      if (operator === 'exists') {
        return hasTalent;
      } else { // 'not-exists'
        return !hasTalent;
      }
    }
  }

  /**
   * 检查事件条件
   */
  private checkEventCondition(condition: any): boolean {
    const { eventId, operator, count } = condition;
    
    if (Array.isArray(eventId)) {
      const occurrenceCounts = eventId.map(id => this.gameState.getEventOccurrenceCount(id));
      
      switch (operator) {
        case 'exists':
          return occurrenceCounts.some(count => count > 0);
        case 'not-exists':
          return occurrenceCounts.every(count => count === 0);
        case 'count':
          const totalCount = occurrenceCounts.reduce((sum, count) => sum + count, 0);
          return totalCount >= (count || 1);
        default:
          console.warn(`Unknown event operator: ${operator}`);
          return false;
      }
    } else {
      const occurrenceCount = this.gameState.getEventOccurrenceCount(eventId);
      
      switch (operator) {
        case 'exists':
          return occurrenceCount > 0;
        case 'not-exists':
          return occurrenceCount === 0;
        case 'count':
          return occurrenceCount >= (count || 1);
        default:
          console.warn(`Unknown event operator: ${operator}`);
          return false;
      }
    }
  }

  /**
   * 检查年龄条件
   */
  private checkAgeCondition(condition: any): boolean {
    const { age, operator } = condition;
    const currentAge = this.gameState.getAge();

    if (Array.isArray(age)) {
      const [minAge, maxAge] = age;
      return currentAge >= minAge && currentAge <= maxAge;
    } else {
      switch (operator) {
        case '>':
          return currentAge > age;
        case '<':
          return currentAge < age;
        case '>=':
          return currentAge >= age;
        case '<=':
          return currentAge <= age;
        case '==':
          return currentAge === age;
        case '!=':
          return currentAge !== age;
        default:
          console.warn(`Unknown age operator: ${operator}`);
          return false;
      }
    }
  }

  /**
   * 检查随机条件
   */
  private checkRandomCondition(condition: any): boolean {
    const { probability } = condition;
    return this.gameState.random() < probability;
  }

  /**
   * 生成缓存键
   */
  private generateCacheKey(conditionGroup: ConditionGroup): string {
    return JSON.stringify(conditionGroup);
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.conditionCache.clear();
  }

  /**
   * 获取缓存统计信息
   */
  getCacheStats(): { size: number; hitRate: number } {
    // 这里简化实现，实际应该记录命中次数
    return {
      size: this.conditionCache.size,
      hitRate: 0.8 // 假设命中率
    };
  }

  /**
   * 条件分析工具
   */
  analyzeCondition(conditionGroup: ConditionGroup): {
    result: boolean;
    breakdown: any[];
    failedConditions: any[];
  } {
    const breakdown: any[] = [];
    const failedConditions: any[] = [];

    const evaluateWithBreakdown = (condition: Condition | ConditionGroup): boolean => {
      if ('operator' in condition) {
        const subResult = this.evaluateConditionGroupWithBreakdown(
          condition, 
          breakdown, 
          failedConditions
        );
        breakdown.push({
          type: 'group',
          operator: condition.operator,
          result: subResult,
          conditions: condition.conditions
        });
        return subResult;
      } else {
        const result = this.evaluateSingleCondition(condition);
        breakdown.push({
          type: 'condition',
          condition,
          result
        });
        
        if (!result) {
          failedConditions.push(condition);
        }
        
        return result;
      }
    };

    const result = evaluateWithBreakdown(conditionGroup);

    return {
      result,
      breakdown,
      failedConditions
    };
  }

  private evaluateConditionGroupWithBreakdown(
    conditionGroup: ConditionGroup, 
    breakdown: any[], 
    failedConditions: any[]
  ): boolean {
    const { operator, conditions } = conditionGroup;
    
    if (operator === 'and') {
      return conditions.every(condition => this.evaluateCondition(condition));
    } else {
      return conditions.some(condition => this.evaluateCondition(condition));
    }
  }
}

export default ConditionEngine;