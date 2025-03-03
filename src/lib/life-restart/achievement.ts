/* eslint-disable @typescript-eslint/no-explicit-any */

interface System {
  request: (module: any) => any;
  Module: {
    PROPERTY: any;
  };
  clone: <T>(obj: T) => T;
  check: (condition: any) => boolean;
  $$event: (event: string, data: any) => any;
}

interface AchievementData {
  id: string;
  name: string;
  opportunity: string;
  description: string;
  hide: boolean;
  grade: number;
  condition?: any;
  isAchieved?: boolean;
}

interface PropertyModule {
  TYPES: {
    ACHV: string;
  };
  get: (type: string) => Array<[string, any]> | undefined;
  achieve: (type: string, id: string) => void;
}

interface InitialData {
  achievements: Record<string, AchievementData>;
}

class Achievement {
  constructor(system: System) {
    this.#system = system;
  }

  // 时机
  Opportunity = {
    START: "START",             // 分配完成点数，点击开始新人生后
    TRAJECTORY: "TRAJECTORY",   // 每一年的人生经历中
    SUMMARY: "SUMMARY",         // 人生结束，点击人生总结后
    END: "END",                 // 游戏完成，点击重开 重开次数在这之后才会+1
  };

  #system: System;
  #achievements: Record<string, AchievementData> = {};

  initial(data: InitialData): number {
    this.#achievements = data.achievements;
    return this.count;
  }

  get count(): number {
    return Object.keys(this.#achievements).length;
  }

  get #prop(): PropertyModule {
    return this.#system.request(this.#system.Module.PROPERTY);
  }

  list(): AchievementData[] {
    return Object
      .values(this.#achievements)
      .map(({
        id, name, opportunity,
        description, hide, grade,
      }) => ({
        id, name, opportunity,
        description, hide, grade,
        isAchieved: this.isAchieved(id),
      }));
  }

  get(achievementId: string): AchievementData {
    const achievement = this.#achievements[achievementId];
    if (!achievement) throw new Error(`[ERROR] No Achievement[${achievementId}]`);
    return this.#system.clone(achievement);
  }

  check(achievementId: string): boolean {
    const { condition } = this.get(achievementId);
    return this.#system.check(condition);
  }

  isAchieved(achievementId: string): boolean {
    for (const [achieved] of (this.#prop.get(this.#prop.TYPES.ACHV) || []))
      if (achieved == achievementId) return true;
    return false;
  }

  achieve(opportunity: string): void {
    this.list()
      .filter(({ isAchieved }) => !isAchieved)
      .filter(({ opportunity: o }) => o == opportunity)
      .filter(({ id }) => this.check(id))
      .forEach(({ id }) => {
        this.#prop.achieve(this.#prop.TYPES.ACHV, id);
        this.#system.$$event('achievement', this.get(id));
      });
  }
}

export default Achievement;
